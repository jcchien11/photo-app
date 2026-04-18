"use client";

import { useState } from "react";
import { Check, ImagePlus } from "lucide-react";
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
import { photoLibrary, type Photo } from "@/lib/mock-data";

interface AddPhotosDialogProps {
  albumId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPhotosDialog({ albumId, open, onOpenChange }: AddPhotosDialogProps) {
  const { addPhotosToAlbum, getAlbum } = useAlbums();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const album = getAlbum(albumId);
  const existingIds = new Set(album?.photos.map((p) => p.id) ?? []);
  const available = photoLibrary.filter((p) => !existingIds.has(p.id));

  const toggle = (photo: Photo) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(photo.id)) {
        next.delete(photo.id);
      } else {
        next.add(photo.id);
      }
      return next;
    });
  };

  const handleAdd = () => {
    const photos = available.filter((p) => selected.has(p.id));
    addPhotosToAlbum(albumId, photos);
    setSelected(new Set());
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelected(new Set());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-8 pt-8 pb-4 shrink-0">
          <DialogTitle>Add Photos</DialogTitle>
          <DialogDescription>
            Select photos from your library to add to this album.{" "}
            {selected.size > 0 && (
              <span className="text-neutral-900 font-medium">
                {selected.size} selected
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-8">
          {available.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
              <ImagePlus className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm font-sans">All library photos are already in this album.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 pb-4">
              {available.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => toggle(photo)}
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
                  <div
                    className={`absolute top-1.5 right-1.5 h-5 w-5 rounded-full border-2 transition-all ${
                      selected.has(photo.id)
                        ? "border-white bg-neutral-900"
                        : "border-white bg-transparent opacity-0 group-hover:opacity-100"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={selected.size === 0}>
            <ImagePlus className="h-4 w-4" />
            Add {selected.size > 0 ? `${selected.size} ` : ""}
            {selected.size === 1 ? "Photo" : "Photos"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
