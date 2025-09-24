export default async function handler(req, res) {
  try {
    const clientIP =
      req.headers["x-real-ip"] ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "";

    if (!clientIP) return res.status(200).json({ blocked: false });

    const API_KEY = process.env.IPQS_API_KEY;
    if (!API_KEY) return res.status(200).json({ blocked: false });

    const url = `https://ipqualityscore.com/api/json/ip/${API_KEY}/${clientIP}?strictness=1&allow_public_access_points=true`;

    const response = await fetch(url);
    const data = await response.json();

    const isBlocked =
      data.vpn === true ||
      data.proxy === true ||
      data.tor === true ||
      data.host === true ||
      data.fraud_score > 75;

    res.status(200).json({ blocked: isBlocked });
  } catch (err) {
    console.error("VPN Check Error:", err);
    res.status(200).json({ blocked: false });
  }
}
