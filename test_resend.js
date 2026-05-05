const { Resend } = require('resend');
const resend = new Resend('re_RKZ6zN29_JHGA7nfTngTxcQJZPL1b2Ryd');

async function test() {
  const result = await resend.emails.send({
    from: 'Havenly Solutions Team <team@havenly.solutions>',
    to: ['brendanvusimbele@gmail.com'],
    subject: 'Test Email',
    html: '<p>Test</p>'
  });
  console.log(result);
}
test();
