const fs = require('fs');
const path = '../havenly-backend/prisma/schema.prisma';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "enum Role {\n  FOUNDER",
  "enum Role {\n  ADMIN\n  FOUNDER"
);

fs.writeFileSync(path, content);
console.log('Patched schema.prisma');
