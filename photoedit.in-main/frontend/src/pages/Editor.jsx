import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "@/App.css";
import "@/responsive.css";
import "@/site.css";
import {
  Download, FolderOpen, Undo2, Redo2, Search, ZoomIn, ZoomOut, Maximize2,
  MousePointer2, Move, Crop, Paintbrush, Eraser, Type, Square, Circle, Pipette,
  Hand, SlidersHorizontal, Eye, Lock, MoreHorizontal, Plus, ChevronDown,
  Image as ImageIcon, ArrowUpRight, Highlighter, ScanLine, RotateCw, RotateCcw,
  ClipboardPaste, MonitorUp, FlipHorizontal, FlipVertical, PaintBucket,
  FileImage, Trash2, Home as HomeIcon, Save, FolderClock, Pencil, X, Package,
} from "lucide-react";
import JSZip from "jszip";
import AdSlot from "../components/AdSlot";
import useDraft from "../hooks/useDraft";
import usePinchZoom from "../hooks/usePinchZoom";

const AUTOSAVE_INTERVAL_MS = 60 * 1000;

const sampleImage = "https://images.unsplash.com/photo-1604871000636-074fa5117945?crop=entropy&cs=srgb&fm=jpg&q=85";
const tools = [
  ["move", Move, "Move"], ["select", MousePointer2, "Select"],
  ["crop", Crop, "Crop (drag rectangle)"], ["resize", Maximize2, "Resize"],
  ["brush", Paintbrush, "Pen / draw"], ["eraser", Eraser, "Eraser"],
  ["arrow", ArrowUpRight, "Arrow"], ["highlight", Highlighter, "Highlight"],
  ["shape", Square, "Rectangle"], ["ellipse", Circle, "Circle"],
  ["text", Type, "Text (click to place)"], ["blur", ScanLine, "Blur / pixelate"],
  ["fill", PaintBucket, "Fill canvas"], ["picker", Pipette, "Color picker"],
  ["hand", Hand, "Pan"],
];
const NEEDS_COLOR = ["brush", "arrow", "shape", "ellipse", "highlight", "text", "fill"];
const NEEDS_SIZE = ["brush", "eraser", "arrow", "shape", "ellipse"];
const FONT_OPTIONS = [
  { label: "Manrope Sans", value: "Manrope, sans-serif" },
  { label: "Serif (Georgia)", value: "Georgia, serif" },
  { label: "Mono", value: "'JetBrains Mono', ui-monospace, monospace" },
  { label: "Handwriting", value: "'Comic Sans MS', 'Marker Felt', cursive" },
  { label: "Impact", value: "Impact, 'Arial Black', sans-serif" },
  { label: "Elegant", value: "'Times New Roman', serif" },
];

