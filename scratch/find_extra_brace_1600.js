
import fs from 'fs';

const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

let b = 0;
// We know balance at 1600 is 1.
b = 1; 
for (let i = 1600; i < 1686; i++) {
  const line = lines[i];
  for (let char of line) {
    if (char === '{') b++;
    if (char === '}') b--;
  }
  if (b < 0) {
    console.log(`EXTRA CLOSING BRACE AT LINE ${i + 1}: ${line}`);
    process.exit(1);
  }
  console.log(`Line ${i + 1}: Balance ${b}`);
}
