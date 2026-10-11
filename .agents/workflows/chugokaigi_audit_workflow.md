# 柱合会議（ちゅうごうかいぎ）標準監査ワークフロー (.agents/workflows/chugokaigi_audit_workflow.md)

<workflow name="chugokaigi_eleven_pillars_audit" version="1.0">

<meta>
  <description>
    十一柱（零瑕・反証・契約・実証・現場・時差・因果・意匠・憲道・旋律・管制）による
    全方位ゼロトレランス監査の実行、実証エビデンス採取、全5プロジェクト同期、
    およびデプロイ待機までを一気通貫で規律する最高品質保証ワークフロー。
  </description>
</meta>

<workflow_stages>

  <!-- ステージ1: 召集準備と変更差分の特定 -->
  <stage id="STAGE_1" name="変更差分の分析と主査柱の特定">
    <action>
      直前の作業（シナリオ加筆、CSS変更、UIロジック、通信API、TIPS等）のgit diffや変更ファイルを走査し、
      主査（P0責任者）となる柱および副査（P1関連）となる柱を特定する。
    </action>
    <mapping_guidelines>
      <rule target="scenario_*.html">主査:【因果柱】 【零瑕柱】 / 副査:【意匠柱】 【憲道柱】</rule>
      <rule target="css.html, js_ui.html">主査:【意匠柱】 / 副査:【現場柱】 【反証柱】</rule>
      <rule target="Code.js, js_state.html">主査:【契約柱】 【時差柱】 / 副査:【管制柱】 【現場柱】</rule>
      <rule target="js_audio.html">主査:【旋律柱】 / 副査:【現場柱】 【零瑕柱】</rule>
      <rule target="js_tips.html">主査:【憲道柱】 / 副査:【因果柱】 【意匠柱】</rule>
    </mapping_guidelines>
  </stage>

  <!-- ステージ2: 自動シミュレータ＆実証エビデンス採取 -->
  <stage id="STAGE_2" name="自動検証スイートの実行と実証エビデンス（🔵）採取">
    <action>
      推測による「動くはず」を厳禁とし、必ず以下のスクリプト群を実コードVM環境で実行する。
    </action>
    <mandatory_executions>
      <command name="シナリオ完全導通＆認知境界リンター">
        <code>node simulate_all_paths.js</code>
        <pass_condition>Broken link: 0, DIR_08/DIR_03違反: 0件</pass_condition>
      </command>
      <command name="破壊仮説＆16列スキーマ競合テスト">
        <code>node scratch/test_pillar_audit_fixes.js</code>
        <pass_condition>全テストPASS (exit code 0)</pass_condition>
      </command>
      <command name="TIPS色体系＆マスター同期テスト">
        <code>node scratch/test_tip_colors_and_mastery.js</code>
        <pass_condition>全10項目PASS (桜色ピンク整合)</pass_condition>
      </command>
      <command name="プレビューHTML自動生成">
        <code>node build_preview.js</code>
        <pass_condition>local_preview.html 正常出力</pass_condition>
      </command>
    </mandatory_executions>
  </stage>

  <!-- ステージ3: 十一柱による全方位監査 -->
  <stage id="STAGE_3" name="十一柱の視点による批判的査定と監査報告">
    <action>
      `.agents/rules/chugokaigi_eleven_pillars_rules.md` のチェックリストに基づき、
      十一柱の合議による徹底査定を行う。
    </action>
    <pillars_checklist>
      <item pillar="零瑕柱">破損リンク0件、JS例外0件、パースエラー0件</item>
      <item pillar="反証柱">連打耐性、特殊文字サニタイズ、オフライン復帰</item>
      <item pillar="契約柱">スプシ全16列仕様遵守、13列データ後方互換性</item>
      <item pillar="実証柱">実コードVM実行エビデンス（🔵）の添付</item>
      <item pillar="現場柱">Chromebook履歴消去復帰100%、45分授業枠適性</item>
      <item pillar="時差柱">非同期遅延パケット逆転防止、タイムスタンプ制御</item>
      <item pillar="因果柱">DIR_08認知境界、DIR_02角括弧排除、428式中置演出</item>
      <item pillar="意匠柱">青・黄・桜・赤の色調和、350msタップ貫通ガード</item>
      <item pillar="憲道柱">DIR_03条文秘匿、14大判例の学術性、二巡目クイズ効果</item>
      <item pillar="旋律柱">BGMの劇伴設計、プロシージャル音源の負荷ゼロ性</item>
      <item pillar="管制柱">教員ダッシュボード要件、生徒進捗の可視化</item>
    </pillars_checklist>
  </stage>

  <!-- ステージ4: 是正ループ（欠陥・不整合の根絶） -->
  <stage id="STAGE_4" name="是正措置と再テストループ">
    <action>
      ❌（致命的欠陥）または 🟡（不整合・改善推奨）が1件でも検知された場合、
      直ちに該当コード・シナリオを修正し、STAGE_2 へ巻き戻して再実証する。
      全項目が 🟢（合格）に達するまでこのループを脱出できない。
    </action>
  </stage>

  <!-- ステージ5: 全5プロジェクト一括同期 -->
  <stage id="STAGE_5" name="全5プロジェクト一括同期の執行">
    <action>
      Rootで検証完了した最新ファイルを、以下の全サブプロジェクトへ完全同期する。
    </action>
    <targets>
      <target path="scratch/check_projects/proj1" />
      <target path="scratch/check_projects/proj2" />
      <target path="scratch/check_projects/proj3" />
      <target path="spreadsheet_edition" />
    </targets>
    <command>node scratch/sync_to_subprojects.js</command>
    <subproject_preview_build>node build_preview.js (spreadsheet_edition配下)</subproject_preview_build>
  </stage>

  <!-- ステージ6: お館様への報告とデプロイ待機 -->
  <stage id="STAGE_6" name="監査報告書の提出と号令待機（DIR_06厳守）">
    <action>
      柱合会議の決議事項とお館様への確認事項を整理して報告する。
      ユーザーからの明示的な指示（「push」「deploy」等）があるまで、
      clasp push / clasp deploy は絶対に実行せず待機する。
    </action>
  </stage>

</workflow_stages>

</workflow>