export default function Editor() {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const stageRef = useRef(null);
  const fileRef = useRef(null);
  const screenshotRef = useRef(null);
  const drawingRef = useRef(false);
  const startPointRef = useRef(null);
  const mergedSnapshotRef = useRef(null);
  const snapshotImageRef = useRef(null);
  const canvasHistoryRef = useRef([]);
  const canvasRedoRef = useRef([]);
  const panRef = useRef(null); // { x, y, scrollLeft, scrollTop } for move/hand tool

  const [image, setImage] = useState(sampleImage);
  const [tool, setTool] = useState("move");
  const [zoom, setZoom] = useState(66);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [filter, setFilter] = useState("none");
  const [color, setColor] = useState("#ff4d6d");
  const [recentColors, setRecentColors] = useState(["#ff4d6d", "#6aa6ff", "#c9f269", "#ffffff", "#111827", "#ffb020"]);
  const [size, setSize] = useState(5);
  const [textSize, setTextSize] = useState(32);
  const [textFont, setTextFont] = useState(FONT_OPTIONS[0].value);
  const [shapeFill, setShapeFill] = useState(false);
  const [activeText, setActiveText] = useState(null); // { id?, x, y, text, original? }
  const [textObjects, setTextObjects] = useState([]); // committed text layers (editable)
  const [spacePan, setSpacePan] = useState(false);
  const textDragRef = useRef(null); // { offsetX, offsetY }
  const [layers, setLayers] = useState(["Sunset landscape", "Background"]);
  const [activeLayer, setActiveLayer] = useState(0);
  const [dims, setDims] = useState({ w: 900, h: 600 });
  const [history, setHistory] = useState(["Opened image", "Canvas ready"]);
  const [showAdjust, setShowAdjust] = useState(true);
  const [activeTab, setActiveTab] = useState("layers");
  const [activeMenu, setActiveMenu] = useState(null);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [rubberBand, setRubberBand] = useState(null); // {x,y,w,h} for crop overlay
  const [pan, setPan] = useState({ x: 0, y: 0 }); // move-tool position offset in CSS pixels
  const [saveToast, setSaveToast] = useState("");
  const [autosavedAt, setAutosavedAt] = useState(null);
  const [hoverDraft, setHoverDraft] = useState(null); // { item, top }

  // Draft & multi-touch hooks
  const draft = useDraft();
  const gesture = usePinchZoom({
    stageRef,
    zoom,
    setZoom,
    onGestureStart: () => { drawingRef.current = false; setRubberBand(null); },
  });

  // Trackpad pinch / Ctrl+wheel = zoom, plain wheel = normal scroll of the stage.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const step = Math.max(2, Math.min(15, Math.abs(e.deltaY) * 0.15));
        setZoom((z) => Math.min(200, Math.max(25, Math.round(z + (e.deltaY < 0 ? step : -step)))));
      }
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const filterString = () => {
    const extra = filter === "grayscale" ? "grayscale(1)" : filter === "sepia" ? "sepia(1)" : filter === "invert" ? "invert(1)" : "";
    return `brightness(${brightness}%) contrast(${contrast}%) ${extra}`.trim();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const nw = img.naturalWidth || 900;
      const nh = img.naturalHeight || 600;
      const scale = Math.min(1, 1600 / Math.max(nw, nh));
      const w = Math.max(1, Math.round(nw * scale));
      const h = Math.max(1, Math.round(nh * scale));
      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      const data = canvas.toDataURL("image/png");
      mergedSnapshotRef.current = data;
      snapshotImageRef.current = image;
      canvasHistoryRef.current = [data];
      canvasRedoRef.current = [];
      setDims({ w, h });
      setPan({ x: 0, y: 0 });
    };
    img.src = image;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  const pushRecentColor = (hex) => {
    const c = (hex || "").toLowerCase();
    if (!/^#[0-9a-f]{6}$/.test(c)) return;
    setRecentColors((old) => {
      const next = [c, ...old.filter((x) => x.toLowerCase() !== c)];
      return next.slice(0, 6);
    });
  };
  const applyColor = (hex) => { setColor(hex); pushRecentColor(hex); };

  const record = (label) => setHistory((old) => [label, ...old].slice(0, 12));

  const canvasPayload = () => {
    // Store a compressed JPEG copy so many drafts fit into the ~5MB localStorage quota.
    // Bake any live text layers into the copy so the draft looks exactly like what the user sees.
    const canvas = canvasRef.current;
    const maxEdge = 1200;
    const scale = Math.min(1, maxEdge / Math.max(canvas.width, canvas.height));
    const w = Math.max(1, Math.round(canvas.width * scale));
    const h = Math.max(1, Math.round(canvas.height * scale));
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const octx = off.getContext("2d");
    octx.fillStyle = "#ffffff";
    octx.fillRect(0, 0, w, h);
    octx.drawImage(canvas, 0, 0, w, h);
    paintTexts(octx, scale);
    return {
      data: off.toDataURL("image/jpeg", 0.72),
      w: canvas.width,
      h: canvas.height,
    };
  };

  const toast = (text) => {
    setSaveToast(text);
    setTimeout(() => setSaveToast(""), 2200);
  };

  const saveDraft = () => {
    const name = window.prompt("Name this draft", `Untitled draft ${draft.drafts.length + 1}`);
    if (name === null) return; // cancelled
    const result = draft.saveNamed(name, canvasPayload());
    if (!result.ok) { toast("Draft too large to save"); return; }
    if (result.dropped > 0) {
      toast(`Saved "${result.item.name}" · ${result.dropped} older draft(s) removed to fit`);
    } else {
      toast(`Saved "${result.item.name}"`);
    }
    record(`Saved draft "${result.item.name}"`);
  };

  const loadDraft = (item) => {
    setImage(item.data);
    setLayers([`Draft · ${item.name}`, "Background"]);
    setActiveLayer(0);
    record(`Opened draft "${item.name}"`);
    toast(`Opened "${item.name}"`);
  };

  const renameDraft = (item) => {
    const name = window.prompt("New name for this draft", item.name);
    if (name === null || !name.trim()) return;
    draft.rename(item.id, name);
  };

  const safeFileName = (name) => name.replace(/[^\w\-. ]+/g, "_").replace(/\s+/g, "-").slice(0, 80) || "draft";

  const exportAllDrafts = async () => {
    if (draft.drafts.length === 0) { toast("No drafts to export yet"); return; }
    toast(`Packing ${draft.drafts.length} draft(s)…`);
    const zip = new JSZip();
    const used = new Map();
    const summary = [];
    for (const item of draft.drafts) {
      const [meta, b64] = item.data.split(",");
      const ext = meta.includes("jpeg") ? "jpg" : meta.includes("png") ? "png" : "img";
      let base = safeFileName(item.name);
      const key = `${base}.${ext}`;
      const count = (used.get(key) || 0) + 1;
      used.set(key, count);
      const fname = count > 1 ? `${base}-${count}.${ext}` : key;
      zip.file(fname, b64, { base64: true });
      summary.push(`${fname}\t${item.w}x${item.h}\t${item.savedAt}`);
    }
    zip.file("drafts-manifest.txt",
      `photoedit.in drafts export\nGenerated: ${new Date().toISOString()}\nCount: ${draft.drafts.length}\n\n` + summary.join("\n") + "\n");
    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
    const link = document.createElement("a");
    link.download = `photoedit-drafts-${new Date().toISOString().slice(0, 10)}.zip`;
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 4000);
    toast(`Downloaded ${draft.drafts.length} draft(s)`);
    record(`Exported ${draft.drafts.length} draft(s) as ZIP`);
  };

  const showHover = (item, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoverDraft({ item, top: rect.top, right: rect.left });
  };
  const hideHover = () => setHoverDraft(null);

  const restoreAutosave = () => {
    const auto = draft.autosaveBanner;
    if (!auto) return;
    setImage(auto.data);
    setLayers(["Restored auto-save", "Background"]);
    setActiveLayer(0);
    draft.dismissAutosave();
    record("Restored auto-save");
  };

  // Auto-save every minute — silently overwrites the auto-save slot only if the user has edited something.
  useEffect(() => {
    const id = setInterval(() => {
      if (canvasHistoryRef.current.length <= 1) return; // no edits yet
      try {
        draft.saveAuto(canvasPayload());
        setAutosavedAt(new Date());
      } catch (_) {}
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(id);
    // draft.saveAuto is stable (useCallback), but the whole `draft` object is not — depend on the memoized fn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.saveAuto]);

  const restoreSnapshot = (data) => {
    if (!data) return;
    const img = new window.Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      mergedSnapshotRef.current = data;
      setDims({ w: img.width, h: img.height });
    };
    img.src = data;
  };

  const commitSnapshot = (label) => {
    const data = canvasRef.current.toDataURL("image/png");
    mergedSnapshotRef.current = data;
    canvasHistoryRef.current = [...canvasHistoryRef.current, data].slice(-30);
    canvasRedoRef.current = [];
    record(label);
  };

  const undo = () => {
    if (canvasHistoryRef.current.length < 2) return;
    const current = canvasHistoryRef.current.pop();
    canvasRedoRef.current.push(current);
    restoreSnapshot(canvasHistoryRef.current[canvasHistoryRef.current.length - 1]);
    record("Undo");
  };
  const redo = () => {
    const next = canvasRedoRef.current.pop();
    if (!next) return;
    canvasHistoryRef.current.push(next);
    restoreSnapshot(next);
    record("Redo");
  };

  const canvasScale = Math.min(zoom / 66, viewportWidth < 900 ? Math.max(0.3, (viewportWidth - 70) / 900) : zoom / 66);

  const openFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
    setLayers([file.name, "Background"]);
    setActiveLayer(0);
    record(`Opened ${file.name}`);
  };
  const openScreenshot = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
    setLayers([`Screenshot · ${file.name}`, "Background"]);
    setActiveLayer(0);
    record(`Opened screenshot · ${file.name}`);
  };
  const newDocument = () => {
    const w = 1200, h = 800;
    const off = document.createElement("canvas");
    off.width = w; off.height = h;
    const octx = off.getContext("2d");
    octx.fillStyle = "#ffffff";
    octx.fillRect(0, 0, w, h);
    setImage(off.toDataURL("image/png"));
    setLayers(["Blank canvas", "Background"]);
    setActiveLayer(0);
    record("New blank document");
  };

  const bakeAndDownload = (mime, ext) => {
    const canvas = canvasRef.current;
    const off = document.createElement("canvas");
    off.width = canvas.width; off.height = canvas.height;
    const octx = off.getContext("2d");
    if (mime === "image/jpeg") { octx.fillStyle = "#ffffff"; octx.fillRect(0, 0, off.width, off.height); }
    octx.filter = filterString();
    octx.drawImage(canvas, 0, 0);
    octx.filter = "none";
    paintTexts(octx, 1);
    const link = document.createElement("a");
    link.download = `photoedit-export.${ext}`;
    link.href = off.toDataURL(mime, 0.92);
    link.click();
    record(`Exported ${ext.toUpperCase()}`);
  };
  const exportPNG = () => bakeAndDownload("image/png", "png");
  const exportJPG = () => bakeAndDownload("image/jpeg", "jpg");

  const doResize = () => {
    const value = window.prompt("New width in pixels (200 - 4000). Height auto-scales.", String(canvasRef.current.width));
    const w = Number(value);
    if (!(w >= 200 && w <= 4000)) return;
    flattenTextsToCanvas();
    const canvas = canvasRef.current;
    const ratio = canvas.height / canvas.width;
    const h = Math.round(w * ratio);
    const off = document.createElement("canvas");
    off.width = w; off.height = h;
    off.getContext("2d").drawImage(canvas, 0, 0, w, h);
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d").drawImage(off, 0, 0);
    setDims({ w, h });
    commitSnapshot(`Resized to ${w}px`);
  };

  const applyCropRect = (rect) => {
    flattenTextsToCanvas();
    const canvas = canvasRef.current;
    const sx = Math.max(0, Math.round(rect.x));
    const sy = Math.max(0, Math.round(rect.y));
    const sw = Math.min(canvas.width - sx, Math.round(rect.w));
    const sh = Math.min(canvas.height - sy, Math.round(rect.h));
    if (sw < 4 || sh < 4) return;
    const off = document.createElement("canvas");
    off.width = sw; off.height = sh;
    off.getContext("2d").drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
    canvas.width = sw; canvas.height = sh;
    canvas.getContext("2d").drawImage(off, 0, 0);
    setDims({ w: sw, h: sh });
    commitSnapshot(`Cropped to ${sw}×${sh}`);
  };

  const commitText = () => {
    if (!activeText) return;
    const value = (activeText.text || "").trim();
    if (!value) { setActiveText(null); return; }
    const obj = {
      id: activeText.id || `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      x: activeText.x,
      y: activeText.y,
      text: value,
      color,
      size: textSize,
      font: textFont,
    };
    setTextObjects((old) => [...old, obj]);
    setActiveText(null);
    record(`Text: "${value.slice(0, 24)}${value.length > 24 ? "…" : ""}"`);
  };

  const cancelText = () => {
    // Restore original object if we were re-editing an existing one.
    if (activeText && activeText.original) {
      setTextObjects((old) => [...old, activeText.original]);
    }
    setActiveText(null);
  };

  const startEditText = (obj) => {
    // Pull the object out of textObjects and open it in the live overlay.
    setTextObjects((old) => old.filter((t) => t.id !== obj.id));
    setActiveText({ id: obj.id, x: obj.x, y: obj.y, text: obj.text, original: obj });
    setColor(obj.color);
    setTextSize(obj.size);
    setTextFont(obj.font);
    setTool("text");
  };

  // Draw every committed text object onto a canvas ctx. Used to flatten before destructive ops
  // (rotate/crop/resize/filter) and when producing an export or draft image.
  const paintTexts = (ctx, scale = 1) => {
    textObjects.forEach((t) => {
      ctx.save();
      ctx.font = `bold ${t.size * scale}px ${t.font}`;
      ctx.fillStyle = t.color;
      ctx.textBaseline = "alphabetic";
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 4 * scale;
      ctx.fillText(t.text, t.x * scale, t.y * scale);
      ctx.restore();
    });
  };

  // Bake all live text layers into the main canvas pixels, then clear the layer list.
  const flattenTextsToCanvas = () => {
    if (textObjects.length === 0) return;
    paintTexts(canvasRef.current.getContext("2d"), 1);
    setTextObjects([]);
  };

  const startTextDrag = (event) => {
    if (!activeText) return;
    event.stopPropagation();
    const overlay = event.currentTarget.closest(".text-overlay");
    if (!overlay) return;
    const box = overlay.getBoundingClientRect();
    textDragRef.current = { dx: event.clientX - box.left, dy: event.clientY - box.top };
    try { overlay.setPointerCapture(event.pointerId); } catch (_) {}
    // Attach live drag listeners at window level so movement outside the handle still tracks.
    const onMove = (e) => dragText(e);
    const onUp = (e) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      textDragRef.current = null;
      try { overlay.releasePointerCapture(e.pointerId); } catch (_) {}
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };
  const dragText = (event) => {
    if (!activeText || !textDragRef.current) return;
    const canvas = canvasRef.current;
    const wrapRect = canvas.getBoundingClientRect();
    const nx = ((event.clientX - textDragRef.current.dx) - wrapRect.left) / wrapRect.width * canvas.width;
    const ny = ((event.clientY - textDragRef.current.dy) - wrapRect.top) / wrapRect.height * canvas.height + textSize;
    setActiveText((t) => t ? { ...t, x: Math.max(0, Math.min(canvas.width, nx)), y: Math.max(textSize, Math.min(canvas.height, ny)) } : t);
  };

  // Cancel any open text overlay on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (!activeText) return;
      if (e.key === "Escape") { cancelText(); }
      if (e.key === "Enter" && !e.shiftKey && document.activeElement?.tagName === "INPUT") {
        e.preventDefault();
        commitText();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeText]);

  const rotate = (dir) => {
    flattenTextsToCanvas();
    const canvas = canvasRef.current;
    const w = canvas.width, h = canvas.height;
    const off = document.createElement("canvas");
    off.width = h; off.height = w;
    const octx = off.getContext("2d");
    octx.translate(h / 2, w / 2);
    octx.rotate((dir === "cw" ? 1 : -1) * Math.PI / 2);
    octx.drawImage(canvas, -w / 2, -h / 2);
    canvas.width = h; canvas.height = w;
    canvas.getContext("2d").drawImage(off, 0, 0);
    setDims({ w: h, h: w });
    commitSnapshot(`Rotated 90° ${dir === "cw" ? "CW" : "CCW"}`);
  };

  const flip = (axis) => {
    flattenTextsToCanvas();
    const canvas = canvasRef.current;
    const off = document.createElement("canvas");
    off.width = canvas.width; off.height = canvas.height;
    const octx = off.getContext("2d");
    if (axis === "h") { octx.translate(canvas.width, 0); octx.scale(-1, 1); }
    else { octx.translate(0, canvas.height); octx.scale(1, -1); }
    octx.drawImage(canvas, 0, 0);
    canvas.getContext("2d").drawImage(off, 0, 0);
    commitSnapshot(`Flipped ${axis === "h" ? "horizontal" : "vertical"}`);
  };

  const bakeFilter = (name) => {
    flattenTextsToCanvas();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (name === "blur" || name === "sharpen") {
      // Sharpen via convolution — Canvas2D has no built-in, so use a simple downscale/upscale for blur
      // and stack alpha blending for sharpen.
      if (name === "blur") {
        const off = document.createElement("canvas");
        off.width = Math.max(2, Math.round(canvas.width / 3));
        off.height = Math.max(2, Math.round(canvas.height / 3));
        off.getContext("2d").drawImage(canvas, 0, 0, off.width, off.height);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
      } else {
        // Poor-man's sharpen: increase contrast
        const off = document.createElement("canvas");
        off.width = canvas.width; off.height = canvas.height;
        const octx = off.getContext("2d");
        octx.filter = "contrast(140%) saturate(115%)";
        octx.drawImage(canvas, 0, 0);
        ctx.drawImage(off, 0, 0);
      }
    } else {
      const off = document.createElement("canvas");
      off.width = canvas.width; off.height = canvas.height;
      const octx = off.getContext("2d");
      const map = { grayscale: "grayscale(1)", sepia: "sepia(1)", invert: "invert(1)" };
      octx.filter = map[name];
      octx.drawImage(canvas, 0, 0);
      ctx.drawImage(off, 0, 0);
    }
    commitSnapshot(`Filter: ${name}`);
  };

  const changeTool = (name) => {
    setTool(name);
    setActiveMenu(null);
    record(`${name[0].toUpperCase() + name.slice(1)} tool`);
    if (name === "resize") doResize();
  };

  const pointFromEvent = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvasRef.current.width,
      y: ((event.clientY - rect.top) / rect.height) * canvasRef.current.height,
    };
  };

  // Space-bar hold pans the canvas — a Photopea shortcut. Doesn't interfere with typing in inputs.
  useEffect(() => {
    const isTyping = () => {
      const a = document.activeElement;
      return !!(a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.isContentEditable));
    };
    const onDown = (e) => {
      if (e.code === "Space" && !e.repeat && !isTyping()) {
        e.preventDefault();
        setSpacePan(true);
      }
    };
    const onUp = (e) => {
      if (e.code === "Space") setSpacePan(false);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", () => setSpacePan(false));
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  const onStagePointerDown = (event) => {
    // Pan when Move / Hand tool selected OR when the user is holding Space.
    if (!(spacePan || tool === "move" || tool === "hand")) return;
    panRef.current = {
      x: event.clientX,
      y: event.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
    };
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch (_) {}
  };
  const onStagePointerMove = (event) => {
    if (!panRef.current) return;
    const dx = event.clientX - panRef.current.x;
    const dy = event.clientY - panRef.current.y;
    setPan({ x: panRef.current.startPanX + dx, y: panRef.current.startPanY + dy });
  };
  const onStagePointerUp = (event) => {
    if (!panRef.current) return;
    panRef.current = null;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch (_) {}
  };
  const resetPan = () => setPan({ x: 0, y: 0 });

  const onPointerDown = (event) => {
    if (gesture.onDown(event)) return; // two-finger gesture consumed

    // Space-bar pan or Move/Hand tool: let the event bubble up to the stage handler.
    if (spacePan || tool === "move" || tool === "hand") return;

    const p = pointFromEvent(event);

    // Instant-action tools
    if (tool === "text") {
      // Open a live draggable text overlay at the click point. Overlay styles read directly from
      // the current color / textSize / textFont so changing those controls updates the live preview.
      pushRecentColor(color);
      setActiveText({ x: p.x, y: p.y, text: "" });
      return;
    }
    if (tool === "picker") {
      const ctx = canvasRef.current.getContext("2d", { willReadFrequently: true });
      const d = ctx.getImageData(Math.floor(p.x), Math.floor(p.y), 1, 1).data;
      const hex = "#" + [d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, "0")).join("");
      applyColor(hex);
      record(`Picked color ${hex}`);
      setTool("brush");
      return;
    }
    if (tool === "fill") {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      commitSnapshot("Filled canvas");
      return;
    }

    // Drag-based tools
    if (!["brush", "eraser", "arrow", "highlight", "shape", "ellipse", "blur", "crop"].includes(tool)) return;
    drawingRef.current = true;
    startPointRef.current = p;
    if (tool === "brush" || tool === "eraser") {
      const ctx = canvasRef.current.getContext("2d");
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (tool === "eraser") ctx.globalCompositeOperation = "destination-out";
    }
    if (tool === "crop") setRubberBand({ x: p.x, y: p.y, w: 0, h: 0 });
  };

  const onPointerMove = (event) => {
    if (gesture.onMove(event)) return; // gesture consumed
    if (!drawingRef.current) return;
    const p = pointFromEvent(event);
    if (tool === "brush" || tool === "eraser") {
      const ctx = canvasRef.current.getContext("2d");
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    } else if (tool === "crop") {
      const s = startPointRef.current;
      setRubberBand({ x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) });
    }
  };

  const onPointerUp = (event) => {
    if (gesture.onUp(event)) return; // gesture consumed / trailing finger
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const start = startPointRef.current;
    const end = pointFromEvent(event);
    const ctx = canvasRef.current.getContext("2d");

    if (tool === "brush" || tool === "eraser") {
      ctx.restore();
      commitSnapshot(tool === "eraser" ? "Erased" : "Brush stroke");
      return;
    }
    ctx.save();
    if (tool === "arrow") {
      ctx.strokeStyle = color; ctx.fillStyle = color;
      ctx.lineWidth = Math.max(3, size);
      ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const head = 12 + size * 1.5;
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - head * Math.cos(angle - Math.PI / 6), end.y - head * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(end.x - head * Math.cos(angle + Math.PI / 6), end.y - head * Math.sin(angle + Math.PI / 6));
      ctx.closePath(); ctx.fill();
    }
    if (tool === "shape" || tool === "ellipse") {
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = Math.max(2, size);
      const w = end.x - start.x, h = end.y - start.y;
      if (tool === "shape") {
        if (shapeFill) ctx.fillRect(start.x, start.y, w, h);
        else ctx.strokeRect(start.x, start.y, w, h);
      } else {
        ctx.beginPath();
        ctx.ellipse(start.x + w / 2, start.y + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
        if (shapeFill) ctx.fill();
        else ctx.stroke();
      }
    }
    if (tool === "highlight") {
      const hex = color.replace("#", "");
      const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
      ctx.fillStyle = `rgba(${r},${g},${b},0.35)`;
      ctx.fillRect(start.x, start.y, end.x - start.x, end.y - start.y);
    }
    if (tool === "blur") {
      const x = Math.min(start.x, end.x), y = Math.min(start.y, end.y);
      const w = Math.abs(end.x - start.x), h = Math.abs(end.y - start.y);
      if (w > 4 && h > 4) {
        const block = Math.max(6, Math.round(Math.min(w, h) / 14));
        const off = document.createElement("canvas");
        const sw = Math.max(1, Math.floor(w / block));
        const sh = Math.max(1, Math.floor(h / block));
        off.width = sw; off.height = sh;
        const octx = off.getContext("2d");
        octx.imageSmoothingEnabled = false;
        octx.drawImage(canvasRef.current, x, y, w, h, 0, 0, sw, sh);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(off, 0, 0, sw, sh, x, y, w, h);
        ctx.imageSmoothingEnabled = true;
      }
    }
    if (tool === "crop") {
      ctx.restore();
      const rect = { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), w: Math.abs(end.x - start.x), h: Math.abs(end.y - start.y) };
      setRubberBand(null);
      applyCropRect(rect);
      return;
    }
    ctx.restore();
    commitSnapshot(`${tool[0].toUpperCase() + tool.slice(1)} added`);
  };

  const pasteScreenshot = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((entry) => entry.startsWith("image/"));
        if (type) {
          const blob = await item.getType(type);
          setImage(URL.createObjectURL(blob));
          setLayers(["Pasted screenshot", "Background"]);
          record("Pasted screenshot");
          return;
        }
      }
      record("Clipboard has no image");
    } catch { record("Clipboard permission needed"); }
  };
  const captureScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();
      await new Promise((r) => setTimeout(r, 400));
      const cap = document.createElement("canvas");
      cap.width = video.videoWidth; cap.height = video.videoHeight;
      cap.getContext("2d").drawImage(video, 0, 0);
      stream.getTracks().forEach((t) => t.stop());
      setImage(cap.toDataURL("image/png"));
      setLayers(["Screen capture", "Background"]);
      record("Captured screen");
    } catch { record("Screen capture cancelled"); }
  };

  const clearCanvas = () => {
    if (!window.confirm("Clear everything on the canvas?")) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    commitSnapshot("Cleared canvas");
  };

  const menus = {
    File: [
      { label: "New blank canvas", action: newDocument, icon: FileImage },
      { label: "Open image…", action: () => fileRef.current.click(), icon: FolderOpen },
      { label: "Open screenshot…", action: () => screenshotRef.current.click(), icon: ImageIcon },
      { label: "Export as PNG", action: exportPNG, icon: Download },
      { label: "Export as JPG", action: exportJPG, icon: Download },
    ],
    Edit: [
      { label: "Undo", action: undo, icon: Undo2 },
      { label: "Redo", action: redo, icon: Redo2 },
      { label: "Clear canvas", action: clearCanvas, icon: Trash2 },
    ],
    Image: [
      { label: "Rotate 90° CW", action: () => rotate("cw"), icon: RotateCw },
      { label: "Rotate 90° CCW", action: () => rotate("ccw"), icon: RotateCcw },
      { label: "Flip horizontal", action: () => flip("h"), icon: FlipHorizontal },
      { label: "Flip vertical", action: () => flip("v"), icon: FlipVertical },
      { label: "Resize…", action: doResize, icon: Maximize2 },
    ],
    Layer: [
      { label: "New layer", action: () => { setLayers((l) => [`New layer ${l.length}`, ...l]); setActiveLayer(0); record("Created layer"); }, icon: Plus },
    ],
    Filter: [
      { label: "Grayscale", action: () => bakeFilter("grayscale") },
      { label: "Sepia", action: () => bakeFilter("sepia") },
      { label: "Invert", action: () => bakeFilter("invert") },
      { label: "Blur", action: () => bakeFilter("blur") },
      { label: "Sharpen", action: () => bakeFilter("sharpen") },
    ],
    View: [
      { label: "Fit to screen", action: () => { setZoom(66); resetPan(); }, icon: Maximize2 },
      { label: "100%", action: () => setZoom(100) },
      { label: "Zoom in", action: () => setZoom((z) => Math.min(200, z + 10)), icon: ZoomIn },
      { label: "Zoom out", action: () => setZoom((z) => Math.max(25, z - 10)), icon: ZoomOut },
    ],
  };

  return (
    <main className="editor-shell" data-testid="photoedit-editor">
      {draft.autosaveBanner && (
        <div className="draft-banner" data-testid="draft-restore-banner">
          <span>Auto-save found from earlier — restore it?</span>
          <div>
            <button className="btn-primary" data-testid="restore-draft-button" onClick={restoreAutosave}>Restore</button>
            <button className="btn-ghost" data-testid="discard-draft-button" onClick={draft.discardAutosave}>Discard</button>
          </div>
        </div>
      )}
      {saveToast && <div className="save-toast" data-testid="save-toast">{saveToast}</div>}
      {hoverDraft && (
        <div
          className="draft-hover-preview"
          data-testid="draft-hover-preview"
          style={{ top: Math.max(12, hoverDraft.top - 40), left: Math.max(12, hoverDraft.right - 340) }}
        >
          <div className="hover-preview-image" style={{ backgroundImage: `url(${hoverDraft.item.data})` }} />
          <div className="hover-preview-meta">
            <div className="hover-preview-name" data-testid="draft-hover-name">{hoverDraft.item.name}</div>
            <div className="hover-preview-sub">
              {hoverDraft.item.w}×{hoverDraft.item.h} · saved {new Date(hoverDraft.item.savedAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}
      <header className="topbar">
        <Link to="/" className="brand" data-testid="brand-logo">
          <span className="brand-mark">p</span>
          <span>photoedit<span className="brand-dot">.in</span></span>
        </Link>
        <nav className="menu" data-testid="main-menu">
          {Object.keys(menus).map((item) => (
            <div key={item} className="menu-wrap">
              <button data-testid={`${item.toLowerCase()}-menu-button`} onClick={() => setActiveMenu(activeMenu === item ? null : item)}>
                {item} <ChevronDown size={12} />
              </button>
              {activeMenu === item && (
                <div className="menu-dropdown" data-testid={`${item.toLowerCase()}-menu-dropdown`}>
                  {menus[item].map((entry) => (
                    <button
                      key={entry.label}
                      className="menu-item"
                      data-testid={`menu-item-${entry.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}
                      onClick={() => { entry.action(); setActiveMenu(null); }}
                    >
                      {entry.icon ? <entry.icon size={14} /> : <span className="menu-bullet" />}
                      <span>{entry.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="top-actions">
          <Link to="/" className="icon-button" data-testid="home-link" title="Go to home"><HomeIcon size={16} /></Link>
          <button className="icon-button" data-testid="undo-button" title="Undo" onClick={undo}><Undo2 size={16} /></button>
          <button className="icon-button" data-testid="redo-button" title="Redo" onClick={redo}><Redo2 size={16} /></button>
          <span className="divider" />
          <button className="icon-button capture-button" data-testid="paste-screenshot-button" title="Paste screenshot" onClick={pasteScreenshot}><ClipboardPaste size={16} /></button>
          <button className="icon-button capture-button" data-testid="capture-screen-button" title="Capture screen" onClick={captureScreen}><MonitorUp size={16} /></button>
          <button className="icon-button" data-testid="rotate-button" title="Rotate 90° CW" onClick={() => rotate("cw")}><RotateCw size={16} /></button>
          <button className="icon-button" data-testid="save-draft-button" title="Save draft to this browser" onClick={saveDraft}><Save size={16} /></button>
          <button className="secondary-button screenshot-button" data-testid="edit-screenshot-button" onClick={() => screenshotRef.current.click()}><ImageIcon size={15} /> Edit screenshot</button>
          <button className="secondary-button" data-testid="open-image-button" onClick={() => fileRef.current.click()}><FolderOpen size={15} /> Open</button>
          <button className="primary-button" data-testid="export-button" onClick={exportPNG}><Download size={15} /> Export</button>
          <input ref={fileRef} data-testid="image-file-input" type="file" accept="image/*" onChange={openFile} hidden />
          <input ref={screenshotRef} data-testid="screenshot-file-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={openScreenshot} hidden />
        </div>
      </header>
      <div className="optionsbar">
        <div className="tool-context">
          <span className="context-icon"><SlidersHorizontal size={14} /></span>
          <b data-testid="active-tool-label">{tool[0].toUpperCase() + tool.slice(1)}</b>
        </div>
        {NEEDS_COLOR.includes(tool) && (
          <label className="option-color" data-testid="color-control">
            <span>Color</span>
            <input type="color" value={color} onChange={(e) => applyColor(e.target.value)} data-testid="color-input" />
            <span className="value-chip" data-testid="color-value">{color.toUpperCase()}</span>
            <span className="swatch-row" data-testid="recent-colors">
              {recentColors.map((c, i) => (
                <button
                  key={`${c}-${i}`}
                  type="button"
                  className={`swatch ${c.toLowerCase() === color.toLowerCase() ? "selected" : ""}`}
                  style={{ background: c }}
                  data-testid={`swatch-${i}`}
                  aria-label={`Use ${c}`}
                  title={c}
                  onClick={() => applyColor(c)}
                />
              ))}
            </span>
          </label>
        )}
        {NEEDS_SIZE.includes(tool) && (
          <label className="option-size" data-testid="size-control">
            <span>Size</span>
            <input type="range" min="1" max="60" value={size} onChange={(e) => setSize(Number(e.target.value))} data-testid="size-input" className="range" />
            <span className="value-chip" data-testid="size-value">{size}px</span>
          </label>
        )}
        {tool === "text" && (
          <>
            <label className="option-size" data-testid="text-size-control">
              <span>Text size</span>
              <input type="range" min="10" max="140" value={textSize} onChange={(e) => setTextSize(Number(e.target.value))} data-testid="text-size-input" className="range" />
              <span className="value-chip" data-testid="text-size-value">{textSize}px</span>
            </label>
            <label className="option-font" data-testid="text-font-control">
              <span>Font</span>
              <select value={textFont} onChange={(e) => setTextFont(e.target.value)} data-testid="text-font-select">
                {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </label>
          </>
        )}
        {(tool === "shape" || tool === "ellipse") && (
          <label className="option-toggle" data-testid="shape-fill-control">
            <input type="checkbox" checked={shapeFill} onChange={(e) => setShapeFill(e.target.checked)} data-testid="shape-fill-input" />
            <span>Filled</span>
          </label>
        )}
        {tool === "crop" && <span className="option-label" data-testid="crop-hint">Drag a rectangle on the canvas to crop</span>}
        {tool === "text" && <span className="option-label" data-testid="text-hint">Click on the canvas to place text</span>}
        {tool === "fill" && <span className="option-label" data-testid="fill-hint">Click to fill canvas with color</span>}
        {tool === "picker" && <span className="option-label" data-testid="picker-hint">Click on canvas to sample color</span>}
        <span className="divider" />
        <button className="option-button" data-testid="fit-canvas-button" onClick={() => { setZoom(66); resetPan(); }}><Maximize2 size={14} /> Fit canvas</button>
        <span className="zoom-readout" data-testid="zoom-value">{zoom}%</span>
      </div>
      <section className="workspace">
        <aside className="tool-rail" data-testid="tools-panel">
          {tools.map(([name, Icon, label]) => (
            <button key={name} data-testid={`tool-${name}-button`} title={label} className={`tool-button ${tool === name ? "selected" : ""}`} onClick={() => changeTool(name)}>
              <Icon size={18} />
            </button>
          ))}
          <div className="rail-spacer" />
          <div className="color-stack" title="Current color" data-testid="color-swatch">
            <span style={{ background: color }} />
            <i style={{ background: "#ffffff" }} />
          </div>
        </aside>
        <div className="canvas-zone">
          <div className="canvas-heading">
            <div>
              <span className="eyebrow">EDITOR / UNTITLED</span>
              <h1 data-testid="document-title">Untitled document</h1>
            </div>
            <div className="canvas-actions">
              <button className="canvas-action" data-testid="search-button"><Search size={15} /></button>
              <button className="canvas-action" data-testid="zoom-out-button" onClick={() => setZoom(Math.max(25, zoom - 10))}><ZoomOut size={15} /></button>
              <button className="canvas-action" data-testid="zoom-in-button" onClick={() => setZoom(Math.min(200, zoom + 10))}><ZoomIn size={15} /></button>
            </div>
          </div>
          <div
            className="canvas-stage"
            data-testid="canvas-stage"
            ref={stageRef}
            style={{ cursor: (spacePan || tool === "move" || tool === "hand") ? "grab" : undefined }}
            onPointerDown={onStagePointerDown}
            onPointerMove={onStagePointerMove}
            onPointerUp={onStagePointerUp}
            onPointerCancel={onStagePointerUp}
          >
            <div
              className="canvas-wrap"
              style={{
                "--canvas-scale": canvasScale,
                "--pan-x": `${pan.x}px`,
                "--pan-y": `${pan.y}px`,
                width: `${dims.w}px`,
                height: `${dims.h}px`,
              }}
            >
              <canvas
                ref={canvasRef}
                data-testid="editor-canvas"
                style={{
                  filter: filterString(),
                  cursor:
                    tool === "picker" ? "crosshair" :
                    (tool === "hand" || tool === "move") ? (panRef.current ? "grabbing" : "grab") :
                    "crosshair",
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
                onPointerCancel={onPointerUp}
              />
              {rubberBand && (
                <div
                  ref={overlayRef}
                  className="crop-overlay"
                  data-testid="crop-overlay"
                  style={{
                    left: `${(rubberBand.x / dims.w) * 100}%`,
                    top: `${(rubberBand.y / dims.h) * 100}%`,
                    width: `${(rubberBand.w / dims.w) * 100}%`,
                    height: `${(rubberBand.h / dims.h) * 100}%`,
                  }}
                />
              )}
              {textObjects.map((t) => (
                <div
                  key={t.id}
                  className="text-layer"
                  data-testid={`text-layer-${t.id}`}
                  style={{
                    left: `${(t.x / dims.w) * 100}%`,
                    top: `${((t.y - t.size) / dims.h) * 100}%`,
                    color: t.color,
                    fontFamily: t.font,
                    fontSize: `${t.size}px`,
                    fontWeight: 700,
                    pointerEvents: spacePan ? "none" : "auto",
                  }}
                  title="Click to re-edit"
                  onClick={(e) => { e.stopPropagation(); startEditText(t); }}
                >{t.text}</div>
              ))}
              {activeText && (
                <div
                  className="text-overlay"
                  data-testid="active-text-overlay"
                  style={{
                    left: `${(activeText.x / dims.w) * 100}%`,
                    top: `${((activeText.y - textSize) / dims.h) * 100}%`,
                  }}
                >
                  <div
                    className="text-drag-bar"
                    data-testid="text-drag-handle"
                    title="Drag to move"
                    onPointerDown={startTextDrag}
                  >⋮⋮</div>
                  <input
                    autoFocus
                    className="text-input"
                    data-testid="text-input"
                    style={{
                      color,
                      fontFamily: textFont,
                      fontSize: `${textSize}px`,
                      fontWeight: 700,
                    }}
                    value={activeText.text}
                    placeholder="Type here…"
                    onChange={(e) => setActiveText((t) => t ? { ...t, text: e.target.value } : t)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitText(); }
                      if (e.key === "Escape") { e.preventDefault(); cancelText(); }
                    }}
                  />
                  <div className="text-actions">
                    <button type="button" className="text-btn primary" data-testid="text-commit" onClick={commitText}>Add</button>
                    <button type="button" className="text-btn ghost" data-testid="text-cancel" onClick={cancelText}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="statusbar">
            <span data-testid="canvas-dimensions">{dims.w} × {dims.h} px</span>
            <span className="status-center">{layers.length} layers · RGB / 8-bit · {tool}</span>
            <span data-testid="status-zoom">{zoom}%</span>
          </div>
        </div>
        <aside className="right-panel" data-testid="right-panel">
          <div className="panel-tabs">
            <button className={activeTab === "layers" ? "active" : ""} data-testid="layers-tab" onClick={() => setActiveTab("layers")}>Layers</button>
            <button className={activeTab === "history" ? "active" : ""} data-testid="history-tab" onClick={() => setActiveTab("history")}>History</button>
            <button className={activeTab === "drafts" ? "active" : ""} data-testid="drafts-tab" onClick={() => setActiveTab("drafts")}>
              Drafts {draft.drafts.length > 0 && <small data-testid="drafts-tab-count">{draft.drafts.length}</small>}
            </button>
          </div>
          {activeTab === "layers" ? (
            <>
              <div className="panel-title">
                <span>Layers <small data-testid="layer-count">{layers.length}</small></span>
                <div>
                  <button data-testid="add-layer-button" className="panel-icon" onClick={() => { setLayers((l) => [`New layer ${l.length}`, ...l]); setActiveLayer(0); record("Created layer"); }}><Plus size={15} /></button>
                  <button data-testid="layer-options-button" className="panel-icon"><MoreHorizontal size={15} /></button>
                </div>
              </div>
              <div className="layer-list">
                {layers.map((layer, index) => (
                  <button key={`${layer}-${index}`} data-testid={`layer-row-${index}`} className={`layer-row ${activeLayer === index ? "active" : ""}`} onClick={() => setActiveLayer(index)}>
                    <span className="layer-thumb">{index === 0 ? <ImageIcon size={16} /> : <span />}</span>
                    <span className="layer-name">{layer}</span>
                    <Eye size={14} className="visibility" data-testid={`layer-visibility-${index}`} />
                    <Lock size={12} className="lock" />
                  </button>
                ))}
              </div>
              <div className="panel-section">
                <button className="section-heading" data-testid="adjustments-toggle" onClick={() => setShowAdjust(!showAdjust)}>Adjustments <ChevronDown size={14} /></button>
                {showAdjust && (
                  <div className="adjustments">
                    <label data-testid="brightness-control">Brightness <span>{brightness}%</span>
                      <input type="range" min="0" max="200" value={brightness} onChange={(e) => { setBrightness(e.target.value); }} />
                    </label>
                    <label data-testid="contrast-control">Contrast <span>{contrast}%</span>
                      <input type="range" min="0" max="200" value={contrast} onChange={(e) => { setContrast(e.target.value); }} />
                    </label>
                    <select data-testid="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                      <option value="none">No filter (live)</option>
                      <option value="grayscale">Grayscale</option>
                      <option value="sepia">Sepia</option>
                      <option value="invert">Invert</option>
                    </select>
                    <small className="adjust-hint">Live previews only — use the Filter menu to bake into pixels.</small>
                  </div>
                )}
              </div>
              <div className="panel-ad">
                <AdSlot slot="4444444444" />
              </div>
            </>
          ) : activeTab === "history" ? (
            <div className="panel-section history-section" data-testid="history-panel">
              <div className="section-heading">History <span className="history-count">{history.length}</span></div>
              {history.map((item, i) => (
                <div className={`history-row ${i === 0 ? "current" : ""}`} key={`${item}-${i}`} data-testid={`history-row-${i}`}>
                  <span className="history-dot" />{item}
                </div>
              ))}
            </div>
          ) : (
            <div className="panel-section drafts-panel" data-testid="drafts-panel">
              <div className="drafts-toolbar">
                <button className="drafts-save-btn" data-testid="drafts-save-current" onClick={saveDraft}>
                  <Save size={13} /> Save current
                </button>
                {draft.drafts.length > 0 && (
                  <button className="drafts-export-btn" data-testid="drafts-export-all" onClick={exportAllDrafts} title="Download all drafts as a ZIP">
                    <Package size={13} /> Export all
                  </button>
                )}
                {autosavedAt && (
                  <span className="drafts-auto-hint" data-testid="drafts-auto-hint">
                    Auto-saved {autosavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
              {draft.drafts.length === 0 && (
                <div className="drafts-empty" data-testid="drafts-empty">
                  No drafts yet. Click <b>Save current</b> to keep this canvas here for later.
                </div>
              )}
              <div className="drafts-list">
                {draft.drafts.map((item, i) => (
                  <div
                    key={item.id}
                    className="draft-card"
                    data-testid={`draft-card-${i}`}
                    onMouseEnter={(e) => showHover(item, e)}
                    onMouseLeave={hideHover}
                  >
                    <div className="draft-thumb" style={{ backgroundImage: `url(${item.data})` }} />
                    <div className="draft-meta">
                      <div className="draft-name" data-testid={`draft-name-${i}`}>{item.name}</div>
                      <div className="draft-sub">
                        {item.w}×{item.h} · {new Date(item.savedAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <div className="draft-actions">
                      <button className="draft-action" data-testid={`draft-load-${i}`} title="Open this draft" onClick={() => loadDraft(item)}><FolderClock size={13} /></button>
                      <button className="draft-action" data-testid={`draft-rename-${i}`} title="Rename" onClick={() => renameDraft(item)}><Pencil size={13} /></button>
                      <button className="draft-action danger" data-testid={`draft-delete-${i}`} title="Delete" onClick={() => draft.remove(item.id)}><X size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
