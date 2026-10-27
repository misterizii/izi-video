import { interpolate, spring } from 'remotion';
import type { CSSProperties } from 'react';

/**
 * Semua gerakan digerakkan dari penghitung frame, bukan dari transisi CSS.
 * Renderer menggambar satu frame demi satu frame, jadi transisi CSS tidak
 * pernah benar-benar berjalan (lihat motion="static" di design system).
 */

interface MasukOpts {
  /** Frame ke berapa setelah beat dimulai. */
  delay?: number;
  /** Jarak geser ke atas saat muncul, dalam piksel kanvas 1080×1920. */
  jarak?: number;
  fps: number;
}

/** Muncul sambil naik sedikit. Dipakai untuk hampir semua elemen. */
export function masuk(local: number, { delay = 0, jarak = 28, fps }: MasukOpts): CSSProperties {
  const s = spring({
    frame: local - delay,
    fps,
    config: { damping: 200, stiffness: 190, mass: 0.5 },
  });

  return {
    opacity: s,
    transform: `translateY(${(1 - s) * jarak}px)`,
  };
}

/**
 * Meredupkan elemen yang sedang jadi latar, tanpa membatalkan animasi
 * munculnya: nilai redupnya dikalikan, bukan menimpa.
 */
export function redup(gaya: CSSProperties, disorot: boolean): CSSProperties {
  if (disorot) return gaya;
  return { ...gaya, opacity: Number(gaya.opacity ?? 1) * 0.35 };
}

/** Coretan yang tumbuh dari kiri ke kanan, untuk menandai jawaban salah. */
export function coretan(local: number, { delay = 0, fps }: { delay?: number; fps: number }): number {
  const s = spring({
    frame: local - delay,
    fps,
    config: { damping: 200, stiffness: 90, mass: 0.5 },
  });
  return interpolate(s, [0, 1], [0, 100]);
}
