import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export interface PdfOptions {
  filename?: string;
  docTitle?: string;
  marginMm?: number;
}

/**
 * Generates and downloads a pixel-perfect A4 PDF receipt from an HTML element.
 * Works seamlessly across desktop, Android, and iOS mobile devices.
 * Uses a standardized desktop A4 container clone so mobile screen constraints
 * never cause text wrapping, clipping, or scattered layout.
 */
export const downloadElementAsPdf = async (
  elementId: string,
  options: PdfOptions = {}
): Promise<boolean> => {
  const originalElement = document.getElementById(elementId);
  if (!originalElement) {
    console.error(`downloadElementAsPdf: Element with id "${elementId}" not found.`);
    return false;
  }

  const filename = (options.filename || "NASS_LASUSTECH_Receipt.pdf").replace(/[^a-zA-Z0-9_\-\. ()]/g, "_").trim();
  const cleanFilename = filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;

  // Create an off-screen staging container with fixed standard A4 width (794px = 210mm @ 96dpi)
  const stagingWrapper = document.createElement("div");
  stagingWrapper.id = "nass-pdf-staging-wrapper";
  stagingWrapper.style.position = "fixed";
  stagingWrapper.style.left = "-9999px";
  stagingWrapper.style.top = "0";
  stagingWrapper.style.width = "794px";
  stagingWrapper.style.backgroundColor = "#ffffff";
  stagingWrapper.style.zIndex = "-9999";
  stagingWrapper.style.opacity = "1";
  stagingWrapper.style.pointerEvents = "none";
  stagingWrapper.style.boxSizing = "border-box";
  stagingWrapper.style.padding = "24px";

  // Clone original element
  const clone = originalElement.cloneNode(true) as HTMLElement;
  clone.style.width = "100%";
  clone.style.maxWidth = "746px";
  clone.style.margin = "0 auto";
  clone.style.boxSizing = "border-box";
  clone.style.display = "block";
  clone.style.backgroundColor = "#ffffff";
  clone.style.color = "#0f172a";

  stagingWrapper.appendChild(clone);
  document.body.appendChild(stagingWrapper);

  try {
    // Wait for all images inside clone to be loaded
    const images = Array.from(stagingWrapper.querySelectorAll("img"));
    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete && img.naturalWidth > 0) {
              resolve();
            } else {
              img.onload = () => resolve();
              img.onerror = () => resolve(); // continue even if an image fails
            }
          })
      )
    );

    // Short stabilization tick for fonts and SVG rendering
    await new Promise((r) => setTimeout(r, 150));

    // Render clone to high-res canvas (2x for crisp Retina text & QR codes)
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 1024,
    });

    const imgData = canvas.toDataURL("image/png", 1.0);

    // Create jsPDF in standard A4 format (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const marginMm = options.marginMm ?? 8;
    const printableWidth = pageWidth - marginMm * 2;
    const calculatedHeight = (canvas.height * printableWidth) / canvas.width;

    // If it fits comfortably on one page, center it vertically or place with top margin
    if (calculatedHeight <= pageHeight - marginMm * 2) {
      const yOffset = Math.max(marginMm, (pageHeight - calculatedHeight) / 2);
      pdf.addImage(imgData, "PNG", marginMm, yOffset, printableWidth, calculatedHeight, undefined, "FAST");
    } else {
      // Slightly scale down to guarantee single-page fit for official receipt
      const maxHeight = pageHeight - marginMm * 2;
      const scaledWidth = (canvas.width * maxHeight) / canvas.height;
      const xOffset = Math.max(marginMm, (pageWidth - scaledWidth) / 2);
      pdf.addImage(imgData, "PNG", xOffset, marginMm, scaledWidth, maxHeight, undefined, "FAST");
    }

    pdf.save(cleanFilename);
    return true;
  } catch (error) {
    console.error("PDF generation error:", error);
    return false;
  } finally {
    if (stagingWrapper.parentNode) {
      stagingWrapper.parentNode.removeChild(stagingWrapper);
    }
  }
};
