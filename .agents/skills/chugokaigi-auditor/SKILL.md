---
name: chugokaigi-auditor
description: >-
  Performs an uncompromising, evidence-based Eleven Pillars Audit (Chugokaigi) across zero-defect links,
  falsification edge cases, schema protection, empirical proof, classroom readiness, latency, 428 causality,
  aesthetics, constitutional pedagogy, procedural BGM, and teacher admin console.
---

# 柱合会議 監査スキル (chugokaigi-auditor)

<skill_definition name="chugokaigi-auditor" version="1.0">

<context>
  本作『パラレル・ジャパニア：クロニクル 〜失われた人権の180分〜』における
  開発・改修・リファクタリング・デプロイ前の最終防波堤として機能する最高監査機関。
  従来の4ペルソナレビューを包含・超越した「十一柱（じゅういちはしら）」の合議制により、
  全方位の品質・教育工学・428ゲーム性をゼロトレランス（妥協ゼロ）で査定する。
</context>

<audit_workflow>
  <step number="1" name="差分検知と査定柱の選定">
    直前の修正内容（シナリオテキスト、CSS、エンジン、通信API、TIPS等）に基づき、
    主担当となる柱（P0監査）と関連する柱（P1/P2監査）を特定する。
  </step>

  <step number="2" name="自動テストと決定論的監査JSONロード">
    推測による評価を厳禁とし、必ず以下のコマンド群を実行して実エビデンス（🔵）を取得する：
    - `node simulate_all_paths.js` (零瑕柱・因果柱・憲道柱) ➔ 直前60秒以内に発行された `audit_receipt.json`（SHA256署名付き）およびスクリプト自動生成の `audit_pillars.json` が PASSED であることを物理確認。不合格なら会議を即時中断。
    - `node export_path_script.js` (因果柱・実証柱) ➔ 直前ノードからの行動連続性・不可逆行動記憶（旧仕様残骸の有無）を通読照合。
    - `node scratch/test_pillar_audit_fixes.js` (反証柱・契約柱・時差柱)
    - `node scratch/test_tip_colors_and_mastery.js` (意匠柱・憲道柱)
    - `node build_preview.js` (零瑕柱・現場柱)
  </step>

  <step number="3" name="十一柱の批判的査定と糾弾（優等生バイアスの排除）">
    各柱の信条と監査チェックリスト（`.agents/rules/chugokaigi_eleven_pillars_rules.md`）に照らし、
    微小な不整合やエッジケースの穴を洗い出す。
    ※ 叱責直後の『全柱オールグリーン（減点恐怖症）』を厳禁とし、実運用上のエッジケース（未対応ブラウザ操作やサニタイズ等）があれば率直に 🟡 CAUTION として計上すること。
    ※ メタ内輪話（AI開発プロセスの言い訳等）および指示なき他スキル（アクターズアイ等）の勝手な越境を完全禁止する。
    - 零瑕柱: 破損リンク、構文エラー、CIレシート（`audit_receipt.json`）の整合性
    - 反証柱: 連打、特殊文字、異常系（popstateブラウザ履歴同期等）
    - 契約柱: スプシ全16列、スキーマ互換性、数式インジェクション防止、LockService排他
    - 実証柱: 実行ログエビデンス（🔵）、`audit_pillars.json` 現物照合
    - 現場柱: Chromebook履歴消去復帰、45分枠
    - 時差柱: 非同期逆転上書き、クロックドリフト
    - 因果柱: 認知境界（DIR_08）、角括弧（DIR_02）、428式中置、通読台本による不可逆行動の連続性照合
    - 意匠柱: 青・黄・桜・赤の配色整合性、タップ貫通ガード
    - 憲道柱: 条文秘匿（DIR_03）、判例純度、二巡目クイズ効果
    - 旋律柱: プロシージャルBGM、劇伴展開、負荷ゼロ音響
    - 管制柱: 教員ダッシュボード、進捗俯瞰、生徒レスキュー
  </step>

  <step number="4" name="決定論的監査JSONおよび報告書の出力と決議">
    必ずスクリプト生成の決定論的監査JSON（`audit_pillars.json`）を冒頭に出力した上で、
    各柱の評定、エビデンス（🔵/⚪/❌/🟡/🟢）、および具体的改修案をお館様（ユーザー様）へ提示し、決議する。
  </step>
</audit_workflow>

<report_template>
<![CDATA[
```json
{
  "chugokaigi_audit_metadata": { ... },
  "eleven_pillars_evaluations": [ ... ]
}
```

# 柱合会議 監査報告書
## 対象変更: [変更対象の概要]

---

### 1. 実証エビデンスサマリー（🔵）
- **CI実行レシート (Proof of Execution)**: `RCP-XXXX` (Status: PASSED / SHA256: `...` / Timestamp: `...`)
- **simulate_all_paths.js**: [結果]
- **export_path_script.js**: [通読照合結果・不可逆行動残骸0件確認]
- **プレビュービルド**: [結果]

---

### 2. 十一柱 査定マトリクス
| 柱 | 判定 | 査定要旨 | エビデンス |
| :--- | :---: | :--- | :---: |
| 【零瑕柱】 | 🟢/❌ | ... | 🔵/⚪ |
| 【反証柱】 | 🟢/❌ | ... | 🔵/⚪ |
| 【契約柱】 | 🟢/❌ | ... | 🔵/⚪ |
| 【実証柱】 | 🟢/❌ | ... | 🔵/⚪ |
| 【現場柱】 | 🟢/❌ | ... | 🔵/⚪ |
| 【時差柱】 | 🟢/❌ | ... | 🔵/⚪ |
| 【因果柱】 | 🟢/❌ | ... | 🔵/⚪ |
| 【意匠柱】 | 🟢/❌ | ... | 🔵/⚪ |
| 【憲道柱】 | 🟢/❌ | ... | 🔵/⚪ |
| 【旋律柱】 | 🟢/❌ | ... | 🔵/⚪ |
| 【管制柱】 | 🟢/❌ | ... | 🔵/⚪ |

---

### 3. 重大指摘事項（Defects & Inconsistencies）
- ...

---

### 4. 決議提言（Actionable Proposals）
- ...
]]>
</report_template>

</skill_definition>
