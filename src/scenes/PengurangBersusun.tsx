import { interpolate, spring } from 'remotion';

/**
 * Pengurangan bersusun yang benar-benar bergerak.
 *
 * Bukan tiga gambar diam yang berganti: angka pinjaman muncul satu per satu
 * ke kolom yang meminjam, angka aslinya meredup di tempatnya, lalu hasilnya
 * turun dari kanan ke kiri — arah yang sama dengan cara anak mengerjakannya.
 */

export interface Pinjaman {
  /** Nilai baru yang ditulis di atas kolom, mis. 15 atau 9. */
  nilai: number;
  /** Kolom ke berapa dari kiri. */
  kolom: number;
}

/** Menghitung pinjaman kolom demi kolom, persis seperti cara menghitung di buku. */
export function hitungPinjaman(atas: string, bawah: string) {
  const a = atas.split('').map(Number);
  const b = bawah.split('').map(Number);
  const urutan: Pinjaman[] = [];

  for (let i = a.length - 1; i >= 0; i--) {
    if (a[i] >= b[i]) continue;

    // Cari kolom terdekat di kiri yang masih punya sesuatu untuk dipinjamkan.
    let j = i - 1;
    while (j >= 0 && a[j] === 0) j--;
    if (j < 0) break;

    a[j] -= 1;
    urutan.push({ nilai: a[j], kolom: j });

    // Kolom nol yang dilewati berubah jadi 9 — ini bagian yang paling sering
    // membingungkan anak, jadi ditampilkan satu per satu, bukan sekaligus.
    for (let k = j + 1; k < i; k++) {
      a[k] = 9;
      urutan.push({ nilai: 9, kolom: k });
    }

    a[i] += 10;
    urutan.push({ nilai: a[i], kolom: i });
  }

  const hasil = a.map((d, i) => d - b[i]);
  return { urutan, hasil };
}

interface Props {
  atas: string;
  bawah: string;
  /** 1 = soalnya, 2 = proses meminjam, 3 = hasilnya. */
  tahap: 1 | 2 | 3;
  local: number;
  fps: number;
}

const LEBAR = 560;
const TINGGI = 405;
const JARAK = 110;
const Y_PINJAM = 70;
const Y_ATAS = 175;
const Y_BAWAH = 285;
const Y_GARIS = 313;
const Y_HASIL = 395;

export function PengurangBersusun({ atas, bawah, tahap, local, fps }: Props) {
  const n = Math.max(atas.length, bawah.length);
  const atasRata = atas.padStart(n, '0');
  const bawahRata = bawah.padStart(n, '0');
  const x = (i: number) => 300 - (n - 1) * (JARAK / 2) + i * JARAK;

  const { urutan, hasil } = hitungPinjaman(atasRata, bawahRata);
  const dipinjam = new Set(urutan.map((p) => p.kolom));

  const pegas = (delayDetik: number) =>
    spring({ frame: local - Math.round(fps * delayDetik), fps, config: { damping: 200, stiffness: 180, mass: 0.5 } });

  const kolomSatuan = n - 1;

  return (
    <svg viewBox={`0 0 ${LEBAR} ${TINGGI}`} width="100%" style={{ maxHeight: '100%' }}>
      <text
        x={90}
        y={Y_BAWAH}
        textAnchor="middle"
        fontSize={72}
        fontWeight={800}
        fill="var(--mz-text-muted)"
      >
        &#8722;
      </text>

      {atasRata.split('').map((d, i) => (
        <text
          key={`a${i}`}
          x={x(i)}
          y={Y_ATAS}
          textAnchor="middle"
          fontSize={96}
          fontWeight={800}
          fill="var(--mz-heading)"
          opacity={tahap === 1 || !dipinjam.has(i) ? 1 : interpolate(pegas(0.1), [0, 1], [1, 0.28])}
        >
          {d}
        </text>
      ))}

      {bawahRata.split('').map((d, i) => (
        <text key={`b${i}`} x={x(i)} y={Y_BAWAH} textAnchor="middle" fontSize={96} fontWeight={800} fill="var(--mz-heading)">
          {d}
        </text>
      ))}

      <line
        x1={x(0) - JARAK / 2 - 15}
        y1={Y_GARIS}
        x2={x(n - 1) + JARAK / 2}
        y2={Y_GARIS}
        stroke="var(--mz-text-muted)"
        strokeWidth={5}
        strokeLinecap="round"
      />

      {/* Tahap 1: lingkaran merah di kolom satuan — di sinilah soalnya macet. */}
      {tahap === 1 && (
        <g opacity={pegas(0.25)}>
          <rect
            x={x(kolomSatuan) - 48}
            y={Y_ATAS - 80}
            width={96}
            height={205}
            rx={18}
            fill="none"
            stroke="var(--mz-red-500)"
            strokeWidth={5}
          />
          <text
            x={x(kolomSatuan)}
            y={Y_HASIL}
            textAnchor="middle"
            fontSize={80}
            fontWeight={800}
            fill="var(--mz-red-500)"
            opacity={pegas(0.7)}
          >
            ?
          </text>
        </g>
      )}

      {/* Angka pinjaman muncul berurutan, mengikuti jalannya pinjaman. */}
      {tahap >= 2 &&
        urutan.map((p, k) => {
          const s = tahap === 2 ? pegas(0.25 + k * 0.45) : 1;
          return (
            <text
              key={`p${k}`}
              x={x(p.kolom)}
              y={Y_PINJAM}
              textAnchor="middle"
              fontSize={56}
              fontWeight={800}
              fill="var(--mz-accent)"
              opacity={tahap === 3 ? 0.45 : s}
              transform={`translate(0 ${(1 - s) * 18})`}
            >
              {p.nilai}
            </text>
          );
        })}

      {/* Hasil turun dari kanan ke kiri, arah yang sama dengan cara mengerjakannya. */}
      {tahap === 3 &&
        hasil.map((d, i) => {
          const urut = n - 1 - i;
          const s = pegas(0.2 + urut * 0.4);
          const kosongDiDepan = i === 0 && d === 0;
          if (kosongDiDepan) return null;
          return (
            <text
              key={`h${i}`}
              x={x(i)}
              y={Y_HASIL}
              textAnchor="middle"
              fontSize={96}
              fontWeight={800}
              fill="var(--mz-accent)"
              opacity={s}
              transform={`translate(0 ${(1 - s) * -26})`}
            >
              {d}
            </text>
          );
        })}
    </svg>
  );
}
