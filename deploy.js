/**
 * 安全なデプロイラッパー (deploy.js)
 * 
 * 目的:
 * テスト未通過の壊れたシナリオが Google Apps Script (GAS) 本番環境へ
 * デプロイされる事故を物理的に 100% 遮断するプリフライト結合デプロイヤー。
 * 
 * 注意 (DIR_06):
 * ユーザーからの明示的な指示（「push」「deploy」等）があるまで勝手に実行しないこと。
 */

const { execSync } = require('child_process');

console.log("=== PARALLEL JAPANIA SAFE DEPLOYMENT PIPELINE ===");

// 1. 全因果律＆整合性シミュレーションの強制実行
console.log("\n[Step 1/3] Running Full Integrity Simulation...");
try {
  execSync('node simulate_all_paths.js', { stdio: 'inherit' });
  console.log("✓ Simulation Passed: Zero broken links, zero residual violations.");
} catch (e) {
  console.error("\n❌ DEPLOYMENT ABORTED: Simulation failed. Fix errors before deploying!");
  process.exit(1);
}

// 2. プレビューHTMLの生成と構文結合検証
console.log("\n[Step 2/3] Building Local Preview & Checking HTML Inlining...");
try {
  execSync('node build_preview.js', { stdio: 'inherit' });
  console.log("✓ Preview Build Passed.");
} catch (e) {
  console.error("\n❌ DEPLOYMENT ABORTED: Preview build failed!");
  process.exit(1);
}

// 3. clasp push によるGASデプロイ
console.log("\n[Step 3/3] Deploying to Google Apps Script via clasp push...");
try {
  execSync('npx @google/clasp push', { stdio: 'inherit' });
  console.log("\n🎉 DEPLOYMENT SUCCESSFUL! All files safely synced to Google Apps Script.");
} catch (e) {
  console.error("\n❌ Clasp push failed. Check clasp credentials / network!");
  process.exit(1);
}
