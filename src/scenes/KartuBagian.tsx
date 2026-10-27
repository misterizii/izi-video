import type { CSSProperties } from 'react';

interface KartuBagianProps {
  nomor: number;
  judul: string;
  /** Ukuran: `besar` saat bagian itu sedang dibahas, `kecil` saat rekap. */
  ukuran?: 'besar' | 'kecil';
  style?: CSSProperties;
}

/**
 * Kartu bernomor — bentuk bawaan untuk semua materi.
 * Nomor menyatakan urutan pembahasan, bukan sebab-akibat. Panah hanya
 * ditambahkan di luar kartu ini, saat alur materinya memang berurutan.
 */
export function KartuBagian({ nomor, judul, ukuran = 'besar', style }: KartuBagianProps) {
  const besar = ukuran === 'besar';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: besar ? 28 : 20,
        width: '100%',
        padding: besar ? '32px 36px' : '20px 24px',
        borderRadius: 24,
        background: 'var(--mz-surface)',
        border: '2px solid var(--mz-border)',
        ...style,
      }}
    >
      <span
        style={{
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: besar ? 76 : 52,
          height: besar ? 76 : 52,
          borderRadius: '50%',
          background: 'var(--mz-accent)',
          color: 'var(--mz-on-accent)',
          fontWeight: 800,
          fontSize: besar ? 40 : 28,
          lineHeight: 1,
        }}
      >
        {nomor}
      </span>
      <span
        style={{
          fontWeight: 800,
          fontSize: besar ? 46 : 32,
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          color: 'var(--mz-heading)',
        }}
      >
        {judul}
      </span>
    </div>
  );
}

/** Panah ke bawah — hanya untuk materi dengan `alur: "urut"`. */
export function PanahBawah({ style }: { style?: CSSProperties }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden style={style}>
      <path
        d="M20 6v24m0 0l-10-10m10 10l10-10"
        fill="none"
        stroke="var(--mz-text-muted)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
