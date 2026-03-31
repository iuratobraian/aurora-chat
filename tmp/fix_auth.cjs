const fs = require('fs');
const path = require('path');

const files = ['profiles.ts', 'posts.ts', 'notifications.ts', 'communities.ts', 'chat.ts', 'reviews.ts'].map(f => path.join('convex', f));

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  
  // Remove getUserIdentity()
  c = c.replace(/const identity = await ctx\.auth\.getUserIdentity\(\);\s*if \(!identity\) throw new Error\("No autenticado"\);\s*/g, '');
  
  // Replace identity.subject references with userId or similar
  // For patterns like: if (args.userId !== identity.subject) { const admin = ... }
  c = c.replace(/if \((args\.\w+) !== identity\.subject\) /g, 'if (false /* skip identity check */) ');
  
  fs.writeFileSync(f, c);
  console.log('Fixed ' + f);
});
