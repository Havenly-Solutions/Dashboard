const fs = require('fs');
const path = '../havenly-backend/src/routes/ngo-partners.ts';
let content = fs.readFileSync(path, 'utf8');

// The sed command I ran earlier:
// sed -i "s/res.status(500).json({ message: 'Internal Server Error' });/res.status(500).json({ message: 'Internal Server Error', error: error.message, stack: error.stack });/"

// Actually, wait, maybe I just introduced a syntax error because of how sed evaluates the string.
// Let's just fix it.
content = content.replace(
  "res.status(500).json({ message: 'Internal Server Error', error: error.message, stack: error.stack });",
  "res.status(500).json({ message: 'Internal Server Error' });"
);

fs.writeFileSync(path, content);
console.log('Fixed ngo-partners.ts');
