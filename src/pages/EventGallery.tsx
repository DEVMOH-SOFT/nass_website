import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { X, Eye, Download, ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { downloadFile, getDownloadUrl } from "@/lib/download";
import { eventGalleries } from "@/data/galleries";

const EventGallery = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const gallery = id ? eventGalleries[id] : null;
  const [selectedImage, setSelectedImage] = useState<{ src: string, alt: string } | null>(null);

  useEffect(() => {
    if (!gallery && id) {
      console.error("Gallery not found for ID:", id);
    }
  }, [gallery, id]);

  if (!gallery) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-bold">Gallery Not Found</h2>
          <p className="mt-4 text-muted-foreground">The requested gallery does not exist or has no images yet.</p>
          <Link to="/events">
            <Button className="mt-8">Back to Events</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleDownload = (e: React.MouseEvent, src: string, alt: string) => {
    e.stopPropagation();
    const filename = `${alt.toLowerCase().replace(/\s+/g, "_")}.jpg`;
    downloadFile(src, filename);
  };

  return (
    <Layout>
      <section className="bg-foreground py-8 md:py-10">
        <div className="container">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </button>
          <div className="mt-4 max-w-2xl">
            <h1 className="font-display text-2xl font-bold text-white sm:text-3xl md:text-4xl">{gallery.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              {gallery.description}
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-10">
        <div className="container">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {gallery.images.map((img, i) => (
              <div
                key={i}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted transition-all duration-300 hover:shadow-xl"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Overlay with buttons */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <button
                    onClick={() => setSelectedImage(img)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-foreground shadow-sm transition-transform hover:scale-110"
                    title="View Full Image"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <a
                    href={getDownloadUrl(img.src, `${img.alt.toLowerCase().replace(/\s+/g, "_")}.jpg`)}
                    download={`${img.alt.toLowerCase().replace(/\s+/g, "_")}.jpg`}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-transform hover:scale-110"
                    title="Download Image"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* High Resolution Lightbox Dialog (Portaled to body) */}
      <Dialog open={selectedImage !== null} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-4 sm:p-6 bg-slate-950 text-white border-slate-800 rounded-2xl shadow-2xl">
          <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/10 gap-3 pr-8">
            <div className="text-left">
              <DialogTitle className="text-white font-display text-sm sm:text-base font-bold truncate max-w-[240px] sm:max-w-md">
                {selectedImage?.alt}
              </DialogTitle>
              <DialogDescription className="text-emerald-400 text-xs">
                {gallery.title} • High Resolution Photo
              </DialogDescription>
            </div>
            {selectedImage && (
              <a
                href={getDownloadUrl(selectedImage.src, `${selectedImage.alt.toLowerCase().replace(/\s+/g, "_")}.jpg`)}
                download={`${selectedImage.alt.toLowerCase().replace(/\s+/g, "_")}.jpg`}
                className="h-8 sm:h-9 px-3 gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shrink-0 cursor-pointer inline-flex items-center justify-center rounded-md"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Photo</span>
              </a>
            )}
          </DialogHeader>

          <div className="relative max-h-[72vh] overflow-y-auto flex items-center justify-center p-2 bg-slate-900/90 rounded-xl mt-2">
            {selectedImage && (
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="max-w-full max-h-[68vh] object-contain rounded-lg shadow-2xl"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default EventGallery;
