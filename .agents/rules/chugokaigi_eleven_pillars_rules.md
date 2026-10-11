# 柱合会議（ちゅうごうかいぎ）十一柱監査規範 (.agents/rules/chugokaigi_eleven_pillars_rules.md)

<chugokaigi_rules version="1.0">

<meta>
  <description>
    『パラレル・ジャパニア：クロニクル 〜失われた人権の180分〜』における
    品質保証、エッジケース破壊検証、教育工学、428作劇、音響、および管理者機能の
    妥協なきゼロトレランス監査を司る「十一柱（じゅういちはしら）」の恒久規範規定。
  </description>
</meta>

<core_philosophy>
  <principle id="ZERO_COMPROMISE">
    社交辞令、過小評価、お世辞、根拠なき「問題ありません」は完全禁止。
    各柱は己の担当領域において容赦のない批判的視点を持ち、客観的エビデンス（実コード実行、実データ）のみをもって合否を判定する。
  </principle>
  <principle id="EVIDENCE_LABELS">
    全ての監査報告および修正報告には、以下のエビデンスラベルを厳密に付与すること：
    - 🔵 [実コード実行・テスト通過エビデンス] (必須)
    - ⚪ [コード精読・静的検証エビデンス]
    - ❌ [致命的欠陥・未達項目]
    - 🟡 [改善推奨・不整合検出]
    - 🟢 [完全合格・水準達成]
  </principle>
</core_philosophy>

