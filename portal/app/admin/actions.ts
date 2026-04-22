"use server";

import { revalidatePath } from "next/cache";
import { getClientBySlug } from "@/lib/clients/registry";
import {
  loadAppData,
  saveAppData,
  type StoredDayContent,
} from "@/lib/data/app-data";
import { saveImageUpload } from "@/lib/data/save-upload";
import { getSession } from "@/lib/auth/session";

async function requireAdmin(): Promise<boolean> {
  const s = await getSession();
  return s?.role === "admin";
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type SaveClientDayState = { ok?: boolean; error?: string } | null;

export async function toggleClientRevokedAction(
  formData: FormData,
): Promise<void> {
  if (!(await requireAdmin())) {
    return;
  }
  const slug = formData.get("slug");
  const nextRaw = formData.get("revoked");
  if (typeof slug !== "string" || !getClientBySlug(slug)) {
    return;
  }
  const revoked = nextRaw === "true";
  const data = await loadAppData();
  const set = new Set(data.revokedSlugs);
  if (revoked) {
    set.add(slug);
  } else {
    set.delete(slug);
  }
  data.revokedSlugs = [...set];
  await saveAppData(data);
  revalidatePath("/admin");
}

export async function saveClientDayAction(
  _prev: SaveClientDayState,
  formData: FormData,
): Promise<SaveClientDayState> {
  const slug = formData.get("slug");
  const date = formData.get("date");
  const caption = formData.get("caption");

  if (typeof slug !== "string" || !getClientBySlug(slug)) {
    return { error: "Invalid client." };
  }
  if (!(await requireAdmin())) {
    return { error: "Unauthorized." };
  }
  if (typeof date !== "string" || !DATE_RE.test(date)) {
    return { error: "Pick a valid date." };
  }
  if (typeof caption !== "string" || !caption.trim()) {
    return { error: "Caption is required." };
  }

  const square = formData.get("square");
  const vertical = formData.get("vertical");

  const data = await loadAppData();
  if (!data.schedules[slug]) {
    data.schedules[slug] = {};
  }
  const prev: StoredDayContent = data.schedules[slug][date] ?? {
    caption: "",
    squareUrl: null,
    verticalUrl: null,
    updatedAt: new Date().toISOString(),
  };

  let squareUrl = prev.squareUrl;
  let verticalUrl = prev.verticalUrl;

  try {
    if (square instanceof File && square.size > 0) {
      squareUrl = await saveImageUpload(slug, date, "square", square);
    }
    if (vertical instanceof File && vertical.size > 0) {
      verticalUrl = await saveImageUpload(slug, date, "vertical", vertical);
    }
  } catch {
    return { error: "Could not save one of the images." };
  }

  const next: StoredDayContent = {
    caption: caption.trim(),
    squareUrl,
    verticalUrl,
    updatedAt: new Date().toISOString(),
  };
  if (!verticalUrl && prev.feedOnly) {
    next.feedOnly = true;
  }
  data.schedules[slug][date] = next;

  await saveAppData(data);
  revalidatePath("/admin");
  revalidatePath(`/admin/clients/${slug}`);
  revalidatePath(`/${slug}`);
  return { ok: true };
}

export async function deleteClientDayAction(formData: FormData): Promise<void> {
  const slug = formData.get("slug");
  const date = formData.get("date");
  if (typeof slug !== "string" || typeof date !== "string" || !DATE_RE.test(date)) {
    return;
  }
  if (!(await requireAdmin())) {
    return;
  }
  const data = await loadAppData();
  if (data.schedules[slug]?.[date]) {
    delete data.schedules[slug][date];
    if (Object.keys(data.schedules[slug]).length === 0) {
      delete data.schedules[slug];
    }
    await saveAppData(data);
  }
  revalidatePath("/admin");
  revalidatePath(`/admin/clients/${slug}`);
  revalidatePath(`/${slug}`);
}
