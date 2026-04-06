import fs from 'node:fs';
import path from 'node:path';

import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const REQUIRED_PREVIEW_ENV = [
  'STITCH_API_KEY',
  'STITCH_PROJECT_ID',
  'SITE_GENERATION_PROVIDER',
];

const OPTIONAL_ENV_GROUPS = [
  'AUTH0_DOMAIN',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET',
  'AUTH0_SECRET',
  'APP_BASE_URL',
  'DATABASE_URL',
  'API_KEY_21ST',
  'TWENTY_FIRST_DEV_API_KEY',
  'BROWSERBASE_API_KEY',
  'BROWSERBASE_PROJECT_ID',
  'AUTONOMA_CLIENT_ID',
  'AUTONOMA_SECRET_ID',
  'AI_GATEWAY_API_KEY',
  'AI_GATEWAY_BYOK',
];

function readJsonIfExists(relativePath) {
  const absolutePath = path.resolve(relativePath);
  if (!fs.existsSync(absolutePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
}

function getMissingEnv(envNames) {
  return envNames.filter((name) => {
    const value = process.env[name];
    return !value || !String(value).trim();
  });
}

function main() {
  const linkedProject = readJsonIfExists('.vercel/project.json');
  const localProjectConfig = readJsonIfExists('.vercel-project.json');

  const missingRequired = getMissingEnv(REQUIRED_PREVIEW_ENV);
  const missingOptional = getMissingEnv(OPTIONAL_ENV_GROUPS);

  const provider = process.env.SITE_GENERATION_PROVIDER || '(unset)';
  const stitchProjectId = process.env.STITCH_PROJECT_ID || '(unset)';

  console.log('Vercel preflight');
  console.log(`- linked project: ${linkedProject?.projectName || localProjectConfig?.name || '(unknown)'}`);
  console.log(`- linked project id: ${linkedProject?.projectId || localProjectConfig?.projectId || '(unknown)'}`);
  console.log(`- linked team id: ${linkedProject?.orgId || localProjectConfig?.orgId || '(unknown)'}`);
  console.log(`- active provider: ${provider}`);
  console.log(`- stitch project target: ${stitchProjectId}`);
  console.log(`- expected node engine: 22.x`);

  if (provider !== 'stitch') {
    console.error('- error: SITE_GENERATION_PROVIDER deve ser "stitch" para o caminho de preview');
    process.exitCode = 1;
    return;
  }

  if (missingRequired.length > 0) {
    console.error(`- error: envs obrigatórias ausentes: ${missingRequired.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  if (missingOptional.length > 0) {
    console.warn(`- warning: envs opcionais ausentes: ${missingOptional.join(', ')}`);
  } else {
    console.log('- optional envs: todas presentes');
  }

  console.log('- result: preview-ready');
}

main();
