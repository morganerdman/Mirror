// Results v2 — progressive disclosure, evidence tiers, density modes
// Hero pillar: the career recommendations themselves. Everything else serves them.

const { useState: useStateRes2, useRef: useRefRes2, useEffect: useEffectRes2 } = React;

// -------- Evidence source library --------
// Each source has: id, label, tier, tierDesc, reason
// tier: 'structured' (government/industry datasets) | 'semi' (org reports) | 'anecdotal' (forums/reviews)
const SOURCE_LIBRARY = {
  bls: {
    label: 'BLS Occupational Outlook Handbook',
    tier: 'structured',
    tierDesc: 'Structured · Gov\u2019t data',
    reason: 'Used for salary bands and 10-year growth projections.',
  },
  onet: {
    label: 'O*NET OnLine',
    tier: 'structured',
    tierDesc: 'Structured · Gov\u2019t data',
    reason: 'Used for day-to-day task breakdowns and required skills.',
  },
  linkedin: {
    label: 'LinkedIn Workforce Report',
    tier: 'semi',
    tierDesc: 'Semi-structured · Industry',
    reason: 'Used for hiring velocity and the 5/10-year progression arc.',
  },
  aaas: {
    label: 'AAAS / professional-org reports',
    tier: 'semi',
    tierDesc: 'Semi-structured · Industry',
    reason: 'Used for field-specific outlook when BLS is too broad.',
  },
  reddit: {
    label: 'r/subreddit communities',
    tier: 'anecdotal',
    tierDesc: 'Anecdotal · Community',
    reason: 'Used for texture \u2014 what the job actually feels like day-to-day.',
  },
  glassdoor: {
    label: 'Glassdoor reviews',
    tier: 'anecdotal',
    tierDesc: 'Anecdotal · Employee reports',
    reason: 'Used for work-life-balance descriptions; noisy, averaged with care.',
  },
  interviews: {
    label: 'Interview transcripts with practitioners',
    tier: 'anecdotal',
    tierDesc: 'Anecdotal · First-person',
    reason: 'Used for the \u201Chuman voice\u201D quotes. These are single perspectives, not population data.',
  },
};

// Map career titles → which sources were used for what.
// In a real product this would come from the AI; here we simulate it.
function sourcesForCareer(title) {
  const base = ['bls', 'onet', 'linkedin', 'reddit', 'interviews'];
  if (/journalism|science/i.test(title)) return ['bls', 'onet', 'aaas', 'glassdoor', 'interviews'];
  if (/textile|designer/i.test(title)) return ['bls', 'onet', 'linkedin', 'glassdoor', 'interviews'];
  return base;
}

const TIER_STYLES = {
  structured: {
    bg: 'oklch(0.95 0.04 145)',
    fg: 'oklch(0.34 0.08 145)',
    dot: 'oklch(0.58 0.14 145)',
    label: 'Structured',
  },
  semi: {
    bg: 'oklch(0.95 0.04 230)',
    fg: 'oklch(0.34 0.10 240)',
    dot: 'oklch(0.58 0.14 240)',
    label: 'Semi-structured',
  },
  anecdotal: {
    bg: 'oklch(0.95 0.035 60)',
    fg: 'oklch(0.42 0.09 60)',
    dot: 'oklch(0.62 0.13 60)',
    label: 'Anecdotal',
  },
};

