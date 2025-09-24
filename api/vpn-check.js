// File: /api/vpn-check.js
export default async function handler(req, res) {
  try {
    const clientIP =
      req.headers["x-real-ip"] ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "";

    if (!clientIP) {
      return res.status(200).json({ blocked: false, reason: "no-ip" });
    }

    const API_KEY = process.env.IPQS_API_KEY;
    if (!API_KEY) {
      console.error("❌ IPQS API key not set!");
      return res.status(200).json({ blocked: false, reason: "no-api-key" });
    }

    const url = `https://ipqualityscore.com/api/json/ip/${API_KEY}/${clientIP}?strictness=1`;
    const response = await fetch(url);
    const data = await response.json();

    console.log("🔎 VPN Check:", { clientIP, data });

    // ✅ Block ONLY if IPQS confirms VPN, Proxy, or Tor.
    const isBlocked = data.vpn === true || data.proxy === true || data.tor === true;

    res.status(200).json({
      blocked: isBlocked,
      reason: isBlocked ? "vpn-proxy-tor" : "clean",
      data,
    });
  } catch (err) {
    console.error("VPN Check Error:", err);
    res.status(200).json({ blocked: false, reason: "error" });
  }
}
