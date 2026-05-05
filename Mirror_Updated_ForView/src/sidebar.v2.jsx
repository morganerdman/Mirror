// Sidebar v2 — observation-framed, collaborative, no confidence dots
// Replaces assertive labels ("Values creativity") with observation phrases ("You said making things is what you lose time to").

const { useState: useStateSide2 } = React;

// Rewrites a profile entry into observation language.
function toObservation(text, kind) {
  if (!text) return '';
  const t = text.trim();
  // Already in observation form
  if (/^(you |i (noticed|heard|kept hearing|keep hearing)|heard you)/i.test(t)) return t;

  // Strip confidence-level parens
  const clean = t.replace(/\s*\((high|medium|low)[^)]*\)\s*$/i, '').replace(/\s*\(.*\)\s*$/, '');

  const openers = {
    values: [
      `Sounds like ${clean.toLowerCase()} matters to you`,
      `Heard you place weight on ${clean.toLowerCase()}`,
    ],
    workStyle: [
      `You described yourself as: ${clean.toLowerCase()}`,
      `Noticed you work best with ${clean.toLowerCase()}`,
    ],
    interests: [
      `You kept coming back to ${clean.toLowerCase()}`,
      `Heard you talk about ${clean.toLowerCase()}`,
    ],
    social: [
      `You said ${clean.toLowerCase()}`,
      `Noticed: ${clean.toLowerCase()}`,
    ],
    essence: [clean],
  };
  const pool = openers[kind] || [clean];
  // Deterministic pick from the string itself — stable across renders
  const hash = [...clean].reduce((a, c) => a + c.charCodeAt(0), 0);
  return pool[hash % pool.length];
}

function StructuredSidebarV2({ profile, totalMessages, onEdit }) {
  const categories = [
    { key: 'interests', label: 'What you keep returning to', entries: profile.interests },
    { key: 'values',    label: 'What seems to matter',       entries: profile.values },
    { key: 'workStyle', label: 'How you work',                entries: profile.workStyle },
    { key: 'social',    label: 'How you relate',              entries: profile.social },
    { key: 'pressure',  label: 'Threads to come back to',     entries: profile.pressure, warn: true },
  ];

  return (
    <div className="mirror-conv-scroll" style={{
      fontFamily: 'Lato', color: '#141C21',
      padding: '36px 28px 80px', height: '100%', overflowY: 'auto',
    }}>
      <div style={{
        fontFamily: "'Lato', sans-serif",
        fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase',
        color: '#58666F',
        marginBottom: 8,
      }}>What I'm noticing</div>
      <div style={{
        fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400,
        fontStyle: 'italic',
        letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: 10,
        color: '#141C21',
      }}>Tell me when I'm off.</div>
      <div style={{
        fontSize: 11.5, lineHeight: 1.5,
        color: '#58666F',
        marginBottom: 58,
      }}>
        These are just threads I'm pulling, not conclusions about who you are. I'll rework them as we talk.
      </div>

      {categories.map(cat => (
        <div key={cat.key} style={{ marginBottom: 26 }}>
          <div style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: cat.warn ? '#58666F' : '#58666F',
            marginBottom: 10, display: 'flex', justifyContent: 'space-between',
          }}>
            <span>{cat.label}</span>
            <span style={{ opacity: 0.5 }}>{cat.entries.length}</span>
          </div>

          {cat.entries.length === 0 ? (
            <div style={{
              fontSize: 14, fontStyle: 'italic',
              color: '#58666F',
              padding: '4px 0',
              fontFamily: 'var(--font-serif)',
            }}>(listening)</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {cat.entries.map((e, i) => (
                <div key={i} style={{
                  fontSize: 13, lineHeight: 1.5,
                  padding: '8px 0',
                  animation: 'profileFadeIn 600ms ease both',
                  color: cat.warn ? '#58666F' : '#141C21',
                  fontStyle: cat.warn ? 'italic' : 'normal',
                  fontFamily: cat.warn ? 'var(--font-serif)' : 'Lato, sans-serif',
                  display: 'flex', alignItems: 'flex-start', gap: 6,
                }}>
                  <span style={{ flex: 1 }}>
                    {cat.warn ? e.text : toObservation(e.text, cat.key)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Footer disclaimer — woven in as a note from Mirror */}
      <div style={{
        marginTop: 12, paddingTop: 20,
        fontFamily: 'var(--font-serif)', fontStyle: 'italic',
        fontSize: 14, lineHeight: 1.55,
        color: '#58666F',
      }}>
        A guide, not a diagnosis. If any of these feel wrong, say so — I'd rather be corrected than polite.
      </div>
    </div>
  );
}

// Keep the poetic variant too, but soften its framing
function PoeticSidebarV2({ profile, totalMessages }) {
  const allEntries = [
    ...profile.essence.map(e => ({ ...e, kind: 'essence' })),
    ...profile.interests.map(e => ({ ...e, kind: 'interest' })),
    ...profile.values.map(e => ({ ...e, kind: 'value' })),
    ...profile.workStyle.map(e => ({ ...e, kind: 'work' })),
    ...profile.social.map(e => ({ ...e, kind: 'social' })),
  ];

  return (
    <div className="mirror-conv-scroll" style={{
      fontFamily: 'Lato, sans-serif', color: '#141C21',
      padding: '36px 32px 80px', height: '100%', overflowY: 'auto',
      background: 'transparent',
    }}>
      <div style={{
        fontFamily: "'Lato', sans-serif",
        fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase',
        color: '#58666F', marginBottom: 8,
      }}>What I'm noticing</div>
      <div style={{
        fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400,
        fontStyle: 'italic', letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: 20,
      }}>In your own words, mostly.</div>

      {allEntries.length === 0 ? (
        <p style={{
          fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontSize: 16, lineHeight: 1.6, color: '#58666F',
        }}>Still listening. Things will show up here as we talk.</p>
      ) : (
        <div style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 17, lineHeight: 1.7,
          color: '#141C21',
        }}>
          {allEntries.map((e, i) => (
            <span key={i} style={{
              display: 'inline',
              animation: 'profileFadeIn 900ms ease both',
            }}>
              <span style={{
                fontStyle: e.kind === 'essence' ? 'italic' : 'normal',
                color: e.kind === 'essence' ? '#141C21' : 'inherit',
              }}>{toObservation(e.text, e.kind === 'work' ? 'workStyle' : e.kind === 'interest' ? 'interests' : e.kind + 's'.replace('ss','s'))}</span>
              {i < allEntries.length - 1 ? '. ' : '.'}
            </span>
          ))}
        </div>
      )}

      {profile.pressure.length > 0 && (
        <div style={{ marginTop: 40, paddingTop: 24 }}>
          <div style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#58666F', marginBottom: 12,
          }}>Threads to come back to</div>
          {profile.pressure.map((p, i) => (
            <p key={i} style={{
              fontFamily: 'var(--font-serif)', fontStyle: 'italic',
              fontSize: 14.5, lineHeight: 1.5,
              color: '#58666F',
              margin: '0 0 10px',
            }}>— {p.text}</p>
          ))}
        </div>
      )}

      <div style={{
        marginTop: 40, paddingTop: 20,
        fontFamily: 'var(--font-serif)', fontStyle: 'italic',
        fontSize: 12.5, lineHeight: 1.55,
        color: '#58666F',
      }}>
        A guide, not a diagnosis. Correct me when I'm off.
      </div>
    </div>
  );
}

Object.assign(window, { StructuredSidebarV2, PoeticSidebarV2 });
