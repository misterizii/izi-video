# misterizii video

Video penjelasan materi 9:16 untuk Reels, TikTok, dan Shorts. Satu template tetap untuk semua mata pelajaran — yang berganti hanya file JSON materinya.

Tampilannya memakai [misterizii-style](https://github.com/misterizii/design-style). Repo ini mengatur **bagaimana geraknya**, repo itu mengatur **bagaimana rupanya**.

## Cara pakai

```bash
npm install
npm run dev                 # pratinjau di Remotion Studio
npm run cek                 # periksa semua file materi sebelum dirender
npm run render -- out/ipas-01.mp4 --props=materi/contoh-ipas-ciri-makhluk-hidup.json
```

Untuk episode baru: salin satu file di `materi/`, ganti isinya, jalankan `npm run cek`, lalu render. Tidak ada kode yang perlu disentuh.

## Struktur satu episode

Enam beat, totalnya selalu di bawah 60 detik:

| Beat | Durasi | Isi |
|---|---|---|
| Intro | 3 dtk | Judul + mapel dan kelas, supaya penonton yang mendarat di tengah seri tetap paham konteksnya |
| Pembuka celah | 6 dtk | Miskonsepsi atau pertanyaan — alasan untuk terus menonton |
| Istilah kunci | 4 dtk | Opsional. Dilewati kalau tidak diisi |
| Bagian 1–3 | 9 dtk masing-masing | Isi materinya |
| Rekap | 6 dtk | Ketiga bagian ditampilkan bersama |
| Pancingan | 5 dtk | Soal atau pertanyaan lanjutan |

Durasi video dihitung sendiri dari beat yang terpakai. Materi tanpa istilah kunci menghasilkan video yang lebih pendek — tidak ada layar kosong.

## Dua bentuk alur

Bawaannya **nomor tanpa panah**. Nomor menyatakan urutan pembahasan; panah menyatakan sebab-akibat. Keduanya hal berbeda, dan kebanyakan materi hanya butuh yang pertama.

- `"alur": "sejajar"` — tiga hal setara, bernomor, tanpa panah. Ketiganya terlihat sejak awal. Rekapnya menampilkan semuanya sekaligus.
- `"alur": "urut"` — tambahkan panah penghubung, dan bagian yang belum dibahas belum ditampilkan.

Tes cepat saat mengisi: tukar bagian pertama dan ketiga. Kalau masih masuk akal, itu `sejajar`. Kalau jadi aneh, itu `urut`.

Kalau ragu atau lupa menandai, hasilnya tetap benar — yang hilang hanya penekanannya, bukan maknanya.

## Isi file materi

```jsonc
{
  "mapel": "IPAS",
  "kelas": "3",
  "topik": "Makhluk Hidup",        // nama seri, tampil di pil atas
  "episode": 1,
  "judul": "3 ciri makhluk hidup",
  "kataKunci": "makhluk hidup",    // opsional, diberi stabilo mangga; harus persis ada di judul

  "pembukaCelah": {                // wajib, pilih salah satu bentuk
    "jenis": "pertanyaan",
    "teks": "Mobil bisa bergerak. Jadi mobil makhluk hidup?"
  },
  // atau:
  // { "jenis": "miskonsepsi", "teks": "Kenapa 123 salah?", "jawabanSalah": "123" }

  "istilahKunci": {                // opsional
    "istilah": "Meminjam",
    "arti": "Mengambil satu puluhan untuk menambah satuan."
  },

  "alur": "sejajar",               // atau "urut"
  "bagian": [                      // 2 sampai 3 bagian
    { "judul": "Bergerak sendiri", "penjelasan": "Bergerak tanpa ada yang menyalakan." }
  ],

  "rekap": "Bergerak sendiri, bernapas, tumbuh.",
  "pancingan": "Apakah api termasuk makhluk hidup?",
  "tema": "light"                  // atau "dark"
}
```

`npm run cek` menolak file yang melanggar aturan ini, dengan menyebut bagian mana yang bermasalah:

- judul bagian maksimal 6 kata, supaya rekap muat menampilkan ketiganya
- maksimal 3 bagian, karena satu video hanya membahas satu konsep
- `kataKunci` harus benar-benar ada di dalam `judul`
- total durasi di bawah 60 detik

## Catatan desain

**Tanpa VO, tapi dirancang tetap jalan tanpa suara.** Teks di layar sengaja sedikit: judul pendek dan satu kalimat caption. Kalau nanti VO ditambahkan, jangan tambah teksnya — narasi dan teks yang sama persis justru menurunkan pemahaman.

**Gerakan digerakkan dari penghitung frame, bukan transisi CSS.** Renderer menggambar satu frame demi satu frame, jadi transisi CSS tidak pernah benar-benar berjalan. Semua komponen dibungkus `motion="static"` agar transisi bawaan design system dimatikan.

**Font dimuat lewat `@remotion/google-fonts`, bukan `@import`.** Karena itu repo ini memakai `misterizii-style/styles.base.css`, bukan `styles.css`.

**Merah hanya untuk menandai salah.** Tidak dipakai sebagai warna hiasan, supaya artinya tetap jelas bagi anak.

## Area aman

Kanvas 1080×1920. Isi dijaga di luar area yang tertutup UI aplikasi: atas 9%, bawah 21%, kanan 15%. Untuk memeriksanya, nyalakan `showSafeArea` pada `ReelsFrame` saat membuka Studio.
