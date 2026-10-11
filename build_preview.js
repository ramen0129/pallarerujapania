const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("=== PRE-FLIGHT AUDIT: RUNNING FULL INTEGRITY SIMULATION ===");
const receiptPath = path.join(__dirname, 'audit_receipt.json');

// 古いレシートがあれば事前に削除して実行偽装を防止
if (fs.existsSync(receiptPath)) fs.unlinkSync(receiptPath);

try {
  // テストを1件でもパスしなければプレビュー生成を物理的に拒絶（強制停止）
  execSync('node simulate_all_paths.js', { stdio: 'inherit', cwd: __dirname });
} catch (e) {
  console.error("\n❌ PRE-FLIGHT AUDIT FAILED! Preview generation aborted to prevent corrupted build.");
  process.exit(1);
}

// 桑原原則: Proof of Execution（物理レシート）の厳格検証
if (!fs.existsSync(receiptPath)) {
  console.error("\n❌ PROOF OF EXECUTION MISSING: audit_receipt.json was not generated!");
  process.exit(1);
}

const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
const receiptAgeSec = (Date.now() - new Date(receipt.timestamp).getTime()) / 1000;

if (receipt.status !== "PASSED" || receiptAgeSec > 60) {
  console.error(`\n❌ INVALID AUDIT RECEIPT: Status=${receipt.status}, Age=${receiptAgeSec.toFixed(1)}s`);
  process.exit(1);
}

console.log(`✓ PRE-FLIGHT AUDIT VERIFIED: Receipt ID ${receipt.receipt_id} (SHA256: ${receipt.scenario_sha256.slice(0, 16)}...)\n`);

console.log("=== BUILDING LOCAL PREVIEW HTML ===");

const indexPath = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// GASの <?!= HtmlService.createHtmlOutputFromFile('xxx').getContent(); ?> を実際のファイル内容に置換
const includeRegex = /<\?!=\s*HtmlService\.createHtmlOutputFromFile\(['"]([^'"]+)['"]\)\.getContent\(\);\s*\?>/g;

indexContent = indexContent.replace(includeRegex, (match, fileName) => {
  const targetFile = path.join(__dirname, fileName + '.html');
  if (fs.existsSync(targetFile)) {
    console.log(`- Inlined: ${fileName}.html`);
    return fs.readFileSync(targetFile, 'utf8');
  } else {
    console.warn(`! File not found: ${targetFile}`);
    return `<!-- Missing: ${fileName}.html -->`;
  }
});

const previewPath = path.join(__dirname, 'local_preview.html');
fs.writeFileSync(previewPath, indexContent, 'utf8');

console.log(`✓ Generated ${previewPath} successfully!`);