// -------- Main view --------
function ResultsViewV2({ recommendations, profile, onStartOver, onBackToConversation, sidebarVariant, density = 'standard' }) {
  if (!recommendations) return null;
  const { summary, careers = [], obscure = [] } = recommendations;
  const [openCareerIndex, setOpenCareerIndex] = useStateRes2(null);

  // Close modal on Escape
  useEffectRes2(() => {
    if (openCareerIndex === null) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpenCareerIndex(null); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [openCareerIndex]);

  return (
    <div style={{
      background: '#F8FBFF',
      color: '#141C21',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      isolation: 'isolate',
    }}>
      <div aria-hidden="true" style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'url("assets/hero-saltflats.jpeg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center 60%',
        opacity: 0.25,
        pointerEvents: 'none',
        zIndex: 0,
      }}></div>
      <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <header className="no-print" style={{
        padding: '28px 40px',
        borderBottom: '1px solid oklch(0.90 0.008 240)',
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 10,
        background: 'transparent',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, position: 'fixed', top: 28, left: 40, zIndex: 30 }}>
          <button
            onClick={onStartOver}
            style={{
              fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400,
              lineHeight: '22px', height: 22,
              background: 'transparent', border: 'none', padding: 0,
              color: '#141C21', cursor: 'pointer',
            }}
            aria-label="Go to home"
          >
            Mirror
          </button>
          <button
            onClick={onBackToConversation}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              fontFamily: "'Lato', sans-serif",
              fontSize: 10,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#58666F',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
            aria-label="Back to conversation"
          >
            <span aria-hidden="true">←</span>
            Back to conversation
          </button>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => window.print()} style={btnV2}>Export PDF</button>
          <button onClick={onStartOver} style={{ ...btnV2, background: 'oklch(0.22 0.015 240)', color: '#58666F' }}>Start over</button>
        </div>
      </header>

      {/* Hero synthesis */}
      <section style={{
        maxWidth: 900, margin: '0 auto',
        padding: '80px 48px 40px',
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
          color: 'rgba(92, 101, 107, 1)',
          marginBottom: 24,
        }}>What I heard from you</div>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(32px, 4.4vw, 52px)',
          fontWeight: 400, lineHeight: 1.2,
          letterSpacing: '-0.02em',
          margin: 0,
          textWrap: 'pretty',
        }}>
          {summary}
        </h1>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: 17, lineHeight: 1.55,
          color: '#58666F',
          marginTop: 24, maxWidth: 640,
          textWrap: 'pretty',
        }}>
          This is my read, not a diagnosis. Tap any card to see the reasoning. If something feels wrong, trust yourself before you trust me.
        </p>
      </section>

      {/* Careers — the centerpiece */}
      <section style={{ maxWidth: 1040, margin: '0 auto', padding: '40px 48px' }}>
        <SectionHeaderV2
          number="01"
          title="Four careers that might fit"
          aside={`${careers.length} candidates`}
        />
        <div style={{
          marginTop: 40,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
          gap: 20,
        }}>
          {careers.map((c, i) => (
            <CareerCardV2
              key={i}
              index={i}
              career={c}
              density={density}
              onOpen={() => setOpenCareerIndex(i)}
            />
          ))}
        </div>
      </section>

      {/* Obscure */}
      {obscure.length > 0 && (
        <section style={{ maxWidth: 1040, margin: '0 auto', padding: '72px 48px' }}>
          <SectionHeaderV2
            number="02"
            title="Paths you may not have heard named"
            aside={`${obscure.length} off-the-map`}
          />
          <p style={{
            fontFamily: 'var(--font-serif)', fontStyle: 'italic',
            fontSize: 17, lineHeight: 1.55, fontWeight: 400,
            color: '#58666F',
            maxWidth: 600, marginTop: 20, marginBottom: 36,
          }}>
            These might feel random. That's the point — you can't want a job you've never been shown. Worth a Google, not a commitment.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 16 }}>
            {obscure.map((o, i) => (
              <div key={i} style={{
                padding: '24px 26px',
                background: 'linear-gradient(160deg, oklch(0.99 0.008 240 / 0.48), oklch(0.96 0.015 245 / 0.30))',
                border: '1px solid transparent',
                borderRadius: 14,
                backdropFilter: 'blur(14px) saturate(125%)',
                WebkitBackdropFilter: 'blur(14px) saturate(125%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.52), inset 0 -1px 0 rgba(255,255,255,0.10), 0 8px 18px rgba(22,40,66,0.08)',
              }}>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase',
                  color: '#58666F',
                  marginBottom: 10,
                }}>Worth a look · {String(i+1).padStart(2, '0')}</div>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 400,
                  letterSpacing: '-0.01em', marginBottom: 8, lineHeight: 1.2,
                }}>{o.title}</div>
                <p style={{
                  fontSize: 13, lineHeight: 1.5, margin: '0 0 14px',
                  color: '#58666F',
                }}>{o.oneLine}</p>
                <p style={{
                  fontFamily: 'var(--font-serif)', fontSize: 15, lineHeight: 1.55,
                  color: '#141C21', fontStyle: 'italic',
                  margin: 0, textWrap: 'pretty',
                }}>{o.why}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Portrait, now smaller and less central */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '72px 48px 40px' }}>
        <SectionHeaderV2
          number="03"
          title="What I'm noticing about you"
          aside="Observations, not conclusions"
        />
        <p style={{
          fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontSize: 16, lineHeight: 1.55, color: '#58666F',
          maxWidth: 580, marginTop: 20, marginBottom: 32,
          textWrap: 'pretty',
        }}>
          I kept track of what I was hearing. These aren't verdicts on who you are — just the threads I pulled on while we talked.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 24 }}>
          {[
            { label: 'What you said you love', entries: profile.interests },
            { label: 'What seemed to matter', entries: profile.values },
            { label: 'How you work', entries: profile.workStyle },
            { label: 'How you relate', entries: profile.social },
          ].map(cat => (
            <div key={cat.label}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
                color: '#58666F',
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: '1px solid oklch(0.88 0.008 240)',
              }}>{cat.label}</div>
              {cat.entries.length === 0 ? (
                <div style={{ fontSize: 13, fontStyle: 'italic', color: '#58666F' }}>—</div>
              ) : cat.entries.map((e, i) => (
                <div key={i} style={{
                  fontSize: 13.5, lineHeight: 1.55,
                  padding: '5px 0',
                  color: '#141C21',
                }}>{stripParenLevel(e.text)}</div>
              ))}
            </div>
          ))}
        </div>

        {profile.pressure.length > 0 && (
          <div style={{
            marginTop: 48, padding: '24px 28px',
            background: 'linear-gradient(160deg, oklch(0.99 0.008 240 / 0.48), oklch(0.96 0.015 245 / 0.30))',
            border: '1px solid transparent',
            borderRadius: 14,
            backdropFilter: 'blur(14px) saturate(125%)',
            WebkitBackdropFilter: 'blur(14px) saturate(125%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.52), inset 0 -1px 0 rgba(255,255,255,0.10), 0 8px 18px rgba(22,40,66,0.08)',
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: '#58666F',
              marginBottom: 14,
            }}>Threads worth returning to</div>
            <p style={{
              fontFamily: 'var(--font-serif)', fontStyle: 'italic',
              fontSize: 14, lineHeight: 1.5,
              color: '#58666F',
              margin: '0 0 14px',
            }}>Things I heard that might be worth talking about with a counselor or someone you trust — not conclusions, just patterns.</p>
            {profile.pressure.map((p, i) => (
              <div key={i} style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 15, lineHeight: 1.55,
                color: '#141C21',
                margin: '0 0 10px', paddingLeft: 16,
                borderLeft: '2px solid #B9CEF4',
              }}>{p.text}</div>
            ))}
          </div>
        )}
      </section>

      {/* Footer disclaimer */}
      <footer style={{
        borderTop: '1px solid oklch(0.88 0.008 240)',
        padding: '36px 48px',
        maxWidth: 900, margin: '40px auto 0',
        fontSize: 12, lineHeight: 1.6, color: '#58666F',
        fontStyle: 'italic',
        fontFamily: 'var(--font-serif)',
      }}>
        Mirror is a guide, not a decision-maker. The careers above are a starting list to explore, not an answer. Take this to a counselor, a mentor, or someone who knows you. The final decision is always yours — and you're allowed to change it.
      </footer>

      {/* Detail modal */}
      {openCareerIndex !== null && careers[openCareerIndex] && (
        <CareerDetailModal
          career={careers[openCareerIndex]}
          index={openCareerIndex}
          onClose={() => setOpenCareerIndex(null)}
        />
      )}
      </div>
    </div>
  );
}

