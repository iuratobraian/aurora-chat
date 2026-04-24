
import fs from 'fs';

const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

let b = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let char of line) {
    if (char === '{') b++;
    if (char === '}') b--;
  }
  if (i > 1700) {
    console.log(`Line ${i + 1}: Balance ${b} | ${line}`);
  }
}
