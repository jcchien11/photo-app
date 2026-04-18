"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Images, MoreHorizontal, Pencil, Trash2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateSpaced } from "@/lib/utils";
import type { Album } from "@/lib/mock-data";

interface AlbumCardProps {
  album: Album;
  onEdit?: (album: Album) => void;
  onDelete?: (id: string) => void;
  onShare?: (album: Album) => void;
}

export function AlbumCard({ album, onEdit, onDelete, onShare }: AlbumCardProps) {
  return (
    <div className="group relative flex flex-col">
      {/* Cover image */}
      <Link href={`/albums/${album.id}`} className="block relative overflow-hidden aspect-[4/3] bg-neutral-100">
        {album.coverPhoto ? (
          <Image
            src={album.coverPhoto}
            alt={album.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
            <Images className="h-10 w-10 text-neutral-300" />
          </div>
        )}
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Photo count badge */}
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white text-xs font-sans tracking-widest uppercase">
            {album.photos.length} photos
          </span>
        </div>
      </Link>

      {/* Meta */}
      <div className="flex items-start justify-between pt-3 gap-2">
        <div className="min-w-0">
          <Link href={`/albums/${album.id}`}>
            <h3 className="font-serif text-lg text-neutral-900 leading-tight truncate hover:text-warm-500 transition-colors">
              {album.title}
            </h3>
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[11px] font-sans tracking-widest uppercase text-neutral-400">
              {formatDateSpaced(album.date)}
            </span>
          </div>
          {album.location && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-neutral-400" />
              <span className="text-xs font-sans text-neutral-400 truncate">
                {album.location}
              </span>
            </div>
          )}
        </div>

        {/* Context menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-neutral-400 hover:text-neutral-700 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit?.(album)}>
              <Pencil className="h-3.5 w-3.5" />
              Edit album
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare?.(album)}>
              <Share2 className="h-3.5 w-3.5" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete?.(album.id)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tags */}
      {album.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {album.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-sans tracking-widest uppercase text-neutral-400 border border-neutral-200 px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
