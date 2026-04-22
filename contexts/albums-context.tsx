"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { Album, Photo } from "@/lib/mock-data";

// DB row types
interface AlbumRow {
  id: string;
  title: string;
  description: string;
  cover_photo: string;
  date: string;
  location: string | null;
  tags: string[];
  created_at: string;
  shared_with: string[];
}

interface PhotoRow {
  id: string;
  album_id: string;
  url: string;
  width: number;
  height: number;
  aspect_ratio: string;
  tags: string[];
  location: string | null;
  date: string;
  favorite: boolean;
  exif_location: { lat: number; lng: number; label: string } | null;
  sort_order: number;
}

function rowToAlbum(row: AlbumRow, photos: Photo[] = []): Album {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    coverPhoto: row.cover_photo,
    date: row.date,
    location: row.location ?? undefined,
    tags: row.tags,
    createdAt: row.created_at,
    sharedWith: row.shared_with,
    photos,
  };
}

function rowToPhoto(row: PhotoRow): Photo {
  return {
    id: row.id,
    url: row.url,
    width: row.width,
    height: row.height,
    aspectRatio: row.aspect_ratio as Photo["aspectRatio"],
    tags: row.tags,
    location: row.location ?? undefined,
    date: row.date,
    favorite: row.favorite,
    exifLocation: row.exif_location ?? undefined,
  };
}

interface AlbumsContextType {
  albums: Album[];
  loading: boolean;
  getAlbum: (id: string) => Album | undefined;
  createAlbum: (data: Omit<Album, "id" | "createdAt" | "photos" | "sharedWith">) => Promise<Album>;
  updateAlbum: (id: string, updates: Partial<Album>) => Promise<void>;
  deleteAlbum: (id: string) => Promise<void>;
  addPhotosToAlbum: (albumId: string, photos: Photo[]) => Promise<void>;
  removePhotoFromAlbum: (albumId: string, photoId: string) => Promise<void>;
  duplicatePhotosInAlbum: (albumId: string, photoIds: string[]) => Promise<void>;
  toggleFavorite: (albumId: string, photoId: string) => Promise<void>;
  setCoverPhoto: (albumId: string, photoUrl: string) => Promise<void>;
}

const AlbumsContext = createContext<AlbumsContextType | null>(null);

