const fs = require('fs');
const path = require('path');

const files = ['profiles.ts', 'posts.ts', 'notifications.ts', 'communities.ts', 'chat.ts', 'reviews.ts'].map(f => path.join('convex', f));

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  
  c = c.replace(/args\.userId \|\| args\.adminId \|\| args\.ownerId \|\| args\.senderId \|\| args\.followerId/g, '(args as any).userId || (args as any).adminId || (args as any).ownerId || (args as any).senderId || (args as any).followerId');
  
  fs.writeFileSync(f, c);
  console.log('Fixed ' + f);
});
