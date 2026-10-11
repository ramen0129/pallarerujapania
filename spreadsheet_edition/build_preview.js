/**
 * スプレッドシート移植版 プレビューHTMLビルダー
 * GASインライン構文 (<?!= ... ?>) を結合して local_preview.html を出力
 */
const fs = require('fs');
const path = require('path');

const targetDir = __dirname;
const indexFile = path.join(targetDir, 'index.html');
const outputFile = path.join(targetDir, 'local_preview.html');

console.log('--- スプレッドシート移植版 プレビューHTMLビルド開始 ---');

let html = fs.readFileSync(indexFile, 'utf8');

// <?!= HtmlService.createHtmlOutputFromFile('FILENAME').getContent(); ?> の置換
const regex = /<\?!=\s*HtmlService\.createHtmlOutputFromFile\(['"]([^'"]+)['"]\)\.getContent\(\);\s*\?>/g;

html = html.replace(regex, (match, filename) => {
  const filePath = path.join(targetDir, `${filename}.html`);
  if (fs.existsSync(filePath)) {
    console.log(`インライン結合: ${filename}.html`);
    return fs.readFileSync(filePath, 'utf8');
  } else {
    console.warn(`警告: ファイルが見つかりません -> ${filePath}`);
    return `<!-- Missing: ${filename}.html -->`;
  }
});

fs.writeFileSync(outputFile, html, 'utf8');
console.log(`✔ プレビュー生成完了: ${outputFile} (${Math.round(fs.statSync(outputFile).size / 1024)} KB)`);
