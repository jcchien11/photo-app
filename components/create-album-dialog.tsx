"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
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

interface CreateAlbumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (albumId: string) => void;
}

const TAG_SUGGESTIONS = [
  "wedding", "engagement", "portrait", "family", "editorial",
  "landscape", "elopement", "couples", "commercial", "event",
];

const COVER_OPTIONS = [
  "https://picsum.photos/seed/cover1/800/533",
  "https://picsum.photos/seed/cover2/800/533",
  "https://picsum.photos/seed/cover3/800/533",
  "https://picsum.photos/seed/cover4/800/533",
  "https://picsum.photos/seed/cover5/800/533",
  "https://picsum.photos/seed/cover6/800/533",
];

export function CreateAlbumDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateAlbumDialogProps) {
  const { createAlbum } = useAlbums();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedCover, setSelectedCover] = useState(COVER_OPTIONS[0]);
  const [step, setStep] = useState<1 | 2>(1);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setLocation("");
    setTags([]);
    setTagInput("");
    setSelectedCover(COVER_OPTIONS[0]);
    setStep(1);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const addTag = (tag: string) => {
    const clean = tag.trim().toLowerCase();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    const album = await createAlbum({
      title: title.trim(),
      description: description.trim(),
      coverPhoto: selectedCover,
      date: new Date(date).toISOString(),
      location: location.trim() || undefined,
      tags,
    });
    handleClose();
    onCreated?.(album.id);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Create New Album" : "Choose Cover Photo"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="px-8 pb-2 space-y-7">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Album Title</Label>
              <Input
                id="title"
                placeholder="e.g. Emma & James — Tuscany"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-base"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="A brief story about this collection..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Date + Location side by side */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. Tuscany, Italy"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs font-sans tracking-widest uppercase bg-neutral-900 text-white px-2.5 py-1"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-neutral-300 ml-0.5"
                    >
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
                placeholder="Type a tag and press Enter..."
                className="w-full text-sm font-sans border-b border-neutral-300 bg-transparent px-0 py-1.5 focus:border-neutral-900 focus:outline-none placeholder:text-neutral-400"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {TAG_SUGGESTIONS.filter((s) => !tags.includes(s)).map((s) => (
                  <button
                    key={s}
                    onClick={() => addTag(s)}
                    className="text-[10px] font-sans tracking-widest uppercase text-neutral-500 border border-neutral-200 px-2 py-0.5 hover:border-neutral-400 hover:text-neutral-800 transition-colors"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-8 pb-2">
            <p className="text-sm font-sans text-neutral-500 mb-4">
              Select a cover photo for your album. You can change this later.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {COVER_OPTIONS.map((url) => (
                <button
                  key={url}
                  onClick={() => setSelectedCover(url)}
                  className={`relative aspect-[4/3] overflow-hidden transition-all ${
                    selectedCover === url
                      ? "ring-2 ring-neutral-900 ring-offset-2"
                      : "hover:opacity-90"
                  }`}
                >
                  <img
                    src={url}
                    alt="Cover option"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 2 && (
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
          )}
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === 1 ? (
            <Button
              onClick={() => setStep(2)}
              disabled={!title.trim()}
            >
              Continue
            </Button>
          ) : (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              Create Album
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
