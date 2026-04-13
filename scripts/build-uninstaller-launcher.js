const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function resolveNsisDir() {
  if (process.env.ELECTRON_BUILDER_NSIS_DIR) {
    return process.env.ELECTRON_BUILDER_NSIS_DIR;
  }

  const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
  const cacheRoot = path.join(localAppData, 'electron-builder', 'Cache', 'nsis');

  if (!fs.existsSync(cacheRoot)) {
    throw new Error('Cache do NSIS nao encontrado. Execute o electron-builder antes de gerar o desinstalador.');
  }

  const candidates = fs.readdirSync(cacheRoot)
    .map(entry => path.join(cacheRoot, entry))
    .filter(entry => fs.existsSync(path.join(entry, 'Bin', 'makensis.exe')))
    .sort()
    .reverse();

  if (candidates.length === 0) {
    throw new Error('makensis.exe nao encontrado no cache do electron-builder.');
  }

  return candidates[0];
}

function main() {
  if (process.platform !== 'win32') {
    console.log('⚠️  Geracao do desinstalador avulso disponivel apenas no Windows.');
    return;
  }

  const projectDir = path.join(__dirname, '..');
  const packageJson = readJson(path.join(projectDir, 'package.json'));
  const builderConfig = readJson(path.join(projectDir, 'electron-builder.json'));
  const nsisConfig = builderConfig.nsis || {};
  const outputDir = path.join(projectDir, builderConfig.directories?.output || 'release-builder');
  const iconPath = path.join(projectDir, 'build', 'icon.ico');
  const scriptPath = path.join(projectDir, 'build', 'uninstall-launcher.nsi');
  const productName = builderConfig.productName || packageJson.productName || packageJson.name;
  const version = packageJson.version;
  const guid = nsisConfig.guid;

  if (!guid) {
    throw new Error('Defina nsis.guid em electron-builder.json para gerar o desinstalador avulso.');
  }

  if (!fs.existsSync(iconPath)) {
    throw new Error('build/icon.ico nao encontrado. Rode "npm run electron:build:win" para preparar os assets.');
  }

  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Script NSIS nao encontrado: ${scriptPath}`);
  }

  const nsisDir = resolveNsisDir();
  const makensisPath = path.join(nsisDir, 'Bin', 'makensis.exe');
  const outFile = path.join(outputDir, `${productName}-${version}-Uninstall.exe`);
  const uninstallRegistryKey = `Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${guid}`;

  fs.mkdirSync(outputDir, { recursive: true });

  console.log('🧹 Gerando desinstalador standalone...\n');

  const result = spawnSync(
    makensisPath,
    [
      '-NOCD',
      '-INPUTCHARSET',
      'UTF8',
      `-DPRODUCT_NAME=${productName}`,
      `-DOUT_FILE=${outFile}`,
      `-DICON_FILE=${iconPath}`,
      `-DUNINSTALL_REGISTRY_KEY=${uninstallRegistryKey}`,
      scriptPath,
    ],
    { stdio: 'inherit' }
  );

  if (result.status !== 0) {
    throw new Error(`Falha ao compilar o desinstalador standalone (codigo ${result.status ?? 'desconhecido'}).`);
  }

  console.log(`\n✅ Desinstalador gerado: ${path.relative(projectDir, outFile)}`);
}

try {
  main();
} catch (error) {
  console.error(`❌ ${error.message}`);
  process.exit(1);
}
