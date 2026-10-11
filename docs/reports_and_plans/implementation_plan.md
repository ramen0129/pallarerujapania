# 『パラレル・ジャパニア：クロニクル』シナリオ・因果・構造抜本リファクタリング計画書
## 【ステップ4 ＆ ステップ5】詳細綿密実装計画（Implementation Plan for Steps 4 & 5）

**策定日**: 2026年9月9日  
**対象領域**: クライマックスノード統合 / シナリオファイル再編 / 12:00キャラクタータイムライン直接進行エンジン＆UI改修  
**ステータス**: 実行承認待ち（Detailed Blueprint）

---

## 1. 目的と解決する根本課題

### 課題：神視点（メタハブ）によるナラティブの断絶とファイル分散
* **現状**:
  * 12:00に突入した瞬間、`CLIMAX_HUB`（神視点選択肢）が表示され、「まず誰の視点からこの決戦へ挑むか！？」とプレイヤーに選ばせる構造になっている。
  * これにより、プレイヤーが10:00〜11:50まで各主人公（レン、エレナ、ダニエル）の五感と過酷な現実に没入してきたナラティブ体験が急激に冷め、「作者の都合による選択画面」を見せられる違和感（DIR_08 認知境界違反）が生じている。
  * また、クライマックスノードが `scenario_climax_ren.html`, `scenario_climax_elena.html`, `scenario_climax_daniel.html` という別ファイルに隔離されており、キャラクターごとのタイムラインとしての一体感を損ねている。

### 解決策（428型シームレス進行への昇華）：
1. **シナリオファイルの完全統合（ステップ4）**:
   * レン・エレナ・ダニエルの12:00〜12:10決戦ノードおよび個別エピローグ・個別BAD ENDを、それぞれの本編ファイル（`scenario_ren.html`, `scenario_elena.html`, `scenario_daniel.html`）へ完全統合。
   * `scenario_climax.html` は、12:15の「古遺物スキャン合流ハブ（`CLIMAX_CONVERGE_HUB`）」および全23BAD ENDマスターとして純化。
2. **エンジン＆UIの12:00直接進行ルーティング（ステップ5）**:
   * 11:50の三者到達（トリプル・シンクロ達成）時、神視点ハブを介さず、**現在操作中のキャラクターの12:00ノードへシームレスに直接突入**。
   * スタート画面（`viewAuth`）およびヘッダータブから、レン・エレナ・ダニエルの12:00をいつでも直接選択可能にする。
   * 3人全員が12:10の管制室操作（キー押下）を完了した瞬間、自動的に12:15の合流ハブ（`CLIMAX_CONVERGE_HUB`）へ突入。

---

## 2. 【ステップ4】シナリオファイルの統合・再編 詳細設計

### 2.1 ノード移送とデータ構造の完全マッピング

