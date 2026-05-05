const http = require('http');

const testApi = async () => {
  console.log("Testing /api/team/invite...");
  const inviteRes = await fetch('http://localhost:3005/api/team/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      role: "ADMIN"
    })
  });
  console.log("Invite Status:", inviteRes.status);
  console.log("Invite Body:", await inviteRes.text());
};
testApi();
