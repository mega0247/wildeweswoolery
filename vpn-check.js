export default async function handler(req, res) {
  try {
    const clientIP =
      req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

    // Use IPAPI to check if IP is a VPN/proxy
    const response = await fetch(`https://ipapi.co/${clientIP}/json/`);
    const data = await response.json();

    if (data.proxy === true) {
      return res.status(403).json({ blocked: true });
    }

    res.status(200).json({ blocked: false });
  } catch (err) {
    console.error("VPN Check Error:", err);
    res.status(500).json({ blocked: false }); // fallback allow
  }
}
