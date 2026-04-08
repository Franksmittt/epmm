export interface ClientRecord {
  slug: string;
  name: string;
  /** Unique login code for this client (move to DB / Supabase later). */
  accessCode: string;
}

/** Admin portal access — full access to all clients. */
export const ADMIN_ACCESS_CODE = "Admin@epmm";

/**
 * Coordinator / social-media operator — sees only {@link COORDINATOR_CLIENT_SLUGS} on one hub.
 */
export const COORDINATOR_ACCESS_CODE = "Yogs@123";

/** Slugs the multi-brand client login can open (same client dashboard). Order = hub display order. */
export const COORDINATOR_CLIENT_SLUGS = [
  "absolute-offroad",
  "alberton-battery-mart",
  "alberton-tyre-clinic",
] as const;

export function isCoordinatorAllowedSlug(slug: string): boolean {
  return (COORDINATOR_CLIENT_SLUGS as readonly string[]).includes(slug);
}

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
  {
    slug: "endpoint-media",
    name: "Endpoint Media",
    accessCode: "EPMM-ENDPOINT",
  },
  { slug: "as-brokers", name: "AS Brokers", accessCode: "EPMM-AS-BROK" },
  {
    slug: "everest-wealth",
    name: "Everest Wealth",
    accessCode: "EPMM-EVEREST",
  },
];

const bySlug = new Map(CLIENTS.map((c) => [c.slug, c]));
const byCode = new Map(
  CLIENTS.map((c) => [c.accessCode, c]),
);

export function getClientBySlug(slug: string): ClientRecord | undefined {
  return bySlug.get(slug);
}

export function getCoordinatorClients(): ClientRecord[] {
  return COORDINATOR_CLIENT_SLUGS.map((s) => getClientBySlug(s)).filter(
    (c): c is ClientRecord => c !== undefined,
  );
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
