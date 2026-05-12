# RACK4MASTER / Reference

> **Spectral Reference Matching Processor**  
> Intelligent EQ matching and mastering chain that runs entirely in your browser. No uploads, no accounts, no tracking.

---

## ✨ Features

- **Spectral Reference Matching** — load any reference track and auto-match your target's tonal balance using FFT analysis
- **7-Band Parametric EQ** — sub, bass, lo-mid, mid, hi-mid, presence and air bands (±12 dB)
- **Dynamics Processor** — compressor with threshold, ratio, attack, release and makeup gain
- **HPF + Saturation** — high-pass filter with resonance control and harmonic saturation
- **M/S Output Stage** — independent mid/side gain, limiter ceiling and output gain
- **Live DSP Chain** — real-time preview of the processed signal before export
- **Spectral Comparison View** — overlaid reference / target / result spectrum
- **Loop playback with movable handles** — drag loop in/out points directly on the waveform
- **WAV Export** — 16-bit PCM export, processed offline at full quality
- **Internationalisation** — English · Español · Català (always starts in English, no data stored)
- **100% browser** — Web Audio API, zero server-side processing, zero data collection

---

## 🚀 Getting Started

No build step or install required. Just open `index.html` in a modern browser.

```
git clone https://github.com/rack4master/reference.git
cd reference
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

Or serve it locally to avoid any browser file-protocol restrictions:

```bash
npx serve .
# → http://localhost:3000
```

---

## 📂 File Structure

```
reference/
├── index.html          # Main app — all UI, CSS and audio engine in one file
├── i18n.js             # Internationalisation module (en / es / ca)
└── README.md
```

> The entire DSP pipeline, waveform renderer, spectrum analyser and UI live inside `index.html`. No framework, no bundler, no dependencies beyond Meyda.js (loaded from CDN).

---

## 🎛️ How to Use

### 1 — Load tracks
Drag & drop or click **LOAD** to load a **Reference** track (the sound you want to match) and a **Target** track (the mix you want to process).

### 2 — Analyse
Click **ANALYZE & APPLY REFERENCE MATCHING**. The app performs an FFT spectral comparison and automatically sets the EQ, dynamics and output parameters to match the reference tonal curve.

### 3 — Review & tweak
The **Spectral Analysis Report** panel (collapsible) shows the per-band delta between reference and target. Adjust any slider in the Processing Chain manually if needed.

### 4 — Preview
Use the **Processed Output** section to audition the live DSP result in real time.

### 5 — Export
Click **EXPORT WAV** to render and download the processed audio as a 16-bit PCM WAV file.

---

## 🔁 Loop Playback

Both the Reference and Target waveforms support loop playback with movable in/out handles:

- Click **LOOP** to activate. An amber region appears on the waveform.
- Drag the **◁** handle to set the loop start point.
- Drag the **▷** handle to set the loop end point.
- Click anywhere else on the waveform to seek (loop remains active).
- Deactivate by clicking **LOOP** again.

---

## 🌐 Internationalisation

The UI supports **English** (default), **Español** and **Català**.  
Switch language from the **☰ menu** in the top-right corner.

The language resets to English on every page load — no preferences are stored anywhere.

All string keys live in `i18n.js`. Adding a new language requires adding a new entry to each key object and to the `MODALS` block.

---

## 🔒 Privacy

This application runs 100% locally in your browser:

- No audio files are ever uploaded or transmitted
- No analytics, cookies or tracking of any kind
- No data is stored between sessions (not even language preference)
- The only external requests are Google Fonts and the Meyda.js CDN, both loaded at startup

See the **Privacy**, **Legal** and **Terms** links in the footer for full details.

---

## 🛠️ Technical Notes

| Concern | Approach |
|---|---|
| Audio decoding | `AudioContext.decodeAudioData` |
| Spectral analysis | FFT via [Meyda.js](https://meyda.js.org/) (Web Audio) |
| Waveform rendering | Canvas 2D, custom peak-buffer renderer |
| DSP chain | Web Audio API nodes (BiquadFilter, DynamicsCompressor, WaveShaper, Gain) |
| WAV export | Offline rendering via `OfflineAudioContext`, 16-bit PCM writer |
| Loop playback | `AudioBufferSourceNode.loop`, `loopStart`, `loopEnd` |
| No framework | Vanilla JS (ES5-compatible), no bundler |

---

## 📋 Browser Compatibility

| Browser | Support |
|---|---|
| Chrome / Edge 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14.1+ | ✅ Full |
| Mobile (iOS / Android) | ⚠️ Partial — playback works, drag handles may be imprecise |

---
