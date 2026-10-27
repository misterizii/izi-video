import { Composition } from 'remotion';

import { Explainer } from './Explainer';
import { materiSchema, type Materi } from './schema';
import { BATAS_DETIK, buildTimeline } from './timeline';
import contoh from '../materi/contoh-ipas-ciri-makhluk-hidup.json';

export const FPS = 30;
export const LEBAR = 1080;
export const TINGGI = 1920;

export function RemotionRoot() {
  return (
    <Composition
      id="Explainer"
      component={Explainer}
      fps={FPS}
      width={LEBAR}
      height={TINGGI}
      // Diganti oleh calculateMetadata; nilai ini hanya cadangan.
      durationInFrames={FPS * 30}
      defaultProps={contoh as Materi}
      calculateMetadata={({ props }) => {
        const materi = materiSchema.parse(props);
        const { totalInFrames } = buildTimeline(materi, FPS);
        const detik = totalInFrames / FPS;

        if (detik > BATAS_DETIK) {
          throw new Error(
            `Durasi ${Math.round(detik)} detik melewati batas ${BATAS_DETIK} detik. ` +
              `Pecah materinya jadi dua episode — satu video hanya membahas satu konsep.`,
          );
        }

        return { durationInFrames: totalInFrames, props: materi };
      }}
    />
  );
}
