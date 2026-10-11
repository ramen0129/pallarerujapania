# -*- coding: utf-8 -*-
"""
『パラレル・ジャパニア：クロニクル 〜失われた人権の180分〜』
公式BGM MIDI生成スクリプト (Standard MIDI File Format 1)

外部ライブラリ（mido, music21, pretty_midi 等）不要。
Python標準ライブラリ `struct` のみで動作します。

■ 音色の変更方法:
プログラムチェンジ（PC番号: 0〜127、GM規格）を `CUSTOM_INSTRUMENTS` 辞書で
自由に書き換えることで、ギター、ベース、ストリングス、ピアノなどの音色を自由自在に変更できます。
"""

import struct
import os

# ==============================================================================
# 1. 音名 ⇔ MIDIノート番号 変換テーブル
# ==============================================================================
NOTE_MAP = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4,
    'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9,
    'A#': 10, 'Bb': 10, 'B': 11
}

def n2m(name_octave):
    """'F4', 'Db3', 'Bb2' などの音符表記をMIDIノート番号（0〜127）に変換"""
    if name_octave[-1].isdigit():
        octave = int(name_octave[-1])
        note_name = name_octave[:-1]
    else:
        octave = int(name_octave[-2:])
        note_name = name_octave[:-2]
    return 12 * (octave + 1) + NOTE_MAP[note_name]

# ==============================================================================
# 2. General MIDI (GM) 音色設定（音色の変更はここを編集してください）
# ==============================================================================
# GMプログラムチェンジ番号 (0-indexed: 0〜127)
# 例: 0=Acoustic Piano, 30=Distortion Guitar, 38=Synth Bass 1, 42=Cello, 48=Strings
INSTRUMENTS = {
    # [Tr.1] ベース：暗黒都市と電磁首輪の重圧 (Ch.0)
    # 候補: 38 (Synth Bass 1), 39 (Synth Bass 2), 33 (Electric Finger Bass), 34 (Pick Bass)
    'bass': {'ch': 0, 'program': 38, 'name': 'Synth Bass 1'},

    # [Tr.2] リードギター：レンの自由への叫びと抗い (Ch.1)
    # 候補: 30 (Distortion Guitar), 29 (Overdriven Guitar), 80 (Square Lead), 81 (Saw Lead)
    'guitar': {'ch': 1, 'program': 30, 'name': 'Distortion Guitar'},

    # [Tr.3] ソロチェロ：ダニエルの社会権・命の尊厳 (Ch.2)
    # 候補: 42 (Cello), 40 (Violin), 73 (Flute), 11 (Vibraphone), 68 (Oboe)
    'cello': {'ch': 2, 'program': 42, 'name': 'Cello'},

    # [Tr.4] アンサンブル：エレナの平等権・高潔な正義 (Ch.3)
    # 候補: 48 (String Ensemble 1), 49 (String Ensemble 2), 61 (Brass Section), 62 (Synth Brass)
    'ensemble': {'ch': 3, 'program': 48, 'name': 'String Ensemble 1'},

    # [Tr.5] ピアノ/クワイア：真実の演説・民衆の目覚め (Ch.4)
    # 候補: 0 (Acoustic Grand Piano), 4 (Electric Piano 1), 52 (Choir Aahs), 19 (Church Organ)
    'piano': {'ch': 4, 'program': 0, 'name': 'Acoustic Grand Piano'},

    # [Tr.6] サイバーアルペジオ：カウントダウン・秒針警報 (Ch.5)
    # 候補: 80 (Square Lead), 88 (Pad 1 New Age), 89 (Pad 2 Warm), 90 (Pad 3 Polysynth)
    'synth': {'ch': 5, 'program': 80, 'name': 'Lead 1 Square'},

    # [Tr.7] ドラム：インダストリアル・ビート (Ch.9: MIDI Drum Channel)
    'drums': {'ch': 9, 'program': 0, 'name': 'Standard Drum Kit'}
}

# ==============================================================================
# 3. SMF Format 1 バイナリエンコーダ (標準ライブラリ struct のみ)
# ==============================================================================
def encode_vlq(value):
    """可変長数値 (Variable Length Quantity) エンコーダ"""
    v = int(round(value))
    bytes_out = [v & 0x7F]
    v >>= 7
    while v > 0:
        bytes_out.append((v & 0x7F) | 0x80)
        v >>= 7
    return bytes(reversed(bytes_out))

