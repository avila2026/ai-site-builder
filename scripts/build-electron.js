/**
 * Script de build para Electron
 *
 * 1. Roda o build do Next.js (modo standalone)
 * 2. Prepara arquivos para o electron-builder
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico').default;

console.log('📦 Preparando build para Electron...\n');

async function ensureWindowsIcon() {
  const buildDir = path.join(__dirname, '..', 'electron', 'build-resources');
  const icoPath = path.join(buildDir, 'icon.ico');
  fs.mkdirSync(buildDir, { recursive: true });

  if (fs.existsSync(icoPath)) {
    return;
  }

  const pngCandidates = [
    path.join(buildDir, 'icon.png'),
    path.join(__dirname, '..', 'public', 'icon-512.png'),
  ];
  const pngPath = pngCandidates.find(candidate => fs.existsSync(candidate));

  if (!pngPath) {
    throw new Error('Nenhum ícone PNG encontrado em electron/build-resources/icon.png ou public/icon-512.png');
  }

  console.log('🖼️  Gerando electron/build-resources/icon.ico para o instalador...\n');
  const icoBuffer = await pngToIco(pngPath);
  fs.writeFileSync(icoPath, icoBuffer);
}

async function main() {
  try {
    await ensureWindowsIcon();

    // Roda o build do Next.js
    console.log('🔨 Rodando build do Next.js (standalone)...\n');
    const nextCli = path.join(
      __dirname,
      '..',
      'node_modules',
      'next',
      'dist',
      'bin',
      'next'
    );

    execFileSync(process.execPath, [nextCli, 'build'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });

    console.log('\n✅ Build completo!');
    console.log('   Output: .next/standalone/\n');
  } catch (error) {
    console.error('❌ Erro no build:', error.message);
    process.exit(1);
  }
}

main();
