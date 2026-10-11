# 『パラレル・ジャパニア：クロニクル』公式BGM・楽理・MIDI完全設計仕様書
**〜 失われた人権の180分：サイバーパンク・ドラマティック・オーケストラ 〜**

---

## 1. 音楽コンセプトと音響空間設計

『パラレル・ジャパニア：クロニクル』の音楽的アイデンティティは、**「冷徹なディストピアの電子重低音（国家権力・電磁首輪・暗黒統治）」**と、**「人間の尊厳を叫ぶアコースティック＆ディストーション（3人の主人公の命の灯火）」**が激しく交錯する**サイバーパンク・ドラマティック・オーケストラ（Industrial Synthwave × Cinematic Orchestral）**です。

```
【統治機構・抑圧】                                    【人間の尊厳・叫び】
冷徹なSynth Bass ────────────── 対位法 ───────────── 泥臭いDistortion Guitar (レン:自由権)
電磁首輪の16分警告音                                 哀愁のSolo Cello (ダニエル:社会権)
秒針のインダストリアル・ドラム                        高潔なStrings/Brass (エレナ:平等権)
       │                                                      │
       └──────────────▶ 【12:20 同時認証・大合奏(Tutti)】 ◀────┘
                        ヘ短調(Fm) ➔ ヘ長調(F Major)への光の解放
```

### ■ 調性（Key）と速度（BPM）の象徴性
- **基本キー: F minor（ヘ短調）**
  - 重厚で悲劇的、かつ冷酷な圧迫感を持つキー。暗黒都市ネオ・ジャパニアの重力と電磁首輪の拘束を表します。
- **エピローグの転調: F Major（ヘ長調）**
  - 12:20の憲法コード同時認証により、首輪の警報が停止。暗雲を貫く朝陽と基本的人権の奪還を長調（メジャーコード）への昇華で表現します。
- **BPM推移: 100 ➔ 138 ➔ 115 ➔ 152 ➔ 138 ➔ 76**
  - 緊迫感とタイムリミット（180分）の鼓動に連動して有機的に加速・減速します。

---

## 2. キャラクター別テーマ＆コード進行・楽譜（MML・ノート）

### ① レン テーマ：『反逆のパルス 〜自由権〜』
- **キャラクター背景**: 地下第7スラグラボ脱出。身体の自由・精神の自由を奪われた青年の咆哮。
- **BPM**: 138 / **Key**: F minor / **拍子**: 4/4拍子
- **コード進行（焦燥の下降パスカリア）**:
  $$\text{| Fm | Eb | Db | C7 | Fm | Eb | Bbm | C7 |}$$
  - **度数**: $i - \flat VII - \flat VI - V7 - i - \flat VII - iv - V7$
- **ベース・ギターリフ（16分音符刻み）**:
  - `F1 - F1 - F2 - F1 - F1 - F1 - F2 - F1` （8分オクターブ＋パームミュート連打）
- **電磁首輪のアラームモチーフ（Synth Seq）**:
  - 音符: `F5 - C5 - F5 - Gb5 - F5 - C5 - Db5 - C5` (16分音符)
  - MML: `t138 l16 o5 f c f f# f c c# c`
- **リードギター（サビの叫び）**:
  - 音符: `F5 (付点4分) -> Ab5 (8分) -> G5 (4分) -> F5 (4分) | C6 (2分) -> Bb5 (4分) -> Ab5 (4分)`

---

### ② エレナ テーマ：『白銀の矜持 〜平等権〜』
- **キャラクター背景**: ネオ・ジャパニア最高評議会副議長令嬢。法の下の平等・差別なき世界への覚醒。
- **BPM**: 116 / **Key**: Bb minor 〜 F minor / **拍子**: 4/4拍子
- **コード進行（ネオ・バロック的オーケストラ進行）**:
  $$\text{| Bbm | Fm/Ab | Gbmaj7 | F7 | Bbm | Ebm | Ab | Dbmaj7 | C7 | C7 | Fm | Fm |}$$
  - **度数**: $iv - i/3 - \flat VI\text{M7} - V7 - iv - \flat vii - \flat III - \flat VI\text{M7} - V7 - V7 - i - i$
