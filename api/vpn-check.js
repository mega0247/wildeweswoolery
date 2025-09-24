// File: /api/vpn-check.js
export default async function handler(req, res) {
  try {
    // ✅ Get client IP from Vercel headers
    const forwarded = req.headers['x-forwarded-for'] || '';
    const clientIP = forwarded.split(',')[0].trim() || req.socket.remoteAddress || '';

    if (!clientIP) {
      console.warn("No client IP detected, allowing access.");
      return res.status(200).json({ blocked: false });
    }

    const API_KEY = process.env.IPQS_API_KEY;
    if (!API_KEY) {
      console.warn("IPQS API key not set!");
      return res.status(200).json({ blocked: false });
    }

    // Use strictness=2 to catch more VPN/proxy/Tor connections
    const url = `https://ipqualityscore.com/api/json/ip/${API_KEY}/${clientIP}?strictness=2&allow_public_access_points=true`;

    const response = await fetch(url);
    const data = await response.json();

    console.log("VPN Check:", { clientIP, ipqsData: data });

    // Block if any of these are true, or fraud_score is high
    const isBlocked =
      data.vpn === true ||
      data.proxy === true ||
      data.tor === true ||
      data.host === true ||
      (data.fraud_score && data.fraud_score > 50);

    if (isBlocked) {
      console.log("Blocked visitor:", clientIP);
      return res.status(403).json({ blocked: true });
    }

    res.status(200).json({ blocked: false });
  } catch (err) {
    console.error("VPN Check Error:", err);
    res.status(200).json({ blocked: false }); // fail-open so site still loads
  }
}
