// Results view — card stack, expandable careers, PDF-ish export, obscure section
const { useState: useStateRes } = React;

function ResultsView({ recommendations, profile, onStartOver, sidebarVariant }) {
  const [expanded, setExpanded] = useStateRes(0);

  if (!recommendations) return null;

  const { summary, careers = [], obscure = [] } = recommendations;

  return (
    <div style={{
      background: '#F8FBFF',
      color: '#141C21',
      minHeight: '100vh',
      fontFamily: 'Lato, sans-serif',
    }}>
      {/* Header */}
      <header style={{
        padding: '28px 40px',
        borderBottom: '1px solid oklch(0.90 0.008 240)',
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400,
          lineHeight: '22px', height: 22,
          position: 'fixed', top: 28, left: 40, zIndex: 30,
        }}>
            Mirror
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => window.print()} style={btnStyle}>Export PDF</button>
          <button onClick={onStartOver} style={{ ...btnStyle, background: 'oklch(0.22 0.015 240)', color: '#141C21' }}>Start over</button>
        </div>
      </header>

      {/* Hero synthesis */}
      <section style={{
        maxWidth: 900, margin: '0 auto',
        padding: '100px 48px 60px',
      }}>
        <div style={{
          fontFamily: "'Lato', sans-serif",
          fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
          color: '#58666F',
          marginBottom: 24,
        }}>What I see, now that we've talked</div>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(36px, 5vw, 58px)',
          fontWeight: 400, lineHeight: 1.18,
          letterSpacing: '-0.02em',
          margin: 0,
          textWrap: 'pretty',
        }}>
          {summary}
        </h1>
        <div style={{
          marginTop: 40,
          display: 'flex', gap: 32,
          fontFamily: "'Lato', sans-serif",
          fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: '#58666F',
        }}>
          <span>{careers.length} fits</span>
          <span>{obscure.length} off-the-map</span>
          <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </section>

      {/* Career cards */}
      <section style={{
        maxWidth: 900, margin: '0 auto',
        padding: '40px 48px',
      }}>
        <SectionLabel number="01" text="Where your life could actually fit" />
        <div style={{ marginTop: 32 }}>
          {careers.map((c, i) => (
            <CareerCard
              key={i}
              index={i}
              career={c}
              expanded={expanded === i}
              onToggle={() => setExpanded(expanded === i ? -1 : i)}
            />
          ))}
        </div>
      </section>

      {/* Obscure section */}
      {obscure.length > 0 && (
        <section style={{
          maxWidth: 900, margin: '0 auto',
          padding: '80px 48px',
        }}>
          <SectionLabel number="02" text="Careers you've never heard of" />
          <p style={{
            fontFamily: 'var(--font-serif)', fontStyle: 'italic',
            fontSize: 19, lineHeight: 1.5, fontWeight: 400,
            color: '#58666F',
            maxWidth: 560, marginTop: 16, marginBottom: 40,
          }}>
            Because you can't want what you've never seen named. These are the ones I wouldn't have thought to show you, but I think they fit.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            {obscure.map((o, i) => (
              <div key={i} style={{
                padding: '28px 32px',
                background: 'oklch(0.94 0.015 230)',
                border: '1px solid oklch(0.85 0.02 230)',
                borderRadius: 12,
              }}>
                <div style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase',
                  color: '#58666F',
                  marginBottom: 8,
                }}>Off-the-map · {String(i+1).padStart(2, '0')}</div>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400,
                  letterSpacing: '-0.01em', marginBottom: 8,
                }}>{o.title}</div>
                <p style={{
                  fontSize: 14, lineHeight: 1.5, margin: '0 0 14px',
                  color: '#58666F',
                }}>{o.oneLine}</p>
                <p style={{
                  fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 1.5,
                  color: '#141C21', fontStyle: 'italic',
                  margin: 0, textWrap: 'pretty',
                }}>{o.why}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Profile summary */}
      <section style={{
        maxWidth: 900, margin: '0 auto',
        padding: '80px 48px 120px',
      }}>
        <SectionLabel number="03" text="The portrait we built together" />
        <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {[
            { label: 'Values', entries: profile.values },
            { label: 'Work style', entries: profile.workStyle },
            { label: 'Interests', entries: profile.interests },
            { label: 'Social', entries: profile.social },
          ].map(cat => (
            <div key={cat.label}>
              <div style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
                color: '#58666F',
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: '1px solid oklch(0.88 0.008 240)',
              }}>{cat.label}</div>
              {cat.entries.length === 0 ? (
                <div style={{ fontSize: 13, fontStyle: 'italic', color: '#58666F' }}>—</div>
              ) : cat.entries.map((e, i) => (
                <div key={i} style={{
                  fontSize: 14, lineHeight: 1.55,
                  padding: '6px 0',
                }}>{e.text}</div>
              ))}
            </div>
          ))}
        </div>

        {profile.pressure.length > 0 && (
          <div style={{
            marginTop: 60, padding: '28px 32px',
            background: 'oklch(0.96 0.03 60)',
            border: '1px dashed oklch(0.70 0.06 60)',
            borderRadius: 12,
          }}>
            <div style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: '#58666F',
              marginBottom: 16,
            }}>Pressure flags · bring this to conversations with family</div>
            {profile.pressure.map((p, i) => (
              <div key={i} style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                fontSize: 17, lineHeight: 1.5,
                color: '#58666F',
                margin: '0 0 10px',
              }}>— {p.text}</div>
            ))}
          </div>
        )}
      </section>

      {/* Footer disclaimer */}
      <footer style={{
        borderTop: '1px solid oklch(0.88 0.008 240)',
        padding: '40px 48px',
        maxWidth: 900, margin: '0 auto',
        fontSize: 12, lineHeight: 1.55, color: '#58666F',
      }}>
        Mirror is an advising tool, not a decision-maker. Bring this to a counselor, an advisor, a parent who listens. The final decision is always yours.
      </footer>
    </div>
  );
}

