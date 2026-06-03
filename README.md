# RACK4MASTER / Reference

> **Spectral Reference Matching Processor — v8.0**  
> Intelligent EQ matching and mastering chain that runs entirely in your browser. No uploads, no accounts, no tracking.

---

## ✨ Features

- **Spectral Reference Matching** — load any reference track and auto-match your target's tonal balance using FFT analysis (Meyda.js 30-band ISO, fallback IIR)
- **7-Band Parametric EQ** — sub and air as shelf filters (±12 dB); bass, lo-mid, mid, hi-mid and presence as peaking bells
- **4th-Order High-Pass Filter** — two cascaded biquads (24 dB/oct) with resonance control; derived automatically from sub-bass energy delta
- **Harmonic Saturation** — soft-clip WaveShaper at 4× oversampling; derived from spectral flatness delta
- **Dynamics Processor** — feed-forward compressor (threshold, ratio, attack, release, makeup gain)
- **M/S Output Stage** — independent mid/side gain, limiter ceiling (150 ms release, 20:1), output gain
- **A/B Compare** — seamless 40 ms crossfade between dry target and processed output while playing; keyboard shortcut **W**
- **Live DSP Chain** — real-time preview of the full processing chain before export
- **VU Meters** — real-time IN / GR (gain reduction) / OUT peak meters with ballistic decay
- **Loop Playback** — movable S/E handles on all three waveforms; result loop syncs bidirectionally with target loop; toggle sync on/off
- **Spectral Comparison View** — overlaid reference / target / result spectra with logarithmic frequency axis
- **Contextual Help** — inline `?` panel on each FX module explaining every parameter
- **WAV Export** — 16-bit or 24-bit PCM, original or 48 kHz sample rate, rendered offline at full quality
- **Internationalisation** — English · Español · Català (always starts in English, no data stored)
- **100% browser** — Web Audio API, zero server-side processing, zero data collection

---

## 📸 Screenshots

![Main Interface](pic1.png)  
*Main application window with reference and target tracks loaded.*

![Spectral Analysis Report](pic2.png)  
*Collapsible analysis panel showing per-band deltas and recommended adjustments.*

![Live Processing & Export](pic3.png)  
*Real-time DSP chain, VU meters, A/B compare and WAV export options.*

---

## 🚀 Getting Started

No build step or install required.

```bash
git clone https://github.com/rack4master/reference.git
cd reference
npx serve .          # → http://localhost:3000
```

> **Note:** the app must be served over HTTP (not opened as a local `file://` URL) because it loads `i18n.js` and `script.js` as external files.

---

## 📂 File Structure

```
reference/
├── index.html    # HTML structure only — loads external CSS and JS
├── style.css     # All styles (201 lines)
├── script.js     # Full audio engine, DSP chain, UI logic (1 764 lines)
├── i18n.js       # Internationalisation module — en / es / ca (219 lines)
└── README.md
```

No framework, no bundler, no dependencies beyond **Meyda.js** (loaded from CDN at startup).

---

## 🎛️ How to Use

### 1 — Load tracks
Drag & drop or click **LOAD** on the Reference and Target waveform zones.  
You can also drop a new file onto an already-loaded zone to replace it — playback stops automatically.

### 2 — Analyse
Click **ANALYZE & APPLY REFERENCE MATCHING**. The engine performs an FFT spectral comparison and sets the EQ, dynamics, HPF, saturation and output parameters automatically.

### 3 — Review & tweak
The **Spectral Analysis Report** (collapsible) shows per-band deltas. Click **?** on any FX module for a plain-English explanation of each parameter. Adjust any slider — the live chain updates in real time.

### 4 — Preview
Use the **Processed Output** section to audition the result. The transport shows three buttons:
- **PLAY / PAUSE** — starts or pauses the live DSP chain
- **STOP** — stops and rewinds
- **A/B** — toggles between dry target (A) and processed (B) with a 40 ms crossfade; shortcut **W**

### 5 — Export
Click **EXPORT WAV**. Choose bit depth (16 or 24 bit) and sample rate (original or 48 kHz). The file is rendered offline through the full DSP chain and downloaded with the target filename as base.

