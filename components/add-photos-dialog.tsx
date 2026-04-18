"use client";

import { useState, useRef, useCallback } from "react";
import { Check, ImagePlus, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAlbums } from "@/contexts/albums-context";
import { photoLibrary, type Photo, type AspectRatio } from "@/lib/mock-data";

interface AddPhotosDialogProps {
  albumId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Tab = "library" | "upload";

interface UploadPreview {
  id: string;
  dataUrl: string;
  width: number;
  height: number;
  aspectRatio: AspectRatio;
  fileName: string;
}

const MAX_PX = 1200;
const JPEG_QUALITY = 0.85;

function compressAndRead(file: File): Promise<UploadPreview> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const { naturalWidth: w, naturalHeight: h } = img;
        const scale = Math.min(1, MAX_PX / Math.max(w, h));
        const cw = Math.round(w * scale);
        const ch = Math.round(h * scale);

        const canvas = document.createElement("canvas");
        canvas.width = cw;
        canvas.height = ch;
        canvas.getContext("2d")!.drawImage(img, 0, 0, cw, ch);

        const ratio = cw / ch;
        const aspectRatio: AspectRatio =
          ratio > 1.2 ? "landscape" : ratio < 0.85 ? "portrait" : "square";

        resolve({
          id: `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          dataUrl: canvas.toDataURL("image/jpeg", JPEG_QUALITY),
          width: cw,
          height: ch,
          aspectRatio,
          fileName: file.name,
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

export function AddPhotosDialog({ albumId, open, onOpenChange }: AddPhotosDialogProps) {
  const { addPhotosToAlbum, getAlbum } = useAlbums();
  const [tab, setTab] = useState<Tab>("library");

  // Library tab state
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Upload tab state
  const [previews, setPreviews] = useState<UploadPreview[]>([]);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const album = getAlbum(albumId);
  const existingIds = new Set(album?.photos.map((p) => p.id) ?? []);
  const available = photoLibrary.filter((p) => !existingIds.has(p.id));

  const toggleLibrary = (photo: Photo) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(photo.id) ? next.delete(photo.id) : next.add(photo.id);
      return next;
    });
  };

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) return;
    setProcessing(true);
    try {
      const results = await Promise.all(imageFiles.map(compressAndRead));
      setPreviews((prev) => [...prev, ...results]);
    } finally {
      setProcessing(false);
    }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const removePreview = (id: string) =>
    setPreviews((prev) => prev.filter((p) => p.id !== id));

  const handleAdd = () => {
    if (tab === "library") {
      const photos = available.filter((p) => selected.has(p.id));
      addPhotosToAlbum(albumId, photos);
    } else {
      const photos: Photo[] = previews.map((p) => ({
        id: p.id,
        url: p.dataUrl,
        width: p.width,
        height: p.height,
        aspectRatio: p.aspectRatio,
        tags: [],
        date: new Date().toISOString().split("T")[0],
        favorite: false,
      }));
      addPhotosToAlbum(albumId, photos);
    }
    handleClose();
  };

  const handleClose = () => {
    setSelected(new Set());
    setPreviews([]);
    setTab("library");
    onOpenChange(false);
  };

  const addCount = tab === "library" ? selected.size : previews.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-8 pt-8 pb-4 shrink-0">
          <DialogTitle>Add Photos</DialogTitle>
          <DialogDescription>
            {tab === "library"
              ? <>Select from your library.{selected.size > 0 && <span className="text-neutral-900 font-medium"> {selected.size} selected</span>}</>
              : <>Upload from your computer.{previews.length > 0 && <span className="text-neutral-900 font-medium"> {previews.length} ready</span>}</>
            }
          </DialogDescription>

          {/* Tabs */}
          <div className="flex gap-0 mt-4 border-b border-neutral-200">
            {(["library", "upload"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-xs font-sans tracking-widest uppercase transition-colors border-b-2 -mb-px ${
                  tab === t
                    ? "border-neutral-900 text-neutral-900"
                    : "border-transparent text-neutral-400 hover:text-neutral-700"
                }`}
              >
                {t === "library" ? "Library" : "Upload"}
              </button>
            ))}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-8">
          {/* Library tab */}
          {tab === "library" && (
            available.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
                <ImagePlus className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm font-sans">All library photos are already in this album.</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 pb-4">
                {available.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => toggleLibrary(photo)}
                    className="relative aspect-square overflow-hidden bg-neutral-100 group"
                  >
                    <img
                      src={`https://picsum.photos/seed/${photo.id}/300/300`}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {selected.has(photo.id) && (
                      <div className="absolute inset-0 bg-neutral-900/50 flex items-center justify-center">
                        <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 text-neutral-900" />
                        </div>
                      </div>
                    )}
                    <div className={`absolute top-1.5 right-1.5 h-5 w-5 rounded-full border-2 transition-all ${
                      selected.has(photo.id)
                        ? "border-white bg-neutral-900"
                        : "border-white bg-transparent opacity-0 group-hover:opacity-100"
                    }`} />
                  </button>
                ))}
              </div>
            )
          )}

          {/* Upload tab */}
          {tab === "upload" && (
            <div className="pb-4 space-y-4">
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded cursor-pointer transition-colors py-12 ${
                  dragging
                    ? "border-neutral-900 bg-neutral-50"
                    : "border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50"
                }`}
              >
                <Upload className={`h-8 w-8 transition-colors ${dragging ? "text-neutral-700" : "text-neutral-300"}`} />
                <p className="text-sm font-sans text-neutral-500">
                  {processing ? "Processing…" : "Drag & drop images here, or click to browse"}
                </p>
                <p className="text-xs font-sans text-neutral-400">JPEG, PNG, WEBP, HEIC</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={onFileChange}
                />
              </div>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1">
                  {previews.map((p) => (
                    <div key={p.id} className="relative aspect-square overflow-hidden bg-neutral-100 group">
                      <img
                        src={p.dataUrl}
                        alt={p.fileName}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removePreview(p.id)}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-neutral-900/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={addCount === 0 || processing}>
            <ImagePlus className="h-4 w-4" />
            Add {addCount > 0 ? `${addCount} ` : ""}
            {addCount === 1 ? "Photo" : "Photos"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
