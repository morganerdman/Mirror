// Tweaks panel — typography variant + sidebar style
const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "typography": "crimson",
  "sidebar": "structured",
  "density": "standard"
}/*EDITMODE-END*/;

const DENSITY_OPTIONS = [
  { id: 'minimal',  label: 'Minimal',  desc: 'Title + one-line + why. Nothing else.' },
  { id: 'standard', label: 'Standard', desc: 'Collapsed cards, expand on click.' },
  { id: 'detailed', label: 'Detailed', desc: 'All cards pre-expanded.' },
];

const TYPE_OPTIONS = [
  { id: 'crimson', label: 'Crimson Pro + Inter', desc: 'Editorial serif + clean sans' },
  { id: 'instrument', label: 'Instrument Serif + Inter', desc: 'Delicate high-contrast serif' },
  { id: 'fraunces', label: 'Fraunces + Inter', desc: 'Warm, soft optical serif' },
];

const SIDEBAR_OPTIONS = [
  { id: 'structured', label: 'Structured', desc: 'Categories, tags, confidence dots' },
  { id: 'poetic', label: 'Poetic', desc: 'Flowing sentences, accreting portrait' },
];

function applyTypography(id) {
  const root = document.documentElement;
  if (id === 'crimson') {
    root.style.setProperty('--font-serif', "'Crimson Pro', 'Times New Roman', serif");
  } else if (id === 'instrument') {
    root.style.setProperty('--font-serif', "'Instrument Serif', 'Times New Roman', serif");
  } else if (id === 'fraunces') {
    root.style.setProperty('--font-serif', "'Fraunces', 'Times New Roman', serif");
  }
  root.setAttribute('data-typography', id);
}

function TweaksPanel({ tweaks, setTweaks, visible }) {
  if (!visible) return null;

  const update = (key, val) => {
    const next = { ...tweaks, [key]: val };
    setTweaks(next);
    if (key === 'typography') applyTypography(val);
    window.parent?.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: val } }, '*');
  };

  return (
    <div style={{
      position: 'fixed', right: 20, bottom: 20, zIndex: 9999,
      width: 280, padding: 16,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(20px) saturate(1.4)',
      WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
      border: '1px solid rgba(22,40,66,0.1)',
      borderRadius: 14,
      boxShadow: '0 20px 60px rgba(22,40,66,0.18)',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 12, color: '#141C21',
    }}>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#58666F', marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>Tweaks</div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Typography</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {TYPE_OPTIONS.map(o => (
            <button key={o.id} onClick={() => update('typography', o.id)}
              style={{
                textAlign: 'left', padding: '8px 10px', border: '1px solid',
                borderColor: tweaks.typography === o.id ? 'oklch(0.55 0.10 240)' : 'oklch(0.88 0.008 240)',
                background: tweaks.typography === o.id ? 'oklch(0.96 0.02 240)' : '#fff',
                borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
              }}>
              <div style={{ fontWeight: 600, fontSize: 12 }}>{o.label}</div>
              <div style={{ fontSize: 10, color: '#58666F', marginTop: 2 }}>{o.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Card density (v2)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {DENSITY_OPTIONS.map(o => (
            <button key={o.id} onClick={() => update('density', o.id)}
              style={{
                textAlign: 'left', padding: '8px 10px', border: '1px solid',
                borderColor: tweaks.density === o.id ? 'oklch(0.55 0.10 240)' : 'oklch(0.88 0.008 240)',
                background: tweaks.density === o.id ? 'oklch(0.96 0.02 240)' : '#fff',
                borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
              }}>
              <div style={{ fontWeight: 600, fontSize: 12 }}>{o.label}</div>
              <div style={{ fontSize: 10, color: '#58666F', marginTop: 2 }}>{o.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Profile sidebar</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {SIDEBAR_OPTIONS.map(o => (
            <button key={o.id} onClick={() => update('sidebar', o.id)}
              style={{
                textAlign: 'left', padding: '8px 10px', border: '1px solid',
                borderColor: tweaks.sidebar === o.id ? 'oklch(0.55 0.10 240)' : 'oklch(0.88 0.008 240)',
                background: tweaks.sidebar === o.id ? 'oklch(0.96 0.02 240)' : '#fff',
                borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
              }}>
              <div style={{ fontWeight: 600, fontSize: 12 }}>{o.label}</div>
              <div style={{ fontSize: 10, color: '#58666F', marginTop: 2 }}>{o.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function useTweaks() {
  const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    applyTypography(tweaks.typography);
  }, [tweaks.typography]);

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setEditMode(true);
      if (e.data?.type === '__deactivate_edit_mode') setEditMode(false);
    };
    window.addEventListener('message', handler);
    // announce after listener is attached
    window.parent?.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  return { tweaks, setTweaks, editMode };
}

Object.assign(window, { TweaksPanel, useTweaks, TWEAK_DEFAULTS });