// Remove trailing "(high)", "(medium)" etc. from profile text
function stripParenLevel(text) {
  return text?.replace(/\s*\((high|medium|low)[^)]*\)\s*$/i, '') || text;
}

function SectionHeaderV2({ number, title, aside }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      gap: 20,
      paddingBottom: 20,
      borderBottom: '1px solid oklch(0.22 0.015 240)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, flex: 1 }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, letterSpacing: '0.25em', color: '#58666F',
        }}>{number}</span>
        <h2 style={{
          fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 400,
          letterSpacing: '-0.01em', margin: 0, flex: 1,
        }}>{title}</h2>
      </div>
      {aside && (
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: '#58666F',
        }}>{aside}</span>
      )}
    </div>
  );
}

// -------- Career tile (clickable, opens modal) --------
function CareerCardV2({ career, index, density, onOpen }) {
  const [sourcesOpen, setSourcesOpen] = useStateRes2(false);
  const [hover, setHover] = useStateRes2(false);

  const aiRiskLevel = (career.aiRisk || '').split('—')[0].trim().toLowerCase();
  const aiRiskColor =
    aiRiskLevel.startsWith('low') ? 'oklch(0.55 0.12 145)' :
    aiRiskLevel.startsWith('high') ? 'oklch(0.55 0.12 30)' :
    'oklch(0.58 0.10 60)';

  const compact = density === 'minimal';

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff',
        border: '1px solid ' + (hover ? 'oklch(0.72 0.05 240)' : 'oklch(0.88 0.008 240)'),
        borderRadius: 16,
        padding: compact ? '22px 24px 20px' : '28px 28px 24px',
        display: 'flex', flexDirection: 'column',
        cursor: 'pointer',
        transition: 'box-shadow 240ms, border-color 240ms, transform 240ms',
        boxShadow: hover
          ? '0 1px 2px rgba(22,40,66,0.05), 0 18px 40px rgba(22,40,66,0.10)'
          : '0 1px 2px rgba(22,40,66,0.03)',
        transform: hover ? 'translateY(-2px)' : 'none',
        position: 'relative',
        outline: 'none',
      }}>

      {/* Header row: candidate index + sources trigger */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase',
          color: '#58666F',
        }}>Candidate · {String(index + 1).padStart(2, '0')}</span>

        <button
          onMouseEnter={() => setSourcesOpen(true)}
          onMouseLeave={() => setSourcesOpen(false)}
          onFocus={() => setSourcesOpen(true)}
          onBlur={() => setSourcesOpen(false)}
          onClick={(e) => { e.stopPropagation(); setSourcesOpen(v => !v); }}
          aria-label="Show data sources"
          style={{
            border: '1px solid oklch(0.85 0.01 240)',
            background: sourcesOpen ? 'oklch(0.96 0.015 240)' : '#fff',
            width: 28, height: 28, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', position: 'relative',
            color: '#58666F',
          }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="6" cy="6" r="5"/>
            <path d="M6 5.5v3M6 3.5v.2" strokeLinecap="round"/>
          </svg>
          {sourcesOpen && <SourcesPopover sources={sourcesForCareer(career.title)} />}
        </button>
      </div>

      {/* Title + one-line */}
      <h3 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: compact ? 24 : 30, fontWeight: 400,
        letterSpacing: '-0.01em', lineHeight: 1.15,
        margin: '0 0 10px',
        color: '#141C21',
      }}>{career.title}</h3>

      <p style={{
        fontSize: 14, lineHeight: 1.55, margin: '0 0 18px',
        color: '#58666F',
      }}>{career.oneLine}</p>

      {/* Stat chips */}
      {!compact && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          <StatChip label="Salary" value={career.salary} />
          <StatChip label="AI risk" value={aiRiskLevel || 'n/a'} valueColor={aiRiskColor} />
        </div>
      )}

      {/* Why this might fit you */}
      <div style={{
        padding: compact ? '14px 16px' : '18px 20px',
        background: 'oklch(0.96 0.012 230)',
        border: '1px solid oklch(0.88 0.02 230)',
        borderRadius: 12,
        marginBottom: 16,
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: '#58666F',
          marginBottom: 8,
        }}>Why this might fit you</div>
        <p style={{
          fontFamily: 'var(--font-serif)', fontSize: compact ? 14.5 : 16.5, lineHeight: 1.55,
          color: '#141C21',
          margin: 0, textWrap: 'pretty',
        }}>{career.why}</p>
      </div>

    </article>
  );
}

