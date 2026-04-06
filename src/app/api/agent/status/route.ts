import { NextResponse } from "next/server";

import { has21stApiKey } from "@/lib/21st-client";
import { isStitchConfigured } from "@/lib/stitch-client";

export async function GET() {
  return NextResponse.json({
    apiKey: has21stApiKey(),
    stitchApiKey: isStitchConfigured(),
  });
}
