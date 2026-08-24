import { useCallback, useEffect, useState } from "react";

// Manages named drafts + a single rolling auto-save slot in browser localStorage.
// Storage layout:
//   photoedit_drafts_v2 -> [{ id, name, data, w, h, savedAt }]
//   photoedit_autosave_v1 -> { data, w, h, savedAt }
// Also migrates the legacy `photoedit_draft_v1` single-slot into the auto-save slot.

const DRAFTS_KEY = "photoedit_drafts_v2";
const AUTOSAVE_KEY = "photoedit_autosave_v1";
const LEGACY_KEY = "photoedit_draft_v1";
const MAX_DRAFTS = 20;
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // ignore banner for autosaves older than 7 days

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) { return fallback; }
};
const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (_) { return false; }
};

export default function useDraft() {
  const [drafts, setDrafts] = useState([]);
  const [autosaveBanner, setAutosaveBanner] = useState(null);

  // Load + migrate on mount
  useEffect(() => {
    let list = read(DRAFTS_KEY, []);
    const legacy = read(LEGACY_KEY, null);
    if (legacy && legacy.data) {
      // Move legacy single draft into autosave slot.
      write(AUTOSAVE_KEY, { ...legacy, savedAt: legacy.savedAt || new Date().toISOString() });
      try { localStorage.removeItem(LEGACY_KEY); } catch (_) {}
    }
    setDrafts(list);

    const auto = read(AUTOSAVE_KEY, null);
    if (auto && auto.data) {
      const age = Date.now() - new Date(auto.savedAt).getTime();
      if (age < MAX_AGE_MS) setAutosaveBanner(auto);
    }
  }, []);

  const persist = useCallback((next) => {
    write(DRAFTS_KEY, next);
    setDrafts(next);
  }, []);

  const saveNamed = useCallback((name, payload) => {
    const cleanName = (name || "").trim() || `Untitled draft ${drafts.length + 1}`;
    const item = {
      id: `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      name: cleanName,
      data: payload.data,
      w: payload.w,
      h: payload.h,
      savedAt: new Date().toISOString(),
    };
    // Try to save; if quota is hit, drop the oldest drafts one by one until it fits.
    let candidate = [item, ...drafts].slice(0, MAX_DRAFTS);
    while (candidate.length > 0) {
      if (write(DRAFTS_KEY, candidate)) {
        setDrafts(candidate);
        return { ok: true, item, dropped: (drafts.length + 1) - candidate.length };
      }
      // Remove oldest (last in list) and retry
      candidate = candidate.slice(0, -1);
    }
    return { ok: false, error: "quota" };
  }, [drafts]);

  const remove = useCallback((id) => {
    persist(drafts.filter((d) => d.id !== id));
  }, [drafts, persist]);

  const rename = useCallback((id, name) => {
    persist(drafts.map((d) => (d.id === id ? { ...d, name: name.trim() || d.name } : d)));
  }, [drafts, persist]);

  const saveAuto = useCallback((payload) => {
    write(AUTOSAVE_KEY, { ...payload, savedAt: new Date().toISOString() });
  }, []);

  const dismissAutosave = useCallback(() => setAutosaveBanner(null), []);
  const discardAutosave = useCallback(() => {
    try { localStorage.removeItem(AUTOSAVE_KEY); } catch (_) {}
    setAutosaveBanner(null);
  }, []);

  return { drafts, saveNamed, remove, rename, saveAuto, autosaveBanner, dismissAutosave, discardAutosave };
}
