"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Heart, Download, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Photo } from "@/lib/mock-data";

interface PhotoLightboxProps {
  photo: Photo | null;
  photos: Photo[];
  albumId: string;
  onClose: () => void;
  onNavigate: (photo: Photo) => void;
  onToggleFavorite: (photoId: string) => void;
}

export function PhotoLightbox({
  photo,
  photos,
  onClose,
  onNavigate,
  onToggleFavorite,
}: PhotoLightboxProps) {
  const currentIndex = photo ? photos.findIndex((p) => p.id === photo.id) : -1;

  const goPrev = useCallback(() => {
    if (currentIndex > 0) onNavigate(photos[currentIndex - 1]);
  }, [currentIndex, photos, onNavigate]);

  const goNext = useCallback(() => {
    if (currentIndex < photos.length - 1) onNavigate(photos[currentIndex + 1]);
  }, [currentIndex, photos, onNavigate]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, goPrev, goNext]);

  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10 bg-gradient-to-b from-black/60 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {photo.location && (
            <div className="flex items-center gap-1.5 text-white/70">
              <MapPin className="h-3 w-3" />
              <span className="text-xs font-sans tracking-widest uppercase">
                {photo.location}
              </span>
            </div>
          )}
          <span className="text-xs font-sans text-white/50 tracking-widest uppercase">
            {formatDate(photo.date)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleFavorite(photo.id)}
            className={`transition-colors ${
              photo.favorite ? "text-red-400" : "text-white/60 hover:text-white"
            }`}
          >
            <Heart
              className="h-5 w-5"
              fill={photo.favorite ? "currentColor" : "none"}
            />
          </button>
          <a
            href={photo.url}
            download
            onClick={(e) => e.stopPropagation()}
            className="text-white/60 hover:text-white transition-colors"
          >
            <Download className="h-5 w-5" />
          </a>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Image */}
      <div
        className="relative max-w-screen-xl max-h-screen w-full h-full flex items-center justify-center p-16"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.url}
          alt=""
          className="max-w-full max-h-full object-contain"
          style={{ maxHeight: "calc(100vh - 8rem)" }}
        />
      </div>

      {/* Prev/Next */}
      {currentIndex > 0 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      {currentIndex < photos.length - 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Counter */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/40 text-xs font-sans tracking-widest uppercase">
        {currentIndex + 1} / {photos.length}
      </div>

      {/* Tags */}
      {photo.tags.length > 0 && (
        <div className="absolute bottom-5 right-6 flex gap-1.5">
          {photo.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-sans tracking-widest uppercase text-white/40 border border-white/20 px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
