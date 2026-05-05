const fs = require('fs');
const path = '../havenly-backend/src/routes/pre-registrations.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "  const schema = z.object({\n    fullName:     z.string().min(1).max(200).trim(),\n    email:        z.string().email().max(254).toLowerCase().trim(),\n    phoneNumber:  z.string().optional(),\n    location:     z.string().optional(),\n    tierInterest: z.enum(['FREE','PRO','NGO']).default('FREE'),\n  });",
  `  const schema = z.object({
    firstName:    z.string().optional(),
    surname:      z.string().optional(),
    fullName:     z.string().optional(),
    email:        z.string().email().max(254).toLowerCase().trim(),
    phone:        z.string().optional(),
    phoneNumber:  z.string().optional(),
    province:     z.string().optional(),
    location:     z.string().optional(),
    tierInterest: z.string().optional().default('FREE'),
  });`
);

content = content.replace(
  "    const { fullName, email, phoneNumber, location, tierInterest } = result.data;\n    \n    // Normalize data for worker (splitting name)\n    const nameParts = fullName.trim().split(/\\s+/);\n    const firstName = nameParts[0];\n    const surname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';",
  `    const data = result.data;
    const email = data.email;
    let firstName = data.firstName || '';
    let surname = data.surname || 'User';
    if (data.fullName) {
      const nameParts = data.fullName.trim().split(/\\s+/);
      firstName = nameParts[0];
      surname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';
    }
    const phoneNumber = data.phone || data.phoneNumber;
    const location = data.province || data.location;
    const tierInterest = data.tierInterest || 'FREE';`
);

content = content.replace(
  "router.post('/', globalRegistrationLimiter, preRegLimiter, async (req, res) => {",
  "router.post(['/', '/register'], globalRegistrationLimiter, preRegLimiter, async (req, res) => {"
);

fs.writeFileSync(path, content);
console.log('Patched pre-registrations.ts');