- **ピアノ伴奏（流麗な8分アルペジオ）**:
  - Bbm: `Bb3 - Db4 - F4 - Db4 - Bb3 - Db4 - F4 - Db4`
- **ストリングス主旋律（高潔な正義）**:
  - 音符: `F5 (点4分) -> G5 (8分) -> Ab5 (2分) | C6 (2分) -> Bb5 (4分) -> Ab5 (4分) | Gb5 (点4分) -> Ab5 (8分) -> Bb5 (2分) | A5 (全音符)`

---

### ③ ダニエル テーマ：『命のトリアージ 〜社会権〜』
- **キャラクター背景**: 地下第4層スラム診療所医師。シンの死、生存権（25条）と命の選別の拒絶。
- **BPM**: 96 / **Key**: F minor / **拍子**: 4/4拍子
- **コード進行（静かな慟哭と祈り）**:
  $$\text{| Fm | Dbmaj7 | Bbm7 | C7sus4 - C7 | Fm | Bbm/Db | C7 | Fm |}$$
  - **度数**: $i - \flat VI\text{M7} - iv7 - V7sus4 - V7 - i - iv/3 - V7 - i$
- **心拍リズム（Heartbeat Pulse）**:
  - `Kick / Low Bass`: 1拍目（強・トクン…）＋ 3拍目（弱・トクン…）
- **ソロチェロ旋律（アジタートな哀愁）**:
  - 音符: `F3 (点4分) -> G3 (8分) -> Ab3 (2分) | G3 (2分) -> F3 (4分) -> Eb3 (4分) | Db3 (点2分) -> C3 (4分) | C3 (全音符)`

---

### ④ クライマックス：『12:20 同時認証 〜立憲の解放〜』
- **ストーリー**: 統治タワー50F最上階。3人の生体キー同時認証、ネオ憲法一条（生存権・平等権・自由権）の全都市布告。
- **BPM**: 138 / **Key**: F minor ➔ F Major（奇跡の解決） / **拍子**: 4/4拍子
- **コード進行（大サビ・全楽器Tutti）**:
  $$\text{| Db | Eb | Fm | Fm/Ab |}$$
  $$\text{| Db | Eb | C7 | Fm |}$$
  $$\text{| Db | Eb | C7/E | Fm - Eb |}$$
  $$\text{| Dbmaj7 | Eb6 | Fmaj7 | Fmaj7 |}$$
  - **度数**: $\flat VI - \flat VII - i - i/3 \dots \flat VI\text{M7} - \flat VII6 - I\text{M7} - I\text{M7}$
- **全楽器合奏主旋律（グランドテーマ）**:
  - **Bar 1 (Db)**: `F5 (付点4分) -> E5 (16分) -> F5 (16分) -> G5 (4分) -> Ab5 (4分)`
  - **Bar 2 (Eb)**: `Bb5 (付点4分) -> Ab5 (8分) -> G5 (8分) -> F5 (8分) -> Eb5 (2分)`
  - **Bar 3 (Fm)**: `C6 (2分・強ビブラート) -> Bb5 (8分) -> Ab5 (8分) -> G5 (8分) -> Ab5 (8分)`
  - **Bar 4 (Fm/Ab)**: `G5 (点4分) -> F5 (8分) -> F5 (2分)`
  - **Bar 5 (Db)**: `F5 (4分) -> Ab5 (4分) -> Db6 (2分・最高音突破)`
  - **Bar 6 (Eb)**: `C6 (点4分) -> Bb5 (8分) -> Ab5 (2分)`
  - **Bar 7 (C7)**: `G5 (4分) -> A5 (4分) -> C6 (2分・不協和音突破)`
  - **Bar 8 (Fm)**: `F5 (全音符)`
  - **Bar 15-16 (Fmaj7 - 解放)**: `E6 (2分) -> C6 (4分) -> A5 (4分) | F5 (全音符・夜明け)`

---