class MIDITrack:
    def __init__(self, track_name=""):
        self.events = []
        if track_name:
            name_bytes = track_name.encode('utf-8')
            meta = b'\xFF\x03' + encode_vlq(len(name_bytes)) + name_bytes
            self.events.append((0, meta))

    def add_event(self, ticks, event_bytes):
        self.events.append((int(round(ticks)), event_bytes))

    def add_note(self, ch, note, vel, start_ticks, dur_ticks):
        note_on = bytes([0x90 | (ch & 0x0F), note & 0x7F, vel & 0x7F])
        note_off = bytes([0x80 | (ch & 0x0F), note & 0x7F, 0])
        self.add_event(start_ticks, note_on)
        self.add_event(start_ticks + dur_ticks, note_off)

    def add_program_change(self, ch, program, ticks=0):
        pc = bytes([0xC0 | (ch & 0x0F), program & 0x7F])
        self.add_event(ticks, pc)

    def add_control_change(self, ch, control, value, ticks=0):
        cc = bytes([0xB0 | (ch & 0x0F), control & 0x7F, value & 0x7F])
        self.add_event(ticks, cc)

    def get_track_bytes(self):
        self.events.sort(key=lambda x: x[0])
        payload = bytearray()
        prev_ticks = 0
        for ticks, ev in self.events:
            delta = ticks - prev_ticks
            payload.extend(encode_vlq(delta))
            payload.extend(ev)
            prev_ticks = ticks

        # End of Track
        payload.extend(encode_vlq(0))
        payload.extend(b'\xFF\x2F\x00')

        header = b'MTrk' + struct.pack('>I', len(payload))
        return header + payload

class MIDIFile:
    def __init__(self, tpqn=480):
        self.tpqn = tpqn
        self.tracks = []

    def add_track(self, track):
        self.tracks.append(track)

    def set_tempo(self, track, bpm, ticks=0):
        mpqn = int(round(60_000_000 / bpm))
        buf = b'\xFF\x51\x03' + struct.pack('>I', mpqn)[1:]
        track.add_event(ticks, buf)

    def set_time_signature(self, track, num=4, den=4, ticks=0):
        import math
        den_pow = int(round(math.log2(den)))
        buf = bytes([0xFF, 0x58, 0x04, num, den_pow, 24, 8])
        track.add_event(ticks, buf)

    def save(self, filepath):
        header = b'MThd' + struct.pack('>IHHH', 6, 1, len(self.tracks), self.tpqn)
        os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
        with open(filepath, 'wb') as f:
            f.write(header)
            for track in self.tracks:
                f.write(track.get_track_bytes())
        print(f"[MIDI] 生成完了: {filepath} ({os.path.getsize(filepath):,} bytes)")

# ==============================================================================
# 4. 個別楽曲ビルダー
# ==============================================================================
def build_ren_theme(filepath, inst=INSTRUMENTS):
    """1. レン テーマ: 『反逆のパルス 〜自由権〜』 (Key: Fm / BPM: 138)"""
    midi = MIDIFile(480)
    t_con = MIDITrack("Conductor")
    midi.set_tempo(t_con, 138, 0)
    midi.set_time_signature(t_con, 4, 4, 0)
    midi.add_track(t_con)

    t_bass = MIDITrack("Synth Bass (Ren)")
    t_bass.add_program_change(inst['bass']['ch'], inst['bass']['program'], 0)
    t_bass.add_control_change(inst['bass']['ch'], 74, 90, 0) # Cutoff

    t_gtr = MIDITrack("Distortion Guitar")
    t_gtr.add_program_change(inst['guitar']['ch'], inst['guitar']['program'], 0)

    t_synth = MIDITrack("Cyber Arp / Alarm")
    t_synth.add_program_change(inst['synth']['ch'], inst['synth']['program'], 0)

    t_drums = MIDITrack("Industrial Drums")

    # 進行: | Fm | Eb | Db | C7 | Fm | Eb | Bbm | C7 |
    progression = [
        ("F1", ["F3", "Ab3", "C4"]), ("Eb1", ["Eb3", "G3", "Bb3"]),
        ("Db1", ["Db3", "F3", "Ab3"]), ("C1", ["C3", "E3", "G3", "Bb3"]),
        ("F1", ["F3", "Ab3", "C4"]), ("Eb1", ["Eb3", "G3", "Bb3"]),
        ("Bb0", ["Bb2", "Db3", "F3"]), ("C1", ["C3", "E3", "G3", "Bb3"])
    ]

    for bar in range(32):
        start = bar * 1920
        root, chord = progression[bar % len(progression)]

        # 16分ベースライン
        for i in range(16):
            is_oct = (i % 4 == 2)
            note = n2m(root) + (12 if is_oct else 0)
            vel = 110 if i % 4 == 0 else 85
            t_bass.add_note(inst['bass']['ch'], note, vel, start + i * 120, 100)

        # ギターリフ
        if bar >= 4:
            for i in range(8):
                vel = 118 if i in [0, 5] else 88
                t_gtr.add_note(inst['guitar']['ch'], n2m(root) + 24, vel, start + i * 240, 190)
            if bar >= 16:
                lead_notes = ["F5", "Ab5", "G5", "F5", "C6", "Bb5", "Ab5", "G5"]
                ln = lead_notes[bar % len(lead_notes)]
                t_gtr.add_note(inst['guitar']['ch'], n2m(ln), 120, start, 900)
                t_gtr.add_note(inst['guitar']['ch'], n2m(ln) - 2, 115, start + 960, 900)

        # 警告音モチーフ
        alarm = ["F5", "C5", "F5", "Gb5", "F5", "C5", "Db5", "C5"]
        for i in range(8):
            t_synth.add_note(inst['synth']['ch'], n2m(alarm[i]), 70, start + i * 240, 150)

        # ドラム
        if bar >= 2:
            for i in range(4):
                t_drums.add_note(9, 36, 115, start + i * 480, 200)
                if i in [1, 3]:
                    t_drums.add_note(9, 38, 118, start + i * 480, 220)
            for i in range(16):
                vel = 95 if i % 4 == 0 else 65
                t_drums.add_note(9, 42, vel, start + i * 120, 80)

    midi.add_track(t_bass); midi.add_track(t_gtr); midi.add_track(t_synth); midi.add_track(t_drums)
    midi.save(filepath)

