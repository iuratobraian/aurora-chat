/**
 * File Converter Example - Conversión universal de archivos
 * Space: https://huggingface.co/spaces/Agents-MCP-Hackathon/universal-file-converter
 */

import { readFileSync, writeFileSync } from 'fs';

const conversions = {
  'pdf': ['markdown', 'json', 'text', 'html'],
  'docx': ['markdown', 'pdf', 'text'],
  'csv': ['json', 'xlsx', 'markdown', 'yaml'],
  'json': ['csv', 'yaml', 'markdown', 'xml'],
  'markdown': ['html', 'pdf', 'docx'],
  'yaml': ['json', 'toml'],
  'xml': ['json', 'yaml']
};

function detectFormat(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  return ext;
}

function canConvert(from, to) {
  return conversions[from]?.includes(to) || false;
}

async function convertFile(inputFile, targetFormat) {
  const inputFormat = detectFormat(inputFile);
  
  console.log(`\n🔄 Convirtiendo: ${inputFile}`);
  console.log(`   ${inputFormat} → ${targetFormat}`);
  
  if (!canConvert(inputFormat, targetFormat)) {
    throw new Error(`Conversión ${inputFormat} → ${targetFormat} no soportada`);
  }
  
  // Simular conversión
  await new Promise(r => setTimeout(r, 100));
  
  const outputFile = inputFile.replace(`.${inputFormat}`, `.${targetFormat}`);
  console.log(`✅ Guardado como: ${outputFile}`);
  
  return { input: inputFile, output: outputFile, from: inputFormat, to: targetFormat };
}

// Ejemplo de uso
const examples = [
  { file: 'data.csv', to: 'json' },
  { file: 'config.yaml', to: 'json' },
  { file: 'report.md', to: 'html' },
  { file: 'data.json', to: 'csv' }
];

examples.forEach(ex => {
  try {
    convertFile(ex.file, ex.to).catch(console.error);
  } catch (e) {
    console.log(`❌ ${e.message}`);
  }
});

console.log('\n📋 Formatos soportados:');
console.log(Object.entries(conversions).map(([k, v]) => `  ${k} → ${v.join(', ')}`).join('\n'));
