const fs = require('fs');
const path = '../havenly-backend/src/schemas/production.schemas.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "venueType: z.enum(['School', 'College', 'Community', 'Business', 'University']),",
  "venueType: z.enum(['School', 'College', 'Community', 'Business', 'Corporate', 'University']),"
);

fs.writeFileSync(path, content);
console.log('Patched production.schemas.ts');