def build_elena_theme(filepath, inst=INSTRUMENTS):
    """2. エレナ テーマ: 『白銀の矜持 〜平等権〜』 (Key: Bbm/Fm / BPM: 116)"""
    midi = MIDIFile(480)
    t_con = MIDITrack("Conductor")
    midi.set_tempo(t_con, 116, 0)
    midi.set_time_signature(t_con, 4, 4, 0)
    midi.add_track(t_con)

    t_ens = MIDITrack("Orchestral Ensemble (Elena)")
    t_ens.add_program_change(inst['ensemble']['ch'], inst['ensemble']['program'], 0)

    t_piano = MIDITrack("Acoustic Piano")
    t_piano.add_program_change(inst['piano']['ch'], inst['piano']['program'], 0)

    t_bass = MIDITrack("Acoustic / Fingered Bass")
    t_bass.add_program_change(inst['bass']['ch'], 33, 0)

    progression = [
        ("Bb1", ["Bb3", "Db4", "F4"]), ("Ab1", ["Ab3", "C4", "F4"]),
        ("Gb1", ["Gb3", "Bb3", "Db4", "F4"]), ("F1", ["F3", "A3", "C4", "Eb4"]),
        ("Bb1", ["Bb3", "Db4", "F4"]), ("Eb1", ["Eb3", "Gb3", "Bb3", "Eb4"]),
        ("Ab1", ["Ab3", "C4", "Eb4"]), ("Db1", ["Db3", "F3", "Ab3", "C4"]),
        ("C1", ["C3", "E3", "G3", "Bb3"]), ("C1", ["C3", "E3", "G3", "Bb3"]),
        ("F1", ["F3", "Ab3", "C4", "F4"]), ("F1", ["F3", "Ab3", "C4", "F4"])
    ]

    elena_melody = [
        ("F5", 720), ("G5", 240), ("Ab5", 960), ("C6", 960), ("Bb5", 480), ("Ab5", 480),
        ("Gb5", 720), ("Ab5", 240), ("Bb5", 960), ("A5", 1920), ("Db6", 960), ("C6", 480),
        ("Bb5", 480), ("Bb5", 960), ("Ab5", 480), ("Gb5", 480), ("Ab5", 960), ("Gb5", 480),
        ("F5", 480), ("F5", 1920), ("G5", 960), ("Ab5", 480), ("Bb5", 480), ("C6", 1920)
    ]

    for bar in range(24):
        start = bar * 1920
        root, chord = progression[bar % len(progression)]
        t_bass.add_note(inst['bass']['ch'], n2m(root), 85, start, 1850)

        for i in range(8):
            note = chord[i % len(chord)]
            t_piano.add_note(inst['piano']['ch'], n2m(note), 70, start + i * 240, 220)

        for note in chord:
            t_ens.add_note(inst['ensemble']['ch'], n2m(note), 78, start, 1880)

        if bar >= 8:
            m_note, m_dur = elena_melody[bar % len(elena_melody)]
            t_ens.add_note(inst['ensemble']['ch'], n2m(m_note) + 12, 105, start, m_dur)

    midi.add_track(t_ens); midi.add_track(t_piano); midi.add_track(t_bass)
    midi.save(filepath)

