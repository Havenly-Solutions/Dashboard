const fs = require('fs');
const path = '../havenly-backend/src/routes/team.ts';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  /'NGO_PARTNER',\\s*'PA',/g,
  "'NGO_PARTNER',\n    'PA',\n    'ADMIN',\n    'VIDEOGRAPHER',\n    'CONTENT_CREATOR',"
);
fs.writeFileSync(path, content);
console.log('Patched team.ts');
