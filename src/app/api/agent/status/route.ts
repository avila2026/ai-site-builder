import { NextResponse } from "next/server";

import { has21stApiKey } from "@/lib/21st-client";
import { isStitchConfigured } from "@/lib/stitch-client";

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
