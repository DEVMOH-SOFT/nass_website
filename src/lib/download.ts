/**
 * Universal file download helper that guarantees the browser saves with the exact
 * intended clean filename and extension (e.g. NASS_LASUSTECH_2026-2027_Calendar (1).pdf).
 */

export const getDownloadUrl = (assetUrl: string, filename: string): string => {
  let cleanName = filename.replace(/[^a-zA-Z0-9_\-\. ()]/g, "_").trim();
  if (!cleanName.match(/\.(png|jpe?g|webp|pdf|docx?|xlsx?)$/i)) {
    const ext = assetUrl.split(".").pop()?.toLowerCase();
    cleanName += ext && ext.length <= 4 ? `.${ext}` : ".pdf";
  }

  let cleanPath = assetUrl.startsWith("/") ? assetUrl.slice(1) : assetUrl;
  cleanPath = decodeURIComponent(cleanPath.split("?")[0]);

  return `/download?url=${encodeURIComponent(cleanPath)}&name=${encodeURIComponent(cleanName)}`;
};

export const downloadFile = (url: string, filename: string): void => {
  let cleanName = filename.replace(/[^a-zA-Z0-9_\-\. ()]/g, "_").trim();
  if (!cleanName.match(/\.(png|jpe?g|webp|pdf|docx?|xlsx?)$/i)) {
    const ext = url.split(".").pop()?.toLowerCase();
    cleanName += ext && ext.length <= 4 ? `.${ext}` : ".pdf";
  }

  const downloadUrl = getDownloadUrl(url, cleanName);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.setAttribute("download", cleanName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
