"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { mockAlbums, type Album, type Photo } from "@/lib/mock-data";

interface AlbumsContextType {
  albums: Album[];
  getAlbum: (id: string) => Album | undefined;
  createAlbum: (data: Omit<Album, "id" | "createdAt" | "photos" | "sharedWith">) => Album;
  updateAlbum: (id: string, updates: Partial<Album>) => void;
  deleteAlbum: (id: string) => void;
  addPhotosToAlbum: (albumId: string, photos: Photo[]) => void;
  removePhotoFromAlbum: (albumId: string, photoId: string) => void;
  toggleFavorite: (albumId: string, photoId: string) => void;
  setCoverPhoto: (albumId: string, photoUrl: string) => void;
}

const AlbumsContext = createContext<AlbumsContextType | null>(null);

export function AlbumsProvider({ children }: { children: ReactNode }) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("folio-albums");
      if (stored) {
        setAlbums(JSON.parse(stored));
      } else {
        setAlbums(mockAlbums);
      }
    } catch {
      setAlbums(mockAlbums);
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((next: Album[]) => {
    setAlbums(next);
    try {
      localStorage.setItem("folio-albums", JSON.stringify(next));
    } catch {}
  }, []);

  const getAlbum = useCallback(
    (id: string) => albums.find((a) => a.id === id),
    [albums]
  );

  const createAlbum = useCallback(
    (data: Omit<Album, "id" | "createdAt" | "photos" | "sharedWith">) => {
      const newAlbum: Album = {
        ...data,
        id: `album-${Date.now()}`,
        createdAt: new Date().toISOString(),
        photos: [],
        sharedWith: [],
      };
      persist([...albums, newAlbum]);
      return newAlbum;
    },
    [albums, persist]
  );

  const updateAlbum = useCallback(
    (id: string, updates: Partial<Album>) => {
      persist(albums.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    },
    [albums, persist]
  );

  const deleteAlbum = useCallback(
    (id: string) => {
      persist(albums.filter((a) => a.id !== id));
    },
    [albums, persist]
  );

  const addPhotosToAlbum = useCallback(
    (albumId: string, photos: Photo[]) => {
      persist(
        albums.map((a) => {
          if (a.id !== albumId) return a;
          const existingIds = new Set(a.photos.map((p) => p.id));
          const newPhotos = photos.filter((p) => !existingIds.has(p.id));
          const updated = { ...a, photos: [...a.photos, ...newPhotos] };
          if (!updated.coverPhoto && newPhotos[0]) {
            updated.coverPhoto = newPhotos[0].url;
          }
          return updated;
        })
      );
    },
    [albums, persist]
  );

  const removePhotoFromAlbum = useCallback(
    (albumId: string, photoId: string) => {
      persist(
        albums.map((a) =>
          a.id === albumId
            ? { ...a, photos: a.photos.filter((p) => p.id !== photoId) }
            : a
        )
      );
    },
    [albums, persist]
  );

  const toggleFavorite = useCallback(
    (albumId: string, photoId: string) => {
      persist(
        albums.map((a) =>
          a.id === albumId
            ? {
                ...a,
                photos: a.photos.map((p) =>
                  p.id === photoId ? { ...p, favorite: !p.favorite } : p
                ),
              }
            : a
        )
      );
    },
    [albums, persist]
  );

  const setCoverPhoto = useCallback(
    (albumId: string, photoUrl: string) => {
      persist(
        albums.map((a) =>
          a.id === albumId ? { ...a, coverPhoto: photoUrl } : a
        )
      );
    },
    [albums, persist]
  );

  if (!hydrated) return null;

  return (
    <AlbumsContext.Provider
      value={{
        albums,
        getAlbum,
        createAlbum,
        updateAlbum,
        deleteAlbum,
        addPhotosToAlbum,
        removePhotoFromAlbum,
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
