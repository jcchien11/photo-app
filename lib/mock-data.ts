export type AspectRatio = "portrait" | "landscape" | "square";

export interface Photo {
  id: string;
  url: string;
  width: number;
  height: number;
  aspectRatio: AspectRatio;
  tags: string[];
  location?: string;
  date: string;
  favorite: boolean;
  exifLocation?: { lat: number; lng: number; label: string };
}

export interface Album {
  id: string;
  title: string;
  description: string;
  coverPhoto: string;
  date: string;
  location?: string;
  photos: Photo[];
  tags: string[];
  createdAt: string;
  sharedWith: string[];
}

const TAGS = [
  "portrait",
  "candid",
  "ceremony",
  "reception",
  "getting ready",
  "first look",
  "details",
  "landscape",
  "family",
  "couple",
  "editorial",
  "golden hour",
];

const LOCATIONS = [
  { label: "Santorini, Greece", lat: 36.3932, lng: 25.4615 },
  { label: "Tuscany, Italy", lat: 43.7711, lng: 11.2486 },
  { label: "Paris, France", lat: 48.8566, lng: 2.3522 },
  { label: "New York, NY", lat: 40.7128, lng: -74.006 },
  { label: "Joshua Tree, CA", lat: 34.1342, lng: -116.3119 },
  { label: "Asheville, NC", lat: 35.5951, lng: -82.5515 },
];

function aspectDimensions(ratio: AspectRatio): { width: number; height: number } {
  if (ratio === "portrait") return { width: 800, height: 1067 };
  if (ratio === "landscape") return { width: 1067, height: 800 };
  return { width: 800, height: 800 };
}

function makePhotos(albumSeed: string, count: number, startIdx = 0): Photo[] {
  const ratioPattern: AspectRatio[] = [
    "portrait", "landscape", "portrait", "portrait", "landscape",
    "square", "portrait", "landscape", "portrait", "square",
  ];
  const tagPattern = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

  return Array.from({ length: count }, (_, i) => {
    const idx = startIdx + i;
    const ratio = ratioPattern[idx % ratioPattern.length];
    const { width, height } = aspectDimensions(ratio);
    return {
      id: `${albumSeed}-${idx}`,
      url: `https://picsum.photos/seed/${albumSeed}${idx}/${width}/${height}`,
      width,
      height,
      aspectRatio: ratio,
      tags: [TAGS[tagPattern[idx % tagPattern.length]]],
      location: loc.label,
      date: new Date(2023, idx % 12, (idx % 28) + 1).toISOString(),
      favorite: idx % 7 === 0,
      exifLocation: { ...loc },
    };
  });
}

export const mockAlbums: Album[] = [
  {
    id: "album-1",
    title: "Meghan & Desmond",
    description:
      "A timeless winter wedding at the Oia cliffs. Every frame, a love story written in warm light and white linen.",
    coverPhoto: "https://picsum.photos/seed/wedding10/1600/900",
    date: "2023-01-10T00:00:00.000Z",
    location: "Santorini, Greece",
    photos: makePhotos("wed", 28),
    tags: ["wedding", "ceremony", "editorial"],
    createdAt: "2023-01-12T00:00:00.000Z",
    sharedWith: ["olivia@example.com"],
  },
  {
    id: "album-2",
    title: "Emma & James",
    description:
      "An intimate engagement session through the sun-drenched vineyards of Chianti.",
    coverPhoto: "https://picsum.photos/seed/engage20/1600/900",
    date: "2023-03-22T00:00:00.000Z",
    location: "Tuscany, Italy",
    photos: makePhotos("eng", 22),
    tags: ["engagement", "couple", "golden hour"],
    createdAt: "2023-03-25T00:00:00.000Z",
    sharedWith: [],
  },
  {
    id: "album-3",
    title: "The Williams Family",
    description:
      "Central Park at its finest — a family portrait session full of laughter and real moments.",
    coverPhoto: "https://picsum.photos/seed/family30/1600/900",
    date: "2023-04-15T00:00:00.000Z",
    location: "New York, NY",
    photos: makePhotos("fam", 18),
    tags: ["family", "portrait", "candid"],
    createdAt: "2023-04-17T00:00:00.000Z",
    sharedWith: ["dad@williams.com", "mom@williams.com"],
  },
  {
    id: "album-4",
    title: "Sarah & Michael",
    description:
      "Notre-Dame at dusk, Montmartre at dawn — Paris delivered on every romantic promise.",
    coverPhoto: "https://picsum.photos/seed/paris40/1600/900",
    date: "2023-06-05T00:00:00.000Z",
    location: "Paris, France",
    photos: makePhotos("par", 32),
    tags: ["wedding", "destination", "editorial"],
    createdAt: "2023-06-08T00:00:00.000Z",
    sharedWith: [],
  },
  {
    id: "album-5",
    title: "Joshua Tree Retreat",
    description:
      "Where the desert meets the sky — a solitary editorial session under infinite stars.",
    coverPhoto: "https://picsum.photos/seed/desert50/1600/900",
    date: "2023-09-18T00:00:00.000Z",
    location: "Joshua Tree, CA",
    photos: makePhotos("des", 20),
    tags: ["editorial", "landscape", "golden hour"],
    createdAt: "2023-09-20T00:00:00.000Z",
    sharedWith: [],
  },
  {
    id: "album-6",
    title: "Blue Ridge Elopement",
    description:
      "Just the two of them, the mountains, and fog rolling through the valleys at sunrise.",
    coverPhoto: "https://picsum.photos/seed/mountain60/1600/900",
    date: "2023-11-03T00:00:00.000Z",
    location: "Asheville, NC",
    photos: makePhotos("mtn", 16),
    tags: ["elopement", "couple", "landscape"],
    createdAt: "2023-11-05T00:00:00.000Z",
    sharedWith: [],
  },
];

// Shared library of available placeholder photos (for "Add Photos" picker)
export const photoLibrary: Photo[] = [
  ...makePhotos("lib-a", 15, 0),
  ...makePhotos("lib-b", 15, 15),
  ...makePhotos("lib-c", 15, 30),
  ...makePhotos("lib-d", 15, 45),
];