## 3. MIDIトラック構成と音色変更（General MIDI）完全ガイド

本プロジェクトで生成されるMIDIファイルは、**Standard MIDI File (SMF Format 1)** に準拠しており、**プログラムチェンジ（Program Change: PC #0〜#127）** によって再生音色を指定しています。

### ■ トラック＆チャンネル割り当て一覧

| トラック名 | 役割 / 演出意図 | チャンネル | デフォルト音色 (GM PC) | 音色変更の推奨バリエーション |
|---|---|---|---|---|
| **Tr.1: Synth Bass** | 電磁首輪・統治タワーの圧迫 | Ch.1 (0) | **PC #38 (Synth Bass 1)** | PC #39 (Synth Bass 2: より硬質)<br>PC #33 (Fingered Bass: 生音感)<br>PC #34 (Picked Bass: アタック強調) |
| **Tr.2: Lead Guitar** | レンの荒々しい叫び（自由権） | Ch.2 (1) | **PC #30 (Distortion Guitar)** | PC #29 (Overdriven Guitar: 温かい歪み)<br>PC #80 (Square Lead: チップチューン風)<br>PC #81 (Saw Lead: シンセサイザー疾走) |
| **Tr.3: Solo Cello** | ダニエルの知性と哀愁（社会権） | Ch.3 (2) | **PC #42 (Cello)** | PC #40 (Violin: より高域の悲痛)<br>PC #68 (Oboe: 哀愁の木管)<br>PC #73 (Flute: 澄んだ祈り)<br>PC #11 (Vibraphone: 幻想的) |
| **Tr.4: Ensemble** | エレナの高潔さと覚悟（平等権） | Ch.4 (3) | **PC #48 (String Ensemble 1)** | PC #49 (String Ensemble 2: スローアタック)<br>PC #61 (Brass Section: 壮大な金管)<br>PC #62 (Synth Brass: サイバー感強調) |
| **Tr.5: Piano / Choir** | 真実の演説・民衆の目覚め | Ch.5 (4) | **PC #0 (Acoustic Grand Piano)** | PC #4 (Electric Piano 1: ネオソウル風)<br>PC #52 (Choir Aahs: 聖歌隊の神聖さ)<br>PC #19 (Church Organ: 厳格なバロック) |
| **Tr.6: Cyber Synth** | カウントダウン秒針・電子警報 | Ch.6 (5) | **PC #80 (Square Lead)** | PC #88 (New Age Pad: 浮遊感)<br>PC #89 (Warm Pad: 厚い空気感)<br>PC #98 (Crystal: 硬質なクリスタル音) |
| **Tr.7: Percussion** | 脈拍・180分タイムリミット | Ch.10 (9) | **Standard Drum Kit** | GM規格のCh.10 (ノート番号36: Kick, 38: Snare, 42: Hi-Hat, 49: Crash) |

### ■ 音色を変更する方法（Python / Node.js スクリプト）
スクリプト内の `INSTRUMENTS` 辞書（または `DEFAULT_PRESET` オブジェクト）の `program` 番号を書き換えるだけで、生成されるMIDIの音色が瞬時に切り替わります。

```python
# 例：レンのリードを「サウザンド・シンセリード」に、チェロを「バイオリン」に変更する場合
INSTRUMENTS['guitar']['program'] = 81   # PC #81 (Lead 2 Sawtooth)
INSTRUMENTS['cello']['program']  = 40   # PC #40 (Violin)
```

### ■ 表情付けのためのコントロールチェンジ（CC）
本設計では、以下のCCパラメータに対応しています：
- **CC#74 (Brightness / Filter Cutoff)**: シンセベースのフィルター開閉（0=こもった低音 ➔ 127=鋭い電子音）。
- **CC#11 (Expression)**: フレーズの抑揚・クレッシェンド。
- **CC#1 (Modulation)**: ストリングスやギターの生々しいビブラート。
- **CC#10 (Pan)**: 楽器ごとの左右定位（Cello=中央左、Lead=中央右、Piano=中央）。

---

