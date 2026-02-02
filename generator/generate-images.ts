/**
 * Low Ratings Academy Awards - Image Generator
 *
 * Downloads CC-licensed photos from Wikimedia Commons for people,
 * and generates satirical AI art via DALL-E 3 for scene/thematic images.
 *
 * Usage: npx tsx generator/generate-images.ts
 *
 * Requires: OPENAI_API_KEY in ~/.continuum/config.env
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import https from 'https';
import http from 'http';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ROOT = join(import.meta.dirname, '..');
const PEOPLE_DIR = join(ROOT, 'public', 'images', 'people');
const SCENES_DIR = join(ROOT, 'public', 'images', 'scenes');

function loadEnv(): Record<string, string> {
  const envPath = join(process.env.HOME ?? '', '.continuum', 'config.env');
  if (!existsSync(envPath)) {
    console.error(`Config not found: ${envPath}`);
    process.exit(1);
  }
  const env: Record<string, string> = {};
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx > 0) {
      env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
    }
  }
  return env;
}

const env = loadEnv();
const OPENAI_API_KEY = env['OPENAI_API_KEY'];

// ---------------------------------------------------------------------------
// Wikimedia Commons downloads (CC-licensed photos of real people)
// ---------------------------------------------------------------------------

interface PersonImage {
  name: string;
  filename: string;
  url: string;
  attribution: string;
}

const PEOPLE_IMAGES: PersonImage[] = [
  {
    name: 'Jimmy Kimmel',
    filename: 'jimmy_kimmel.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Jimmy_Kimmel_in_2015.jpg',
    attribution: 'Public Domain - White House Photo by Pete Souza',
  },
  {
    name: 'Trevor Noah',
    filename: 'trevor_noah.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Trevor_Noah_%2853554114243%29_%28portrait_crop%29.jpg',
    attribution: 'CC BY 2.0 - Web Summit Qatar',
  },
  {
    name: 'Kathy Griffin',
    filename: 'kathy_griffin.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Kathy_in_2008_cropped.jpg',
    attribution: 'CC BY-SA 2.0 - Rob Marquardt',
  },
  {
    name: 'Melania Trump',
    filename: 'melania_trump.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Melania_Trump_official_portrait_%28cropped%29.jpg',
    attribution: 'CC BY 3.0 US - White House Photo by Regine Mahaux',
  },
  {
    name: 'Rosie O\'Donnell',
    filename: 'rosie_odonnell.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Rosie_O%27Donnell_by_David_Shankbone.jpg',
    attribution: 'CC BY-SA 3.0 - David Shankbone',
  },
  {
    name: 'Robert De Niro',
    filename: 'robert_deniro.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Robert_De_Niro_2011_Shankbone.JPG',
    attribution: 'CC BY 3.0 - David Shankbone',
  },
  {
    name: 'Tom Hanks',
    filename: 'tom_hanks.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Tom_Hanks_2014.jpg',
    attribution: 'Public Domain - U.S. Department of State',
  },
  {
    name: 'Meryl Streep',
    filename: 'meryl_streep.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Meryl_Streep_interview_at_Festival_de_Cannes_2024_%28cropped%29.jpg',
    attribution: 'CC BY-SA 4.0 - Kevin Payravi / WikiPortraits',
  },
  {
    name: 'Alec Baldwin',
    filename: 'alec_baldwin.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Alec_Baldwin_by_David_Shankbone.jpg',
    attribution: 'CC BY-SA 3.0 - David Shankbone',
  },
  {
    name: 'Jussie Smollett',
    filename: 'jussie_smollett.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Jussie_Smollett_%2826362136311%29.jpg',
    attribution: 'CC BY-SA 2.0 - Dominick D',
  },
  {
    name: 'Mark Ruffalo',
    filename: 'mark_ruffalo.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Mark_Ruffalo_%2826758760433%29.jpg',
    attribution: 'CC BY-SA 2.0 - Greg2600',
  },
  {
    name: 'Dinesh D\'Souza',
    filename: 'dinesh_dsouza.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Dinesh_D%27Souza_booking_photo.jpg',
    attribution: 'Public Domain - U.S. Federal Government booking photo',
  },
  {
    name: 'Brett Ratner',
    filename: 'brett_ratner.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Brett_Ratner_2012_Shankbone.JPG',
    attribution: 'CC BY 3.0 - David Shankbone',
  },
  {
    name: 'Donald Trump',
    filename: 'donald_trump.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Donald_Trump_official_portrait.jpg',
    attribution: 'Public Domain - White House Photo by Shealah Craighead',
  },
];

// ---------------------------------------------------------------------------
// DALL-E 3 scene prompts
// ---------------------------------------------------------------------------

interface ScenePrompt {
  name: string;
  filename: string;
  prompt: string;
  size: '1024x1024' | '1792x1024' | '1024x1792';
}

const SCENE_PROMPTS: ScenePrompt[] = [
  {
    name: 'Hero Banner',
    filename: 'hero_banner.png',
    prompt:
      'A hilariously cheap awards ceremony set up in a parking lot at night. A small folding table with a spray-painted gold plastic trophy on it. Christmas string lights tangled on parking meters. A wrinkled red bath towel laid out as a "red carpet" on the asphalt. A cardboard sign reading "AWARDS" in gold spray paint. Cinematic wide shot, dramatic lighting that contrasts with the absurd cheapness. Photorealistic.',
    size: '1792x1024',
  },
  {
    name: 'Trophy',
    filename: 'trophy.png',
    prompt:
      'A participation trophy from a dollar store, crudely spray-painted gold, sitting on a folding card table with a paper tablecloth. The trophy has a tiny generic figure on top. There is visible dripping gold spray paint and fingerprints. Shot against a dark velvet curtain backdrop that has a visible seam and is slightly crooked. Studio product photography style, dramatic golden lighting.',
    size: '1024x1024',
  },
  {
    name: 'Melania Movie Poster Parody',
    filename: 'melania_poster.png',
    prompt:
      'A satirical movie poster for a fictional documentary. Golden gilded ornate baroque picture frame, but the frame is clearly plastic and spray-painted. Inside the frame is a view of a luxurious marble hallway with gold chandeliers, but it looks like a hotel lobby. At the bottom in elegant serif font: "VIRTUALLY UNWATCHABLE" and "1.3 STARS". The overall feel is ostentatious luxury meets budget filmmaking. No people in the image.',
    size: '1024x1792',
  },
  {
    name: 'Going the Extra Mule',
    filename: 'mule_award.png',
    prompt:
      'A cartoon-style illustration of a stubborn mule wearing a tiny golden crown, standing next to a ballot drop box in a parking lot. The mule has a defiant expression and is holding a rolled-up document that says "DEBUNKED" in its mouth. Humorous editorial cartoon style with bold outlines. Golden warm color palette.',
    size: '1024x1024',
  },
  {
    name: 'Best Western',
    filename: 'best_western.png',
    prompt:
      'A Wild West movie set that has clearly gone wrong. A broken director\'s chair tipped over in a dusty desert town set. A prop gun lying on the ground with a "SAFETY FIRST" sign that has fallen off the wall. Tumbleweeds rolling through. The scene has dramatic golden-hour western lighting but everything is slightly askew and amateur. Cinematic wide shot, film grain.',
    size: '1792x1024',
  },
  {
    name: 'Parking Lot Venue',
    filename: 'venue.png',
    prompt:
      'A parking lot behind a large theatre building at night, set up as a makeshift outdoor event venue. Folding chairs arranged in rows on asphalt, facing a small wooden stage made of pallets. A hand-painted banner hangs between two light poles reading "LOW RATINGS ACADEMY AWARDS". Christmas lights strung haphazardly. A single spotlight duct-taped to a parking meter. Cinematic night photography, moody golden lighting.',
    size: '1792x1024',
  },
];

// ---------------------------------------------------------------------------
// Download helper
// ---------------------------------------------------------------------------

function download(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = dest;
    if (existsSync(file)) {
      console.log(`  [skip] ${file} already exists`);
      resolve();
      return;
    }

    const client = url.startsWith('https') ? https : http;
    const get = (currentUrl: string): void => {
      client.get(currentUrl, { headers: { 'User-Agent': 'LowRatingsBot/1.0' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const redirect = res.headers.location;
          if (redirect) {
            get(redirect);
            return;
          }
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${currentUrl}`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          writeFileSync(file, Buffer.concat(chunks));
          console.log(`  [done] ${file}`);
          resolve();
        });
        res.on('error', reject);
      }).on('error', reject);
    };
    get(url);
  });
}

// ---------------------------------------------------------------------------
// DALL-E 3 generation
// ---------------------------------------------------------------------------

async function generateImage(prompt: string, size: string, dest: string): Promise<void> {
  if (existsSync(dest)) {
    console.log(`  [skip] ${dest} already exists`);
    return;
  }

  if (!OPENAI_API_KEY) {
    console.error('  [error] No OPENAI_API_KEY found');
    return;
  }

  console.log(`  [generating] ${dest}...`);

  const body = JSON.stringify({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size,
    quality: 'standard',
    response_format: 'url',
  });

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body,
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`  [error] DALL-E API: ${response.status} ${err}`);
    return;
  }

  const json = (await response.json()) as { data: Array<{ url: string; revised_prompt: string }> };
  const imageUrl = json.data[0]?.url;
  const revisedPrompt = json.data[0]?.revised_prompt;

  if (!imageUrl) {
    console.error('  [error] No image URL in response');
    return;
  }

  console.log(`  [revised prompt] ${revisedPrompt}`);

  // Download the generated image
  await download(imageUrl, dest);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Ensure dirs exist
  for (const dir of [PEOPLE_DIR, SCENES_DIR]) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }

  // Generate attributions file
  const attributions = PEOPLE_IMAGES.map((p) => `${p.name}: ${p.attribution}`).join('\n');
  writeFileSync(join(ROOT, 'public', 'images', 'ATTRIBUTIONS.txt'), attributions);
  console.log('Wrote ATTRIBUTIONS.txt\n');

  // Download people photos
  console.log('=== Downloading people photos from Wikimedia Commons ===\n');
  for (const person of PEOPLE_IMAGES) {
    console.log(`${person.name}:`);
    await download(person.url, join(PEOPLE_DIR, person.filename));
  }

  // Generate scene images
  console.log('\n=== Generating scene images via DALL-E 3 ===\n');
  for (const scene of SCENE_PROMPTS) {
    console.log(`${scene.name}:`);
    await generateImage(scene.prompt, scene.size, join(SCENES_DIR, scene.filename));
  }

  console.log('\n=== Done! ===');
  console.log(`People photos: ${PEOPLE_DIR}`);
  console.log(`Scene images: ${SCENES_DIR}`);
}

main().catch(console.error);
