const { execSync } = require('child_process');

try {
  execSync('npx eslint . -f json', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
  console.log('Zero ESLint errors!');
} catch (e) {
  try {
    const results = JSON.parse(e.stdout);
    let total = 0;
    results.filter(r => r.messages.length > 0).forEach(r => {
      const fileName = r.filePath.replace(/\\/g, '/').split('/').pop();
      console.log(`\n📄 ${fileName} (${r.messages.length} issues):`);
      total += r.messages.length;
      r.messages.forEach(m => {
        console.log(`  Line ${m.line}:${m.column} [${m.ruleId}] ${m.message}`);
      });
    });
    console.log(`\nTotal ESLint issues: ${total}`);
  } catch (parseErr) {
    console.error('Raw error:', e.stdout || e.message);
  }
}
