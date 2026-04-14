import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { extname, join, resolve } from "path";
import { NextRequest } from "next/server";

const UPLOAD_CATEGORIES = ["logo", "product", "prompt", "palette", "reference"] as const;
type UploadCategory = (typeof UPLOAD_CATEGORIES)[number];

const MIME_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

function isUploadCategory(value: string): value is UploadCategory {
  return UPLOAD_CATEGORIES.includes(value as UploadCategory);
}

function getUploadsRootDir() {
  const desktopDir = process.env.APP_UPLOADS_DIR?.trim();
  if (desktopDir) {
    return desktopDir;
  }

  return join(process.cwd(), "public", "uploads");
}

function sanitizeFilename(raw: string) {
  if (!raw) return null;
  if (raw.includes("/") || raw.includes("\\") || raw.includes("..")) return null;
  return raw;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ category: string; filename: string }> },
) {
  const { category: rawCategory, filename: rawFilename } = await params;
  const category = decodeURIComponent(rawCategory || "");
  const filename = sanitizeFilename(decodeURIComponent(rawFilename || ""));

  if (!isUploadCategory(category) || !filename) {
    return new Response("Arquivo não encontrado", { status: 404 });
  }

  const rootDir = getUploadsRootDir();
  const categoryDir = resolve(rootDir, category);
  const filePath = resolve(categoryDir, filename);

  if (!filePath.startsWith(categoryDir) || !existsSync(filePath)) {
    return new Response("Arquivo não encontrado", { status: 404 });
  }

  try {
    const body = await readFile(filePath);
    const extension = extname(filePath).toLowerCase();
    const contentType = MIME_BY_EXTENSION[extension] || "application/octet-stream";
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch {
    return new Response("Falha ao ler arquivo", { status: 500 });
  }
}