def build_daniel_theme(filepath, inst=INSTRUMENTS):
    """3. ダニエル テーマ: 『命のトリアージ 〜社会権〜』 (Key: Fm / BPM: 96)"""
    midi = MIDIFile(480)
    t_con = MIDITrack("Conductor")
    midi.set_tempo(t_con, 96, 0)
    midi.set_time_signature(t_con, 4, 4, 0)
    midi.add_track(t_con)

    t_cello = MIDITrack("Solo Cello (Daniel)")
    t_cello.add_program_change(inst['cello']['ch'], inst['cello']['program'], 0)
    t_cello.add_control_change(inst['cello']['ch'], 1, 60, 0)

    t_piano = MIDITrack("Acoustic Piano")
    t_piano.add_program_change(inst['piano']['ch'], inst['piano']['program'], 0)

    t_pulse = MIDITrack("Heartbeat Pulse")
    t_pulse.add_program_change(inst['bass']['ch'], 38, 0)

    progression = [
        ("F1", ["F3", "Ab3", "C4"]), ("Db1", ["F3", "Ab3", "C4", "Db4"]),
        ("Bb0", ["Db3", "F3", "Ab3", "C4"]), ("C1", ["E3", "G3", "Bb3", "C4"]),
        ("F1", ["F3", "Ab3", "C4"]), ("Db1", ["Db3", "F3", "Bb3"]),
        ("C1", ["C3", "E3", "G3", "Bb3"]), ("F1", ["F2", "C3", "F3", "Ab3"])
    ]

    cello_phrases = [
        [("F3", 720), ("G3", 240), ("Ab3", 960)], [("G3", 960), ("F3", 480), ("Eb3", 480)],
        [("Db3", 1440), ("C3", 480)], [("C3", 1920)],
        [("Ab3", 720), ("Bb3", 240), ("C4", 960)], [("Db4", 960), ("C4", 480), ("Bb3", 480)],
        [("G3", 1440), ("E3", 480)], [("F3", 1920)]
    ]

    for bar in range(16):
        start = bar * 1920
        root, chord = progression[bar % len(progression)]

        # 心拍パルス (トクン…トクン…)
        t_pulse.add_note(inst['bass']['ch'], n2m(root), 85, start, 200)
        t_pulse.add_note(inst['bass']['ch'], n2m(root), 65, start + 300, 180)
        t_pulse.add_note(inst['bass']['ch'], n2m(root), 80, start + 960, 200)
        t_pulse.add_note(inst['bass']['ch'], n2m(root), 60, start + 1260, 180)

        for i in range(4):
            note = chord[i % len(chord)]
            t_piano.add_note(inst['piano']['ch'], n2m(note), 65, start + i * 480, 440)

        phrase = cello_phrases[bar % len(cello_phrases)]
        offset = 0
        for n_name, dur in phrase:
            t_cello.add_note(inst['cello']['ch'], n2m(n_name), 90, start + offset, dur - 40)
            offset += dur

    midi.add_track(t_cello); midi.add_track(t_piano); midi.add_track(t_pulse)
    midi.save(filepath)

