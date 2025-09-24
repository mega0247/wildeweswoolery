// /pages/api/vpn-check.js
export default async function handler(req, res) {
  try {
    // ✅ Get real client IP (Vercel-aware)
    const clientIP =
      req.headers["x-real-ip"] ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "";

    if (!clientIP) {
      return res.status(200).json({ blocked: false, reason: "No IP found" });
    }

    // ✅ Call IPQualityScore API
    const response = await fetch(
      `https://ipqualityscore.com/api/json/ip/<YOUR_API_KEY>/${clientIP}`
    );
    const data = await response.json();

    console.log("🔎 IPQS Response:", data);

    // ✅ Block ONLY if VPN/Proxy/Tor is true (ignore fraud score)
    if (data.vpn || data.proxy || data.tor) {
      return res.status(200).json({
        blocked: true,
        reason: "VPN/Proxy/Tor detected",
        data,
      });
    }

    // ✅ Allow everything else (even if fraud_score is high)
    return res.status(200).json({
      blocked: false,
      reason: "Clean IP",
      data,
    });
  } catch (error) {
    console.error("VPN Check Error:", error);
    return res.status(200).json({ blocked: false, reason: "API error" });
  }
}
