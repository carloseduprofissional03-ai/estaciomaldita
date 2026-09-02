export type ReportStatus = "pending" | "approved" | "rejected";
export type EventStatus = "pending" | "approved" | "cancelled";
export type MediaStatus = "pending" | "approved";

export interface Report {
  id: string;
  category: string;
  title: string;
  description: string;
  reference: string;
  lat: number;
  lng: number;
  photoUrl?: string;
  contact?: string;
  status: ReportStatus;
  resolved: boolean;
  resolutionNote?: string;
  createdAt: string;
}

export interface CleanupEvent {
  id: string;
  title: string;
  description: string;
  locationName: string;
  date: string; // yyyy-mm-dd
  startTime: string; // HH:mm
  endTime: string;
  volunteersTarget?: number;
  signupCount: number;
  proposerName: string;
  proposerContact?: string;
  status: EventStatus;
  createdAt: string;
}

export interface EventSignup {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  body: string;
  coverUrl?: string;
  author: string;
  status: MediaStatus;
  createdAt: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  author: string;
  status: MediaStatus;
  createdAt: string;
}

export interface AppDB {
  reports: Report[];
  events: CleanupEvent[];
  news: NewsItem[];
  photos: GalleryPhoto[];
}

export type DbKey = keyof AppDB;

export interface NewReportInput {
  category: string;
  title: string;
  description: string;
  reference: string;
  lat: number;
  lng: number;
  photoUrl?: string;
  contact?: string;
}

export interface NewEventInput {
  title: string;
  description: string;
  locationName: string;
  date: string;
  startTime: string;
  endTime: string;
  volunteersTarget?: number;
  proposerName: string;
  proposerContact?: string;
}

export interface NewNewsInput {
  title: string;
  summary: string;
  body: string;
  coverUrl?: string;
  author: string;
}

export interface NewPhotoInput {
  title: string;
  description?: string;
  imageUrl: string;
  author: string;
}

export interface NewSignupInput {
  eventId: string;
  name: string;
  email: string;
  phone?: string;
}
