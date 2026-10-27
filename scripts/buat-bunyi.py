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


def tirai(n, naik=0.3, turun=0.55):
    """Amplop yang naik dan turun mulus, tanpa sudut tajam."""
    t = np.linspace(0, 1, n)
    batas = naik
    keluar = np.where(
        t < batas,
        0.5 - 0.5 * np.cos(np.pi * t / batas),
        0.5 + 0.5 * np.cos(np.pi * np.clip((t - batas) / turun, 0, 1)),
    )
    return keluar


def woosh(durasi=0.3, puncak=0.3):
    """
    Desir tipis yang menyapu ke atas.

    Dijaga di frekuensi tinggi: begitu energinya turun ke bawah ~1 kHz,
    derau yang disapu berhenti terdengar seperti udara dan mulai terdengar
    seperti sesuatu yang lain. Amplopnya juga dibuat naik-turun mulus,
    karena serangan yang lambat membuatnya terdengar mendorong.
    """
    n = int(SR * durasi)
    derau = np.random.default_rng(7).normal(0, 1, n)

    # Beberapa pita dihitung penuh lalu dicampur dengan bobot yang bergeser
    # seiring waktu. Dicampur begitu, sapuannya mulus — tidak ada sambungan
    # antar potongan yang terdengar sebagai kerikil.
    pusat = np.geomspace(2200, 9500, 10)
    pita = np.empty((len(pusat), n))
    for i, f in enumerate(pusat):
        lo = max(f / 1.7, 300) / (SR / 2)
        hi = min(f * 1.7, SR / 2 - 500) / (SR / 2)
        bb, aa = butter(2, [lo, hi], btype="band")
        pita[i] = lfilter(bb, aa, derau)

    posisi = np.linspace(0, len(pusat) - 1, n)
    indeks = np.arange(len(pusat))[:, None]
    bobot = np.exp(-((indeks - posisi[None, :]) ** 2) / (2 * 1.1**2))
    bobot /= bobot.sum(axis=0, keepdims=True)

    return normalkan((pita * bobot).sum(axis=0) * tirai(n), puncak)


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
