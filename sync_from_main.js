const fs = require('fs');
const path = require('path');

const filesToSync = [
  'scenario_ren.html',
  'scenario_elena.html',
  'scenario_daniel.html',
  'scenario_climax.html',
  'scenario_shin.html',
  'scenario_august.html',
  'scenario_talk.html',
  'js_state.html',
  'js_engine.html',
  'js_ui.html',
  'js_tips.html',
  'js_audio.html',
  'js_assets.html',
  'css.html'
];

console.log("=== SYNCING FILES TO SPREADSHEET EDITION ===");
const targetDir = path.join(__dirname, 'spreadsheet_edition');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

let syncCount = 0;
filesToSync.forEach(file => {
  const src = path.join(__dirname, file);
  const dest = path.join(targetDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✓ Synced: ${file}`);
    syncCount++;
  } else {
    console.warn(`⚠ Missing file in root: ${file}`);
  }
});

console.log(`\nSuccessfully synced ${syncCount} files to spreadsheet_edition/`);
