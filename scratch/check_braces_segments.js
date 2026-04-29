
import fs from 'fs';

const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i += 100) {
  const segment = lines.slice(i, i + 100).join('\n');
  let b = 0;
  for (let char of segment) {
    if (char === '{') b++;
    if (char === '}') b--;
  }
  console.log(`Lines ${i + 1}-${i + 100}: ${b}`);
}
