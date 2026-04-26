import { NextResponse } from "next/server";

import { has21stApiKey } from "@/lib/providers/21st-client";
import { isStitchConfigured } from "@/lib/providers/stitch-client";

export async function GET() {
  const twentyFirstConfigured = has21stApiKey();
  const stitchConfigured = isStitchConfigured();

  return NextResponse.json({
    apiKey: twentyFirstConfigured,
    stitchApiKey: stitchConfigured,
    twentyFirstConfigured,
    stitchConfigured,
  });
}
