/**
 * 親リポジトリから最新のシナリオ・スクリプト・アセットモジュールを
 * spreadsheet_edition フォルダへ一括同期するビルドツール
 */
const fs = require('fs');
const path = require('path');

const parentDir = path.resolve(__dirname, '..');
const targetDir = __dirname;

const filesToSync = [
  'css.html',
  'js_assets.html',
  'js_audio.html',
  'js_engine.html',
  'js_tips.html',
  'js_ui.html',
  'js_state.html',
  'scenario_ren.html',
  'scenario_elena.html',
  'scenario_daniel.html',
  'scenario_climax.html',
  'scenario_shin.html',
  'scenario_talk.html',
  'scenario_august.html'
];

console.log('--- 親リポジトリから最新モジュールを同期中 ---');

filesToSync.forEach(filename => {
  const srcPath = path.join(parentDir, filename);
  const destPath = path.join(targetDir, filename);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✔ 同期完了: ${filename}`);
  } else {
    console.warn(`⚠ ファイルが見つかりません: ${srcPath}`);
  }
});

// index.html のカスタマイズ同期
// ヘッダーに「✖ スプレッドシートに戻る」ボタンを追加
const parentIndex = path.join(parentDir, 'index.html');
const destIndex = path.join(targetDir, 'index.html');

if (fs.existsSync(parentIndex)) {
  let content = fs.readFileSync(parentIndex, 'utf-8');

  // ヘッダーバーの右端に「スプレッドシートに戻る」ボタンを追加
  const closeBtnHtml = `
    <!-- スプレッドシートに戻るボタン -->
    <button id="btnCloseModal" onclick="if(typeof google!=='undefined'&&google.script&&google.script.host){google.script.host.close();}else{window.close();}" class="text-xs px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-lg border border-rose-800/80 flex items-center gap-1 transition-all shadow-md ml-1" title="ゲームを終了してスプレッドシートに戻る">
      <span>✖</span><span class="hidden sm:inline">シートへ戻る</span>
    </button>
  `;

  if (!content.includes('id="btnCloseModal"')) {
    content = content.replace('</header>', `${closeBtnHtml}\n</header>`);
    console.log('✔ index.html: モーダル終了ボタン「✖ シートへ戻る」を統合');
  }

  fs.writeFileSync(destIndex, content, 'utf-8');
  console.log('✔ 同期完了: index.html');
}

console.log('--- 全モジュールの同期が完了しました ---');
