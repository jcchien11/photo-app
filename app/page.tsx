"use client";

import { useState, useMemo } from "react";
import { Plus, Images, SlidersHorizontal, Grid3X3, LayoutList } from "lucide-react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { AlbumCard } from "@/components/album-card";
import { CreateAlbumDialog } from "@/components/create-album-dialog";
import { EditAlbumDialog } from "@/components/edit-album-dialog";
import { ShareDialog } from "@/components/share-dialog";
import { Button } from "@/components/ui/button";
import { useAlbums } from "@/contexts/albums-context";
import { formatDateShort } from "@/lib/utils";
import type { Album } from "@/lib/mock-data";

const ALL_TAGS = [
  "wedding", "engagement", "portrait", "family", "editorial",
  "landscape", "elopement", "couples", "commercial", "event",
];

type SortKey = "date-desc" | "date-asc" | "title" | "count";
type ViewMode = "grid" | "list";

export default function DashboardPage() {
  const { albums, deleteAlbum } = useAlbums();
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [editAlbum, setEditAlbum] = useState<Album | null>(null);
  const [shareAlbum, setShareAlbum] = useState<Album | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("date-desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...albums];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.location?.toLowerCase().includes(q) ||
          a.tags.some((t) => t.includes(q))
      );
    }

    if (activeTag) {
      result = result.filter((a) => a.tags.includes(activeTag));
    }

    result.sort((a, b) => {
      if (sortKey === "date-desc")
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortKey === "date-asc")
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortKey === "title") return a.title.localeCompare(b.title);
      if (sortKey === "count") return b.photos.length - a.photos.length;
      return 0;
    });

    return result;
  }, [albums, searchQuery, activeTag, sortKey]);

  const totalPhotos = albums.reduce((sum, a) => sum + a.photos.length, 0);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar onSearch={setSearchQuery} />

      <main className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-10">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="font-sans text-5xl lg:text-5xl leading-tight" style={{color: '#003366'}}>
              My Albums
            </h1>
            <p className="text-sm font-sans text-neutral-400 tracking-widest uppercase mt-2">
              {albums.length} albums · {totalPhotos} photos
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="self-start sm:self-auto shrink-0 bg-orange-500 hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            New Album
          </Button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between gap-4 mb-8 border-b border-neutral-200 pb-4">
          {/* Tag filters - scrollable on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTag(null)}
              className={`whitespace-nowrap text-xs font-sans tracking-widest uppercase px-3 py-1.5 transition-colors shrink-0 ${
                activeTag === null
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-500 hover:text-neutral-800 border border-neutral-200 hover:border-neutral-400"
              }`}
            >
              All
            </button>
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`whitespace-nowrap text-xs font-sans tracking-widest uppercase px-3 py-1.5 transition-colors shrink-0 ${
                  activeTag === tag
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-500 hover:text-neutral-800 border border-neutral-200 hover:border-neutral-400"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Sort + View controls */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="text-xs font-sans tracking-widest uppercase text-neutral-500 bg-transparent border border-neutral-200 px-2 py-1.5 focus:outline-none focus:border-neutral-500 cursor-pointer"
            >
              <option value="date-desc">Newest</option>
              <option value="date-asc">Oldest</option>
              <option value="title">A–Z</option>
              <option value="count">Most Photos</option>
            </select>

            <div className="hidden sm:flex items-center gap-1 border border-neutral-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-400 hover:text-neutral-700"
                }`}
              >
                <Grid3X3 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 transition-colors ${
                  viewMode === "list"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-400 hover:text-neutral-700"
                }`}
              >
                <LayoutList className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Images className="h-12 w-12 text-neutral-300 mb-4" />
            {searchQuery || activeTag ? (
              <>
                <p className="font-serif text-xl text-neutral-500">
                  No albums found
                </p>
                <p className="text-sm font-sans text-neutral-400 mt-1">
                  Try adjusting your search or filters
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTag(null);
                  }}
                >
                  Clear filters
                </Button>
              </>
            ) : (
              <>
                <p className="font-serif text-xl text-neutral-500">
                  No albums yet
                </p>
                <p className="text-sm font-sans text-neutral-400 mt-1">
                  Create your first album to get started
                </p>
                <Button className="mt-6 bg-orange-500 hover:bg-orange-600" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4" />
                  New Album
                </Button>
              </>
            )}
          </div>
        )}

        {/* Grid view */}
        {viewMode === "grid" && filtered.length > 0 && (
          <div className="album-grid stagger-children">
            {filtered.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onEdit={setEditAlbum}
                onDelete={deleteAlbum}
                onShare={setShareAlbum}
              />
            ))}
          </div>
        )}

        {/* List view */}
        {viewMode === "list" && filtered.length > 0 && (
          <div className="divide-y divide-neutral-100">
            {filtered.map((album) => (
              <div
                key={album.id}
                className="flex items-center gap-6 py-5 group cursor-pointer hover:bg-white transition-colors -mx-4 px-4"
                onClick={() => router.push(`/albums/${album.id}`)}
              >
                {/* Thumbnail */}
                <div className="h-16 w-24 shrink-0 overflow-hidden bg-neutral-100">
                  {album.coverPhoto ? (
                    <img
                      src={album.coverPhoto}
                      alt={album.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Images className="h-5 w-5 text-neutral-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-lg text-neutral-900 leading-tight">
                    {album.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-0.5">
                    <span className="text-xs font-sans text-neutral-400 tracking-widest uppercase">
                      {formatDateShort(album.date)}
                    </span>
                    {album.location && (
                      <span className="text-xs font-sans text-neutral-400">
                        {album.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Count + tags */}
                <div className="hidden md:flex items-center gap-4 shrink-0">
                  {album.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-sans tracking-widest uppercase text-neutral-400 border border-neutral-200 px-2 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="text-sm font-sans text-neutral-400">
                    {album.photos.length} photos
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <CreateAlbumDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => router.push(`/albums/${id}`)}
      />
      <EditAlbumDialog
        album={editAlbum}
        open={!!editAlbum}
        onOpenChange={(open) => !open && setEditAlbum(null)}
      />
      <ShareDialog
        album={shareAlbum}
        open={!!shareAlbum}
        onOpenChange={(open) => !open && setShareAlbum(null)}
      />
    </div>
  );
}
