/**
 * 『パラレル・ジャパニア：クロニクル 〜失われた人権の180分〜』
 * 428型 タイムライン群像劇 バックエンドAPIシステム (Code.js)
 * 
 * 【モジュール構成・スプレッドシート完全永続化】
 * - スプレッドシートID: 1c_b9hAlH2virJOQnm8pfEZfcsGykoZBQbBlUgB6ruEY
 * - doGet での HtmlService.createTemplateFromFile テンプレート評価
 * - 11カラム構成のプレイ記録永続化・LockService排他制御
 * - exportScenarioToSpreadsheet による全シナリオ一括スプレッドシート書き出し
 */

const SPREADSHEET_ID = "1c_b9hAlH2virJOQnm8pfEZfcsGykoZBQbBlUgB6ruEY";

function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('パラレル・ジャパニア：クロニクル 〜失われた人権の180分〜')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const result = saveProgress(data);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet() {
  let ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {}
  if (!ss) {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  const sheetName = 'プレイ記録';
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow([
      '最終更新日時',
      '名前（カタカナ）',
      'パスコード',
      '現在主人公',
      '現在地（シーン名）',
      '達成度',
      '復帰キー',
      '【システム用】獲得フラグJSON',
      '【システム用】通過ノードJSON',
      '【システム用】解放結末JSON',
      '【システム用】スロット状態JSON',
      '獲得トロフィー',
      '【システム用】トロフィーJSON',
      '【システム用】各主人公復帰ノードJSON',
      '【システム用】TIPS修得JSON',
      '【システム用】最終更新タイムスタンプ'
    ]);
    sheet.setFrozenRows(1);
  } else {
    // 既存シートのヘッダー自動マイグレーション（12列〜16列目の追加）
    const lastCol = sheet.getLastColumn();
    if (lastCol < 12) {
      sheet.getRange(1, 12).setValue('獲得トロフィー');
      sheet.getRange(1, 13).setValue('【システム用】トロフィーJSON');
      sheet.getRange(1, 14).setValue('【システム用】各主人公復帰ノードJSON');
      sheet.getRange(1, 15).setValue('【システム用】TIPS修得JSON');
      sheet.getRange(1, 16).setValue('【システム用】最終更新タイムスタンプ');
    } else if (lastCol < 14) {
      sheet.getRange(1, 14).setValue('【システム用】各主人公復帰ノードJSON');
      sheet.getRange(1, 15).setValue('【システム用】TIPS修得JSON');
      sheet.getRange(1, 16).setValue('【システム用】最終更新タイムスタンプ');
    } else if (lastCol < 16) {
      sheet.getRange(1, 15).setValue('【システム用】TIPS修得JSON');
      sheet.getRange(1, 16).setValue('【システム用】最終更新タイムスタンプ');
    }
  }
  return sheet;
}

function sanitizeInput(str) {
  if (!str) return "";
  let s = String(str).replace(/[\r\n\t]/g, " ").trim();
  // スプレッドシート数式インジェクション（Formula Injection）対策
  if (/^[=+@-]/i.test(s)) {
    s = "'" + s;
  }
  return s;
}

