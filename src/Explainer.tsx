import { Fragment, type ReactNode } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { MzProvider, ReelsFrame, Highlight } from 'misterizii-style';
// Font dibawa sendiri, bukan diambil dari Google Fonts saat render. Render
// jadi tidak bergantung jaringan, dan hasilnya selalu sama di mana pun.
// Empat berat ini yang dipakai design system: 400, 500, 700, 800.
import '@fontsource/plus-jakarta-sans/latin-400.css';
import '@fontsource/plus-jakarta-sans/latin-500.css';
import '@fontsource/plus-jakarta-sans/latin-700.css';
import '@fontsource/plus-jakarta-sans/latin-800.css';
// styles.base.css, bukan styles.css: entri ini tidak mengambil font dari
// Google Fonts lewat @import, karena renderer tidak menunggunya selesai.
import 'misterizii-style/styles.base.css';

import type { Materi } from './schema';
import { beatAt, buildTimeline } from './timeline';
import { masuk, redup } from './anim';
import { KartuBagian, PanahBawah } from './scenes/KartuBagian';
import { JawabanSalah } from './scenes/JawabanSalah';

/** Akun tempat video ini diunggah. */
const HANDLE = '@iziilearning';

/** Memasang stabilo mangga pada satu kata di dalam judul. */
function sorot(judul: string, kataKunci?: string): ReactNode {
  if (!kataKunci) return judul;
  const i = judul.indexOf(kataKunci);
  if (i === -1) return judul;
  return (
    <>
      {judul.slice(0, i)}
      <Highlight>{kataKunci}</Highlight>
      {judul.slice(i + kataKunci.length)}
    </>
  );
}

/** Props-nya adalah isi file materi itu sendiri, jadi JSON-nya tetap datar. */
export function Explainer(materi: Materi) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { beats } = buildTimeline(materi, fps);
  const { beat, local } = beatAt(beats, frame);

  const urut = materi.alur === 'urut';
  const pil = `${materi.topik} #${materi.episode}`;

  let judul: ReactNode;
  let caption: ReactNode;
  let visual: ReactNode = null;

  if (beat.kind === 'intro') {
    judul = sorot(materi.judul, materi.kataKunci);
    caption = `${materi.mapel} · Kelas ${materi.kelas}`;
  }

  if (beat.kind === 'celah') {
    judul = materi.pembukaCelah.teks;
    if (materi.pembukaCelah.jenis === 'miskonsepsi') {
      visual = <JawabanSalah teks={materi.pembukaCelah.jawabanSalah} local={local} fps={fps} />;
    }
  }

  if (beat.kind === 'istilah' && materi.istilahKunci) {
    judul = <Highlight>{materi.istilahKunci.istilah}</Highlight>;
    caption = materi.istilahKunci.arti;
  }

  if (beat.kind === 'bagian') {
    const aktif = beat.index ?? 0;
    caption = materi.bagian[aktif].penjelasan;
    visual = (
      <TumpukanKartu
        materi={materi}
        aktif={aktif}
        // Pada alur berurutan, bagian yang belum dibahas belum boleh terlihat:
        // memperlihatkan akhir cerita lebih dulu menghapus alasan menontonnya.
        tampil={urut ? aktif + 1 : materi.bagian.length}
        urut={urut}
        local={local}
        fps={fps}
      />
    );
  }

  if (beat.kind === 'rekap') {
    caption = materi.rekap;
    visual = (
      <TumpukanKartu
        materi={materi}
        aktif={-1}
        tampil={materi.bagian.length}
        urut={urut}
        ukuran="kecil"
        local={local}
        fps={fps}
      />
    );
  }

  if (beat.kind === 'pancingan') {
    judul = materi.pancingan;
    caption = 'Tulis jawabanmu di komentar.';
  }

  return (
    <AbsoluteFill style={{ background: 'var(--mz-bg)' }}>
      <MzProvider theme={materi.tema} motion="static" style={{ width: '100%', height: '100%' }}>
        <ReelsFrame
          theme={materi.tema}
          motion="static"
          handle={HANDLE}
          hook={pil}
          title={judul ? <span style={masuk(local, { fps })}>{judul}</span> : undefined}
          caption={caption ? <span style={masuk(local, { delay: Math.round(fps * 0.3), fps })}>{caption}</span> : undefined}
          style={{ width: '100%', height: '100%' }}
        >
          {visual}
        </ReelsFrame>
      </MzProvider>
    </AbsoluteFill>
  );
}

interface TumpukanProps {
  materi: Materi;
  /** Index bagian yang sedang dibahas, atau -1 saat rekap (semuanya setara). */
  aktif: number;
  tampil: number;
  urut: boolean;
  ukuran?: 'besar' | 'kecil';
  local: number;
  fps: number;
}

function TumpukanKartu({ materi, aktif, tampil, urut, ukuran = 'besar', local, fps }: TumpukanProps) {
  const kartu = materi.bagian.slice(0, tampil);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center',
        gap: urut ? 10 : 20,
        width: '100%',
      }}
    >
      {kartu.map((b, i) => {
        const terakhir = i === kartu.length - 1;
        const disorot = aktif === -1 || i === aktif;
        const delay = aktif === -1 ? Math.round(i * fps * 0.25) : terakhir ? 0 : -fps;

        return (
          <Fragment key={i}>
            <KartuBagian
              nomor={i + 1}
              judul={b.judul}
              ukuran={ukuran}
              style={{
                ...redup(masuk(local, { delay, fps }), disorot),
                borderColor: disorot && aktif !== -1 ? 'var(--mz-accent)' : 'var(--mz-border)',
              }}
            />
            {urut && !terakhir && <PanahBawah style={{ alignSelf: 'center' }} />}
          </Fragment>
        );
      })}
    </div>
  );
}
