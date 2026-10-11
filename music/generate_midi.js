const fs = require('fs');
const path = require('path');

// ==============================================================================
// 1. 音名 ⇔ MIDIノート番号変換テーブル
// ==============================================================================
const NOTE_MAP = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4,
  'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9,
  'A#': 10, 'Bb': 10, 'B': 11
};

function n2m(nameOctave) {
  const match = nameOctave.match(/^([A-G][b#]?)(-?\d+)$/);
  if (!match) throw new Error(`Invalid note name: ${nameOctave}`);
  const noteName = match[1];
  const octave = parseInt(match[2], 10);
  return 12 * (octave + 1) + NOTE_MAP[noteName];
}

// ==============================================================================
// 2. Standard MIDI File (SMF Format 1) バイナリビルダー (外部依存ゼロ)
// ==============================================================================
function encodeVLQ(value) {
  let v = Math.round(value);
  if (v < 0) v = 0;
  const bytes = [];
  bytes.push(v & 0x7F);
  v >>= 7;
  while (v > 0) {
    bytes.push((v & 0x7F) | 0x80);
    v >>= 7;
  }
  return Buffer.from(bytes.reverse());
}

class MIDITrack {
  constructor(name = '') {
    this.events = [];
    if (name) {
      const nameBuf = Buffer.from(name, 'utf8');
      const meta = Buffer.concat([
        Buffer.from([0xFF, 0x03]),
        encodeVLQ(nameBuf.length),
        nameBuf
      ]);
      this.events.push({ ticks: 0, bytes: meta });
    }
  }

  addEvent(ticks, bytes) {
    this.events.push({ ticks: Math.round(ticks), bytes });
  }

  addNote(ch, note, vel, startTicks, durTicks) {
    const noteOn = Buffer.from([0x90 | (ch & 0x0F), note & 0x7F, vel & 0x7F]);
    const noteOff = Buffer.from([0x80 | (ch & 0x0F), note & 0x7F, 0]);
    this.addEvent(startTicks, noteOn);
    this.addEvent(startTicks + durTicks, noteOff);
  }

  addProgramChange(ch, program, ticks = 0) {
    const pc = Buffer.from([0xC0 | (ch & 0x0F), program & 0x7F]);
    this.addEvent(ticks, pc);
  }

  addControlChange(ch, control, value, ticks = 0) {
    const cc = Buffer.from([0xB0 | (ch & 0x0F), control & 0x7F, value & 0x7F]);
    this.addEvent(ticks, cc);
  }

  toBuffer() {
    // タイム順にソート (同一タイム時はメタ/PC/CCが先頭)
    this.events.sort((a, b) => a.ticks - b.ticks);

    const chunks = [];
    let prevTicks = 0;

    for (const ev of this.events) {
      const delta = ev.ticks - prevTicks;
      chunks.push(encodeVLQ(delta));
      chunks.push(ev.bytes);
      prevTicks = ev.ticks;
    }

    // End of Track
    chunks.push(encodeVLQ(0));
    chunks.push(Buffer.from([0xFF, 0x2F, 0x00]));

    const payload = Buffer.concat(chunks);
    const header = Buffer.alloc(8);
    header.write('MTrk', 0, 4, 'ascii');
    header.writeUInt32BE(payload.length, 4);

    return Buffer.concat([header, payload]);
  }
}

class MIDIFile {
  constructor(tpqn = 480) {
    this.tpqn = tpqn; // Ticks Per Quarter Note (四分音符あたりの分解能)
    this.tracks = [];
  }

  addTrack(track) {
    this.tracks.push(track);
  }

  setTempo(track, bpm, ticks = 0) {
    const mpqn = Math.round(60000000 / bpm);
    const buf = Buffer.alloc(6);
    buf[0] = 0xFF;
    buf[1] = 0x51;
    buf[2] = 0x03;
    buf[3] = (mpqn >> 16) & 0xFF;
    buf[4] = (mpqn >> 8) & 0xFF;
    buf[5] = mpqn & 0xFF;
    track.addEvent(ticks, buf);
  }

  setTimeSignature(track, num = 4, den = 4, ticks = 0) {
    const denPow = Math.round(Math.log2(den));
    const buf = Buffer.from([0xFF, 0x58, 0x04, num, denPow, 24, 8]);
    track.addEvent(ticks, buf);
  }

  save(filepath) {
    const header = Buffer.alloc(14);
    header.write('MThd', 0, 4, 'ascii');
    header.writeUInt32BE(6, 4);
    header.writeUInt16BE(1, 8); // Format 1
    header.writeUInt16BE(this.tracks.length, 10);
    header.writeUInt16BE(this.tpqn, 12);

    const trackBuffers = this.tracks.map(t => t.toBuffer());
    const fullBuffer = Buffer.concat([header, ...trackBuffers]);
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, fullBuffer);
    console.log(`[MIDI] 生成完了: ${filepath} (${fullBuffer.length.toLocaleString()} bytes)`);
  }
}

// ==============================================================================
// 3. 楽器構成・音色設定 (General MIDI Program Change)
// ==============================================================================
const DEFAULT_PRESET = {
  bass: { ch: 0, program: 38, name: "Synth Bass 1 (電磁首輪/暗黒都市)" },
  guitar: { ch: 1, program: 30, name: "Distortion Guitar (レン:自由権の叫び)" },
  cello: { ch: 2, program: 42, name: "Cello (ダニエル:社会権・知性と哀愁)" },
  ensemble: { ch: 3, program: 48, name: "String Ensemble 1 (エレナ:平等権・高潔)" },
  piano: { ch: 4, program: 0, name: "Acoustic Grand Piano (真実の告発/記憶)" },
  synth: { ch: 5, program: 80, name: "Lead 1 Square (カウントダウン警報音)" },
  pad: { ch: 6, program: 89, name: "Pad 2 Warm (ディストピア空間)" },
  drums: { ch: 9, program: 0, name: "Standard Drum Kit (心拍/秒針/激闘)" }
};

// ==============================================================================
// 4. 個別楽曲ジェネレータ
// ==============================================================================

/**
 * 1. レン テーマ: 『反逆のパルス 〜自由権〜』 (Key: Fm / BPM: 138)
 */
function buildRenTheme(outputPath, instruments = DEFAULT_PRESET) {
  const midi = new MIDIFile(480);
  const tCon = new MIDITrack("Conductor");
  midi.setTempo(tCon, 138, 0);
  midi.setTimeSignature(tCon, 4, 4, 0);
  midi.addTrack(tCon);

  const tBass = new MIDITrack("Synth Bass (Ren)");
  tBass.addProgramChange(instruments.bass.ch, instruments.bass.program, 0);
  tBass.addControlChange(instruments.bass.ch, 74, 90, 0); // Cutoff

  const tGtr = new MIDITrack("Distortion Guitar");
  tGtr.addProgramChange(instruments.guitar.ch, instruments.guitar.program, 0);

  const tSynth = new MIDITrack("Cyber Arp / Alarm");
  tSynth.addProgramChange(instruments.synth.ch, instruments.synth.program, 0);

  const tDrums = new MIDITrack("Industrial Drums");

  // 32小節 (8小節進行 x 4ループ)
  // コード: | Fm | Eb | Db | C7 | Fm | Eb | Bbm | C7 |
  const progression = [
    { root: "F1", chord: ["F3", "Ab3", "C4"] },
    { root: "Eb1", chord: ["Eb3", "G3", "Bb3"] },
    { root: "Db1", chord: ["Db3", "F3", "Ab3"] },
    { root: "C1", chord: ["C3", "E3", "G3", "Bb3"] },
    { root: "F1", chord: ["F3", "Ab3", "C4"] },
    { root: "Eb1", chord: ["Eb3", "G3", "Bb3"] },
    { root: "Bb0", chord: ["Bb2", "Db3", "F3"] },
    { root: "C1", chord: ["C3", "E3", "G3", "Bb3"] }
  ];

  const totalBars = 32;
  for (let bar = 0; bar < totalBars; bar++) {
    const barStart = bar * 1920;
    const p = progression[bar % progression.length];

    // 16分ベースライン (パルシブにドライブ)
    for (let i = 0; i < 16; i++) {
      const isOct = (i % 4 === 2);
      const note = n2m(p.root) + (isOct ? 12 : 0);
      const vel = (i % 4 === 0) ? 110 : 85;
      tBass.addNote(instruments.bass.ch, note, vel, barStart + i * 120, 100);
    }

    // ギターリフ (パームミュート刻み + アクセント)
    if (bar >= 4) {
      for (let i = 0; i < 8; i++) {
        const vel = (i === 0 || i === 5) ? 118 : 88;
        tGtr.addNote(instruments.guitar.ch, n2m(p.root) + 24, vel, barStart + i * 240, 190);
      }
      // サビでのリード叫び
      if (bar >= 16) {
        const leadPattern = ["F5", "Ab5", "G5", "F5", "C6", "Bb5", "Ab5", "G5"];
        const lNote = leadPattern[bar % leadPattern.length];
        tGtr.addNote(instruments.guitar.ch, n2m(lNote), 120, barStart, 900);
        tGtr.addNote(instruments.guitar.ch, n2m(lNote) - 2, 115, barStart + 960, 900);
      }
    }

    // サイバーアラーム (電磁首輪の警告音モチーフ)
    const alarmSeq = ["F5", "C5", "F5", "Gb5", "F5", "C5", "Db5", "C5"];
    for (let i = 0; i < 8; i++) {
      tSynth.addNote(instruments.synth.ch, n2m(alarmSeq[i]), 70, barStart + i * 240, 150);
    }

    // インダストリアルドラム
    if (bar >= 2) {
      for (let i = 0; i < 4; i++) {
        tDrums.addNote(9, 36, 115, barStart + i * 480, 200); // Kick (4つ打ち)
        if (i === 1 || i === 3) {
          tDrums.addNote(9, 38, 118, barStart + i * 480, 220); // Heavy Snare (2, 4拍)
        }
      }
      // 16分ハイハット
      for (let i = 0; i < 16; i++) {
        const vel = (i % 4 === 0) ? 95 : 65;
        tDrums.addNote(9, 42, vel, barStart + i * 120, 80);
      }
    }
  }

  midi.addTrack(tBass);
  midi.addTrack(tGtr);
  midi.addTrack(tSynth);
  midi.addTrack(tDrums);
  midi.save(outputPath);
}

/**
 * 2. エレナ テーマ: 『白銀の矜持 〜平等権〜』 (Key: Bbm/Fm / BPM: 116)
 */
function buildElenaTheme(outputPath, instruments = DEFAULT_PRESET) {
  const midi = new MIDIFile(480);
  const tCon = new MIDITrack("Conductor");
  midi.setTempo(tCon, 116, 0);
  midi.setTimeSignature(tCon, 4, 4, 0);
  midi.addTrack(tCon);

  const tEns = new MIDITrack("Orchestral Ensemble (Elena)");
  tEns.addProgramChange(instruments.ensemble.ch, instruments.ensemble.program, 0);

  const tPiano = new MIDITrack("Acoustic Piano");
  tPiano.addProgramChange(instruments.piano.ch, instruments.piano.program, 0);

  const tBass = new MIDITrack("Contrabass / Synth Bass");
  tBass.addProgramChange(instruments.bass.ch, 33, 0); // Fingered Bass

  // 24小節 (ネオ・バロック的コード進行)
  // | Bbm | Fm/Ab | Gbmaj7 | F7 | Bbm | Ebm | Ab | Dbmaj7 |
  // | C7 | C7 | Fm | Fm |
  const progression = [
    { root: "Bb1", chord: ["Bb3", "Db4", "F4"] },
    { root: "Ab1", chord: ["Ab3", "C4", "F4"] },
    { root: "Gb1", chord: ["Gb3", "Bb3", "Db4", "F4"] },
    { root: "F1", chord: ["F3", "A3", "C4", "Eb4"] },
    { root: "Bb1", chord: ["Bb3", "Db4", "F4"] },
    { root: "Eb1", chord: ["Eb3", "Gb3", "Bb3", "Eb4"] },
    { root: "Ab1", chord: ["Ab3", "C4", "Eb4"] },
    { root: "Db1", chord: ["Db3", "F3", "Ab3", "C4"] },
    { root: "C1", chord: ["C3", "E3", "G3", "Bb3"] },
    { root: "C1", chord: ["C3", "E3", "G3", "Bb3"] },
    { root: "F1", chord: ["F3", "Ab3", "C4", "F4"] },
    { root: "F1", chord: ["F3", "Ab3", "C4", "F4"] }
  ];

  // 優雅で高潔なメロディライン
  const elenaMelody = [
    ["F5", 720], ["G5", 240], ["Ab5", 960],
    ["C6", 960], ["Bb5", 480], ["Ab5", 480],
    ["Gb5", 720], ["Ab5", 240], ["Bb5", 960],
    ["A5", 1920],
    ["Db6", 960], ["C6", 480], ["Bb5", 480],
    ["Bb5", 960], ["Ab5", 480], ["Gb5", 480],
    ["Ab5", 960], ["Gb5", 480], ["F5", 480],
    ["F5", 1920],
    ["G5", 960], ["Ab5", 480], ["Bb5", 480],
    ["C6", 1920],
    ["F5", 1920],
    ["F5", 1920]
  ];

  for (let bar = 0; bar < 24; bar++) {
    const barStart = bar * 1920;
    const p = progression[bar % progression.length];

    // ベース
    tBass.addNote(instruments.bass.ch, n2m(p.root), 85, barStart, 1850);

    // ピアノ・アルペジオ (8分音符で流麗に)
    for (let i = 0; i < 8; i++) {
      const note = p.chord[i % p.chord.length];
      tPiano.addNote(instruments.piano.ch, n2m(note), 70, barStart + i * 240, 220);
    }

    // ストリングス・和音持続
    for (const note of p.chord) {
      tEns.addNote(instruments.ensemble.ch, n2m(note), 78, barStart, 1880);
    }

    // エレナ主旋律 (8小節目以降)
    if (bar >= 8) {
      const mel = elenaMelody[bar % elenaMelody.length];
      let tOffset = 0;
      if (mel) {
        tEns.addNote(instruments.ensemble.ch, n2m(mel[0]) + 12, 105, barStart, mel[1]);
      }
    }
  }

  midi.addTrack(tEns);
  midi.addTrack(tPiano);
  midi.addTrack(tBass);
  midi.save(outputPath);
}

/**
 * 3. ダニエル テーマ: 『命のトリアージ 〜社会権〜』 (Key: Fm / BPM: 96)
 */
function buildDanielTheme(outputPath, instruments = DEFAULT_PRESET) {
  const midi = new MIDIFile(480);
  const tCon = new MIDITrack("Conductor");
  midi.setTempo(tCon, 96, 0);
  midi.setTimeSignature(tCon, 4, 4, 0);
  midi.addTrack(tCon);

  const tCello = new MIDITrack("Solo Cello (Daniel)");
  tCello.addProgramChange(instruments.cello.ch, instruments.cello.program, 0);
  tCello.addControlChange(instruments.cello.ch, 1, 60, 0); // Vibrato

  const tPiano = new MIDITrack("Acoustic Piano");
  tPiano.addProgramChange(instruments.piano.ch, instruments.piano.program, 0);

  const tPulse = new MIDITrack("Heartbeat Pulse (Bass)");
  tPulse.addProgramChange(instruments.bass.ch, 38, 0);

  // 16小節 (深い哀愁と命の選択に対する苦悩)
  // | Fm | Dbmaj7 | Bbm7 | C7sus4 C7 |
  // | Fm | Bbm/Db | C7 | Fm |
  const progression = [
    { bass: "F1", chord: ["F3", "Ab3", "C4"] },
    { bass: "Db1", chord: ["F3", "Ab3", "C4", "Db4"] },
    { bass: "Bb0", chord: ["Db3", "F3", "Ab3", "C4"] },
    { bass: "C1", chord: ["E3", "G3", "Bb3", "C4"] },
    { bass: "F1", chord: ["F3", "Ab3", "C4"] },
    { bass: "Db1", chord: ["Db3", "F3", "Bb3"] },
    { bass: "C1", chord: ["C3", "E3", "G3", "Bb3"] },
    { bass: "F1", chord: ["F2", "C3", "F3", "Ab3"] }
  ];

  // ダニエルの悲痛なチェロ旋律 (生存権の叫び)
  const celloPhrases = [
    [["F3", 720], ["G3", 240], ["Ab3", 960]],
    [["G3", 960], ["F3", 480], ["Eb3", 480]],
    [["Db3", 1440], ["C3", 480]],
    [["C3", 1920]],
    [["Ab3", 720], ["Bb3", 240], ["C4", 960]],
    [["Db4", 960], ["C4", 480], ["Bb3", 480]],
    [["G3", 1440], ["E3", 480]],
    [["F3", 1920]]
  ];

  for (let bar = 0; bar < 16; bar++) {
    const barStart = bar * 1920;
    const p = progression[bar % progression.length];

    // 心拍パルス (心電図の鼓動: トクン…トクン…)
    tPulse.addNote(instruments.bass.ch, n2m(p.bass), 85, barStart, 200);
    tPulse.addNote(instruments.bass.ch, n2m(p.bass), 65, barStart + 300, 180);
    tPulse.addNote(instruments.bass.ch, n2m(p.bass), 80, barStart + 960, 200);
    tPulse.addNote(instruments.bass.ch, n2m(p.bass), 60, barStart + 1260, 180);

    // ピアノ静かなアルペジオ
    for (let i = 0; i < 4; i++) {
      const note = p.chord[i % p.chord.length];
      tPiano.addNote(instruments.piano.ch, n2m(note), 65, barStart + i * 480, 440);
    }

    // チェロ旋律
    const phrase = celloPhrases[bar % celloPhrases.length];
    let offset = 0;
    for (const [note, dur] of phrase) {
      tCello.addNote(instruments.cello.ch, n2m(note), 90, barStart + offset, dur - 40);
      offset += dur;
    }
  }

  midi.addTrack(tCello);
  midi.addTrack(tPiano);
  midi.addTrack(tPulse);
  midi.save(outputPath);
}

/**
 * 4. クライマックス: 『12:20 同時認証 〜立憲の解放〜』 (Key: Fm -> F Major / BPM: 138)
 */
function buildClimaxTheme(outputPath, instruments = DEFAULT_PRESET) {
  const midi = new MIDIFile(480);
  const tCon = new MIDITrack("Conductor");
  midi.setTempo(tCon, 138, 0);
  midi.setTimeSignature(tCon, 4, 4, 0);
  midi.addTrack(tCon);

  const tBass = new MIDITrack("Synth Bass");
  tBass.addProgramChange(instruments.bass.ch, instruments.bass.program, 0);

  const tGtr = new MIDITrack("Lead Guitar (Ren)");
  tGtr.addProgramChange(instruments.guitar.ch, instruments.guitar.program, 0);

  const tCello = new MIDITrack("Solo Cello (Daniel)");
  tCello.addProgramChange(instruments.cello.ch, instruments.cello.program, 0);

  const tEns = new MIDITrack("Full Strings & Brass (Elena)");
  tEns.addProgramChange(instruments.ensemble.ch, 49, 0); // Orchestral Strings

  const tPiano = new MIDITrack("Grand Piano & Choir");
  tPiano.addProgramChange(instruments.piano.ch, instruments.piano.program, 0);

  const tDrums = new MIDITrack("Epic Percussion");

  // 王道カタルシス進行
  // | Db | Eb | Fm | Fm/Ab |
  // | Db | Eb | C7 | Fm |
  // | Db | Eb | C7/E | Fm Eb |
  // | Db | Eb | Fmaj7 | Fmaj7 | (最後は人権回復でメジャー解決！)
  const climaxChords = [
    { bass: "Db1", chord: ["Db4", "F4", "Ab4", "Db5"] },
    { bass: "Eb1", chord: ["Eb4", "G4", "Bb4", "Eb5"] },
    { bass: "F1", chord: ["F4", "Ab4", "C5", "F5"] },
    { bass: "Ab0", chord: ["Ab3", "C4", "F4", "Ab4"] },

    { bass: "Db1", chord: ["Db4", "F4", "Ab4", "Db5"] },
    { bass: "Eb1", chord: ["Eb4", "G4", "Bb4", "Eb5"] },
    { bass: "C1", chord: ["E4", "G4", "Bb4", "C5"] },
    { bass: "F1", chord: ["F4", "Ab4", "C5", "F5"] },

    { bass: "Db1", chord: ["Db4", "F4", "Ab4", "Db5"] },
    { bass: "Eb1", chord: ["Eb4", "G4", "Bb4", "Eb5"] },
    { bass: "E1", chord: ["E4", "G4", "Bb4", "C5"] },
    { bass: "F1", chord: ["F4", "Ab4", "C5"] },

    { bass: "Db1", chord: ["Db4", "F4", "Ab4", "C5"] },
    { bass: "Eb1", chord: ["Eb4", "G4", "Bb4", "D5"] },
    { bass: "F1", chord: ["F4", "A4", "C5", "E5"] }, // Fmaj7 (光の回復)
    { bass: "F1", chord: ["F4", "A4", "C5", "E5"] }
  ];

  const mainMelody = [
    // Bar 1 (Db): F5... E5 F5 G5... Ab5...
    [["F5", 360], ["E5", 120], ["F5", 480], ["G5", 480], ["Ab5", 480]],
    // Bar 2 (Eb): Bb5... Ab5 G5 F5... Eb5...
    [["Bb5", 360], ["Ab5", 240], ["G5", 240], ["F5", 240], ["Eb5", 840]],
    // Bar 3 (Fm): C6....... Bb5 Ab5 G5 Ab5
    [["C6", 960], ["Bb5", 240], ["Ab5", 240], ["G5", 240], ["Ab5", 240]],
    // Bar 4 (Fm/Ab): G5... F5 F5.......
    [["G5", 720], ["F5", 240], ["F5", 960]],

    // Bar 5 (Db): F5... Ab5... Db6.......
    [["F5", 480], ["Ab5", 480], ["Db6", 960]],
    // Bar 6 (Eb): C6... Bb5... Ab5.......
    [["C6", 720], ["Bb5", 240], ["Ab5", 960]],
    // Bar 7 (C7): G5... A5... C6.......
    [["G5", 480], ["A5", 480], ["C6", 960]],
    // Bar 8 (Fm): F5 (全音符)
    [["F5", 1920]],

    // Bar 9 (Db)
    [["F5", 360], ["E5", 120], ["F5", 480], ["G5", 480], ["Ab5", 480]],
    // Bar 10 (Eb)
    [["Bb5", 360], ["Ab5", 240], ["G5", 240], ["F5", 240], ["Eb5", 840]],
    // Bar 11 (C7/E)
    [["C6", 720], ["Bb5", 240], ["G5", 480], ["Bb5", 480]],
    // Bar 12 (Fm)
    [["Ab5", 960], ["G5", 960]],

    // Bar 13 (Dbmaj7)
    [["F5", 480], ["Ab5", 480], ["C6", 960]],
    // Bar 14 (Eb6)
    [["G5", 480], ["Bb5", 480], ["D6", 960]],
    // Bar 15 (Fmaj7 - 自由の歓喜)
    [["E6", 960], ["C6", 480], ["A5", 480]],
    // Bar 16 (Fmaj7 - 終止)
    [["F5", 1920]]
  ];

  for (let bar = 0; bar < 16; bar++) {
    const barStart = bar * 1920;
    const c = climaxChords[bar];

    // ベース (重低音)
    tBass.addNote(instruments.bass.ch, n2m(c.bass), 120, barStart, 1880);

    // 和音 (ブラス & ピアノ)
    for (const note of c.chord) {
      tEns.addNote(instruments.ensemble.ch, n2m(note), 110, barStart, 1880);
      tPiano.addNote(instruments.piano.ch, n2m(note), 95, barStart, 1880);
    }

    // 主旋律 (リードギター & ストリングス & チェロによる大合奏)
    const mel = mainMelody[bar];
    let offset = 0;
    for (const [nName, dur] of mel) {
      tGtr.addNote(instruments.guitar.ch, n2m(nName), 125, barStart + offset, dur - 30);
      tEns.addNote(instruments.ensemble.ch, n2m(nName) + 12, 115, barStart + offset, dur - 30);
      tCello.addNote(instruments.cello.ch, n2m(nName) - 12, 110, barStart + offset, dur - 30);
      offset += dur;
    }

    // ドラム (フルダイナミクス)
    for (let i = 0; i < 4; i++) {
      tDrums.addNote(9, 36, 124, barStart + i * 480, 200); // Kick
      if (i === 1 || i === 3) {
        tDrums.addNote(9, 38, 127, barStart + i * 480, 220); // Snare
      }
      tDrums.addNote(9, 42, 100, barStart + i * 480, 100); // Hi-Hat
      tDrums.addNote(9, 42, 80, barStart + i * 480 + 240, 100);
    }
    if (bar === 0 || bar === 8 || bar === 14) {
      tDrums.addNote(9, 49, 127, barStart, 800); // Crash
    }
  }

  midi.addTrack(tBass);
  midi.addTrack(tGtr);
  midi.addTrack(tCello);
  midi.addTrack(tEns);
  midi.addTrack(tPiano);
  midi.addTrack(tDrums);
  midi.save(outputPath);
}

/**
 * 5. 全曲長編組曲: 『パラレル・ジャパニア：クロニクル組曲 (全7パート)』
 */
function buildFullSuite(outputPath, instruments = DEFAULT_PRESET) {
  const midi = new MIDIFile(480);
  const tCon = new MIDITrack("Conductor / Tempo Timeline");

  // タイムラインとテンポ変化
  // Part I: 100 BPM (0:00〜)
  midi.setTempo(tCon, 100, 0);
  midi.setTimeSignature(tCon, 4, 4, 0);
  // Part II: 138 BPM
  midi.setTempo(tCon, 138, 50 * 1920);
  // Part III: 138 BPM
  midi.setTempo(tCon, 138, (50 + 40) * 1920);
  // Part IV: 115 BPM
  midi.setTempo(tCon, 115, (50 + 40 + 40) * 1920);
  // Part V: 152 BPM
  midi.setTempo(tCon, 152, (50 + 40 + 40 + 36) * 1920);
  // Part VI: 138 BPM
  midi.setTempo(tCon, 138, (50 + 40 + 40 + 36 + 48) * 1920);
  // Part VII: 76 BPM
  midi.setTempo(tCon, 76, (50 + 40 + 40 + 36 + 48 + 32) * 1920);
  midi.addTrack(tCon);

  const tBass = new MIDITrack("Synth Bass");
  tBass.addProgramChange(instruments.bass.ch, instruments.bass.program, 0);

  const tGtr = new MIDITrack("Distortion Guitar");
  tGtr.addProgramChange(instruments.guitar.ch, instruments.guitar.program, 0);

  const tCello = new MIDITrack("Solo Cello");
  tCello.addProgramChange(instruments.cello.ch, instruments.cello.program, 0);

  const tEns = new MIDITrack("Orchestral Ensemble");
  tEns.addProgramChange(instruments.ensemble.ch, instruments.ensemble.program, 0);

  const tPiano = new MIDITrack("Piano & Choir");
  tPiano.addProgramChange(instruments.piano.ch, instruments.piano.program, 0);

  const tSynth = new MIDITrack("Cyber Arp");
  tSynth.addProgramChange(instruments.synth.ch, instruments.synth.program, 0);

  const tDrums = new MIDITrack("Drums & Percussion");

  let currentBar = 0;

  // --- PART I: 監視都市の夜明けと重圧 (50小節) ---
  for (let bar = 0; bar < 50; bar++) {
    const start = (currentBar + bar) * 1920;
    tBass.addNote(instruments.bass.ch, n2m("F1"), 60 + Math.min(bar, 35), start, 1880);

    // 首輪警告音
    if (bar < 24) {
      const seq = ["F5", "Gb5", "F5", "C5", "Db5", "C5", "G4", "C5"];
      for (let i = 0; i < 8; i++) {
        tSynth.addNote(instruments.synth.ch, n2m(seq[i]), 60, start + i * 240, 180);
      }
    }
    // ソロチェロ
    if (bar >= 12 && bar < 36) {
      const cNotes = ["F3", "G3", "Ab3", "G3", "F3", "Eb3", "Db3", "C3"];
      tCello.addNote(instruments.cello.ch, n2m(cNotes[bar % cNotes.length]), 80, start, 1800);
    }
    // ストリングス
    if (bar >= 24) {
      const chords = [["F3", "Ab3", "C4"], ["Db3", "F3", "Ab3"], ["Bb2", "Db3", "F3"], ["C3", "E3", "G3"]];
      for (const n of chords[bar % 4]) {
        tEns.addNote(instruments.ensemble.ch, n2m(n), 70, start, 1880);
      }
    }
  }
  currentBar += 50;

  // --- PART II: スラム脱出・カウントダウン始動 (40小節) ---
  for (let bar = 0; bar < 40; bar++) {
    const start = (currentBar + bar) * 1920;
    // 8分オクターブベース
    for (let i = 0; i < 8; i++) {
      tBass.addNote(instruments.bass.ch, n2m(i % 2 === 0 ? "F1" : "F2"), 95, start + i * 240, 200);
    }
    // ギターリフ
    const gSeq = ["F3", "F3", "Ab3", "G3", "F3", "F3", "C4", "Bb3"];
    for (let i = 0; i < 8; i++) {
      tGtr.addNote(instruments.guitar.ch, n2m(gSeq[i]), 105, start + i * 240, 200);
    }
    // アルペジオ
    for (let i = 0; i < 16; i++) {
      tSynth.addNote(instruments.synth.ch, n2m(["F4", "C5", "Ab5", "C5"][i % 4]), 75, start + i * 120, 100);
    }
    // ドラム
    for (let i = 0; i < 4; i++) {
      tDrums.addNote(9, 36, 115, start + i * 480, 200);
      if (i === 1 || i === 3) tDrums.addNote(9, 38, 120, start + i * 480, 200);
    }
  }
  currentBar += 40;

  // --- PART III: 3人の邂逅と対位法 (40小節) ---
  for (let bar = 0; bar < 40; bar++) {
    const start = (currentBar + bar) * 1920;
    // Voice 1: Daniel (Cello)
    const cNotes = ["Bb2", "F3", "Db3", "Ab2", "Gb2", "F2", "Eb2", "C3"];
    tCello.addNote(instruments.cello.ch, n2m(cNotes[bar % cNotes.length]), 90, start, 1850);

    // Voice 2: Ren (Guitar Counterpoint)
    const gCounter = ["Db5", "C5", "Bb4", "F5", "Gb5", "F5", "Eb5", "C5"];
    for (let i = 0; i < 4; i++) {
      tGtr.addNote(instruments.guitar.ch, n2m(gCounter[(bar + i) % gCounter.length]), 95, start + i * 480, 260);
    }

    // Voice 3: Elena (Brass Accents)
    if (bar % 2 === 0) {
      for (const bn of ["F4", "Ab4", "C5"]) {
        tEns.addNote(instruments.ensemble.ch, n2m(bn), 100, start + 480, 480);
        tEns.addNote(instruments.ensemble.ch, n2m(bn), 100, start + 1440, 480);
      }
    }
  }
  currentBar += 40;

  // --- PART IV: 街頭ビジョンジャック (36小節) ---
  const pChords = [
    ["F3", "Ab3", "C4", "F4"], ["Db3", "F3", "Ab3", "Db4"],
    ["Ab2", "C3", "Eb3", "Ab3"], ["Eb3", "G3", "Bb3", "Eb4"]
  ];
  for (let bar = 0; bar < 36; bar++) {
    const start = (currentBar + bar) * 1920;
    const c = pChords[bar % 4];
    for (let i = 0; i < 16; i++) {
      tPiano.addNote(instruments.piano.ch, n2m(c[i % 4]) + (i >= 8 ? 12 : 0), 75, start + i * 120, 110);
    }
    for (const pn of c.slice(0, 3)) {
      tEns.addNote(instruments.ensemble.ch, n2m(pn) + 12, 75, start, 1880);
    }
  }
  currentBar += 36;

  // --- PART V: 統治タワー50F激闘 (48小節) ---
  const spiccato = ["F4", "Ab4", "G4", "F4", "C5", "Bb4", "Ab4", "G4"];
  for (let bar = 0; bar < 48; bar++) {
    const start = (currentBar + bar) * 1920;
    for (let i = 0; i < 16; i++) {
      tEns.addNote(instruments.ensemble.ch, n2m(spiccato[(i + bar) % spiccato.length]), 105, start + i * 120, 90);
    }
    for (let i = 0; i < 8; i++) {
      tBass.addNote(instruments.bass.ch, n2m("F1"), 105, start + i * 240, 180);
      tGtr.addNote(instruments.guitar.ch, n2m("F3"), 110, start + i * 240, 180);
      tDrums.addNote(9, 36, 120, start + i * 240, 160);
    }
  }
  currentBar += 48;

  // --- PART VI: 12:20 同時認証・大サビ (32小節) ---
  const climaxChords = [
    { bass: "Db1", chord: ["Db4", "F4", "Ab4", "Db5"] },
    { bass: "Eb1", chord: ["Eb4", "G4", "Bb4", "Eb5"] },
    { bass: "F1", chord: ["F4", "Ab4", "C5", "F5"] },
    { bass: "Ab0", chord: ["Ab3", "C4", "F4", "Ab4"] }
  ];
  for (let bar = 0; bar < 32; bar++) {
    const start = (currentBar + bar) * 1920;
    const c = climaxChords[bar % 4];
    tBass.addNote(instruments.bass.ch, n2m(c.bass), 125, start, 1880);
    for (const note of c.chord) {
      tEns.addNote(instruments.ensemble.ch, n2m(note), 118, start, 1880);
      tPiano.addNote(instruments.piano.ch, n2m(note), 105, start, 1880);
    }
    // 主旋律
    tGtr.addNote(instruments.guitar.ch, n2m("C6"), 127, start, 960);
    tGtr.addNote(instruments.guitar.ch, n2m("Bb5"), 120, start + 960, 480);
    tGtr.addNote(instruments.guitar.ch, n2m("Ab5"), 120, start + 1440, 480);
    for (let i = 0; i < 4; i++) {
      tDrums.addNote(9, 36, 125, start + i * 480, 200);
      if (i === 1 || i === 3) tDrums.addNote(9, 38, 127, start + i * 480, 200);
    }
  }
  currentBar += 32;

  // --- PART VII: エピローグ・自由の夜明け (20小節) ---
  const fMajArp = [
    ["F3", "A3", "C4", "E4", "G4", "C5"],
    ["Db3", "F3", "Ab3", "C4", "Eb4", "Ab4"],
    ["Eb3", "G3", "Bb3", "D4", "F4", "Bb4"],
    ["F3", "A3", "C4", "E4", "G4", "A5"]
  ];
  for (let bar = 0; bar < 20; bar++) {
    const start = (currentBar + bar) * 1920;
    const arp = fMajArp[bar % 4];
    for (let i = 0; i < arp.length; i++) {
      tPiano.addNote(instruments.piano.ch, n2m(arp[i]), 65 - i * 3, start + i * 280, 500);
    }
    tCello.addNote(instruments.cello.ch, n2m(arp[0].slice(0, -1) + "2"), 55, start, 1850);
  }

  midi.addTrack(tBass);
  midi.addTrack(tGtr);
  midi.addTrack(tCello);
  midi.addTrack(tEns);
  midi.addTrack(tPiano);
  midi.addTrack(tSynth);
  midi.addTrack(tDrums);
  midi.save(outputPath);
}

// ==============================================================================
// 5. 実行処理
// ==============================================================================
function main() {
  const outDir = path.join(__dirname, 'output');
  console.log("=== 『パラレル・ジャパニア：クロニクル』 MIDI生成開始 ===");
  buildRenTheme(path.join(outDir, 'theme_ren_freedom.mid'));
  buildElenaTheme(path.join(outDir, 'theme_elena_equality.mid'));
  buildDanielTheme(path.join(outDir, 'theme_daniel_social.mid'));
  buildClimaxTheme(path.join(outDir, 'theme_climax_constitutional.mid'));
  buildFullSuite(path.join(outDir, 'parallel_japania_suite.mid'));
  console.log("=== 全MIDIファイル生成完了 ===");
}

if (require.main === module) {
  main();
}

module.exports = {
  MIDIFile,
  MIDITrack,
  n2m,
  DEFAULT_PRESET,
  buildRenTheme,
  buildElenaTheme,
  buildDanielTheme,
  buildClimaxTheme,
  buildFullSuite
};
