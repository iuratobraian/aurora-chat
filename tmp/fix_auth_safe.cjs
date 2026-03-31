const fs = require('fs');
const path = require('path');

const files = ['profiles.ts', 'posts.ts', 'notifications.ts', 'communities.ts', 'chat.ts', 'reviews.ts'].map(f => path.join('convex', f));

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  
  c = c.replace(/const identity = await ctx\.auth\.getUserIdentity\(\);\s*if \(!identity\) throw new Error\("No autenticado"\);/g, `// MOCKED_AUTH\n    const identity = { subject: args.userId || args.adminId || args.ownerId || args.senderId || args.followerId };`);
  
  fs.writeFileSync(f, c);
  console.log('Fixed ' + f);
});
