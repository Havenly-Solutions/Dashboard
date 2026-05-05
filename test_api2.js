const http = require('http');

const testApi = async () => {
  const ngoRes = await fetch('http://localhost:3005/api/ngo-partners/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orgName: "SafeWatch",
      liaisonName: "John Doe",
      liaisonPhone: "+27123456789",
      orgType: "Community Watch",
      email: "safe2@watch.org",
      regNumber: "",
      operatingRegion: "Cape Town",
      missionStatement: "Keep safe"
    })
  });
  console.log("NGO Status:", ngoRes.status);
  console.log("NGO Body:", await ngoRes.text());
};
testApi();
