const DATABASE_ID = '33142b008df080f8b6b3db69d36e84d5';
const API_KEY = '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';

const BASE = 'https://api.notion.com/v1';
const HEADERS = {
  'Authorization': `Bearer ${API_KEY}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};

async function notionGet(path) {
  const res = await fetch(`${BASE}${path}`, { headers: HEADERS });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GET ${path} failed: ${res.status} - ${body}`);
  }
  return res.json();
}

async function notionPost(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`POST ${path} failed: ${res.status} - ${errBody}`);
  }
  return res.json();
}

function extractValue(prop) {
  switch (prop.type) {
    case 'title':
      return prop.title.map(t => t.plain_text).join('');
    case 'rich_text':
      return prop.rich_text.map(t => t.plain_text).join('');
    case 'select':
      return prop.select ? prop.select.name : null;
    case 'multi_select':
      return prop.multi_select.map(ms => ms.name);
    case 'status':
      return prop.status ? prop.status.name : null;
    case 'date':
      return prop.date ? prop.date.start : null;
    case 'checkbox':
      return prop.checkbox;
    case 'number':
      return prop.number;
    case 'url':
      return prop.url;
    case 'email':
      return prop.email;
    case 'phone_number':
      return prop.phone_number;
    case 'created_time':
      return prop.created_time;
    case 'last_edited_time':
      return prop.last_edited_time;
    case 'created_by':
      return prop.created_by?.name || prop.created_by?.id;
    case 'last_edited_by':
      return prop.last_edited_by?.name || prop.last_edited_by?.id;
    case 'relation':
      return prop.relation.map(r => r.id);
    case 'people':
      return prop.people.map(p => p.name || p.id);
    case 'files':
      return prop.files.map(f => f.name);
    case 'formula':
      return prop.formula;
    default:
      return prop[prop.type];
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  NOTION DATABASE INSPECTOR');
  console.log('═══════════════════════════════════════════════════════\n');

  // 1. Get database schema
  console.log('📋 STEP 1: Fetching database schema...\n');
  const db = await notionGet(`/databases/${DATABASE_ID}`);

  console.log('Database ID:', db.id);
  console.log('Database Title:', db.title?.map(t => t.plain_text).join('') || '(no title)');
  console.log('Description:', db.description?.map(t => t.plain_text).join('') || '(none)');
  console.log('URL:', db.url);
  console.log('');

  // Properties can be an object keyed by name
  const props = db.properties;
  console.log('─── Property Schema ───────────────────────────────────');
  console.log('');

  if (props && typeof props === 'object') {
    for (const [name, prop] of Object.entries(props)) {
      console.log(`  Name: "${name}"`);
      console.log(`    ID:   ${prop.id}`);
      console.log(`    Type: ${prop.type}`);

      if (prop.type === 'select' && prop.select?.options) {
        console.log(`    Options: ${prop.select.options.map(o => `"${o.name}" (${o.color})`).join(', ')}`);
      }
      if (prop.type === 'multi_select' && prop.multi_select?.options) {
        console.log(`    Options: ${prop.multi_select.options.map(o => `"${o.name}" (${o.color})`).join(', ')}`);
      }
      if (prop.type === 'status' && prop.status?.options) {
        console.log(`    Options: ${prop.status.options.map(o => `"${o.name}" (${o.color})`).join(', ')}`);
      }
      if (prop.type === 'relation') {
        console.log(`    Database: ${prop.relation?.database_id}`);
      }
      if (prop.type === 'formula') {
        console.log(`    Expression: ${prop.formula?.expression || '(none)'}`);
      }
      if (prop.type === 'rollup') {
        console.log(`    Relation property: ${prop.rollup?.relation_property_name}`);
        console.log(`    Rollup property: ${prop.rollup?.rollup_property_name}`);
        console.log(`    Function: ${prop.rollup?.function}`);
      }
      console.log('');
    }
  }

  // 2. Fetch sample pages
  console.log('═══════════════════════════════════════════════════════');
  console.log('📄 STEP 2: Fetching sample pages...\n');

  const queryRes = await notionPost(`/databases/${DATABASE_ID}/query`, {
    page_size: 5,
  });

  console.log(`Total pages returned: ${queryRes.results.length}\n`);

  for (let i = 0; i < queryRes.results.length; i++) {
    const page = queryRes.results[i];
    console.log(`─── Page ${i + 1} ─────────────────────────────────────────`);
    console.log(`  Page ID: ${page.id}`);

    const pageProps = page.properties;
    for (const [propName, propValue] of Object.entries(pageProps)) {
      const val = extractValue(propValue);
      const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
      console.log(`  "${propName}" (${propValue.type}): ${displayVal}`);
    }
    console.log('');
  }

  // 3. Summary
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ STEP 3: Summary - Property names to use in sync script\n');

  console.log('Use these EXACT property names in your sync script:\n');
  if (props && typeof props === 'object') {
    for (const [name, prop] of Object.entries(props)) {
      console.log(`  "${name}" → type: "${prop.type}"`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
