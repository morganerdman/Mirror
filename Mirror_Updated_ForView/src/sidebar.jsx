// Profile sidebar — two variants: structured and poetic
// Shared data shape: { values: [], workStyle: [], interests: [], social: [], pressure: [], essence: [] }

function ProfileDot({ confidence }) {
  const n = 3;
  return (
    <span style={{ display: 'inline-flex', gap: 3, marginLeft: 6 }}>
      {[...Array(n)].map((_, i) => (
        <span key={i} style={{
          width: 4, height: 4, borderRadius: '50%',
          background: i < Math.round(confidence * n) ? 'oklch(0.55 0.10 240)' : 'oklch(0.88 0.008 240)',
          display: 'inline-block',
        }}/>
      ))}
    </span>
  );
}

function StructuredSidebar({ profile, totalMessages }) {
  const categories = [
    { key: 'values', label: 'Values', entries: profile.values },
    { key: 'workStyle', label: 'Work style', entries: profile.workStyle },
    { key: 'interests', label: 'Interests', entries: profile.interests },
    { key: 'social', label: 'Social', entries: profile.social },
    { key: 'pressure', label: 'Pressure flags', entries: profile.pressure, warn: true },
  ];

  const totalEntries = categories.reduce((s, c) => s + c.entries.length, 0);

  return (
    <div style={{
      fontFamily: 'Lato, sans-serif', color: '#141C21',
      padding: '36px 28px 80px', height: '100%', overflowY: 'auto',
    }}>
      <div style={{
        fontFamily: "'Lato', sans-serif",
        fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase',
        color: '#58666F',
        marginBottom: 8,
      }}>Your portrait</div>
      <div style={{
        fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 400,
        letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: 4,
      }}>Being built</div>
      <div style={{ fontSize: 11, color: '#58666F', marginBottom: 28 }}>
        {totalEntries} observations · {totalMessages} exchanges
      </div>

      {/* Thin progress */}
      <div style={{
        height: 2, background: 'oklch(0.92 0.008 240)', borderRadius: 2, marginBottom: 36,
        overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          height: '100%', width: `${Math.min(100, totalEntries * 4)}%`,
          background: 'linear-gradient(90deg, oklch(0.72 0.09 230), oklch(0.55 0.10 240))',
          transition: 'width 800ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}/>
      </div>

      {categories.map(cat => (
        <div key={cat.key} style={{ marginBottom: 28 }}>
          <div style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: cat.warn ? '#58666F' : '#58666F',
            marginBottom: 10, display: 'flex', justifyContent: 'space-between',
          }}>
            <span>{cat.label}</span>
            <span style={{ opacity: 0.6 }}>{cat.entries.length}</span>
          </div>

          {cat.entries.length === 0 ? (
            <div style={{
              fontSize: 12, fontStyle: 'italic',
              color: '#58666F',
              padding: '6px 0',
            }}>—</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cat.entries.map((e, i) => (
                <div key={i} style={{
                  fontSize: 13, lineHeight: 1.4,
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  animation: 'profileFadeIn 600ms ease both',
                  color: cat.warn ? '#58666F' : 'inherit',
                }}>
                  <span style={{
                    marginTop: 7, width: 4, height: 4, borderRadius: '50%',
                    background: cat.warn ? 'oklch(0.55 0.10 40)' : 'oklch(0.55 0.10 240)',
                    flexShrink: 0,
                  }}/>
                  <span style={{ flex: 1 }}>
                    {e.text}
                    {e.confidence != null && !cat.warn && <ProfileDot confidence={e.confidence} />}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PoeticSidebar({ profile, totalMessages }) {
  // Render entries as a flowing paragraph that accretes
  const allEntries = [
    ...profile.essence.map(e => ({ ...e, kind: 'essence' })),
    ...profile.values.map(e => ({ ...e, kind: 'value' })),
    ...profile.workStyle.map(e => ({ ...e, kind: 'work' })),
    ...profile.interests.map(e => ({ ...e, kind: 'interest' })),
    ...profile.social.map(e => ({ ...e, kind: 'social' })),
  ];

  return (
    <div style={{
      fontFamily: 'Lato, sans-serif', color: '#141C21',
      padding: '36px 32px 80px', height: '100%', overflowY: 'auto',
      background: 'transparent',
    }}>
      <div style={{
        fontFamily: "'Lato', sans-serif",
        fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase',
        color: '#58666F',
        marginBottom: 8,
      }}>A portrait</div>
      <div style={{
        fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 400,
        letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: 28, fontStyle: 'italic',
      }}>In your own words</div>

      {allEntries.length === 0 ? (
        <p style={{
          fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontSize: 17, lineHeight: 1.6, color: '#58666F',
        }}>The page is blank. Talk to me, and it fills.</p>
      ) : (
        <div style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 18, lineHeight: 1.65,
          color: '#141C21',
          letterSpacing: '0.005em',
        }}>
          {allEntries.map((e, i) => (
            <span key={i} style={{
              display: 'inline',
              animation: 'profileFadeIn 900ms ease both',
            }}>
              <span style={{
                fontStyle: e.kind === 'essence' || e.kind === 'value' ? 'italic' : 'normal',
                fontWeight: e.kind === 'essence' ? 500 : 400,
                color: e.kind === 'essence'
                  ? 'oklch(0.35 0.08 240)'
                  : 'inherit',
                borderBottom: e.confidence > 0.7 ? '1px solid oklch(0.80 0.04 230)' : 'none',
                paddingBottom: 1,
              }}>{e.text}</span>
              {i < allEntries.length - 1 ? ' ' : '.'}
              {i < allEntries.length - 1 && ' '}
            </span>
          ))}
        </div>
      )}

      {profile.pressure.length > 0 && (
        <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px dashed oklch(0.75 0.04 40)' }}>
          <div style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#58666F',
            marginBottom: 12,
          }}>Voices that aren't yours</div>
          {profile.pressure.map((p, i) => (
            <p key={i} style={{
              fontFamily: 'var(--font-serif)', fontStyle: 'italic',
              fontSize: 15, lineHeight: 1.5,
              color: '#58666F',
              margin: '0 0 10px',
            }}>— {p.text}</p>
          ))}
        </div>
      )}

      <div style={{
        marginTop: 40, paddingTop: 20, borderTop: '1px solid oklch(0.85 0.01 240)',
        fontFamily: "'Lato', sans-serif",
        fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase',
        color: '#58666F',
      }}>
        {totalMessages} exchanges · {allEntries.length + profile.pressure.length} observations
      </div>
    </div>
  );
}

Object.assign(window, { StructuredSidebar, PoeticSidebar });
