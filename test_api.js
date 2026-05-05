const http = require('http');

const testApi = async () => {
  console.log("Testing /api/pre-registrations/register...");
  const preRegRes = await fetch('http://localhost:3005/api/pre-registrations/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: "Test",
      surname: "User",
      email: "test@example.com",
      phone: "+27123456789",
      province: "Gauteng",
      tierInterest: "FREE"
    })
  });
  console.log("Pre-Reg Status:", preRegRes.status);
  console.log("Pre-Reg Body:", await preRegRes.text());

  console.log("\nTesting /api/tour-requests...");
  const tourRes = await fetch('http://localhost:3005/api/tour-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "Test Corp",
      email: "test@corporate.com",
      venueType: "Corporate",
      location: "Johannesburg"
    })
  });
  console.log("Tour Status:", tourRes.status);
  console.log("Tour Body:", await tourRes.text());

  console.log("\nTesting /api/ngo-partners/apply...");
  const ngoRes = await fetch('http://localhost:3005/api/ngo-partners/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orgName: "SafeWatch",
      liaisonName: "John Doe",
      liaisonPhone: "+27123456789",
      orgType: "Community Watch",
      email: "safe@watch.org",
      regNumber: "",
      operatingRegion: "Cape Town",
      missionStatement: "Keep safe"
    })
  });
  console.log("NGO Status:", ngoRes.status);
  console.log("NGO Body:", await ngoRes.text());
};
testApi();
