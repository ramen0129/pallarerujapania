# アクターズアイ運用標準ワークフロー (actors_eye_workflow.md)

<actors_eye_workflow version="1.0">

<workflow_stages>

  <stage id="STAGE_1_DETECTION" name="発動トリガーの検知">
    ユーザーの入力から以下のような意図を検知する：
    - 「○○でアクターズアイ」
    - 「アクターズアイ（○○）」
    - 「○○の視点から演じてみて」
    - 「○○役の役者として台本を読んでみて」
    ※ ○○にはキャラクター名（オーガスト、ダニエル、レン、エレナ、シン、ゴードン、エマ、マーサ等）が入る。
  </stage>

  <stage id="STAGE_2_LOAD_SCRIPT_AND_ACTOR" name="台本と俳優ペルソナのロード">
    1. 対象シーンのコード（HTMLシナリオノード）を取得。
    2. `.agents/rules/actors_eye_rules.md` から対応する俳優ペルソナ（黒岩ゲンゾウ、神谷マサキ、佐藤タクミ、新田アオイ、三浦カイト等）をロード。
    3. 『パラレル・ジャパニア_キャラクター完全設計仕様書.md』の人物設定・知能指数・トラウマ・嗜好・宿命の糸を再確認。
  </stage>

  <stage id="STAGE_3_THEATRICAL_AUDIT" name="演劇的本読みと5大視点監査">
    俳優になりきり、声に出して台本を演じながら以下の5点を検証：
    1. **感情の動線と助走**: その言葉を叫ぶに至る心の準備ができているか？
    2. **身体感覚と生理的リアリティ**: 極限状況（寒さ、痛み、疲労、心拍数）に無理がないか？
    3. **認知境界の徹底 (DIR_08)**: 自分が知り得ない事象を口走っていないか？
    4. **背負う権利と魂の重み**: 自由権・平等権・社会権のテーマ性が言葉に宿っているか？
    5. **共鳴の承認と違和感の抽出**: 魂が震えた名シーンと、口に出すと白ける箇所を分ける。
  </stage>

  <stage id="STAGE_4_REPORT_AND_PROPOSAL" name="アクターズアイ報告とリライト提案">
    `.agents/skills/actors-eye/SKILL.md` のフォーマットに基づき、俳優の熱量ある語り口で報告：
    - 控室でのファーストインプレッション
    - 喉に引っかかった違和感（生理的不自然さ、助走不足など）
    - 役者冥利に尽きる承認ポイント（鳥肌が立った名台詞）
    - 役者からの演技・台詞リライト提案
    - プロデューサー（ユーザー）への相談
  </stage>

  <stage id="STAGE_5_APPLICATION_AND_VERIFICATION" name="合意形成とコード反映・検証">
    ユーザーの承認を得た場合：
    1. シナリオファイルを更新。
    2. `node simulate_all_paths.js`（DIR_07）を実行し、破損リンク0件・DIR_08違反0件を確認。
    3. `node scratch/sync_to_subprojects.js` でサブプロジェクト同期。
    4. `node build_preview.js` で `local_preview.html` を再生成。
  </stage>

</workflow_stages>

</actors_eye_workflow>
