import { useEffect, useRef } from "react";
import { ADSENSE_PUBLISHER_ID } from "../config";

// Google AdSense ad slot. Placeholder is shown until a valid publisher ID and slot ID are configured.
// Docs: https://support.google.com/adsense/answer/9274019
export default function AdSlot({ slot = "0000000000", format = "auto", layout, className = "" }) {
  const ref = useRef(null);
  const configured = ADSENSE_PUBLISHER_ID && !ADSENSE_PUBLISHER_ID.includes("8946799794760149");

  useEffect(() => {
    if (!configured) return;
    try {
      // eslint-disable-next-line no-undef
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) {
      // ignore double-push in dev
    }
  }, [configured]);

  if (!configured) {
    return (
      <div className={`ad-slot ad-placeholder ${className}`} data-testid="ad-slot-placeholder">
        <span>Advertisement</span>
        <small>Configure ADSENSE_PUBLISHER_ID in src/config.js to enable ads.</small>
      </div>
    );
  }

  return (
    <div className={`ad-slot ${className}`} data-testid="ad-slot">
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout={layout}
        data-full-width-responsive="true"
      />
    </div>
  );
}
