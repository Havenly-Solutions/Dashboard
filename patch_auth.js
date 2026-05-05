const fs = require('fs');
const path = '../havenly-backend/src/schemas/auth.schemas.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "role: z.enum(['FOUNDER', 'CHIEF_OFFICER', 'OFFICER', 'VIEWER', 'LEADER', 'SECURITY', 'POLICE', 'USER', 'PA', 'MANAGER', 'DEVELOPER', 'INVESTOR', 'NGO_PARTNER'])",
  "role: z.enum(['FOUNDER', 'CHIEF_OFFICER', 'OFFICER', 'VIEWER', 'LEADER', 'SECURITY', 'POLICE', 'USER', 'PA', 'MANAGER', 'DEVELOPER', 'INVESTOR', 'NGO_PARTNER', 'ADMIN', 'VIDEOGRAPHER', 'CONTENT_CREATOR'])"
);

fs.writeFileSync(path, content);
console.log('Patched auth.schemas.ts');