function SectionLabel({ number, text }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: 20,
      paddingBottom: 24,
      borderBottom: '1px solid oklch(0.22 0.015 240)',
    }}>
      <span style={{
        fontFamily: "'Lato', sans-serif",
        fontSize: 11, letterSpacing: '0.25em', color: '#58666F',
      }}>{number}</span>
      <h2 style={{
        fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 400,
        letterSpacing: '-0.01em', margin: 0, flex: 1,
      }}>{text}</h2>
    </div>
  );
}

function CareerCard({ career, expanded, onToggle, index }) {
  return (
    <div style={{
      borderTop: index === 0 ? '1px solid oklch(0.88 0.008 240)' : 'none',
      borderBottom: '1px solid oklch(0.88 0.008 240)',
      padding: '28px 0',
      transition: 'background 200ms',
    }}>
      <button onClick={onToggle} style={{
        width: '100%', display: 'flex', alignItems: 'baseline', gap: 24,
        background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
        textAlign: 'left', fontFamily: 'inherit',
      }}>
        <span style={{
          fontFamily: "'Lato', sans-serif",
          fontSize: 11, letterSpacing: '0.2em',
          color: '#58666F',
          minWidth: 32,
        }}>{String(index + 1).padStart(2, '0')}</span>

        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 400,
            letterSpacing: '-0.01em', lineHeight: 1.15,
            color: '#141C21',
          }}>{career.title}</div>
          <div style={{
            fontSize: 14, color: '#58666F',
            marginTop: 6, lineHeight: 1.45,
          }}>{career.oneLine}</div>
        </div>

        <div style={{
          fontFamily: "'Lato', sans-serif", fontSize: 11,
          color: '#58666F',
          minWidth: 110, textAlign: 'right',
        }}>{career.salary}</div>

        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          border: '1px solid oklch(0.78 0.01 240)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: expanded ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'transform 360ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          color: '#58666F',
          flexShrink: 0,
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M5 1v8M1 5h8"/>
          </svg>
        </div>
      </button>

      <div style={{
        maxHeight: expanded ? 1200 : 0,
        overflow: 'hidden',
        transition: 'max-height 600ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}>
        <div style={{
          marginTop: 28,
          paddingLeft: 56,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px 48px',
          opacity: expanded ? 1 : 0,
          transition: 'opacity 400ms',
        }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <CardLabel>Why Mirror chose this</CardLabel>
            <p style={{
              fontFamily: 'var(--font-serif)', fontSize: 22, lineHeight: 1.5,
              fontWeight: 400, color: '#141C21',
              margin: 0, textWrap: 'pretty',
            }}>{career.why}</p>
          </div>

          <div>
            <CardLabel>Day to day</CardLabel>
            <p style={cardPStyle}>{career.dayToDay}</p>
          </div>
          <div>
            <CardLabel>Growth outlook</CardLabel>
            <p style={cardPStyle}>{career.outlook}</p>
          </div>
          <div>
            <CardLabel>AI risk · {career.aiRisk?.split('—')[0]?.trim() || '—'}</CardLabel>
            <p style={cardPStyle}>{career.aiRisk?.includes('—') ? career.aiRisk.split('—').slice(1).join('—').trim() : career.aiRisk}</p>
          </div>
          <div>
            <CardLabel>5 / 10 / 20 years</CardLabel>
            <p style={cardPStyle}>{career.progression}</p>
          </div>

          {career.workLifeBalance && (
            <div>
              <CardLabel>Work–life balance</CardLabel>
              <p style={cardPStyle}>{career.workLifeBalance}</p>
            </div>
          )}
          {career.schools && (
            <div>
              <CardLabel>Programs to look at</CardLabel>
              <p style={cardPStyle}>{career.schools}</p>
            </div>
          )}

          {career.humanVoice && (
            <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
              <CardLabel>A human voice from the field</CardLabel>
              <blockquote style={{
                fontFamily: 'var(--font-serif)', fontSize: 19, lineHeight: 1.55,
                fontStyle: 'italic', color: '#58666F',
                margin: 0, paddingLeft: 20,
                borderLeft: '2px solid oklch(0.72 0.09 230)',
              }}>"{career.humanVoice}"</blockquote>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CardLabel({ children }) {
  return (
    <div style={{
      fontFamily: "'Lato', sans-serif",
      fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase',
      color: '#58666F',
      marginBottom: 10,
    }}>{children}</div>
  );
}

const cardPStyle = {
  fontSize: 14, lineHeight: 1.55,
  color: '#141C21',
  margin: 0,
};

const btnStyle = {
  padding: '9px 18px',
  border: '1px solid oklch(0.22 0.015 240)',
  background: 'transparent',
  color: '#141C21',
  borderRadius: 999,
  fontFamily: "'Lato', sans-serif",
  fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
  cursor: 'pointer',
};

window.ResultsView = ResultsView;
