import dotenv from 'dotenv';
import { stitch } from '@google/stitch-sdk';

dotenv.config({ path: '.env.local' });

const sitePrompt =
  process.env.STITCH_SMOKE_PROMPT ||
  'Uma landing page moderna em português do Brasil para um SaaS de automação, com hero, benefícios e CTA.';

const projectTitle =
  process.env.STITCH_SMOKE_PROJECT_TITLE ||
  `Stitch Smoke ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;

async function run() {
  if (!process.env.STITCH_API_KEY) {
    throw new Error('STITCH_API_KEY nao configurada em .env.local');
  }

  const project = await stitch.createProject(projectTitle);
  const screen = await project.generate(
    sitePrompt,
    process.env.STITCH_DEVICE_TYPE || 'DESKTOP',
    process.env.STITCH_MODEL_ID || 'GEMINI_3_FLASH',
  );

  const htmlUrl = await screen.getHtml();
  const imageUrl = await screen.getImage();

  const htmlResponse = await fetch(htmlUrl);
  const html = await htmlResponse.text();

  console.log(
    JSON.stringify(
      {
        ok: true,
        provider: 'stitch',
        projectId: project.id,
        screenId: screen.id,
        htmlUrl,
        imageUrl,
        htmlChars: html.length,
      },
      null,
      2,
    ),
  );
}

run()
  .catch((error) => {
    console.error(
      JSON.stringify(
        {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await stitch.close();
    } catch {
      // no-op
    }
  });
