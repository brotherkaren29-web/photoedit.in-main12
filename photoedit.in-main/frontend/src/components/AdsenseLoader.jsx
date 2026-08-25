import { useEffect } from "react";
import { ADSENSE_PUBLISHER_ID } from "../config";

// Injects Google AdSense loader + ownership meta tag when a real publisher ID is configured
// in src/config.js. While the placeholder ID is in place, nothing is added to the DOM (so we
// don't produce 4xx requests to pagead2.googlesyndication.com during development).
export default function AdsenseLoader() {
  useEffect(() => {
    if (!ADSENSE_PUBLISHER_ID || ADSENSE_PUBLISHER_ID.includes("8946799794760149")) return;

    // Ownership verification meta tag (idempotent)
    if (!document.querySelector('meta[name="google-adsense-account"]')) {
      const meta = document.createElement("meta");
      meta.name = "google-adsense-account";
      meta.content = ADSENSE_PUBLISHER_ID;
      document.head.appendChild(meta);
    }

    // Loader script (idempotent — check by data attribute)
    const existing = document.querySelector('script[data-adsense-loader="1"]');
    if (existing) return;
    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`;
    script.setAttribute("data-adsense-loader", "1");
    document.head.appendChild(script);
  }, []);

  return null;
}
