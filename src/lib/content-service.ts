import { supabase, isSupabaseConfigured } from "./supabase";
import { executives as staticExecutives, Executive } from "@/data/executives";
import { events as staticEvents } from "@/data/events";
import { blogs as staticBlogs, BlogPost } from "@/data/blogs";

export interface SupabaseExecutive {
  id: string;
  name: string;
  post: string;
  department: string;
  level: string;
  description: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  arm?: "SEC" | "SRC";
}

export interface SupabaseEvent {
  id: string;
  slug: string;
  title: string;
  event_status: "upcoming" | "current" | "past";
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  description: string;
  cover_image_url: string | null;
  registration_url: string | null;
  sort_order: number;
  is_active: boolean;
  gallery?: string[];
}

export interface SupabaseBlog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  image_url: string | null;
  is_published: boolean;
  published_at: string | null;
}

/**
 * Fetches executives from Supabase with graceful fallback to static data
 */
export const fetchExecutives = async (): Promise<Executive[]> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("executives")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((item: SupabaseExecutive) => ({
          name: item.name,
          post: item.post,
          department: item.department || "Basic Sciences",
          level: item.level || "400 Level",
          description: item.description || "",
          image: item.image_url || "/assets/president.jpg",
          arm: item.arm || (item.post.toLowerCase().includes("speaker") || item.post.toLowerCase().includes("clerk") || item.post.toLowerCase().includes("honorable") || item.post.toLowerCase().includes("honourable") ? "SRC" : "SEC"),
        }));
      }
    } catch (err) {
      console.warn("Could not query Supabase executives, using local fallback:", err);
    }
  }

  return staticExecutives;
};

/**
 * Fetches collegiate events from Supabase with fallback to static events
 */
export const fetchEvents = async (): Promise<any[]> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((item: SupabaseEvent) => ({
          id: item.slug || item.id,
          slug: item.slug,
          title: item.title,
          description: item.description,
          event_date: item.start_date,
          location: item.location || "LASUSTECH Campus",
          upcoming: item.event_status === "upcoming" || (item.start_date && new Date(item.start_date) >= new Date()),
          image: item.cover_image_url || "",
          link: item.registration_url || "",
        }));
      }
    } catch (err) {
      console.warn("Could not query Supabase events, using local fallback:", err);
    }
  }

  return staticEvents;
};

/**
 * Fetches blogs / articles from Supabase with fallback to static articles
 */
export const fetchBlogs = async (): Promise<BlogPost[]> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item: SupabaseBlog) => ({
          id: item.slug || item.id,
          title: item.title,
          excerpt: item.excerpt,
          content: item.content,
          author: item.author || "NASS Secretariat",
          date: item.published_at ? new Date(item.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent",
          category: item.category || "Collegiate Dispatch",
          image: item.image_url || "",
        }));
      }
    } catch (err) {
      console.warn("Could not query Supabase blogs, using local fallback:", err);
    }
  }

  return staticBlogs;
};
