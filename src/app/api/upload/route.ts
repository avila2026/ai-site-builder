import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Tipos de arquivos suportados
const ALLOWED_TYPES: Record<string, string> = {
  // Imagens
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  // Documentos de texto
  'text/plain': '.txt',
  'application/json': '.json',
  'text/markdown': '.md',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Categorias de upload
type UploadCategory = 'logo' | 'product' | 'prompt' | 'palette' | 'reference';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = (formData.get('category') as UploadCategory) || 'reference';

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Validar tipo
    if (!ALLOWED_TYPES[file.type]) {
      return NextResponse.json(
        { error: `Tipo de arquivo não suportado: ${file.type}` },
        { status: 400 }
      );
    }

    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB.' },
        { status: 400 }
      );
    }

    // Criar diretório de uploads se não existir
    const uploadDir = join(process.cwd(), 'public', 'uploads', category);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Gerar nome único
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const extension = ALLOWED_TYPES[file.type];
    const filename = `${category}-${timestamp}-${randomId}${extension}`;

    // Salvar arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // URL pública do arquivo
    const publicUrl = `/uploads/${category}/${filename}`;

    // Para imagens, retornar também base64 para preview rápido
    let base64: string | undefined;
    if (file.type.startsWith('image/')) {
      base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
    }

    // Para arquivos de texto, ler conteúdo
    let content: string | undefined;
    if (file.type.startsWith('text/') || file.type === 'application/json') {
      content = buffer.toString('utf-8');
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: file.name,
      type: file.type,
      size: file.size,
      category,
      base64,
      content,
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { error: 'Falha ao fazer upload do arquivo' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Listar arquivos uploadados por categoria
  const { readdir } = await import('fs/promises');
  const { join } = await import('path');

  try {
    const categories: UploadCategory[] = ['logo', 'product', 'prompt', 'palette', 'reference'];
    const result: Record<string, Array<{ name: string; url: string; type: string }>> = {};

    for (const category of categories) {
      const dir = join(process.cwd(), 'public', 'uploads', category);
      try {
        const files = await readdir(dir);
        result[category] = files
          .filter(f => !f.startsWith('.'))
          .map(filename => ({
            name: filename,
            url: `/uploads/${category}/${filename}`,
            type: filename.split('.').pop() || '',
          }));
      } catch {
        result[category] = [];
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao listar uploads:', error);
    return NextResponse.json(
      { error: 'Falha ao listar arquivos' },
      { status: 500 }
    );
  }
}
