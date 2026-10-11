/**
 * 一気通貫台本生成CLIツール (export_path_script.js)
 * 
 * 目的:
 * シーン単体の部分確認を廃止し、開始から結末までの因果チェーンを
 * 一本の連続した「劇用台本（Script）」として一気通貫で出力・通読するための汎用ツール。
 * 
 * 使い方:
 * node export_path_script.js <Char: A|B|C|ALL> [Optional: startNodeId]
 * 例:
 * node export_path_script.js ALL CLIMAX_HUB
 * node export_path_script.js A
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

const charArg = (process.argv[2] || 'ALL').toUpperCase();
const startNodeArg = process.argv[3];

let startNodeId = startNodeArg;
if (!startNodeId) {
  if (charArg === 'A') startNodeId = 'A_1000';
  else if (charArg === 'B') startNodeId = 'B_1000';
  else if (charArg === 'C') startNodeId = 'C_1000';
  else startNodeId = 'CLIMAX_HUB';
}

if (!allNodes[startNodeId]) {
  console.error(`Start node '${startNodeId}' not found!`);
  process.exit(1);
}

console.log("================================================================================");
console.log(`【一気通貫通読台本 (Through-Play Script)】: [${charArg}] 開始ノード: ${startNodeId}`);
console.log("================================================================================\n");

const visited = new Set();
let curr = startNodeId;
let step = 1;

while (curr && allNodes[curr] && !visited.has(curr)) {
  visited.add(curr);
  const n = allNodes[curr];
  
  console.log(`--------------------------------------------------------------------------------`);
  console.log(`[Scene #${step}] ${n.time || ''} 【${n.charName || n.char || ''}】 NodeID: ${curr}`);
  console.log(`舞台: ${n.stage || ''} | 表題: ${n.title || ''}`);
  console.log(`--------------------------------------------------------------------------------\n`);
  
  if (n.paragraphs) {
    n.paragraphs.forEach(p => {
      const t = typeof p === 'function' ? p({ slots: {}, flags: [] }) : p;
      console.log(t);
      console.log("");
    });
  }
  
  if (n.isBadEnd || n.isClearEnd || !n.choices || n.choices.length === 0) {
    if (n.isBadEnd) console.log(`[END] === ${n.badId || 'BAD END'} ===`);
    if (n.isClearEnd) console.log(`[END] === CLEAR END ===`);
    break;
  }
  
  console.log(`▼ [選択肢 (正道ルートを選択)]:`);
  n.choices.forEach((ch, idx) => {
    console.log(`   ${idx === 0 ? '▶ (採用)' : '  (別解)'} [${idx + 1}] ${ch.text} ➔ ${ch.next || '分岐'}`);
  });
  console.log("\n");
  
  // 次ノードへ（デフォルトで最初の正道選択肢を辿る）
  const nextChoice = n.choices[0];
  let nextId = nextChoice.next;
  if (!nextId && nextChoice.checkJump) {
    nextId = nextChoice.checkJump.defaultNext || nextChoice.checkJump.onPass;
  }
  curr = nextId;
  step++;
}

console.log("================================================================================");
console.log(`【通読台本終了】 総ノード数: ${step} ノード`);
console.log("================================================================================");
