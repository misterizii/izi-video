import type { Materi } from './schema';

export type BeatKind = 'intro' | 'celah' | 'istilah' | 'bagian' | 'rekap' | 'pancingan';

export interface Beat {
  kind: BeatKind;
  /** Index bagian (0-based) — hanya untuk kind 'bagian'. */
  index?: number;
  from: number;
  durationInFrames: number;
}

/** Panjang tiap beat dalam detik. Totalnya dijaga tetap di bawah 60 detik. */
export const DURASI_DETIK = {
  intro: 2.5,
  celah: 4.5,
  istilah: 3.5,
  rekap: 5,
  pancingan: 4,
} as const;

export const BATAS_DETIK = 60;

/**
 * Panjang beat bagian mengikuti panjang kalimatnya, bukan angka tetap.
 *
 * Durasi tetap selalu salah di salah satu arah: kalimat pendek jadi
 * menggantung, kalimat panjang terpotong sebelum anak selesai membaca.
 * Pembaca kelas 3 butuh waktu jauh lebih lama daripada orang dewasa, jadi
 * dasarnya dihitung dari jumlah kata, lalu dijaga di rentang yang wajar.
 */
export const DETIK_DASAR_BAGIAN = 2.5;
export const DETIK_PER_KATA = 0.55;
export const DETIK_BAGIAN_MIN = 6;
export const DETIK_BAGIAN_MAKS = 9;

export function detikBagian(penjelasan: string): number {
  const kata = penjelasan.trim().split(/\s+/).filter(Boolean).length;
  const hitung = DETIK_DASAR_BAGIAN + kata * DETIK_PER_KATA;
  return Math.min(DETIK_BAGIAN_MAKS, Math.max(DETIK_BAGIAN_MIN, hitung));
}

export function buildTimeline(materi: Materi, fps: number): { beats: Beat[]; totalInFrames: number } {
  const urutan: Array<{ kind: BeatKind; index?: number; detik: number }> = [
    { kind: 'intro', detik: DURASI_DETIK.intro },
    { kind: 'celah', detik: DURASI_DETIK.celah },
  ];

  if (materi.istilahKunci) {
    urutan.push({ kind: 'istilah', detik: DURASI_DETIK.istilah });
  }

  materi.bagian.forEach((b, index) => {
    urutan.push({ kind: 'bagian', index, detik: detikBagian(b.penjelasan) });
  });

  urutan.push({ kind: 'rekap', detik: DURASI_DETIK.rekap });
  urutan.push({ kind: 'pancingan', detik: DURASI_DETIK.pancingan });

  let from = 0;
  const beats: Beat[] = urutan.map((b) => {
    const beat: Beat = {
      kind: b.kind,
      index: b.index,
      from,
      durationInFrames: Math.round(b.detik * fps),
    };
    from += beat.durationInFrames;
    return beat;
  });

  return { beats, totalInFrames: from };
}

export function beatAt(beats: Beat[], frame: number): { beat: Beat; local: number } {
  const beat =
    beats.find((b) => frame >= b.from && frame < b.from + b.durationInFrames) ?? beats[beats.length - 1];
  return { beat, local: frame - beat.from };
}
