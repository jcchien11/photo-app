"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAlbums } from "@/contexts/albums-context";
import type { Album } from "@/lib/mock-data";

interface EditAlbumDialogProps {
  album: Album | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TAG_SUGGESTIONS = [
  "wedding", "engagement", "portrait", "family", "editorial",
  "landscape", "elopement", "couples", "commercial", "event",
];

export function EditAlbumDialog({ album, open, onOpenChange }: EditAlbumDialogProps) {
  const { updateAlbum } = useAlbums();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (album) {
      setTitle(album.title);
      setDescription(album.description || "");
      setDate(album.date.split("T")[0]);
      setLocation(album.location || "");
      setTags(album.tags);
    }
  }, [album]);

  const addTag = (tag: string) => {
    const clean = tag.trim().toLowerCase();
    if (clean && !tags.includes(clean)) setTags([...tags, clean]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleSave = () => {
    if (!album || !title.trim()) return;
    updateAlbum(album.id, {
      title: title.trim(),
      description: description.trim(),
      date: new Date(date).toISOString(),
      location: location.trim() || undefined,
      tags,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Album</DialogTitle>
        </DialogHeader>

        <div className="px-8 pb-2 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Album Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-desc">Description</Label>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                placeholder="e.g. Paris, France"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs font-sans tracking-widest uppercase bg-neutral-900 text-white px-2.5 py-1"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)}>
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag(tagInput);
                }
              }}
              placeholder="Add a tag..."
              className="w-full text-sm font-sans border-b border-neutral-300 bg-transparent px-0 py-1.5 focus:border-neutral-900 focus:outline-none placeholder:text-neutral-400"
            />
            <div className="flex flex-wrap gap-1.5">
              {TAG_SUGGESTIONS.filter((s) => !tags.includes(s)).map((s) => (
                <button
                  key={s}
                  onClick={() => addTag(s)}
                  className="text-[10px] font-sans tracking-widest uppercase text-neutral-500 border border-neutral-200 px-2 py-0.5 hover:border-neutral-400 transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
