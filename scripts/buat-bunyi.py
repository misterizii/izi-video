"""
Membuat bunyi transisi untuk video, dari nol.

Semuanya disintesis di sini, tidak diambil dari mana pun, jadi tidak ada
urusan lisensi dan tidak ada risiko klaim hak cipta.

Tiga bunyi:
  woosh.wav  — pergantian beat besar (intro, celah, istilah, rekap, pancingan)
  klik.wav   — satu kartu bagian muncul
  tutup.wav  — beat pancingan, nada naik sebagai penutup

Semuanya pendek dan pelan: ini penanda perpindahan, bukan musik. Videonya
meminta anak membaca, jadi suara tidak boleh ikut meminta perhatian.

Jalankan: python3 scripts/buat-bunyi.py
"""

from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter

SR = 44100
KELUARAN = Path(__file__).resolve().parent.parent / "public"


def amplop(n, serang, luruh):
    """Naik cepat lalu meluruh secara eksponensial."""
    t = np.arange(n) / SR
    naik = np.clip(t / max(serang, 1e-6), 0, 1)
    turun = np.exp(-t / luruh)
    return naik * turun


def normalkan(x, puncak):
    maks = np.max(np.abs(x))
    return x * (puncak / maks) if maks > 0 else x


def woosh(durasi=0.34, puncak=0.36):
    """Derau yang disapu dari rendah ke tinggi — terasa seperti sesuatu lewat."""
    n = int(SR * durasi)
    derau = np.random.default_rng(7).normal(0, 1, n)

    # Sapuan dikerjakan bertahap: tiap potongan difilter pada frekuensi
    # yang makin tinggi, lalu disambung.
    potongan = 24
    batas = np.linspace(500, 3200, potongan)
    keluar = np.zeros(n)
    panjang = n // potongan
    for i, f in enumerate(batas):
        a, b = i * panjang, n if i == potongan - 1 else (i + 1) * panjang
        bb, aa = butter(2, [max(f - 350, 120) / (SR / 2), min(f + 350, SR / 2 - 200) / (SR / 2)], btype="band")
        keluar[a:b] = lfilter(bb, aa, derau)[a:b]

    return normalkan(keluar * amplop(n, 0.05, 0.11), puncak)


def klik(durasi=0.13, puncak=0.30):
    """Ketukan pendek bernada — menandai satu kartu muncul."""
    n = int(SR * durasi)
    t = np.arange(n) / SR
    nada = np.sin(2 * np.pi * 1180 * t) + 0.45 * np.sin(2 * np.pi * 1770 * t)
    desis = np.random.default_rng(3).normal(0, 1, n) * np.exp(-t / 0.004)
    return normalkan((nada + 0.3 * desis) * amplop(n, 0.002, 0.028), puncak)


def tutup(durasi=0.5, puncak=0.34):
    """Dua nada naik — terdengar seperti pertanyaan, pas untuk pancingan."""
    n = int(SR * durasi)
    keluar = np.zeros(n)
    for i, f in enumerate((784, 1046)):  # G5 lalu C6
        mulai = int(SR * 0.13 * i)
        sisa = n - mulai
        t = np.arange(sisa) / SR
        nada = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2 * t)
        keluar[mulai:] += nada * amplop(sisa, 0.004, 0.13)
    return normalkan(keluar, puncak)


def tulis(nama, data):
    KELUARAN.mkdir(parents=True, exist_ok=True)
    jalur = KELUARAN / nama
    wavfile.write(jalur, SR, (np.clip(data, -1, 1) * 32767).astype(np.int16))
    print(f"{jalur.name}  {len(data) / SR:.2f} dtk")


if __name__ == "__main__":
    tulis("woosh.wav", woosh())
    tulis("klik.wav", klik())
    tulis("tutup.wav", tutup())
