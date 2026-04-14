import { existsSync } from "fs";
import { mkdir, readdir, writeFile } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";

import { isElectronDesktopRuntime } from "@/lib/app-base-url";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "text/plain": ".txt",
  "application/json": ".json",
  "text/markdown": ".md",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const UPLOAD_CATEGORIES = ["logo", "product", "prompt", "palette", "reference"] as const;
type UploadCategory = (typeof UPLOAD_CATEGORIES)[number];

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

function toUploadApiUrl(category: UploadCategory, filename: string) {
  return `/api/uploads/${encodeURIComponent(category)}/${encodeURIComponent(filename)}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const rawCategory = String(formData.get("category") || "reference");
    const category: UploadCategory = isUploadCategory(rawCategory)
      ? rawCategory
      : "reference";

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    if (!ALLOWED_TYPES[file.type]) {
      return NextResponse.json(
        { error: `Tipo de arquivo não suportado: ${file.type}` },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo 5MB." }, { status: 400 });
    }

    const uploadRootDir = getUploadsRootDir();
    const uploadDir = join(uploadRootDir, category);

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const extension = ALLOWED_TYPES[file.type];
    const filename = `${category}-${timestamp}-${randomId}${extension}`;
    const filePath = join(uploadDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    let base64: string | undefined;
    if (file.type.startsWith("image/")) {
      base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    let content: string | undefined;
    if (file.type.startsWith("text/") || file.type === "application/json") {
      content = buffer.toString("utf-8");
    }

    return NextResponse.json({
      success: true,
      url: toUploadApiUrl(category, filename),
      filename: file.name,
      storedFilename: filename,
      type: file.type,
      size: file.size,
      category,
      storage: isElectronDesktopRuntime() ? "desktop" : "web",
      base64,
      content,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json({ error: "Falha ao fazer upload do arquivo" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const uploadRootDir = getUploadsRootDir();
    const result: Record<string, Array<{ name: string; url: string; type: string }>> = {};

    for (const category of UPLOAD_CATEGORIES) {
      const dir = join(uploadRootDir, category);
      try {
        const files = await readdir(dir);
        result[category] = files
          .filter((name) => !name.startsWith("."))
          .map((filename) => ({
            name: filename,
            url: toUploadApiUrl(category, filename),
            type: filename.split(".").pop() || "",
          }));
      } catch {
        result[category] = [];
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao listar uploads:", error);
    return NextResponse.json({ error: "Falha ao listar arquivos" }, { status: 500 });
  }
}
