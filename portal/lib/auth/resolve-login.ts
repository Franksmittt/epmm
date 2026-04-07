import {
  ADMIN_ACCESS_CODE,
  COORDINATOR_ACCESS_CODE,
  findClientByAccessCode,
  type ClientRecord,
} from "@/lib/clients/registry";
import { isSlugRevoked, loadAppData } from "@/lib/data/app-data";

export type ResolvedLogin =
  | { kind: "admin" }
  | { kind: "coordinator" }
  | { kind: "client"; client: ClientRecord };

export async function resolveLogin(
  rawCode: string,
): Promise<
  | ResolvedLogin
  | { kind: "error"; message: string }
> {
  const code = rawCode.trim();

  if (!code) {
    return { kind: "error", message: "Enter your access code." };
  }

  if (code === ADMIN_ACCESS_CODE) {
    return { kind: "admin" };
  }

  if (code === COORDINATOR_ACCESS_CODE) {
    return { kind: "coordinator" };
  }

  const client = findClientByAccessCode(code);
  if (!client) {
    return { kind: "error", message: "Invalid access code." };
  }

  const data = await loadAppData();
  if (isSlugRevoked(data, client.slug)) {
    return {
      kind: "error",
      message: "This access code is no longer active. Contact your agency.",
    };
  }

  return { kind: "client", client };
}
