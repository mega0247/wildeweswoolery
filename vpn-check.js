// File: /pages/api/vpn-check.js
export default async function handler(req, res) {
  try {
    // ✅ Get real client IP (Vercel & proxies)
    const clientIP =
      req.headers["x-real-ip"] ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "";

    if (!clientIP) {
      return res.status(200).json({ blocked: false }); // no IP, allow
    }

    // ✅ Query IPQualityScore API (FREE tier available)
    const API_KEY = process.env.IPQS_API_KEY; // store key in Vercel env variables
    const url = `https://ipqualityscore.com/api/json/ip/${API_KEY}/${clientIP}`;

    const response = await fetch(url);
    const data = await response.json();

    // ✅ Block if VPN, Proxy, Tor, or hosting provider detected
    const isBlocked =
      data.vpn === true ||
      data.proxy === true ||
      data.tor === true ||
      data.host === true;

    if (isBlocked) {
      return res.status(403).json({ blocked: true });
    }

    res.status(200).json({ blocked: false });
  } catch (err) {
    console.error("VPN Check Error:", err);
    res.status(200).json({ blocked: false }); // fail open
  }
}
