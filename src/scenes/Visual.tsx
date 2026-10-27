import type { CSSProperties } from 'react';

/**
 * Menampilkan gambar khusus milik satu bagian materi.
 *
 * Markup-nya datang dari file materi, yang ditulis sendiri untuk repo ini —
 * bukan dari unggahan orang lain atau sumber luar. Karena sumbernya tepercaya,
 * markup itu disisipkan apa adanya supaya SVG-nya bisa mewarisi token warna
 * dan ikut berubah saat temanya navy atau terang. Jangan pernah mengisi
 * kolom ini dari sumber yang tidak kamu tulis sendiri.
 */
export function Visual({ svg, style }: { svg: string; style?: CSSProperties }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxHeight: '100%',
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/** Penanda nomor bagian saat gambar khusus mengambil alih ruang utama. */
export function Nomor({ nomor, style }: { nomor: number; style?: CSSProperties }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
        borderRadius: '50%',
        background: 'var(--mz-accent)',
        color: 'var(--mz-on-accent)',
        fontWeight: 800,
        fontSize: 32,
        lineHeight: 1,
        ...style,
      }}
    >
      {nomor}
    </span>
  );
}
