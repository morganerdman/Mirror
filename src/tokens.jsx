// Design tokens — Mirror
// Declared colors drawn from the Salar de Uyuni hero (muted blue sky, soft white salt)

window.MIRROR_TOKENS = {
  color: {
    // Backgrounds
    composerSurface: '#F8FBFF',          // pane fill (composer, grid) — rgb(248,251,255)
    salt: 'oklch(0.97 0.008 80)',        // warm off-white "salt"
    saltDeep: 'oklch(0.94 0.012 80)',    // slightly deeper warm white
    fog: 'oklch(0.90 0.015 230)',        // pale blue fog
    // Ink
    ink: 'oklch(0.22 0.015 240)',        // charcoal
    inkSoft: 'oklch(0.38 0.015 240)',    // muted charcoal
    inkFaint: 'oklch(0.55 0.012 240)',   // subdued text
    inkHairline: '#F8FBFF',             // rules & hairlines (same as composerSurface)
    // Accents
    sky: 'oklch(0.72 0.09 230)',         // cerulean pulled from hero
    skyDeep: 'oklch(0.55 0.10 240)',     // deeper reflection blue
    earth: 'oklch(0.68 0.04 60)',        // dusty warm earth
    // Utility
    glassTint: 'rgba(255,255,255,0.28)',
    glassEdge: 'rgba(255,255,255,0.55)',
    glassShadow: 'rgba(22,40,66,0.18)',
  },
  radius: {
    sm: '6px',
    md: '12px',
    lg: '20px',
    pill: '999px',
  },
  shadow: {
    card: '0 1px 2px rgba(22,40,66,0.04), 0 8px 24px rgba(22,40,66,0.06)',
    lift: '0 2px 4px rgba(22,40,66,0.05), 0 24px 60px rgba(22,40,66,0.12)',
  },
};

// Persona for the demo conversation
window.MIRROR_PERSONA = {
  name: 'Jess',
  age: 17,
  grade: 'Senior',
  summary: 'High school senior, unsure about college major. Parents want pre-med. Actually spends free time making zines and tinkering with sewing machines.',
};
