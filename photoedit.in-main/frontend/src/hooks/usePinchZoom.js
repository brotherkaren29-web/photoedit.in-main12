import { useRef } from "react";

// Two-finger pinch-zoom + pan hook for a canvas mounted inside a scrolling stage container.
// Returns handlers to spread on a pointer target; each returns true if the event was consumed
// by the gesture (so the caller should skip its own drawing logic).
//
//   const gesture = usePinchZoom({ stageRef, zoom, setZoom, onGestureStart });
//   onPointerDown = (e) => { if (gesture.onDown(e)) return; /* normal draw start */ }

export default function usePinchZoom({ stageRef, zoom, setZoom, min = 25, max = 200, onGestureStart }) {
  const pointersRef = useRef(new Map());
  const pinchRef = useRef(null);

  const onDown = (event) => {
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size >= 2) {
      if (onGestureStart) onGestureStart();
      const pts = Array.from(pointersRef.current.values()).slice(0, 2);
      const dist = Math.max(1, Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y));
      pinchRef.current = {
        dist,
        zoom,
        cx: (pts[0].x + pts[1].x) / 2,
        cy: (pts[0].y + pts[1].y) / 2,
        scrollLeft: stageRef.current ? stageRef.current.scrollLeft : 0,
        scrollTop: stageRef.current ? stageRef.current.scrollTop : 0,
      };
      return true;
    }
    return false;
  };

  const onMove = (event) => {
    if (pointersRef.current.has(event.pointerId)) {
      pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }
    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const pts = Array.from(pointersRef.current.values()).slice(0, 2);
      const dist = Math.max(1, Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y));
      const ratio = dist / pinchRef.current.dist;
      setZoom(Math.min(max, Math.max(min, Math.round(pinchRef.current.zoom * ratio))));
      const cx = (pts[0].x + pts[1].x) / 2;
      const cy = (pts[0].y + pts[1].y) / 2;
      const stage = stageRef.current;
      if (stage) {
        stage.scrollLeft = pinchRef.current.scrollLeft - (cx - pinchRef.current.cx);
        stage.scrollTop = pinchRef.current.scrollTop - (cy - pinchRef.current.cy);
      }
      return true;
    }
    return false;
  };

  const onUp = (event) => {
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size >= 1 && pinchRef.current) {
      pinchRef.current = null;
      return true; // still consuming — don't restart drawing on the remaining finger
    }
    pinchRef.current = null;
    return false;
  };

  const reset = () => {
    pointersRef.current.clear();
    pinchRef.current = null;
  };

  return { onDown, onMove, onUp, reset };
}
