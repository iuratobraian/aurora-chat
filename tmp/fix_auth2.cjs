const fs = require('fs');
const path = require('path');

const files = ['profiles.ts', 'posts.ts', 'notifications.ts', 'communities.ts', 'chat.ts', 'reviews.ts'].map(f => path.join('convex', f));

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  
  c = c.replace(/identity\.subject/g, '(args.adminId || args.ownerId || args.senderId || args.followerId || args.userId)');
  c = c.replace(/if \(false \/\* skip identity check \*\/\) (\{|throw|"([^"]|\\")*";)/g, '');
  
  fs.writeFileSync(f, c);
  console.log('Fixed ' + f);
});
