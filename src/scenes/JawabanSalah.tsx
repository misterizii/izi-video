import { coretan } from '../anim';

interface JawabanSalahProps {
  teks: string;
  local: number;
  fps: number;
}

/**
 * Jawaban keliru yang dicoret merah. Merah di sini bukan warna hiasan —
 * ia hanya muncul saat sesuatu ditandai salah, supaya artinya tetap jelas.
 */
export function JawabanSalah({ teks, local, fps }: JawabanSalahProps) {
  const panjang = coretan(local, { delay: Math.round(fps * 0.8), fps });

  return (
    <div style={{ position: 'relative', display: 'inline-block', padding: '0 12px' }}>
      <span
        style={{
          fontWeight: 800,
          fontSize: 128,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          color: 'var(--mz-text-muted)',
        }}
      >
        {teks}
      </span>
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: '52%',
          height: 12,
          width: `${panjang}%`,
          borderRadius: 999,
          background: 'var(--mz-red-500)',
        }}
      />
    </div>
  );
}
