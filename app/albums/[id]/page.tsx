"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Heart,
  ImagePlus,
  Share2,
  Pencil,
  ArrowLeft,
  MapPin,
  Download,
  Play,
  X,
  Check,
  Filter,
  Copy,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { AddPhotosDialog } from "@/components/add-photos-dialog";
import { EditAlbumDialog } from "@/components/edit-album-dialog";
import { ShareDialog } from "@/components/share-dialog";
import { PhotoLightbox } from "@/components/photo-lightbox";
import { Button } from "@/components/ui/button";
import { useAlbums } from "@/contexts/albums-context";
import { formatDateSpaced } from "@/lib/utils";
import type { Photo } from "@/lib/mock-data";

const ALL_PHOTO_TAGS = [
  "portrait", "candid", "ceremony", "reception", "getting ready",
  "first look", "details", "landscape", "family", "couple", "editorial", "golden hour",
];

export default function AlbumPage() {
  const params = useParams();
  const router = useRouter();
  const albumId = params.id as string;
  const { getAlbum, toggleFavorite, setCoverPhoto, removePhotoFromAlbum, duplicatePhotosInAlbum } = useAlbums();

  const album = getAlbum(albumId);

  const [addPhotosOpen, setAddPhotosOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

  const filteredPhotos = useMemo(() => {
    if (!album) return [];
    let result = [...album.photos];
    if (activeTag) result = result.filter((p) => p.tags.includes(activeTag));
    if (showFavoritesOnly) result = result.filter((p) => p.favorite);
    return result;
  }, [album, activeTag, showFavoritesOnly]);

  if (!album) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40">
          <p className="font-serif text-2xl text-neutral-400">Album not found</p>
          <Button variant="outline" className="mt-6" onClick={() => router.push("/")}>
            Back to Albums
          </Button>
        </div>
      </div>
    );
  }

  const toggleSelect = (photoId: string) => {
    setSelectedPhotos((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) next.delete(photoId);
      else next.add(photoId);
      return next;
    });
  };

  const deleteSelected = () => {
    selectedPhotos.forEach((id) => removePhotoFromAlbum(albumId, id));
    setSelectedPhotos(new Set());
    setSelectMode(false);
  };

  const duplicateSelected = async () => {
    await duplicatePhotosInAlbum(albumId, Array.from(selectedPhotos));
    setSelectedPhotos(new Set());
    setSelectMode(false);
  };

  const favoriteCount = album.photos.filter((p) => p.favorite).length;

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* Hero */}
      <div className="relative h-[55vh] min-h-[380px] max-h-[620px] overflow-hidden bg-neutral-900">
        {album.coverPhoto && (
          <Image
            src={album.coverPhoto}
            alt={album.title}
            fill
            className="object-cover opacity-75"
            priority
            sizes="100vw"
          />
        )}
        {/* gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-6 left-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-sans tracking-wide"
        >
          <ArrowLeft className="h-4 w-4" />
          Albums
        </button>

        {/* Hero text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-3">
            {album.title}
          </h1>
          <div className="flex items-center gap-3 text-white/60">
            {album.location && (
              <>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  <span className="text-xs font-sans tracking-[0.2em] uppercase">
                    {album.location}
                  </span>
                </div>
                <span className="text-white/30">·</span>
              </>
            )}
            <span className="text-xs font-sans tracking-[0.2em] uppercase">
              {formatDateSpaced(album.date)}
            </span>
          </div>

          <button
            onClick={() => {
              const el = document.getElementById("photo-grid");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="mt-8 text-white/70 hover:text-white text-xs font-sans tracking-[0.25em] uppercase border-b border-white/30 hover:border-white/60 pb-0.5 transition-all"
          >
            View Gallery
          </button>
        </div>
      </div>

      {/* Sticky album nav */}
      <div className="sticky top-16 z-30 bg-white border-b border-neutral-100 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* Album name + photo count */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="min-w-0">
                <span className="font-serif text-base text-neutral-800 leading-none truncate block">
                  {album.title}
                </span>
                <span className="text-[10px] font-sans tracking-widest uppercase text-neutral-400">
                  {album.photos.length} photos
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {selectMode ? (
                <>
                  <span className="text-xs font-sans text-neutral-500 mr-1">
                    {selectedPhotos.size} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={duplicateSelected}
                    disabled={selectedPhotos.size === 0}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Duplicate</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deleteSelected}
                    disabled={selectedPhotos.size === 0}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Remove</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectMode(false);
                      setSelectedPhotos(new Set());
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={`flex items-center gap-1.5 text-xs font-sans tracking-wide px-3 py-1.5 transition-colors ${
                      showFavoritesOnly
                        ? "text-red-500"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    <Heart
                      className="h-3.5 w-3.5"
                      fill={showFavoritesOnly ? "currentColor" : "none"}
                    />
                    <span className="hidden sm:inline">
                      Favorites {favoriteCount > 0 && `(${favoriteCount})`}
                    </span>
                  </button>

                  <button
                    onClick={() => setAddPhotosOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-sans tracking-wide px-3 py-1.5 text-neutral-500 hover:text-neutral-800 transition-colors"
                  >
                    <ImagePlus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Add Photos</span>
                  </button>

                  <button
                    onClick={() => setShareOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-sans tracking-wide px-3 py-1.5 text-neutral-500 hover:text-neutral-800 transition-colors"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Share</span>
                  </button>

                  <button
                    onClick={() => setEditOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-sans tracking-wide px-3 py-1.5 text-neutral-500 hover:text-neutral-800 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tag filter strip */}
      <div className="bg-white border-b border-neutral-100" id="photo-grid">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-3 py-3 overflow-x-auto no-scrollbar">
            <Filter className="h-3 w-3 text-neutral-400 shrink-0" />
            <button
              onClick={() => { setActiveTag(null); setShowFavoritesOnly(false); }}
              className={`whitespace-nowrap text-[10px] font-sans tracking-widest uppercase px-2.5 py-1 transition-colors shrink-0 ${
                activeTag === null && !showFavoritesOnly
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-500 border border-neutral-200 hover:border-neutral-400"
              }`}
            >
              All
            </button>
            {ALL_PHOTO_TAGS.filter((tag) =>
              album.photos.some((p) => p.tags.includes(tag))
            ).map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setActiveTag(activeTag === tag ? null : tag);
                  setShowFavoritesOnly(false);
                }}
                className={`whitespace-nowrap text-[10px] font-sans tracking-widest uppercase px-2.5 py-1 transition-colors shrink-0 ${
                  activeTag === tag
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-500 border border-neutral-200 hover:border-neutral-400"
                }`}
              >
                {tag}
              </button>
            ))}
            <button
              onClick={() => setSelectMode(true)}
              className="ml-auto whitespace-nowrap text-[10px] font-sans tracking-widest uppercase px-2.5 py-1 text-neutral-500 border border-neutral-200 hover:border-neutral-400 shrink-0 transition-colors"
            >
              Select
            </button>
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="max-w-screen-2xl mx-auto px-3 py-3">
        {filteredPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <ImagePlus className="h-10 w-10 text-neutral-300 mb-4" />
            {album.photos.length === 0 ? (
              <>
                <p className="font-serif text-xl text-neutral-500">
                  No photos yet
                </p>
                <p className="text-sm font-sans text-neutral-400 mt-1">
                  Add photos to start building this album
                </p>
                <Button className="mt-6" onClick={() => setAddPhotosOpen(true)}>
                  <ImagePlus className="h-4 w-4" />
                  Add Photos
                </Button>
              </>
            ) : (
              <>
                <p className="font-serif text-xl text-neutral-500">
                  No photos match this filter
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => { setActiveTag(null); setShowFavoritesOnly(false); }}
                >
                  Clear filter
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="photo-masonry">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="photo-masonry-item relative group overflow-hidden bg-neutral-100 cursor-pointer"
                onClick={() => {
                  if (selectMode) toggleSelect(photo.id);
                  else setLightboxPhoto(photo);
                }}
              >
                <img
                  src={photo.url}
                  alt=""
                  className="w-full block transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

                {/* Select mode overlay */}
                {selectMode && (
                  <div
                    className={`absolute inset-0 transition-colors ${
                      selectedPhotos.has(photo.id) ? "bg-neutral-900/50" : ""
                    }`}
                  />
                )}

                {/* Select checkbox */}
                {selectMode && (
                  <div
                    className={`absolute top-2 right-2 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center transition-colors ${
                      selectedPhotos.has(photo.id) ? "bg-neutral-900" : "bg-transparent"
                    }`}
                  >
                    {selectedPhotos.has(photo.id) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                )}

                {/* Photo actions on hover (non-select mode) */}
                {!selectMode && (
                  <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(albumId, photo.id);
                      }}
                      className={`h-7 w-7 flex items-center justify-center bg-white/90 hover:bg-white transition-colors ${
                        photo.favorite ? "text-red-500" : "text-neutral-600"
                      }`}
                    >
                      <Heart
                        className="h-3.5 w-3.5"
                        fill={photo.favorite ? "currentColor" : "none"}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCoverPhoto(albumId, photo.url);
                      }}
                      title="Set as cover"
                      className="h-7 w-7 flex items-center justify-center bg-white/90 hover:bg-white text-neutral-600 transition-colors"
                    >
                      <Play className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Favorite indicator */}
                {photo.favorite && !selectMode && (
                  <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="h-3 w-3 text-red-400 fill-current" />
                  </div>
                )}

                {/* Tags on hover */}
                {photo.tags.length > 0 && !selectMode && (
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-sans tracking-widest uppercase text-white/80 bg-black/30 px-1.5 py-0.5">
                      {photo.tags[0]}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      {album.description && (
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-16 border-t border-neutral-200 mt-8">
          <div className="max-w-lg">
            <p className="font-serif text-lg text-neutral-500 italic leading-relaxed">
              {album.description}
            </p>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <AddPhotosDialog
        albumId={albumId}
        open={addPhotosOpen}
        onOpenChange={setAddPhotosOpen}
      />
      <EditAlbumDialog
        album={album}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <ShareDialog
        album={album}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />

      {/* Lightbox */}
      <PhotoLightbox
        photo={lightboxPhoto}
        photos={filteredPhotos}
        albumId={albumId}
        onClose={() => setLightboxPhoto(null)}
        onNavigate={setLightboxPhoto}
        onToggleFavorite={(photoId) => toggleFavorite(albumId, photoId)}
      />
    </div>
  );
}
