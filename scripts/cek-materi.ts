import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { materiSchema } from '../src/schema';
import { BATAS_DETIK, buildTimeline } from '../src/timeline';

/**
 * Memeriksa semua file di materi/ sebelum dirender: bentuknya benar, judul
 * bagiannya cukup pendek, dan durasinya masih di bawah batas.
 * Jalankan: npm run cek
 */

const FPS = 30;
const dir = 'materi';
const berkas = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();

let gagal = 0;

for (const nama of berkas) {
  const isi = JSON.parse(readFileSync(join(dir, nama), 'utf8'));
  const hasil = materiSchema.safeParse(isi);

  if (!hasil.success) {
    gagal += 1;
    console.log(`\n✗ ${nama}`);
    for (const issue of hasil.error.issues) {
      const jalur = issue.path.join('.') || '(akar)';
      console.log(`    ${jalur}: ${issue.message}`);
    }
    continue;
  }

  const materi = hasil.data;
  const detik = buildTimeline(materi, FPS).totalInFrames / FPS;
  const lewat = detik > BATAS_DETIK;
  if (lewat) gagal += 1;

  const bagian = `${materi.bagian.length} bagian`;
  const alur = materi.alur === 'urut' ? 'berurutan' : 'sejajar';
  console.log(
    `${lewat ? '✗' : '✓'} ${nama} — ${Math.round(detik)} dtk, ${bagian}, ${alur}` +
      (lewat ? `  (lewat batas ${BATAS_DETIK} dtk)` : ''),
  );
}

if (gagal > 0) {
  console.log(`\n${gagal} dari ${berkas.length} file perlu diperbaiki.`);
  process.exit(1);
}

console.log(`\nSemua ${berkas.length} file siap dirender.`);
