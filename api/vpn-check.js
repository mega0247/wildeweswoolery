// File: /pages/api/vpn-check.js
export default async function handler(req, res) {
  try {
    // ✅ Get real client IP (works with Vercel + proxies)
    const clientIP =
      req.headers["x-real-ip"] ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "";

    if (!clientIP) {
      console.log("No client IP detected, allowing access.");
      return res.status(200).json({ blocked: false });
    }

    console.log("Client IP detected:", clientIP);

    // ✅ Use IPQS API key from Vercel environment variable
    const API_KEY = process.env.IPQS_API_KEY;
    if (!API_KEY) {
      console.warn("IPQS API key not set!");
      return res.status(200).json({ blocked: false });
    }

    // ✅ Construct URL correctly with backticks
    const url = `https://ipqualityscore.com/api/json/ip/${API_KEY}/${clientIP}?strictness=1&allow_public_access_points=true`;

    const response = await fetch(url);
    const data = await response.json();

    console.log("IPQS Data:", data);

    // ✅ Decide if the user should be blocked
    const isBlocked =
      data.vpn === true ||
      data.proxy === true ||
      data.tor === true ||
      data.host === true ||
      data.fraud_score > 75; // optional: block high-risk IPs

    if (isBlocked) {
      console.log("Blocked IP:", clientIP);
      return res.status(403).json({ blocked: true });
    }

    res.status(200).json({ blocked: false });
  } catch (err) {
    console.error("VPN Check Error:", err);
    res.status(200).json({ blocked: false }); // fail-open
  }
}