---

## 🔁 Loop Playback

All three waveforms (Reference, Target, Processed Output) support loop playback with draggable handles.

- Click **LOOP** to activate. An amber region appears with **◁** (start) and **▷** (end) handles.
- Drag either handle to resize the loop region.
- Click anywhere else on the waveform to seek — if the click lands outside the loop, playback jumps to the loop start.
- **Processed Output loop** comes with a **SYNC** button (active by default, shown in green):
  - **SYNC ON** — result loop mirrors the target loop in real time; dragging handles on either waveform moves both
  - **SYNC OFF** — result loop is fully independent; handles on the result waveform only affect the result
- During loop + A/B playback, both the target and result waveform playheads advance together (same audio, same position).

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **W** | Toggle A/B compare (while result is playing) |
| **Esc** | Close any open modal or confirmation dialog |

---

## 🌐 Internationalisation

The UI supports **English** (default), **Español** and **Català**.  
Switch language from the **☰ menu** in the top-right corner.

The language resets to English on every page load — no preferences are stored anywhere.  
All string keys live in `i18n.js`. Adding a new language requires a new entry in each key object and in the `MODALS` block.  
Module help panels (`help.eq.body`, `help.dyn.body`, `help.hpf.body`, `help.out.body`) accept full HTML for their translated content.

---

## 🔒 Privacy

This application runs 100% locally in your browser:

- No audio files are ever uploaded or transmitted
- No analytics, cookies or tracking of any kind
- No data is stored between sessions (not even language preference)
- The only external requests are Google Fonts, Meyda.js CDN, and (optionally) the Barlow Condensed / Share Tech Mono / Orbitron font families — all loaded at startup

---

## 🛠️ Technical Notes

| Concern | Approach |
|---|---|
| Audio decoding | `AudioContext.decodeAudioData` |
| Spectral analysis | Hann-windowed FFT (custom) + Meyda.js 30-band ISO 1/3-oct (when available) |
| Waveform rendering | Canvas 2D, L+R averaged peak-buffer renderer |
| HPF | Two cascaded `BiquadFilter` highpass (4th-order, 24 dB/oct) |
| EQ | 7-band: `lowshelf` at 50 Hz, `highshelf` at 16 kHz, `peaking` for middle 5 bands |
| Saturation | `WaveShaperNode` with algebraic soft-clip curve, `oversample: '4x'` |
| Dynamics | `DynamicsCompressorNode` (compressor + brick-wall limiter, 150 ms release) |
| M/S matrix | `ChannelSplitter` → gain nodes → `ChannelMerger` |
| A/B compare | Parallel dry bypass path (`bypassGain` + `bypassAnalyser`), 40 ms gain crossfade |
| VU meters | `getFloatTimeDomainData` peak with ballistic decay (12 dB/s) |
| Loop playback | `AudioBufferSourceNode.loop`, `loopStart`, `loopEnd`; bidirectional sync between target and result |
| LRA measurement | EBU R128 — 3 s blocks, 75 % overlap, 10th–90th percentile |
| LUFS | K-weighted filter approximation (EBU R128) |
| WAV export | `OfflineAudioContext` render → 16-bit or 24-bit PCM writer |
| i18n | External `i18n.js` module (EN/ES/CA); `data-i18n` for text, `data-i18n-html` for rich HTML panels |
| No framework | Vanilla JS (ES5-compatible), no bundler |

---

## 📋 Browser Compatibility

| Browser | Support |
|---|---|
| Chrome / Edge 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14.1+ | ✅ Full |
| Mobile (iOS / Android) | ⚠️ Partial — playback and A/B work; loop drag handles may be imprecise on touch |

---

## 📄 Licence

© 2026 Rack4Master. All rights reserved.

Free for personal and commercial use. You may not reverse-engineer, resell or redistribute the application itself without written permission.  
See [Terms of Use](#) for full details.

---

<p align="center">
  <sub>Runs locally · No data stored · No tracking · 100% browser</sub>
</p>