export function AlbumsProvider({ children }: { children: ReactNode }) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: albumRows, error } = await supabase
        .from("albums")
        .select("*")
        .order("date", { ascending: false });

      if (error || !albumRows) {
        setLoading(false);
        return;
      }

      const { data: photoRows } = await supabase
        .from("photos")
        .select("*")
        .order("sort_order", { ascending: true });

      const photosByAlbum = new Map<string, Photo[]>();
      for (const row of (photoRows ?? []) as PhotoRow[]) {
        const list = photosByAlbum.get(row.album_id) ?? [];
        list.push(rowToPhoto(row));
        photosByAlbum.set(row.album_id, list);
      }

      setAlbums(
        (albumRows as AlbumRow[]).map((r) =>
          rowToAlbum(r, photosByAlbum.get(r.id) ?? [])
        )
      );
      setLoading(false);
    }

    load();
  }, []);

  const getAlbum = useCallback(
    (id: string) => albums.find((a) => a.id === id),
    [albums]
  );

  const createAlbum = useCallback(
    async (data: Omit<Album, "id" | "createdAt" | "photos" | "sharedWith">) => {
      const id = `album-${Date.now()}`;
      const createdAt = new Date().toISOString();
      const row = {
        id,
        title: data.title,
        description: data.description,
        cover_photo: data.coverPhoto,
        date: data.date,
        location: data.location ?? null,
        tags: data.tags,
        created_at: createdAt,
        shared_with: [],
      };
      await supabase.from("albums").insert(row);
      const newAlbum: Album = { ...data, id, createdAt, photos: [], sharedWith: [] };
      setAlbums((prev) => [newAlbum, ...prev]);
      return newAlbum;
    },
    []
  );

  const updateAlbum = useCallback(
    async (id: string, updates: Partial<Album>) => {
      const dbUpdates: Partial<AlbumRow> = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.coverPhoto !== undefined) dbUpdates.cover_photo = updates.coverPhoto;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if ("location" in updates) dbUpdates.location = updates.location ?? null;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.sharedWith !== undefined) dbUpdates.shared_with = updates.sharedWith;

      await supabase.from("albums").update(dbUpdates).eq("id", id);
      setAlbums((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
      );
    },
    []
  );

  const deleteAlbum = useCallback(async (id: string) => {
    await supabase.from("albums").delete().eq("id", id);
    setAlbums((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addPhotosToAlbum = useCallback(
    async (albumId: string, photos: Photo[]) => {
      const album = albums.find((a) => a.id === albumId);
      if (!album) return;

      const existingIds = new Set(album.photos.map((p) => p.id));
      const newPhotos = photos.filter((p) => !existingIds.has(p.id));
      if (newPhotos.length === 0) return;

      const startOrder = album.photos.length;
      const rows = newPhotos.map((p, i) => ({
        id: p.id,
        album_id: albumId,
        url: p.url,
        width: p.width,
        height: p.height,
        aspect_ratio: p.aspectRatio,
        tags: p.tags,
        location: p.location ?? null,
        date: p.date,
        favorite: p.favorite,
        exif_location: p.exifLocation ?? null,
        sort_order: startOrder + i,
      }));

      await supabase.from("photos").insert(rows);

      setAlbums((prev) =>
        prev.map((a) => {
          if (a.id !== albumId) return a;
          const updated = { ...a, photos: [...a.photos, ...newPhotos] };
          if (!updated.coverPhoto && newPhotos[0]) {
            updated.coverPhoto = newPhotos[0].url;
            supabase.from("albums").update({ cover_photo: newPhotos[0].url }).eq("id", albumId);
          }
          return updated;
        })
      );
    },
    [albums]
  );

  const duplicatePhotosInAlbum = useCallback(
    async (albumId: string, photoIds: string[]) => {
      const album = albums.find((a) => a.id === albumId);
      if (!album) return;

      const selectedSet = new Set(photoIds);
      const newPhotos: Photo[] = [];
      const newOrder: Photo[] = [];

      for (const photo of album.photos) {
        newOrder.push(photo);
        if (selectedSet.has(photo.id)) {
          const duplicate: Photo = {
            ...photo,
            id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          };
          newOrder.push(duplicate);
          newPhotos.push(duplicate);
        }
      }

      const insertRows = newPhotos.map((p) => {
        const idx = newOrder.findIndex((x) => x.id === p.id);
        return {
          id: p.id,
          album_id: albumId,
          url: p.url,
          width: p.width,
          height: p.height,
          aspect_ratio: p.aspectRatio,
          tags: p.tags,
          location: p.location ?? null,
          date: p.date,
          favorite: p.favorite,
          exif_location: p.exifLocation ?? null,
          sort_order: idx,
        };
      });

      await supabase.from("photos").insert(insertRows);

      // Update sort_order for existing photos whose positions shifted
      await Promise.all(
        newOrder.map((p, idx) => {
          const originalIdx = album.photos.findIndex((x) => x.id === p.id);
          if (originalIdx !== -1 && originalIdx !== idx) {
            return supabase.from("photos").update({ sort_order: idx }).eq("id", p.id);
          }
          return Promise.resolve();
        })
      );

      setAlbums((prev) =>
        prev.map((a) => (a.id === albumId ? { ...a, photos: newOrder } : a))
      );
    },
    [albums]
  );

  const removePhotoFromAlbum = useCallback(
    async (albumId: string, photoId: string) => {
      await supabase.from("photos").delete().eq("id", photoId);
      setAlbums((prev) =>
        prev.map((a) =>
          a.id === albumId
            ? { ...a, photos: a.photos.filter((p) => p.id !== photoId) }
            : a
        )
      );
    },
    []
  );

  const toggleFavorite = useCallback(
    async (albumId: string, photoId: string) => {
      const album = albums.find((a) => a.id === albumId);
      const photo = album?.photos.find((p) => p.id === photoId);
      if (!photo) return;

      const newFav = !photo.favorite;
      await supabase.from("photos").update({ favorite: newFav }).eq("id", photoId);
      setAlbums((prev) =>
        prev.map((a) =>
          a.id === albumId
            ? {
                ...a,
                photos: a.photos.map((p) =>
                  p.id === photoId ? { ...p, favorite: newFav } : p
                ),
              }
            : a
        )
      );
    },
    [albums]
  );

  const setCoverPhoto = useCallback(
    async (albumId: string, photoUrl: string) => {
      await supabase.from("albums").update({ cover_photo: photoUrl }).eq("id", albumId);
      setAlbums((prev) =>
        prev.map((a) =>
          a.id === albumId ? { ...a, coverPhoto: photoUrl } : a
        )
      );
    },
    []
  );

  if (loading) return null;

  return (
    <AlbumsContext.Provider
      value={{
        albums,
        loading,
        getAlbum,
        createAlbum,
        updateAlbum,
        deleteAlbum,
        addPhotosToAlbum,
        removePhotoFromAlbum,
        duplicatePhotosInAlbum,
        toggleFavorite,
        setCoverPhoto,
      }}
    >
      {children}
    </AlbumsContext.Provider>
  );
}

export function useAlbums() {
  const ctx = useContext(AlbumsContext);
  if (!ctx) throw new Error("useAlbums must be used within AlbumsProvider");
  return ctx;
}
