// Maps a container's free-text `type` to a small SVG glyph. Unknown/custom
// types fall back to a generic box — the icon is purely decorative, `type`
// itself is never validated against this list.
const ICONS = {
  room: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M3 11.5 12 4l9 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  fridge: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="5" y="2.5" width="14" height="19" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <line x1="5" y1="9.5" x2="19" y2="9.5" stroke="currentColor" strokeWidth="2" />
      <line x1="8" y1="4.5" x2="8" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="11.5" x2="8" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  cupboard: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="4" y="3" width="16" height="18" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="2" />
      <circle cx="10" cy="12" r="0.9" fill="currentColor" />
      <circle cx="14" cy="12" r="0.9" fill="currentColor" />
    </svg>
  ),
  drawer: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" />
      <line x1="10" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="16" x2="14" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  table: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <line x1="3" y1="8" x2="21" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="8" x2="6" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="8" x2="18" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  freezer: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="6" width="18" height="14" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="6" x2="12" y2="2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="4" x2="15" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="7" y1="13" x2="17" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  box: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M3 8 12 4l9 4-9 4-9-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M3 8v8l9 4 9-4V8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <line x1="12" y1="12" x2="12" y2="20" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
};

function keyFor(type) {
  const t = (type || "").toLowerCase();
  if (t.includes("room")) return "room";
  if (t.includes("fridge") || t.includes("refrig")) return "fridge";
  if (t.includes("freez")) return "freezer";
  if (t.includes("cupboard") || t.includes("closet") || t.includes("wardrobe")) return "cupboard";
  if (t.includes("drawer")) return "drawer";
  if (t.includes("table")) return "table";
  return "box";
}

// isRoom: pass true for top-level containers (parentId === null). Room "type"
// is a free-text label like "Kitchen"/"Lounge"/"Garage" that rarely contains
// the word "room" itself, so icon lookup can't rely on the text for those —
// the caller already knows it's a room from context (e.g. the Dashboard's
// root container list), so it says so explicitly instead.
export default function ContainerIcon({ type, isRoom = false, className = "w-5 h-5" }) {
  const Icon = ICONS[isRoom ? "room" : keyFor(type)];
  return <Icon className={className} />;
}
