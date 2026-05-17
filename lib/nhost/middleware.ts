import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isNhostConfigured } from "@/lib/nhost/public-config";

export function updateNhostSession(request: NextRequest) {
  if (!isNhostConfigured()) {
    return NextResponse.next({ request });
  }

  return NextResponse.next({ request });
}
