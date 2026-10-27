import { Audio, Sequence, staticFile } from 'remotion';

import type { Beat } from './timeline';

/**
 * Penanda bunyi di tiap perpindahan — bukan musik latar.
 *
 * Bedanya penting: musik berjalan terus dan ikut meminta perhatian,
 * sedangkan bunyi sesaat justru menolong karena menandai "ada yang berganti,
 * lihat lagi". Semuanya dibuat dari nol lewat scripts/buat-bunyi.py, jadi
 * tidak ada risiko klaim hak cipta saat diunggah.
 *
 * Tidak ada yang berlirik, karena kata-kata dalam suara berebut jalur yang
 * sama di otak dengan kata-kata yang sedang dibaca anak di layar.
 */

const BERKAS: Record<Beat['kind'], string> = {
  intro: 'woosh.wav',
  celah: 'woosh.wav',
  istilah: 'woosh.wav',
  bagian: 'klik.wav',
  rekap: 'woosh.wav',
  pancingan: 'tutup.wav',
};

export function Bunyi({ beats, fps }: { beats: Beat[]; fps: number }) {
  return (
    <>
      {beats.map((beat, i) => (
        <Sequence key={i} from={beat.from} durationInFrames={Math.round(fps)} name={`bunyi ${beat.kind}`}>
          <Audio src={staticFile(BERKAS[beat.kind])} />
        </Sequence>
      ))}
    </>
  );
}