## 4. 楽曲生成AI（Suno / Udio）向け入力プロンプト集

生成されたコード進行と世界観を、Suno AI や Udio などの音楽生成AIに入力してフルオーケストラ楽曲を生成するためのプロンプトセットです。

### ① 全体スタイル指定（Style of Music Prompt）
```text
Dark Cyberpunk, Industrial Orchestral, 138 BPM, Key in F Minor, Heavy Synth Bass, Distorted Electric Guitar, Cinematic Strings, Cello Solo, High Tension, Aggressive Drums, Gothic Dystopian Atmosphere, Anime Cyberpunk Soundtrack, 428 Shibuya Scramble Style
```

### ② 楽曲構造プロンプト（Structure / Lyrics Prompt）
```text
[Intro - Electric Collar Alarm, Heavy Low Synth Drone, 100 BPM]
(High-pitched electronic sequence: F5-Gb5-F5-C5)
(Distant wailing siren, dark neon city rain sound)

[Verse 1 - Slum Breakout, 138 BPM, Key in F Minor]
[Instrumentation: Aggressive 16th Synth Bass, Distorted Palm Muted Guitar, Industrial Beat]
(Clock ticking, 180-minute countdown heartbeat)

[Pre-Chorus - The Triage Clinic, Daniel's Solitude]
[Instrumentation: Melancholic Solo Cello, Emotional Acoustic Piano Arpeggios]
(Deep emotional strings rising against oppression)

[Chorus - 12:20 Simultaneous Authentication, Tower 50F Climax]
[Chord Progression: Db - Eb - Fm - Fm/Ab, Db - Eb - C7 - Fm]
[Instrumentation: Full Tutti Orchestral Blast, Soaring Dual Lead Guitar, Epic Brass Section, Double Bass Drum]
(Triumphant climax, breaking the electromagnetic collars!)

[Outro - Dawn of Freedom, Resolution to F Major, 76 BPM]
[Instrumentation: Gentle Acoustic Piano Solo, High Violin Harmonics, Fmaj7 Chords]
(Collar alarm sound clicks off into silence... Dawn light breaks through the dystopian sky)
```

---

## 5. 出力済みMIDIファイルと実行方法

本プロジェクトの `music/output/` フォルダに、すでに以下の**完全規格準拠MIDIファイル**が生成されています：

```
music/
├── generate_midi.js           # Node.js版 SMF Format 1 生成スクリプト (即時実行可)
├── generate_midi.py           # Python版 SMF Format 1 生成スクリプト (標準ライブラリのみ)
├── PARALLEL_JAPANIA_BGM_SPECIFICATION.md  # 本仕様書
└── output/
    ├── theme_ren_freedom.mid             (14.1 KB) : レン疾走・自由権テーマ
    ├── theme_elena_equality.mid          (2.9 KB)  : エレナ高潔・平等権テーマ
    ├── theme_daniel_social.mid           (1.6 KB)  : ダニエル哀愁・社会権テーマ
    ├── theme_climax_constitutional.mid   (4.7 KB)  : 12:20合流・立憲アンセム
    └── parallel_japania_suite.mid        (47.8 KB) : 全7パート15分完全組曲
```

### ■ 再生・編集方法
1. **Windows標準再生 / メディアプレイヤー**:
   - `music/output/` 内の `.mid` ファイルをダブルクリック、または Windows Media Player / VLC で再生可能です（Windows内蔵の Microsoft GS Wavetable Synth 音源で鳴ります）。
2. **DAWソフト（Cubase, Logic Pro, Studio One, GarageBand, Reaper等）**:
   - `.mid` ファイルをトラック領域にドラッグ＆ドロップすると、**7つの個別トラック（Bass, Guitar, Cello, Strings, Piano, Synth, Drums）**に自動展開され、お好みの高品質音源（Serum, Kontakt, Spitfire Strings 等）を即座に割り当てられます。
3. **Webブラウザ・MMLプレーヤー**:
   - オンラインのMIDIビジュアライザー（Online MIDI Player 等）にドラッグするだけで、音符の動きを視覚的に確認できます。
