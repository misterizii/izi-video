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
  intro: 3,
  celah: 6,
  istilah: 4,
  bagian: 9,
  rekap: 6,
  pancingan: 5,
} as const;

export const BATAS_DETIK = 60;

export function buildTimeline(materi: Materi, fps: number): { beats: Beat[]; totalInFrames: number } {
  const urutan: Array<{ kind: BeatKind; index?: number; detik: number }> = [
    { kind: 'intro', detik: DURASI_DETIK.intro },
    { kind: 'celah', detik: DURASI_DETIK.celah },
  ];

  if (materi.istilahKunci) {
    urutan.push({ kind: 'istilah', detik: DURASI_DETIK.istilah });
  }

  materi.bagian.forEach((_, index) => {
    urutan.push({ kind: 'bagian', index, detik: DURASI_DETIK.bagian });
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
