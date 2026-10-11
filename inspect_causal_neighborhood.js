/**
 * 因果近傍一括抽出CLIツール (inspect_causal_neighborhood.js)
 * 
 * 目的:
 * 局所的な「パッチ当て」による残骸放置を物理的に根絶するため、
 * 指定ノードの【流入元ノード群】【流出先ノード群】【同時刻ノード群】【フラグ依存関係】を
 * 1つの因果クラスタとして一括展開・可視化する汎用監査ツール。
 * 
 * 使い方:
 * node inspect_causal_neighborhood.js <NodeId>
 * 例: node inspect_causal_neighborhood.js CLIMAX_DECISION
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadScenarioFile(fileName) {
  const content = fs.readFileSync(path.join(__dirname, fileName), 'utf8');
  const m = content.match(/<script>([\s\S]*?)<\/script>/i);
  const code = (m ? m[1] : content).replace(/const\s+(SCENARIO_[A-Z]+|TIPS_MASTER|TIPS_QUIZ_QUESTIONS)/g, 'var $1');
  return code;
}

const context = { window: {} };
context.window = context;
vm.createContext(context);

['scenario_ren.html', 'scenario_elena.html', 'scenario_daniel.html', 'scenario_climax.html', 'scenario_shin.html', 'scenario_august.html', 'scenario_talk.html'].forEach(f => {
  if (fs.existsSync(path.join(__dirname, f))) {
    vm.runInContext(loadScenarioFile(f), context);
  }
});

const allNodes = Object.assign(
  {},
  context.SCENARIO_REN,
  context.SCENARIO_ELENA,
  context.SCENARIO_DANIEL,
  context.SCENARIO_CLIMAX,
  context.SCENARIO_SHIN || {},
  context.SCENARIO_AUGUST || {},
  context.SCENARIO_TALK || {}
);

const targetId = process.argv[2];
if (!targetId || !allNodes[targetId]) {
  console.error(`Usage: node inspect_causal_neighborhood.js <NodeId>`);
  console.error(`Available nodes count: ${Object.keys(allNodes).length}`);
  if (targetId) console.error(`Node '${targetId}' not found!`);
  process.exit(1);
}

const targetNode = allNodes[targetId];

console.log("================================================================================");
console.log(`【因果近傍クラスタ監査】: ${targetId}`);
console.log(`時間: ${targetNode.time || 'N/A'} | キャラ: ${targetNode.charName || targetNode.char || 'N/A'} | 舞台: ${targetNode.stage || 'N/A'}`);
console.log(`表題: ${targetNode.title || 'N/A'}`);
console.log("================================================================================\n");

// 1. 流入元ノード群 (Incoming / Parents)
console.log("▼ 1. 流入元ノード群 (In-Degree: このノードに遷移してくる親ノード)");
const incoming = [];
Object.entries(allNodes).forEach(([srcId, node]) => {
  if (!node.choices) return;
  node.choices.forEach((ch, cIdx) => {
    let matches = false;
    if (ch.next === targetId) matches = true;
    if (ch.checkJump) {
      if (ch.checkJump.defaultNext === targetId || ch.checkJump.onPass === targetId || ch.checkJump.onBlock === targetId) matches = true;
      if (ch.checkJump.branches && ch.checkJump.branches.some(b => b.next === targetId)) matches = true;
    }
    if (matches) {
      incoming.push({
        fromNode: srcId,
        fromTime: node.time,
        fromChar: node.charName || node.char,
        choiceIdx: cIdx,
        choiceText: ch.text,
        slot: ch.slot,
        flag: ch.flagValue,
        reqSecret: ch.requiresSecretPieces
      });
    }
  });
});

if (incoming.length === 0) {
  console.log("  (なし - ルート開始ノードまたは直接遷移なし)");
} else {
  incoming.forEach(inc => {
    console.log(`  [${inc.fromTime} ${inc.fromChar}] ${inc.fromNode} (選択肢#${inc.choiceIdx + 1})`);
    console.log(`    ↳ 選択肢テキスト: "${inc.choiceText}"`);
    if (inc.slot || inc.flag) console.log(`    ↳ スロット/フラグ: ${inc.slot} => ${inc.flag}`);
    if (inc.reqSecret) console.log(`    ↳ [GATE] requiresSecretPieces: true`);
  });
}
console.log("");

// 2. ターゲットノード本文要約
console.log("▼ 2. 対象ノード本文 (Target Body)");
const paragraphs = (targetNode.paragraphs || []).map((p, idx) => {
  const t = typeof p === 'function' ? p({ slots: {} }) : p;
  return `  [P${idx + 1}] ${t.slice(0, 100)}${t.length > 100 ? '...' : ''}`;
});
console.log(paragraphs.join('\n') || "  (パラグラフなし)");
console.log("");

// 3. 流出先ノード群 (Outgoing / Children)
console.log("▼ 3. 流出先ノード群 (Out-Degree: このノードの選択肢が遷移する先)");
if (!targetNode.choices || targetNode.choices.length === 0) {
  console.log("  (なし - 終端ノード / BAD END / CLEAR)");
} else {
  targetNode.choices.forEach((ch, idx) => {
    console.log(`  [選択肢#${idx + 1}] "${ch.text}"`);
    console.log(`    ➔ 遷移先: ${ch.next || (ch.checkJump ? 'checkJump分岐' : '未定義')}`);
    if (ch.slot || ch.flagValue) console.log(`    ➔ スロット/フラグ: ${ch.slot} => ${ch.flagValue}`);
    if (ch.requiresSecretPieces) console.log(`    ➔ [GATE] requiresSecretPieces: true (古遺物必須)`);
    
    // 遷移先端ノードの情報も表示
    const destNode = allNodes[ch.next];
    if (destNode) {
      console.log(`       【遷移先情報】[${destNode.time} ${destNode.charName || destNode.char}] ${destNode.title || destNode.stage || ''}`);
    }
  });
}
console.log("");

// 4. 同時刻・平行ノード群 (Concurrent / Parallel Peers)
if (targetNode.time) {
  console.log(`▼ 4. 同時刻ノード群 (Concurrent Nodes at ${targetNode.time})`);
  const peers = Object.entries(allNodes).filter(([id, n]) => n.time === targetNode.time && id !== targetId);
  if (peers.length === 0) {
    console.log("  (単独時間帯または他主人公なし)");
  } else {
    peers.forEach(([pId, pNode]) => {
      console.log(`  [${pNode.charName || pNode.char}] ${pId}: ${pNode.title || pNode.stage || ''}`);
    });
  }
}
console.log("\n================================================================================");