// -------- Detail modal --------
function CareerDetailModal({ career, index, onClose }) {
  const [tab, setTab] = useStateRes2('reality');
  const [sourcesOpen, setSourcesOpen] = useStateRes2(false);
  const measureRefs = useRefRes2({ reality: null, trajectory: null, path: null });
  const MIN_TAB_PANEL_HEIGHT = 280;
  const [maxTabHeight, setMaxTabHeight] = useStateRes2(MIN_TAB_PANEL_HEIGHT);

  const aiRiskLevel = (career.aiRisk || '').split('—')[0].trim().toLowerCase();
  const aiRiskColor =
    aiRiskLevel.startsWith('low') ? 'oklch(0.55 0.12 145)' :
    aiRiskLevel.startsWith('high') ? 'oklch(0.55 0.12 30)' :
    'oklch(0.58 0.10 60)';

  useEffectRes2(() => {
    function measureTallestTab() {
      const heights = ['reality', 'trajectory', 'path'].map((key) => {
        const el = measureRefs.current[key];
        return el ? el.scrollHeight : 0;
      });
      const tallest = Math.max(...heights, 0);
      if (tallest > 0) setMaxTabHeight(tallest);
    }

    measureTallestTab();
    window.addEventListener('resize', measureTallestTab);
    return () => window.removeEventListener('resize', measureTallestTab);
  }, [career, tab]);

  function renderTabPanel(panelId) {
    if (panelId === 'reality') {
      return (
        <div>
          <DetailBlock label="A typical day" sourceTag="onet">{career.dayToDay}</DetailBlock>
          <DetailBlock label="Work–life balance" sourceTag="glassdoor">{career.workLifeBalance}</DetailBlock>
          {career.humanVoice && (
            <DetailBlock label="Someone in this field, on the record" sourceTag="interviews">
              <span style={{ fontStyle: 'italic' }}>&ldquo;{career.humanVoice}&rdquo;</span>
            </DetailBlock>
          )}
        </div>
      );
    }

    if (panelId === 'trajectory') {
      return (
        <div>
          <DetailBlock label="How the field is moving" sourceTag="bls">{career.outlook}</DetailBlock>
          <DetailBlock label="AI risk, honestly" sourceTag="linkedin">{career.aiRisk}</DetailBlock>
          <DetailBlock label="5 / 10 / 20 years out" sourceTag="linkedin">{career.progression}</DetailBlock>
        </div>
      );
    }

    return (
      <div>
        <DetailBlock label="Programs to look at" sourceTag="aaas">{career.schools}</DetailBlock>
        <p style={{
          fontSize: 13, lineHeight: 1.55, color: '#58666F',
          marginTop: 20, fontStyle: 'italic',
          fontFamily: 'var(--font-serif)',
        }}>This is a starting list. Talk to a school counselor or an admissions officer before committing — they'll know current cycles and funding better than I do.</p>
      </div>
    );
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'transparent',
        backdropFilter: 'blur(16px) saturate(120%)',
        WebkitBackdropFilter: 'blur(16px) saturate(120%)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '40px 24px',
        overflowY: 'scroll',
        animation: 'mirrorModalFade 200ms ease-out',
      }}>
      <style>{`
        @keyframes mirrorModalFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes mirrorModalRise { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={career.title}
        style={{
          background: 'linear-gradient(160deg, oklch(0.99 0.008 240 / 0.56), oklch(0.95 0.015 245 / 0.34))',
          border: '1px solid transparent',
          borderRadius: 20,
          width: '100%', maxWidth: 820,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.54), inset 0 -1px 0 rgba(255,255,255,0.14), 0 20px 56px rgba(22,40,66,0.18)',
          backdropFilter: 'blur(14px) saturate(125%)',
          WebkitBackdropFilter: 'blur(14px) saturate(125%)',
          position: 'relative',
          animation: 'mirrorModalRise 240ms cubic-bezier(0.2,0.8,0.2,1)',
          margin: 'auto',
          overflow: 'hidden',
        }}>

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 18, right: 18,
            width: 36, height: 36, borderRadius: '50%',
            border: '1px solid #B9CEF4',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#141C21',
            zIndex: 2,
          }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Header */}
        <div style={{ padding: '32px 36px 24px', borderBottom: '1px solid oklch(1 0 0 / 0.2)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 14,
          }}>
            <span style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase',
              color: '#58666F',
            }}>Candidate · {String(index + 1).padStart(2, '0')}</span>

            <button
              onMouseEnter={() => setSourcesOpen(true)}
              onMouseLeave={() => setSourcesOpen(false)}
              onFocus={() => setSourcesOpen(true)}
              onBlur={() => setSourcesOpen(false)}
              onClick={() => setSourcesOpen(v => !v)}
              aria-label="Show data sources"
              style={{
                border: '1px solid #B9CEF4',
                background: 'transparent',
                width: 24, height: 24, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative',
                color: '#58666F',
              }}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="6" cy="6" r="5"/>
                <path d="M6 5.5v3M6 3.5v.2" strokeLinecap="round"/>
              </svg>
              {sourcesOpen && <SourcesPopover sources={sourcesForCareer(career.title)} />}
            </button>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 36, fontWeight: 400,
            letterSpacing: '-0.01em', lineHeight: 1.1,
            margin: '0 0 12px',
            color: '#141C21',
            paddingRight: 40,
          }}>{career.title}</h2>

          <p style={{
            fontSize: 15, lineHeight: 1.55, margin: '0 0 18px',
            color: '#58666F',
            maxWidth: 640,
          }}>{career.oneLine}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <StatChip label="Salary" value={career.salary} />
            <StatChip label="AI risk" value={aiRiskLevel || 'n/a'} valueColor={aiRiskColor} />
          </div>
        </div>

        {/* Why — prominent in modal too */}
        <div style={{ padding: '24px 36px 8px' }}>
          <div style={{
            padding: '20px 22px',
            background: 'transparent',
            border: '1px solid #B9CEF4',
            borderRadius: 12,
          }}>
            <div style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: '#58666F',
              marginBottom: 8,
            }}>Why this might fit you</div>
            <p style={{
              fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1.55,
              color: '#141C21',
              margin: 0, textWrap: 'pretty',
            }}>{career.why}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ padding: '20px 36px 8px' }}>
          <div style={{
            display: 'flex', gap: 2,
            padding: 3,
            background: 'transparent',
            border: '1px solid #B9CEF4',
            borderRadius: 999,
            fontFamily: "'Lato', sans-serif",
            fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
          }}>
            {[
              { id: 'reality', label: 'The reality' },
              { id: 'trajectory', label: 'Trajectory' },
              { id: 'path', label: 'Getting in' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1,
                padding: '10px 12px',
                background: 'transparent',
                border: '1px solid #B9CEF4', borderRadius: 999,
                fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit',
                color: tab === t.id ? '#141C21' : '#58666F',
                cursor: 'pointer',
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Hidden measurement layer to size by tallest tab */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          inset: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
          zIndex: -1,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 36px 36px' }}>
            <div ref={(el) => { measureRefs.current.reality = el; }}>{renderTabPanel('reality')}</div>
            <div ref={(el) => { measureRefs.current.trajectory = el; }}>{renderTabPanel('trajectory')}</div>
            <div ref={(el) => { measureRefs.current.path = el; }}>{renderTabPanel('path')}</div>
          </div>
        </div>

        {/* Tab content */}
        <div style={{ padding: '20px 36px 36px', height: `${Math.max(maxTabHeight, MIN_TAB_PANEL_HEIGHT)}px`, overflowY: 'auto' }}>
          {renderTabPanel(tab)}
        </div>
      </div>
    </div>
  );
}



function StatChip({ label, value, valueColor }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'baseline', gap: 8,
      padding: '7px 12px',
      background: 'transparent',
      border: '1px solid #B9CEF4',
      borderRadius: 999,
      fontFamily: "'Lato', sans-serif",
    }}>
      <span style={{
        fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase',
        color: '#58666F',
      }}>{label}</span>
      <span style={{
        fontSize: 11, fontWeight: 500,
        color: '#141C21',
      }}>{value}</span>
    </div>
  );
}

function DetailBlock({ label, sourceTag, children }) {
  const src = SOURCE_LIBRARY[sourceTag];
  const tierStyle = src ? TIER_STYLES[src.tier] : null;
  return (
    <div style={{
      marginBottom: 18,
      padding: '12px 14px',
      background: 'transparent',
      border: '1px solid #B9CEF4',
      borderRadius: 12,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 8,
      }}>
        <div style={{
          fontFamily: "'Lato', sans-serif",
          fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: '#58666F',
        }}>{label}</div>
        {tierStyle && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '2px 8px',
            background: 'transparent',
            border: '1px solid #B9CEF4',
            color: '#58666F',
            borderRadius: 999,
            fontFamily: "'Lato', sans-serif",
            fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase',
          }}
          title={`${src.label}. ${src.reason}`}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: tierStyle.dot }}/>
            {tierStyle.label}
          </span>
        )}
      </div>
      <div style={{
        fontSize: 14, lineHeight: 1.6,
        color: '#141C21',
      }}>{children}</div>
    </div>
  );
}

function SourcesPopover({ sources }) {
  return (
    <div
      role="tooltip"
      style={{
        position: 'absolute', top: 36, right: 0,
        width: 340,
        background: 'oklch(0.98 0.01 245 / 0.96)',
        border: '1px solid #B9CEF4',
        borderRadius: 14,
        padding: '18px 20px',
        textAlign: 'left',
        zIndex: 20,
        cursor: 'default',
        boxShadow: '0 12px 28px rgba(22,40,66,0.14)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{
        fontFamily: "'Lato', sans-serif",
        fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase',
        color: '#58666F',
        marginBottom: 8,
      }}>Sources behind this card</div>
      <p style={{
        fontSize: 12, lineHeight: 1.5,
        color: '#58666F',
        margin: '0 0 14px',
      }}>Different sources answer different questions. Here's what I used and why.</p>
      {sources.map(sid => {
        const s = SOURCE_LIBRARY[sid];
        const ts = TIER_STYLES[s.tier];
        return (
          <div key={sid} style={{
            padding: '10px 0',
            borderTop: '1px solid oklch(0.93 0.008 240)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              marginBottom: 4,
            }}>
              <span style={{
                fontSize: 12, fontWeight: 500,
                color: '#141C21',
                fontFamily: 'Lato, sans-serif',
              }}>{s.label}</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '1px 7px',
                background: 'transparent', color: '#58666F',
                border: '1px solid #B9CEF4',
                borderRadius: 999,
                fontFamily: "'Lato', sans-serif",
                fontSize: 7, letterSpacing: '0.18em', textTransform: 'uppercase',
              }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: ts.dot }}/>
                {ts.label}
              </span>
            </div>
            <div style={{
              fontSize: 11.5, lineHeight: 1.5,
              color: '#58666F',
            }}>{s.reason}</div>
          </div>
        );
      })}
      <div style={{
        marginTop: 12, paddingTop: 12,
        borderTop: '1px solid oklch(0.93 0.008 240)',
        fontSize: 12, lineHeight: 1.5,
        color: '#58666F',
        fontStyle: 'italic',
        fontFamily: 'var(--font-serif)',
      }}>
        Structured sources (BLS, O*NET) drive the numbers. Anecdotal sources shape the texture. They're not interchangeable.
      </div>
    </div>
  );
}

const btnV2 = {
  padding: '9px 18px',
  border: '1px solid oklch(0.22 0.015 240)',
  background: 'transparent',
  color: '#141C21',
  borderRadius: 999,
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
  cursor: 'pointer',
};

Object.assign(window, { ResultsViewV2, CareerDetailModal });
