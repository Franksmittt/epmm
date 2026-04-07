export interface ClientRecord {
  slug: string;
  name: string;
  /** Unique login code for this client (move to DB / Supabase later). */
  accessCode: string;
}

/** Admin portal access — full access to all clients. */
export const ADMIN_ACCESS_CODE = "Admin@epmm";

/**
 * Preset client access codes (plain for now). Share each code only with that client.
 * Admin: Admin@epmm
 */
export const CLIENTS: ClientRecord[] = [
  { slug: "miwesu-wood", name: "Miwesu Wood", accessCode: "EPMM-MW-WOOD" },
  { slug: "miwesu-farm", name: "Miwesu Farm", accessCode: "EPMM-MW-FARM" },
  { slug: "vaalpenskraal-wood", name: "Vaalpenskraal Wood", accessCode: "EPMM-VK-WOOD" },
  { slug: "vaalpenskraal-farm", name: "Vaalpenskraal Farm", accessCode: "EPMM-VK-FARM" },
  {
    slug: "alberton-tyre-clinic",
    name: "Alberton Tyre Clinic",
    accessCode: "EPMM-ALB-TYRE",
  },
  { slug: "absolute-offroad", name: "Absolute Offroad", accessCode: "EPMM-ABS-OFF" },
  {
    slug: "alberton-battery-mart",
    name: "Alberton Battery Mart",
    accessCode: "EPMM-ALB-BAT",
  },
  {
    slug: "maverick-painting-contractors",
    name: "Maverick Painting Contractors",
    accessCode: "EPMM-MAV-PAINT",
  },
  { slug: "on-the-move-again", name: "On The Move Again", accessCode: "EPMM-MOVE" },
  { slug: "efs-suspension", name: "EFS Suspension", accessCode: "EPMM-EFS" },
  { slug: "as-brokers", name: "AS Brokers", accessCode: "EPMM-AS-BROK" },
];

const bySlug = new Map(CLIENTS.map((c) => [c.slug, c]));
const byCode = new Map(
  CLIENTS.map((c) => [c.accessCode, c]),
);

export function getClientBySlug(slug: string): ClientRecord | undefined {
  return bySlug.get(slug);
}

export function findClientByAccessCode(
  code: string,
): ClientRecord | undefined {
  const trimmed = code.trim();
  return byCode.get(trimmed);
}

export function isRegisteredClientSlug(slug: string): boolean {
  return bySlug.has(slug);
}