def build_climax_theme(filepath, inst=INSTRUMENTS):
    """4. クライマックス: 『12:20 同時認証 〜立憲の解放〜』 (Key: Fm -> F Maj / BPM: 138)"""
    midi = MIDIFile(480)
    t_con = MIDITrack("Conductor")
    midi.set_tempo(t_con, 138, 0)
    midi.set_time_signature(t_con, 4, 4, 0)
    midi.add_track(t_con)

    t_bass = MIDITrack("Synth Bass"); t_bass.add_program_change(inst['bass']['ch'], inst['bass']['program'], 0)
    t_gtr = MIDITrack("Lead Guitar"); t_gtr.add_program_change(inst['guitar']['ch'], inst['guitar']['program'], 0)
    t_cello = MIDITrack("Solo Cello"); t_cello.add_program_change(inst['cello']['ch'], inst['cello']['program'], 0)
    t_ens = MIDITrack("Full Orchestra"); t_ens.add_program_change(inst['ensemble']['ch'], 49, 0)
    t_piano = MIDITrack("Piano & Choir"); t_piano.add_program_change(inst['piano']['ch'], inst['piano']['program'], 0)
    t_drums = MIDITrack("Epic Percussion")

    climax_chords = [
        ("Db1", ["Db4", "F4", "Ab4", "Db5"]), ("Eb1", ["Eb4", "G4", "Bb4", "Eb5"]),
        ("F1", ["F4", "Ab4", "C5", "F5"]), ("Ab0", ["Ab3", "C4", "F4", "Ab4"]),
        ("Db1", ["Db4", "F4", "Ab4", "Db5"]), ("Eb1", ["Eb4", "G4", "Bb4", "Eb5"]),
        ("C1", ["E4", "G4", "Bb4", "C5"]), ("F1", ["F4", "Ab4", "C5", "F5"]),
        ("Db1", ["Db4", "F4", "Ab4", "Db5"]), ("Eb1", ["Eb4", "G4", "Bb4", "Eb5"]),
        ("E1", ["E4", "G4", "Bb4", "C5"]), ("F1", ["F4", "Ab4", "C5"]),
        ("Db1", ["Db4", "F4", "Ab4", "C5"]), ("Eb1", ["Eb4", "G4", "Bb4", "D5"]),
        ("F1", ["F4", "A4", "C5", "E5"]), ("F1", ["F4", "A4", "C5", "E5"])
    ]

    main_melody = [
        [("F5", 360), ("E5", 120), ("F5", 480), ("G5", 480), ("Ab5", 480)],
        [("Bb5", 360), ("Ab5", 240), ("G5", 240), ("F5", 240), ("Eb5", 840)],
        [("C6", 960), ("Bb5", 240), ("Ab5", 240), ("G5", 240), ("Ab5", 240)],
        [("G5", 720), ("F5", 240), ("F5", 960)],
        [("F5", 480), ("Ab5", 480), ("Db6", 960)],
        [("C6", 720), ("Bb5", 240), ("Ab5", 960)],
        [("G5", 480), ("A5", 480), ("C6", 960)],
        [("F5", 1920)],
        [("F5", 360), ("E5", 120), ("F5", 480), ("G5", 480), ("Ab5", 480)],
        [("Bb5", 360), ("Ab5", 240), ("G5", 240), ("F5", 240), ("Eb5", 840)],
        [("C6", 720), ("Bb5", 240), ("G5", 480), ("Bb5", 480)],
        [("Ab5", 960), ("G5", 960)],
        [("F5", 480), ("Ab5", 480), ("C6", 960)],
        [("G5", 480), ("Bb5", 480), ("D6", 960)],
        [("E6", 960), ("C6", 480), ("A5", 480)],
        [("F5", 1920)]
    ]

    for bar in range(16):
        start = bar * 1920
        root, chord = climax_chords[bar]
        t_bass.add_note(inst['bass']['ch'], n2m(root), 120, start, 1880)

        for note in chord:
            t_ens.add_note(inst['ensemble']['ch'], n2m(note), 110, start, 1880)
            t_piano.add_note(inst['piano']['ch'], n2m(note), 95, start, 1880)

        mel = main_melody[bar]
        offset = 0
        for n_name, dur in mel:
            t_gtr.add_note(inst['guitar']['ch'], n2m(n_name), 125, start + offset, dur - 30)
            t_ens.add_note(inst['ensemble']['ch'], n2m(n_name) + 12, 115, start + offset, dur - 30)
            t_cello.add_note(inst['cello']['ch'], n2m(n_name) - 12, 110, start + offset, dur - 30)
            offset += dur

        for i in range(4):
            t_drums.add_note(9, 36, 124, start + i * 480, 200)
            if i in [1, 3]:
                t_drums.add_note(9, 38, 127, start + i * 480, 220)
            t_drums.add_note(9, 42, 100, start + i * 480, 100)
            t_drums.add_note(9, 42, 80, start + i * 480 + 240, 100)
        if bar in [0, 8, 14]:
            t_drums.add_note(9, 49, 127, start, 800)

    midi.add_track(t_bass); midi.add_track(t_gtr); midi.add_track(t_cello)
    midi.add_track(t_ens); midi.add_track(t_piano); midi.add_track(t_drums)
    midi.save(filepath)

def main():
    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
    print("=== 『パラレル・ジャパニア：クロニクル』 Python版 MIDI生成開始 ===")
    build_ren_theme(os.path.join(out_dir, "theme_ren_freedom.mid"))
    build_elena_theme(os.path.join(out_dir, "theme_elena_equality.mid"))
    build_daniel_theme(os.path.join(out_dir, "theme_daniel_social.mid"))
    build_climax_theme(os.path.join(out_dir, "theme_climax_constitutional.mid"))
    print("=== Python版 全MIDIファイル生成完了 ===")

if __name__ == '__main__':
    main()
