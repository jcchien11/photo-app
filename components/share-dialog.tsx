"use client";

import { useState } from "react";
import { Copy, Check, Twitter, Facebook, Link2, X, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAlbums } from "@/contexts/albums-context";
import type { Album } from "@/lib/mock-data";

interface ShareDialogProps {
  album: Album | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MOCK_SHARE_LINK = "https://folio.app/s/abc123xyz";

export function ShareDialog({ album, open, onOpenChange }: ShareDialogProps) {
  const { updateAlbum } = useAlbums();
  const [emailInput, setEmailInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [sharedEmails, setSharedEmails] = useState<string[]>(
    album?.sharedWith ?? []
  );

  if (!album) return null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(MOCK_SHARE_LINK);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (email && !sharedEmails.includes(email) && email.includes("@")) {
      const next = [...sharedEmails, email];
      setSharedEmails(next);
      updateAlbum(album.id, { sharedWith: next });
      setEmailInput("");
    }
  };

  const removeEmail = (email: string) => {
    const next = sharedEmails.filter((e) => e !== email);
    setSharedEmails(next);
    updateAlbum(album.id, { sharedWith: next });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Album</DialogTitle>
          <DialogDescription className="font-serif text-neutral-500 italic">
            {album.title}
          </DialogDescription>
        </DialogHeader>

        <div className="px-8 pb-2 space-y-7">
          {/* Share link */}
          <div className="space-y-3">
            <Label>Shareable Link</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 border-b border-neutral-300 py-2">
                <span className="text-sm font-sans text-neutral-500 select-all">
                  {MOCK_SHARE_LINK}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={copyLink}>
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Social sharing */}
          <div className="space-y-3">
            <Label>Share on Social</Label>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 border border-neutral-200 py-2.5 text-xs font-sans tracking-wide text-neutral-600 hover:bg-neutral-50 transition-colors">
                <Twitter className="h-3.5 w-3.5" />
                Twitter
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 border border-neutral-200 py-2.5 text-xs font-sans tracking-wide text-neutral-600 hover:bg-neutral-50 transition-colors">
                <Facebook className="h-3.5 w-3.5" />
                Facebook
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 border border-neutral-200 py-2.5 text-xs font-sans tracking-wide text-neutral-600 hover:bg-neutral-50 transition-colors">
                <Mail className="h-3.5 w-3.5" />
                Email
              </button>
            </div>
          </div>

          <Separator />

          {/* Share with specific users */}
          <div className="space-y-3">
            <Label>Share with People</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addEmail()}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addEmail}
                className="shrink-0"
              >
                Invite
              </Button>
            </div>

            {sharedEmails.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {sharedEmails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between py-2 border-b border-neutral-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-warm-100 flex items-center justify-center text-xs font-sans text-warm-600">
                        {email[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-sans text-neutral-700">
                        {email}
                      </span>
                    </div>
                    <button
                      onClick={() => removeEmail(email)}
                      className="text-neutral-400 hover:text-neutral-700 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