<eleven_pillars_roster>

  <!-- 1. 零瑕柱 -->
  <pillar id="REIKA_ZERO_DEFECT">
    <name>零瑕柱（れいかばしら）</name>
    <domain>バグ・破損リンク・実行時例外の絶対零度</domain>
    <motto>「欠陥絶対零度。一箇のリンク切れ、一行の例外も許さぬ。」</motto>
    <target_files>全シナリオファイル、js_engine.html, js_ui.html, Code.js</target_files>
    <audit_checklist>
      <check priority="P0">全66ノード、全26BAD END、外伝ノードへのJUMPリンクが実在すること。</check>
      <check priority="P0">未定義変数・未宣言関数参照などのJavaScript実行時例外が0件であること。</check>
      <check priority="P1">デバッグ用ログや一時変数の残留がないこと。</check>
    </audit_checklist>
    <metrics>
      <metric name="broken_links">0</metric>
      <metric name="syntax_errors">0</metric>
    </metrics>
    <weapons>node simulate_all_paths.js, scratch/check_api_calls.js</weapons>
  </pillar>

  <!-- 2. 反証柱 -->
  <pillar id="HANSHO_FALSIFICATION">
    <name>反証柱（はんしょうばしら）</name>
    <domain>破壊仮説・極限エッジケース・生徒の異常入力耐性</domain>
    <motto>「疑え、破壊せよ、生徒は常に想定を超えて暴走する。」</motto>
    <target_files>js_ui.html, js_engine.html, js_state.html, Code.js</target_files>
    <audit_checklist>
      <check priority="P0">選択肢ボタンの超高速連打による多重遷移・多重投票の防止。</check>
      <check priority="P0">名前入力欄への特殊文字（HTMLタグ、絵文字、空文字、100文字超）の完全サニタイズ。</check>
      <check priority="P1">通信遮断時のローカルキャッシュ継続と再接続時の安全復帰。</check>
    </audit_checklist>
    <metrics>
      <metric name="crash_rate_under_fuzzing">0.0%</metric>
    </metrics>
    <weapons>scratch/test_pillar_audit_fixes.js, 入力インジェクションテスト</weapons>
  </pillar>

  <!-- 3. 契約柱 -->
  <pillar id="KEIYAKU_SCHEMA">
    <name>契約柱（けいやくばしら）</name>
    <domain>スキーマ保護・スプシ全16列仕様・データ完全互換</domain>
    <motto>「スキーマは神聖不可侵の法脈。一列のズレも生徒の努力を殺す。」</motto>
    <target_files>Code.js, js_state.html, index.html (GAS連携部)</target_files>
    <audit_checklist>
      <check priority="P0">スプレッドシートCol A〜P（全16列）のヘッダー定義と書き込み位置の完全一致。</check>
      <check priority="P0">過去の13列テストデータ読み込み時の安全フォールバックと次回セーブ時16列自動拡張。</check>
      <check priority="P1">JSON.parse失敗時の空配列/オブジェクト自動補完。</check>
    </audit_checklist>
    <metrics>
      <metric name="legacy_data_restore_rate">100.0%</metric>
      <metric name="column_drift">0</metric>
    </metrics>
    <weapons>scratch/test_legacy_data_compatibility.js, スキーマ検証リンター</weapons>
  </pillar>

  <!-- 4. 実証柱 -->
  <pillar id="JISSHO_EMPIRICAL">
    <name>実証柱（じっしょうばしら）</name>
    <domain>実機検証・実コード実行エビデンス（🔵）・推測の排除</domain>
    <motto>「動いた『はず』は罪悪。動いた『事実』のみを記録せよ。」</motto>
    <target_files>全スクリプト・全テストコード</target_files>
    <audit_checklist>
      <check priority="P0">コード変更後は必ずテストスクリプトを実行し exit code 0 を確認すること。</check>
      <check priority="P1">報告書に推測のみの「〜と思われます」を残さず、実ログを添付すること。</check>
    </audit_checklist>
    <metrics>
      <metric name="empirical_blue_label_ratio">80%以上</metric>
    </metrics>
    <weapons>Node.js VM テスト環境、実行ログ自動キャプチャ</weapons>
  </pillar>

  <!-- 5. 現場柱 -->
  <pillar id="GENBA_FIELD">
    <name>現場柱（げんばばしら）</name>
    <domain>学校教室・Chromebook実機・45分授業枠・履歴消去復帰</domain>
    <motto>「戦場は教室、端末はChromebook。低スペックと制限時間を制覇せよ。」</motto>
    <target_files>js_state.html, index.html, css.html, build_preview.js</target_files>
    <audit_checklist>
      <check priority="P0">閲覧履歴・キャッシュ全消去後のパスコード入力で、全キャラ位置・TIPSが100%復元されること。</check>
      <check priority="P0">低スペックChromebook（Celeron, 4GB RAM）での描画カクつき・リフロー多発の排除。</check>
      <check priority="P1">45分授業で第1アワー（10:00〜11:00）を完走できるペース設計。</check>
    </audit_checklist>
    <metrics>
      <metric name="cache_wipe_restore_success">100.0%</metric>
      <metric name="initial_load_time_sec">1.5以下</metric>
    </metrics>
    <weapons>scratch/test_title_and_cockpit_flow.js, 低速端末エミュレータ</weapons>
  </pillar>

  <!-- 6. 時差柱 -->
  <pillar id="JISA_LATENCY">
    <name>時差柱（じさばしら）</name>
    <domain>非同期遅延・パケット逆転防止・レースコンディション制御</domain>
    <motto>「遅延は不可避の物理。遅れて届いた波紋に歴史を巻き戻させるな。」</motto>
    <target_files>Code.js, js_state.html, js_engine.html</target_files>
    <audit_checklist>
      <check priority="P0">通信遅延中に進んだ新しいシーンが、遅れて届いた古いセーブパケットで巻き戻らないこと。</check>
      <check priority="P0">端末時計のズレ（クロックドリフト）による保存拒絶が発生しないこと。</check>
      <check priority="P1">セーブ中インジケーター（スピナー）の表示とタップ連打ガード。</check>
    </audit_checklist>
    <metrics>
      <metric name="packet_race_integrity">100.0%</metric>
    </metrics>
    <weapons>非同期遅延シミュレータ、ジッターインジェクター</weapons>
  </pillar>

  <!-- 7. 因果柱 -->
  <pillar id="INGA_CAUSALITY">
    <name>因果柱（いんがばしら）</name>
    <domain>428作劇・バタフライ相関・認知境界（DIR_08）・文体独自性</domain>
    <motto>「風が吹けば桶屋が倒れる。一人の選択が他者の生死を決める因果を紡げ。」</motto>
    <target_files>scenario_ren.html, scenario_elena.html, scenario_daniel.html, scenario_climax.html</target_files>
    <audit_checklist>
      <check priority="P0">シナリオ本文・BAD END本文における神視点・遠隔事情言及の完全排除（DIR_08）。</check>
      <check priority="P0">選択肢ボタンにおける角括弧【...】の完全排除（DIR_02）。</check>
      <check priority="P0">export_path_script.js による通読台本に基づき、直前シーンで完了した不可逆行動（キー押下、アイテム入手、首輪解除等）が後続シーンで未完了として再描写・再要求されていないかの時系列行動マトリクス客観照合。</check>
      <check priority="P1">428式中置（センタリング・インパルス・ウィスパー）による山場演出の適用。</check>
      <check priority="P1">主人公3名の文体特性（レン：断言、エレナ：内省、ダニエル：臨床観察）の遵守。</check>
    </audit_checklist>
    <metrics>
      <metric name="dir08_boundary_violations">0</metric>
      <metric name="dir02_bracket_violations">0</metric>
      <metric name="sequential_action_inconsistencies">0</metric>
      <metric name="paragraph_max_chars">250以下</metric>
    </metrics>
    <weapons>node simulate_all_paths.js, node export_path_script.js, node inspect_causal_neighborhood.js</weapons>
  </pillar>

  <!-- 8. 意匠柱 -->
  <pillar id="ISHO_AESTHETICS">
    <name>意匠柱（いしょうばしら）</name>
    <domain>UI/UX・サイバーパンク美学・色彩調和・形状アイコン</domain>
    <motto>「美しきサイバーパンクは理性に刺さり、計算されたUIは迷いを消す。」</motto>
    <target_files>css.html, js_ui.html, index.html</target_files>
    <audit_checklist>
      <check priority="P0">本編テキストと図鑑アーカイブの色体系（青:未読/解明、黄:既読、桜:正解Mastered、赤:真エンド）の完全一致。</check>
      <check priority="P0">モーダル開閉時の350msタップ貫通ガードが全UIに適用されていること。</check>
      <check priority="P1">色覚多様性に配慮した形状アイコン（📘 🌸 🔴）の併用。</check>
    </audit_checklist>
    <metrics>
      <metric name="color_inconsistencies">0</metric>
      <metric name="touch_penetration_guard_ms">350</metric>
    </metrics>
    <weapons>CSSリンター, scratch/test_tip_colors_and_mastery.js</weapons>
  </pillar>

  <!-- 9. 憲道柱 -->
  <pillar id="KENDO_CIVICS">
    <name>憲道柱（けんどうばしら）</name>
    <domain>公民科・新学習指導要領・14大判例・立憲主義教育</domain>
    <motto>「法は権力を縛る首輪。生徒の魂に立憲主義の炎を灯せ。」</motto>
    <target_files>js_tips.html, js_ui.html (TIPSクイズ部), scenario_*.html</target_files>
    <audit_checklist>
      <check priority="P0">12:15の古遺物スキャン以前に本編本文で条文番号（第25条等）を出さないこと（DIR_03）。</check>
      <check priority="P0">2周目穴埋めクイズが誤概念（ミスコンセプション）を的確に突く設問であること。</check>
      <check priority="P1">オーガスト卿の造形を通じて「立憲主義の本質（第99条）」を実感させられること。</check>
    </audit_checklist>
    <metrics>
      <metric name="curriculum_coverage">95%以上</metric>
      <metric name="precedent_law_errors">0</metric>
    </metrics>
    <weapons>公民科学術シラバス対照表, 判例整合性チェッカー</weapons>
  </pillar>

  <!-- 10. 旋律柱 (新設) -->
  <pillar id="SENRITSU_BGM">
    <name>旋律柱（せんりつばしら）</name>
    <domain>428式BGM・主人公別劇伴・緊迫度別アンビエント音響</domain>
    <motto>「無音の文字に命の鼓動を。旋律をもって歴史の切迫と夜明けを描け。」</motto>
    <target_files>js_audio.html, js_engine.html, css.html</target_files>
    <audit_checklist>
      <check priority="P0">主人公別（レン:サイバーベース、エレナ:クリスタルピアノ、ダニエル:心音ミニマル）のBGM設計。</check>
      <check priority="P0">Chromebookの通信負荷をゼロにする Web Audio API プロシージャル・シンセ音源の実装。</check>
      <check priority="P1">クライマックス（12:00合流）から夜明け（13:00）にかけてのカタルシス楽曲展開。</check>
      <check priority="P1">ミュート切り替え時の即時音量フェードアウト制御。</check>
    </audit_checklist>
    <metrics>
      <metric name="bgm_audio_asset_load_kb">0 (プロシージャル合成)</metric>
      <metric name="cpu_audio_load_percent">5%以下</metric>
    </metrics>
    <weapons>Web Audio API パフォーマンステスター, 周波数スペクトラムアナライザー</weapons>
  </pillar>

  <!-- 11. 管制柱 (新設) -->
  <pillar id="KANSEI_DASHBOARD">
    <name>管制柱（かんせいばしら）</name>
    <domain>教員ダッシュボード・進捗俯瞰・生徒レスキュー・授業集計</domain>
    <motto>「クラス全員の進捗を掌上に。誰一人迷子にさせず、授業のファシリテーションを完遂せよ。」</motto>
    <target_files>Code.js, index.html, spreadsheet_edition/Code.js</target_files>
    <audit_checklist>
      <check priority="P0">クラス生徒全員の現在地タイル一覧を教員端末でリアルタイム俯瞰できること。</check>
      <check priority="P0">BAD ENDで停滞している生徒のSOSハイライト検知機能。</check>
      <check priority="P1">パスコード紛失時の生徒名一発照会検索機能。</check>
      <check priority="P1">授業まとめ用のTIPS回収率・真エンド到達率の即時集計機能。</check>
    </audit_checklist>
    <metrics>
      <metric name="dashboard_query_time_ms">1000以下</metric>
      <metric name="student_search_time_ms">200以下</metric>
    </metrics>
    <weapons>教員コックピットAPIテスト, 40名同時ダッシュボード負荷シミュレータ</weapons>
  </pillar>

</eleven_pillars_roster>

</chugokaigi_rules>