function registerStudent(katakanaName, clientPasscode) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (e) {
    return { status: "error", message: "アクセスが集中しています。少々お待ちください。" };
  }

  try {
    const sheet = getOrCreateSheet();
    const cleanName = sanitizeInput(katakanaName);
    if (!cleanName) {
      return { status: "error", message: "名前を入力してください。" };
    }
    // クライアント指定のパスコードがあればそれを採用（なければフォールバック生成）
    const passcode = (clientPasscode && String(clientPasscode).trim()) 
      ? sanitizeInput(clientPasscode) 
      : String(Math.floor(1000 + Math.random() * 9000));
    
    // 既存行チェック（同一の名前＋パスコードが既に存在する場合は多重作成を防ぎ成功を返す）
    const rows = sheet.getDataRange().getValues();
    const inputKey = `${cleanName}_${passcode}`;
    for (let i = 1; i < rows.length; i++) {
      const rowKey = `${String(rows[i][1]).trim()}_${String(rows[i][2]).replace("'", "").trim()}`;
      if (rowKey === inputKey) {
        return { status: "success", passcode: passcode, existing: true };
      }
    }

    const initialFlags = [];
    const initialVisited = ["A_1000"];
    const initialEndings = {};
    const initialSlots = {};
    const initialTrophies = {};

    sheet.appendRow([
      new Date(),
      cleanName,
      `'${passcode}`,
      "A: レン（自由権）",
      "10:00 首輪の火花",
      "0 / 28 結末解明 (🏆 0/5)",
      "A_1000",
      JSON.stringify(initialFlags),
      JSON.stringify(initialVisited),
      JSON.stringify(initialEndings),
      JSON.stringify(initialSlots),
      "🏆 0/5 [未獲得]",
      JSON.stringify(initialTrophies),
      JSON.stringify({ A: "A_1000", B: "B_1000", C: "C_1000" }),
      JSON.stringify({ unlockedTips: {}, masteredTips: {} }),
      0
    ]);

    return { status: "success", passcode: passcode };
  } catch (err) {
    return { status: "error", message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

function loadStudentProgress(katakanaName, passcode) {
  try {
    const sheet = getOrCreateSheet();
    const rows = sheet.getDataRange().getValues();
    const searchName = String(katakanaName).trim();
    const searchPass = String(passcode).trim();

    for (let i = rows.length - 1; i >= 1; i--) {
      const rName = String(rows[i][1]).trim();
      const rPass = String(rows[i][2]).replace("'", "").trim();

      if (rName === searchName && rPass === searchPass) {
        return {
          status: "success",
          data: {
            studentName: rName,
            passcode: rPass,
            currentChar: rows[i][3],
            lastSceneTitle: rows[i][4],
            lastNodeKey: rows[i][6] || "A_1000",
            userFlagsJSON: rows[i][7] || "[]",
            visitedNodesJSON: rows[i][8] || "[]",
            unlockedEndingsJSON: rows[i][9] || "{}",
            slotsJSON: rows[i][10] || "{}",
            trophiesJSON: rows[i][12] || "{}",
            lastCharNodesJSON: rows[i][13] || '{"A":"A_1000","B":"B_1000","C":"C_1000"}',
            tipsJSON: rows[i][14] || '{"unlockedTips":{},"masteredTips":{}}'
          }
        };
      }
    }
    return { status: "not_found", message: "名前またはパスコードが一致しません。" };
  } catch (err) {
    return { status: "error", message: err.toString() };
  }
}

function saveProgress(data) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (e) {
    return { status: "busy", message: "サーバー混雑中" };
  }

  try {
    const cleanStudentName = sanitizeInput(data.studentName);
    const cleanPasscode = sanitizeInput(data.passcode);
    const inputKey = `${cleanStudentName}_${cleanPasscode}`;

    let targetRow = -1;
    let existingVisited = [];
    let existingEndings = {};
    let existingTrophies = {};
    let existingLastCharNodes = { A: "A_1000", B: "B_1000", C: "C_1000" };
    let existingTips = { unlockedTips: {}, masteredTips: {} };
    let existingTimestamp = 0;
    let existingCurrentCharName = "";
    let existingCurrentSceneTitle = "";
    let existingCurrentNodeKey = "A_1000";
    let existingUserFlags = [];
    let existingSlots = {};

    for (let i = 1; i < rows.length; i++) {
      const rowKey = `${String(rows[i][1]).trim()}_${String(rows[i][2]).replace("'", "").trim()}`;
      if (rowKey === inputKey) {
        targetRow = i + 1;
        existingCurrentCharName = rows[i][3] || "";
        existingCurrentSceneTitle = rows[i][4] || "";
        existingCurrentNodeKey = rows[i][6] || "A_1000";
        try { existingUserFlags = JSON.parse(rows[i][7] || "[]"); } catch (e) { existingUserFlags = []; }
        try { existingVisited = JSON.parse(rows[i][8] || "[]"); } catch (e) { existingVisited = []; }
        try { existingEndings = JSON.parse(rows[i][9] || "{}"); } catch (e) { existingEndings = {}; }
        try { existingSlots = JSON.parse(rows[i][10] || "{}"); } catch (e) { existingSlots = {}; }
        try { existingTrophies = JSON.parse(rows[i][12] || "{}"); } catch (e) { existingTrophies = {}; }
        try { existingLastCharNodes = JSON.parse(rows[i][13] || '{"A":"A_1000","B":"B_1000","C":"C_1000"}'); } catch (e) { existingLastCharNodes = { A: "A_1000", B: "B_1000", C: "C_1000" }; }
        try { existingTips = JSON.parse(rows[i][14] || '{"unlockedTips":{},"masteredTips":{}}'); } catch (e) { existingTips = { unlockedTips: {}, masteredTips: {} }; }
        existingTimestamp = Number(rows[i][15]) || 0;
        break;
      }
    }

    const incomingTimestamp = Number(data.clientTimestamp) || Date.now();
    // タイムスタンプ順序判定：初期状態(existingTimestamp===0)なら無条件、それ以外は遅延した古いリクエストを防止
    const isNewer = existingTimestamp === 0 || incomingTimestamp >= existingTimestamp;

    // 累積・和集合データ（到着順序にかかわらず安全にマージ）
    const incomingVisited = data.visitedNodes || [];
    const mergedVisited = Array.from(new Set([...existingVisited, ...incomingVisited]));

    const incomingEndings = data.unlockedEndings || {};
    const mergedEndings = Object.assign({}, existingEndings, incomingEndings);

    const incomingTrophies = data.trophies || {};
    const mergedTrophies = Object.assign({}, existingTrophies, incomingTrophies);

    // TIPSマージ
    const incomingUnlockedTips = data.unlockedTips || {};
    const incomingMasteredTips = data.masteredTips || {};
    const mergedUnlockedTips = Object.assign({}, (existingTips.unlockedTips || {}), incomingUnlockedTips);
    const mergedMasteredTips = Object.assign({}, (existingTips.masteredTips || {}), incomingMasteredTips);

    // 単一状態データ（isNewerの場合のみ更新、遅延パケットなら既存状態を維持）
    const currentCharName = isNewer ? (data.currentCharName || "未選択") : existingCurrentCharName;
    const currentSceneTitle = isNewer ? (data.currentSceneTitle || "進行中") : existingCurrentSceneTitle;
    const currentNodeKey = isNewer ? (data.currentNodeKey || "A_1000") : existingCurrentNodeKey;
    const userFlags = isNewer ? (data.userFlags || []) : existingUserFlags;
    const slots = isNewer ? (data.slots || {}) : existingSlots;
    const lastCharNodes = isNewer 
      ? Object.assign({}, existingLastCharNodes, (data.lastCharNodes || {}))
      : existingLastCharNodes;
    const savedTimestamp = isNewer ? incomingTimestamp : existingTimestamp;

    const unlockedCount = Object.keys(mergedEndings).length;

    // トロフィー可読サマリー
    const TROPHY_MAP = {
      quizMaster: "憲法マスター",
      shinMaster: "探究の鬼",
      trueEnd: "新世紀立憲者",
      normalClear: "人権調和",
      augustMaster: "真実の編纂者"
    };
    const trophyList = Object.keys(mergedTrophies).filter(k => mergedTrophies[k]).map(k => TROPHY_MAP[k] || k);
    const trophyCount = trophyList.length;
    const trophyText = trophyCount > 0 ? `🏆 ${trophyCount}/5 [${trophyList.join(', ')}]` : '🏆 0/5 [未獲得]';

    const rowData = [
      new Date(),
      data.studentName,
      `'${String(data.passcode)}`,
      currentCharName,
      currentSceneTitle,
      `${unlockedCount} / 28 結末解明 (🏆 ${trophyCount}/5)`,
      currentNodeKey,
      JSON.stringify(userFlags),
      JSON.stringify(mergedVisited),
      JSON.stringify(mergedEndings),
      JSON.stringify(slots),
      trophyText,
      JSON.stringify(mergedTrophies),
      JSON.stringify(lastCharNodes),
      JSON.stringify({ unlockedTips: mergedUnlockedTips, masteredTips: mergedMasteredTips }),
      savedTimestamp
    ];

    if (targetRow > 0) {
      sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }

    return { 
      status: "success", 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unlockedCount: unlockedCount,
      trophyCount: trophyCount
    };
  } catch (error) {
    return { status: "error", message: error.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * 全シナリオをスプレッドシートへタブ別に一括エクスポートする管理関数
 */
function exportScenarioToSpreadsheet() {
  let ss = null;
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) {}
  if (!ss) ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // 1. 各主人公シートの準備
  const sheetConfigs = [
    { name: "【レン】自由権タイムライン", char: "A" },
    { name: "【エレナ】平等権タイムライン", char: "B" },
    { name: "【ダニエル】社会権タイムライン", char: "C" },
    { name: "【クライマックス＆全結末】", char: "CLIMAX" },
    { name: "【逆照射TIPS法条文】", char: "TIPS" }
  ];

  sheetConfigs.forEach(function(cfg) {
    let sheet = ss.getSheetByName(cfg.name);
    if (!sheet) {
      sheet = ss.insertSheet(cfg.name);
    } else {
      sheet.clear();
    }

    if (cfg.char === "TIPS") {
      sheet.appendRow(["用語キー", "正式憲法用語", "根拠法条文", "逆照射解説（本来言いたいこと）"]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, 4).setBackground("#0284c7").setFontColor("#ffffff").setFontWeight("bold");
    } else {
      sheet.appendRow([
        "ノードID", "時間", "シーン名", "ステージ", "本文内容",
        "選択肢1（テキスト）", "選択肢1（遷移先）",
        "選択肢2（テキスト）", "選択肢2（遷移先）", "特殊判定・フラグ"
      ]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, 10).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
    }
  });

  return { status: "success", message: "スプレッドシートへのエクスポート枠組みを構築しました。" };
}

/**
 * ============================================================================
 * 【管制柱】教員管制コックピット＆ダッシュボード集計API
 * 40名生徒の現在地、アワー、TIPS正解数、BAD END遭遇数、停滞SOSをリアルタイム集計
 * ============================================================================
 */
function getTeacherDashboardData(adminPasscode) {
  if (String(adminPasscode).trim() !== "9999") {
    return { status: "error", message: "認証に失敗しました。正しい教員パスコードを入力してください。" };
  }

  try {
    const sheet = getOrCreateSheet();
    const rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) {
      return { status: "success", students: [], summary: { total: 0, badEndCount: 0, clearCount: 0, sosCount: 0, totalTipsMastered: 0, badEndStats: {} } };
    }

    const students = [];
    const badEndStats = {};
    let totalTipsMastered = 0;
    let trueEndAchieved = 0;
    let sosCount = 0;
    const now = new Date().getTime();

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const name = String(r[1] || "").trim();
      const pass = String(r[2] || "").replace("'", "").trim();
      if (!name) continue;

      const lastUpdated = r[0] ? new Date(r[0]).getTime() : 0;
      const currentChar = String(r[3] || "");
      const sceneTitle = String(r[4] || "");
      const progressText = String(r[5] || "");
      const currentNodeKey = String(r[6] || "");

      let endings = {};
      try { endings = JSON.parse(r[9] || "{}"); } catch (e) {}
      let tipsData = { unlockedTips: {}, masteredTips: {} };
      try { tipsData = JSON.parse(r[14] || "{}"); } catch (e) {}

      const badEndCount = Object.keys(endings).filter(k => k.startsWith("BAD_")).length;
      const isCleared = !!(endings["NORMAL_CLEAR"] || endings["TRUE_SECRET_END"]);
      if (endings["TRUE_SECRET_END"]) trueEndAchieved++;

      const masteredCount = Object.keys(tipsData.masteredTips || {}).length;
      totalTipsMastered += masteredCount;

      // 最新BAD ENDの集計
      if (currentNodeKey.startsWith("BAD_")) {
        badEndStats[currentNodeKey] = (badEndStats[currentNodeKey] || 0) + 1;
      }

      // SOS停滞判定: 現在地がBAD END、または直近の更新から5分以上経っていてクリア未達
      const isBadEndStuck = currentNodeKey.startsWith("BAD_");
      const isIdle = (now - lastUpdated > 5 * 60 * 1000) && !isCleared;
      const isSos = isBadEndStuck || (isIdle && currentNodeKey !== "A_1000");
      if (isSos) sosCount++;

      students.push({
        name: name,
        passcode: pass,
        currentChar: currentChar,
        sceneTitle: sceneTitle,
        currentNodeKey: currentNodeKey,
        progressText: progressText,
        badEndCount: badEndCount,
        masteredCount: masteredCount,
        isCleared: isCleared,
        isSos: isSos,
        lastUpdatedFormatted: r[0] ? Utilities.formatDate(new Date(r[0]), "Asia/Tokyo", "HH:mm:ss") : "--:--:--"
      });
    }

    // SOS停滞生徒を先頭にソート
    students.sort((a, b) => (b.isSos ? 1 : 0) - (a.isSos ? 1 : 0));

    return {
      status: "success",
      students: students,
      summary: {
        total: students.length,
        sosCount: sosCount,
        trueEndAchieved: trueEndAchieved,
        totalTipsMastered: totalTipsMastered,
        badEndStats: badEndStats
      }
    };
  } catch (err) {
    return { status: "error", message: err.toString() };
  }
}