#### ① `scenario_ren.html` への統合（全15ノード移植）
`scenario_climax_ren.html` に定義されていた以下の全ノードを、`SCENARIO_REN` の末尾に追加：
1. `CLIMAX_REN_START` (12:00: 東翼非常排気ハッチ蹴破り突入)
2. `CLIMAX_REN_STANDOFF` (12:05: 東翼軍事防衛ライン・沈黙の睨み合い)
3. `CLIMAX_REN_DECISION` (12:10: 東翼軍事防衛コンソール前・運命の決断)
4. `REN_EVAL_PRESS` (12:10: レン押下判定)
5. `REN_EVAL_ABORT` (12:10: レン離脱判定)
6. `BAD_REN_RETREAT` (12:11: レンだけ押さず逃走 ➔ BAD_06)
7. `BAD_REN_ELENA_FAILED` (12:11: エレナだけ押さず感電 ➔ BAD_07)
8. `BAD_REN_DANIEL_FAILED` (12:11: ダニエルだけ押さず感電 ➔ BAD_08)
9. `BAD_REN_ALONE_FAILED` (12:11: レン単独押し過電流 ➔ BAD_09)
10. `BAD_REN_BLAME_DANIEL` (12:11: 責め合い ➔ BAD_10)
11. `BAD_REN_BLAME_ELENA` (12:11: 責め合い ➔ BAD_11)
12. `BAD_REN_TIMEOUT` (12:11: 全員タイムアウト ➔ BAD_12)
13. `CLIMAX_EPILOGUE_A_GATE` (12:20: マーサのペンダントの奇跡)
14. `CLIMAX_EPILOGUE_A` (12:25: 「……ただいま、母さん」➔ TRUE_SECRET_END)
15. `CLIMAX_KEEPOUT_A` (12:25: KEEP OUT // 届かぬ奇跡の絆)

#### ② `scenario_elena.html` への統合（全14ノード移植）
`scenario_climax_elena.html` に定義されていた以下の全ノードを、`SCENARIO_ELENA` の末尾に追加：
1. `CLIMAX_ELENA_START` (12:00: 西翼政庁ハッチ突入)
2. `CLIMAX_ELENA_STANDOFF` (12:05: 西翼政庁電算ライン・沈黙の睨み合い)
3. `CLIMAX_ELENA_DECISION` (12:10: 西翼政庁電算コンソール前・運命の決断)
4. `ELENA_EVAL_PRESS` (12:10: エレナ押下判定)
5. `ELENA_EVAL_ABORT` (12:10: エレナ離脱判定)
6. `BAD_ELENA_RETREAT` (12:11: エレナだけ押さず ➔ BAD_13)
7. `BAD_ELENA_REN_FAILED` (12:11: レンだけ押さず ➔ BAD_14)
8. `BAD_ELENA_DANIEL_FAILED` (12:11: ダニエルだけ押さず ➔ BAD_15)
9. `BAD_ELENA_ALONE_FAILED` (12:11: エレナ単独押し ➔ BAD_16)
10. `BAD_ELENA_BLAME_DANIEL` (12:11: 責め合い ➔ BAD_17)
11. `BAD_ELENA_BLAME_REN` (12:11: 責め合い ➔ BAD_18)
12. `BAD_ELENA_TIMEOUT` (12:11: 全員タイムアウト ➔ BAD_19)
13. `CLIMAX_EPILOGUE_B` (12:20: エレナ編エピローグ・平等の誓約)
14. `CLIMAX_KEEPOUT_B` (12:20: KEEP OUT // 憎悪の私刑裁判)

#### ③ `scenario_daniel.html` への統合（全14ノード移植）
`scenario_climax_daniel.html` に定義されていた以下の全ノードを、`SCENARIO_DANIEL` の末尾に追加：
1. `CLIMAX_DANIEL_START` (12:00: 南翼医療インフラハッチ突入)
2. `CLIMAX_DANIEL_STANDOFF` (12:05: 南翼生命インフラライン・沈黙の睨み合い)
3. `CLIMAX_DANIEL_DECISION` (12:10: 南翼生命インフラコンソール前・運命の決断)
4. `DANIEL_EVAL_PRESS` (12:10: ダニエル押下判定)
5. `DANIEL_EVAL_ABORT` (12:10: ダニエル離脱判定)
6. `BAD_DANIEL_RETREAT` (12:11: ダニエルだけ押さず ➔ BAD_06)
7. `BAD_DANIEL_REN_FAILED` (12:11: レンだけ押さず ➔ BAD_07)
8. `BAD_DANIEL_ELENA_FAILED` (12:11: エレナだけ押さず ➔ BAD_08)
9. `BAD_DANIEL_ALONE_FAILED` (12:11: ダニエル単独押し ➔ BAD_09)
10. `BAD_DANIEL_BLAME_ELENA` (12:11: 責め合い ➔ BAD_10)
11. `BAD_DANIEL_BLAME_REN` (12:11: 責め合い ➔ BAD_11)
12. `BAD_DANIEL_TIMEOUT` (12:11: 全員タイムアウト ➔ BAD_12)
13. `CLIMAX_EPILOGUE_C` (12:20: ダニエル編エピローグ・生存権の誓約)
14. `CLIMAX_KEEPOUT_C` (12:20: KEEP OUT // 復讐の選別医療)

#### ④ 旧個別ファイルの安全化（空オブジェクト保持）
* `scenario_climax_ren.html`, `scenario_climax_elena.html`, `scenario_climax_daniel.html` は、削除すると `index.html` の GAS include や `simulate_all_paths.js` の vmContext 読み込みで壊れる可能性があるため、以下のように安全な空オブジェクトとして残す：
  ```html
  <script>
  // 統合済み：ノードは scenario_ren.html に統合されました
  const SCENARIO_CLIMAX_REN = {};
  </script>
  ```

#### ⑤ `scenario_climax.html` の純化
* `CLIMAX_HUB` は直接の導線からは外し、万が一のフォールバック用として温存。
* 12:15の `CLIMAX_CONVERGE_HUB`（三者合流・三つの光の結集）を本ファイルの先頭実効ノードとし、古遺物スキャン、憲法開示、および `BAD_01`〜`BAD_23` の結末マスターとして純化。

---

## 3. 【ステップ5】エンジン＆UIルーティングの12:00直接進行化 詳細設計

### 3.1 `js_engine.html` のルーティング改修仕様

#### 仕様1：`switchChar(charId)` の Hour 3（12:00）自動ルーティング
現在、`switchChar` は Hour 1 クリア時は `hour2Starts`（`A_1100` 等）、未クリア時は `startNodes`（`A_1000` 等）を起動している。
ここに Hour 2 クリア時（`prog.hour2.allClear`）の分岐を追加する：
```javascript
// 428 アワーごとの適切なスタートノード決定
if (prog.hour2.allClear) {
  var hour3Starts = { A: "CLIMAX_REN_START", B: "CLIMAX_ELENA_START", C: "CLIMAX_DANIEL_START" };
  launchNode(hour3Starts[charId] || "CLIMAX_REN_START");
} else if (prog.hour1.allClear) {
  var hour2Starts = { A: "A_1100", B: "B_1100", C: "C_1100" };
  launchNode(hour2Starts[charId] || "A_1100");
} else {
  var startNodes = { A: "A_1000", B: "B_1000", C: "C_1000" };
  launchNode(startNodes[charId] || "A_1000");
}
```

#### 仕様2：`checkTripleSync` 完了時の「シームレス12:00突入」
現在、11:50の三者達成時（`isA && isB && isC`）に `launchNode("CLIMAX_HUB")` を呼んでいる。
これを改修し、**現在操作中のキャラクターの12:00ノードへ直行**させる：
```javascript
if (isA && isB && isC) {
  AudioEngine.play('fanfare');
  UIController.showToast("【12:00 最終決戦突入】\n三者が中央統治タワー最上階へ集結した！");
  var hour3Starts = { A: "CLIMAX_REN_START", B: "CLIMAX_ELENA_START", C: "CLIMAX_DANIEL_START" };
  launchNode(hour3Starts[state.currentChar] || "CLIMAX_REN_START");
} else {
  var msg = "【トリプル・シンクロ待機中】\n";
  if (!isA) msg += "・レンが東管制室へ未到着\n";
  if (!isB) msg += "・エレナが西管制室へ未到着\n";
  if (!isC) msg += "・ダニエルが南管制室へ未到着\n";
  msg += "他の主人公へ切り替えてタワーへ導け！";
  UIController.showToast(msg);
  UIController.switchView('auth');
  UIController.renderTimeBlockStatus();
}
```

#### 仕様3：スタート画面ローンチボタン（`.char-launch-btn`）の挙動更新
Hour 2 が全クリアされている場合（`prog.hour2.allClear`）：
* プレイヤーがレンのカードを押したら `CLIMAX_REN_START` を起動。
* プレイヤーがエレナのカードを押したら `CLIMAX_ELENA_START` を起動。
* プレイヤーがダニエルのカードを押したら `CLIMAX_DANIEL_START` を起動。
* ※もしそのキャラクターが既に12:10の操作（`FLAG_REN_PRESSED` または `FLAG_REN_ABORTED` 等）を完了している場合：
  「この主人公は12:10の管制室操作を完了し、三者同調待機中です。他の主人公を進めてください。」と案内し、未同調のキャラのプレイを促す。

#### 仕様4：12:10の三者同時同期達成時の挙動
* `REN_EVAL_PRESS`, `ELENA_EVAL_PRESS`, `DANIEL_EVAL_PRESS` の判定において、3人全員が押下済み（`elenaPressed && danielPressed` 等）となった場合、即座に `CLIMAX_CONVERGE_HUB`（12:15 三つの光の結集）へ遷移。
* これにより、3人目のキー押下が完了した瞬間に劇的な合流演出へと突入する。

#### 仕様5：ヘッダー切替タブ（A, B, C）の12:00連携
* 12:00〜12:10の各管制室の緊迫した局面において、プレイヤーが上部のレン・エレナ・ダニエルタブをクリックすると、それぞれの12:00ノードへ切り替え可能。

### 3.2 UIおよび画面表示の改修（`js_ui.html` / `index.html`）
* **`cardClimax` の昇華**:
  * スタート画面の `cardClimax` は、神視点キャラ選択ではなく、**「★ FINAL CHAPTER：12:15 三者合流・古遺物スキャン」**として再定義。
  * 3人全員が12:10の操作を終えている場合に、いつでも12:15合流ハブを再開できるアンカーとして機能。
* **Hour 3 解放バッジの表示**:
  * `renderTimeBlockStatus` において、`prog.hour2.allClear` 達成時に各キャラのカードに「12:00 突入可能」のゴールドバッジを点灯。

---

## 4. 検証・品質保証計画

### 4.1 静的解析シミュレーション（`node simulate_all_paths.js`）
* **検証項目**:
  1. ノード存在チェック：統合後の全ノード（131ノード以上）において、`next` 先が1件も欠落していないこと（Missing next nodes = 0件）。
  2. スロット発行チェック：仕様書に規定された全スロット（`CLIMAX_HUB_ACTION`, `CLIMAX_SCAN_ACTION`, `CLIMAX_CHOICE`, `CLIMAX_EPILOGUE_A/B/C` 等）が正常に発行されること。
  3. ルール遵守チェック：
     * DIR_01（地の文・ナレーションに二人称「あなた」なし）
     * DIR_03（12:15前の条文番号・実在省庁名なし）
     * DIR_08 / POV規律（レン編で「レンは」、エレナ編で「エレナは」等の客観三人称記述なし）
  4. 結末到達性チェック：全23BAD END、ノーマルエンド、トゥルーエンドへの到達率100%。

### 4.2 プレビュー生成（`node build_preview.js`）
* GAS include構文と各HTMLモジュールを結合し、エラーなく `local_preview.html` が生成されること。

---

## 5. 実行チェックリスト

- [ ] **Step 4.1**: `scenario_climax_ren.html` の15ノードを `scenario_ren.html` の `SCENARIO_REN` 末尾へ移植。
- [ ] **Step 4.2**: `scenario_climax_elena.html` の14ノードを `scenario_elena.html` の `SCENARIO_ELENA` 末尾へ移植。
- [ ] **Step 4.3**: `scenario_climax_daniel.html` の14ノードを `scenario_daniel.html` の `SCENARIO_DANIEL` 末尾へ移植。
- [ ] **Step 4.4**: 旧3ファイルを空オブジェクト宣言（`const SCENARIO_CLIMAX_XXX = {};`）へ更新。
- [ ] **Step 5.1**: `js_engine.html` の `switchChar` に Hour 3（12:00）判定を追加。
- [ ] **Step 5.2**: `js_engine.html` の `checkTripleSync` 完了時の飛び先を `hour3Starts[state.currentChar]` へ変更。
- [ ] **Step 5.3**: `js_engine.html` の `.char-launch-btn` クリックハンドラを Hour 3 対応へ更新。
- [ ] **Step 5.4**: `js_ui.html` および `index.html` の `cardClimax` 表示・文言を「12:15 三者合流」へ更新。
- [ ] **Step 5.5**: `node simulate_all_paths.js` を実行し、100%合格（Error 0件）を確認。
- [ ] **Step 5.6**: `node build_preview.js` を実行し、プレビューを生成。
