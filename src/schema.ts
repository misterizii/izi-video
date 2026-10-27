import { z } from 'zod';

/**
 * Satu file JSON = satu episode = satu konsep.
 *
 * Aturan yang dijaga di sini, bukan di ingatan saat mengisi:
 * - judul bagian maksimal 6 kata, supaya rekap muat menampilkan semuanya
 * - pembuka celah wajib ada, bentuknya miskonsepsi atau pertanyaan
 * - bagian maksimal 3, karena satu video hanya membahas satu konsep
 */

const kata = (teks: string) => teks.trim().split(/\s+/).filter(Boolean).length;

export const bagianSchema = z.object({
  /** Nama bagian. Pendek — ini yang tampil besar di layar dan diulang saat rekap. */
  judul: z.string().min(1),
  /** Satu kalimat penjelas di kotak bawah. */
  penjelasan: z.string().min(1),
  /**
   * Gambar khusus untuk bagian ini, ditulis sebagai markup SVG.
   *
   * Di sinilah materinya boleh bebas: susunan angka bersusun, diagram,
   * perbandingan, apa pun yang paling menjelaskan. Yang tetap kaku adalah
   * font, warna, dan tata letak di sekelilingnya.
   *
   * Pakai var(--mz-accent), var(--mz-heading), var(--mz-text-muted) dan
   * token lain supaya gambarnya ikut berubah saat temanya navy atau terang.
   * Kalau dikosongkan, yang tampil adalah kartu bernomor bawaan.
   */
  visual: z.string().optional(),
  /**
   * Peraga bergerak yang digambar per frame, untuk materi yang punya proses.
   * Lebih hidup daripada `visual` yang diam, tapi hanya tersedia untuk jenis
   * yang sudah ada komponennya.
   */
  peraga: z
    .object({
      jenis: z.literal('pengurangan-bersusun'),
      atas: z.string().regex(/^\d+$/),
      bawah: z.string().regex(/^\d+$/),
      tahap: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    })
    .optional(),
});

export const pembukaCelahSchema = z.discriminatedUnion('jenis', [
  z.object({
    jenis: z.literal('miskonsepsi'),
    /** Pertanyaan yang menyoroti kesalahannya, mis. "Kenapa 183 salah?" */
    teks: z.string().min(1),
    /** Jawaban keliru yang ditampilkan dicoret merah. */
    jawabanSalah: z.string().min(1),
  }),
  z.object({
    jenis: z.literal('pertanyaan'),
    /** Pertanyaan yang membuka rasa ingin tahu. */
    teks: z.string().min(1),
  }),
]);

export const materiSchema = z
  .object({
    mapel: z.string().min(1),
    kelas: z.string().min(1),
    /** Nama seri, dipakai di pil atas dan di judul unggahan. */
    topik: z.string().min(1),
    episode: z.number().int().positive(),

    /** Baris besar pembuka. Satu kata kuncinya ditandai lewat `kataKunci`. */
    judul: z.string().min(1),
    /** Kata di dalam `judul` yang diberi stabilo mangga. Harus persis sama. */
    kataKunci: z.string().optional(),

    pembukaCelah: pembukaCelahSchema,

    /** Opsional: istilah yang perlu dikenal sebelum masuk bagian inti. */
    istilahKunci: z
      .object({ istilah: z.string().min(1), arti: z.string().min(1) })
      .optional(),

    /**
     * `sejajar` (bawaan): tiga hal setara, bernomor, tanpa panah.
     * `urut`: tambahkan panah dan biarkan bagian sebelumnya tetap terlihat.
     */
    alur: z.enum(['sejajar', 'urut']).default('sejajar'),

    bagian: z.array(bagianSchema).min(2).max(3),

    /** Kalimat penutup yang merangkum. */
    rekap: z.string().min(1),
    /** Ajakan menjawab, mis. soal berikutnya. */
    pancingan: z.string().min(1),

    /** Latar navy adalah bawaannya: lebih teduh dilihat anak di layar terang. */
    tema: z.enum(['light', 'dark']).default('dark'),

    /** Penanda bunyi di tiap perpindahan. Matikan kalau videonya akan diberi
     *  sound dari pustaka TikTok saat diunggah. */
    bunyi: z.boolean().default(true),
  })
  .superRefine((materi, ctx) => {
    materi.bagian.forEach((b, i) => {
      if (kata(b.judul) > 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bagian', i, 'judul'],
          message: `Judul bagian maksimal 6 kata supaya rekap muat menampilkan semuanya (sekarang ${kata(b.judul)}).`,
        });
      }
    });

    if (materi.kataKunci && !materi.judul.includes(materi.kataKunci)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['kataKunci'],
        message: `"${materi.kataKunci}" tidak ditemukan di dalam judul, jadi stabilonya tidak bisa dipasang.`,
      });
    }
  });

export type Materi = z.infer<typeof materiSchema>;
export type Bagian = z.infer<typeof bagianSchema>;
