export default async function handler(req, res) {
  try {
    // Better IP detection behind Vercel/CDN
    const clientIP =
      req.headers['x-real-ip'] ||
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket.remoteAddress ||
      '';

    if (!clientIP) {
      return res.status(200).json({ blocked: false });
    }

    // Use IPAPI to check VPN/proxy (or consider IPQualityScore for better coverage)
    const response = await fetch(`https://ipapi.co/${clientIP}/json/`);
    const data = await response.json();

    if (data.proxy === true) {
      return res.status(403).json({ blocked: true });
    }

    res.status(200).json({ blocked: false });
  } catch (err) {
    console.error("VPN Check Error:", err);
    res.status(200).json({ blocked: false }); // fallback allow
  }
}
