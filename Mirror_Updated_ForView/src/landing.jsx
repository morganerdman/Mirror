// Landing: hero over salt flats + scroll-revealed personal note
const { useEffect: useEffectLanding, useState: useStateLanding, useRef: useRefLanding } = React;

function MirrorCtaButton({ children, onClick, size = 'lg' }) {
  const py = size === 'lg' ? 18 : 12;
  const px = size === 'lg' ? 52 : 28;
  const fontSize = size === 'lg' ? 19 : 15;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-serif)',
        fontSize,
        fontWeight: 400,
        letterSpacing: '0.01em',
        padding: `${py}px ${px}px`,
        borderRadius: 999,
        border: '1px solid rgba(220, 230, 242, 0.95)',
        background: '#fff',
        color: '#141C21',
        cursor: 'pointer',
        boxShadow: '0 8px 24px rgba(20, 40, 60, 0.12)',
      }}
    >
      {children}
    </button>
  );
}

function LandingPage({ onBegin }) {
  const [scrollY, setScrollY] = useStateLanding(0);
  const noteRef = useRefLanding(null);
  const [noteVisible, setNoteVisible] = useStateLanding(false);

  useEffectLanding(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffectLanding(() => {
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setNoteVisible(true),
      { threshold: 0.2 }
    );
    if (noteRef.current) obs.observe(noteRef.current);
    return () => obs.disconnect();
  }, []);

  const parallax = Math.min(scrollY * 0.3, 200);

  return (
    <div style={{ background: '#F8FBFF', color: '#141C21', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        position: 'relative',
        height: '100vh',
        minHeight: 640,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Background image with subtle parallax */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("assets/hero-saltflats.jpeg")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 50%',
          opacity: 0.5,
        }}/>
        {/* Subtle top-bottom tone */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.0) 55%, rgba(245,250,255,0.35) 100%)',
        }}/>

        {/* Top hairline + tiny wordmark */}
        <div style={{
          position: 'relative', zIndex: 2,
          padding: '28px 40px',
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
          color: '#141C21',
        }}>
          <div style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 22, fontWeight: 400, letterSpacing: '0.02em',
            lineHeight: '22px', height: 22,
            position: 'fixed', top: 28, left: 40, zIndex: 30,
            textShadow: '0 1px 2px rgba(255,255,255,0.6)',
          }}>Mirror</div>
          <div style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: '#58666F',
            textShadow: '0 1px 2px rgba(255,255,255,0.6)',
          }}>v1.0 · pre-build</div>
        </div>

        {/* Center headline + CTA */}
        <div style={{
          position: 'relative', zIndex: 2,
          flex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 24px',
          transform: 'none',
          opacity: Math.max(0, 1 - scrollY / 500),
        }}>
          <div style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
            color: '#58666F',
            textShadow: '0 1px 2px rgba(255,255,255,0.6)',
            marginBottom: 28,
          }}>An advisor that actually listens</div>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(56px, 10vw, 128px)',
            fontWeight: 400,
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            margin: 0,
            textAlign: 'center',
            color: '#141C21',
            textShadow: '0 2px 16px rgba(255,255,255,0.35)',
          }}>
            What do <em style={{
              fontStyle: 'italic',
              fontWeight: 600,
              color: '#141C21',
              position: 'relative',
            }}>you</em> want?
          </h1>

          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 22, fontWeight: 300, fontStyle: 'italic',
            color: '#58666F',
            textShadow: '0 1px 2px rgba(255,255,255,0.5)',
            margin: '24px 0 48px',
            textAlign: 'center', maxWidth: 520,
            lineHeight: 1.4,
          }}>Not what your parents want. Not what sounds impressive. You.</p>

          <MirrorCtaButton onClick={onBegin}>Begin</MirrorCtaButton>

          <div style={{
            marginTop: 32,
            fontFamily: "'Lato', sans-serif",
            fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: '#58666F',
            textShadow: '0 1px 2px rgba(255,255,255,0.5)',
          }}>No sign-up · One conversation · About 20 minutes</div>
        </div>

        {/* Scroll hint */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          zIndex: 2,
          fontFamily: "'Lato', sans-serif",
          fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
          color: '#58666F',
          textShadow: '0 1px 2px rgba(255,255,255,0.6)',
          opacity: Math.max(0, 1 - scrollY / 200),
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <span>Scroll</span>
          <div style={{ width: 1, height: 32, background: 'oklch(0.38 0.015 240)', opacity: 0.5 }}/>
        </div>
      </section>

      {/* Personal note */}
      <section ref={noteRef} style={{
        padding: '140px 24px 120px',
        maxWidth: 720, margin: '0 auto',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        opacity: noteVisible ? 1 : 0,
        transform: noteVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 1.2s ease, transform 1.2s ease',
      }}>
        <div style={{
          fontFamily: "'Lato', sans-serif",
          fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
          color: '#58666F',
          marginBottom: 32,
        }}>A note from the maker</div>

        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(28px, 3.5vw, 40px)',
          lineHeight: 1.35,
          fontWeight: 400,
          color: '#141C21',
          margin: 0,
          letterSpacing: '-0.01em',
        }}>
          I built Mirror because I was you. Undecided. Overwhelmed. Switching majors. Terrified of picking wrong. Nobody handed me a real answer, so I built the tool I wish I'd had.
        </p>

        <div style={{ marginTop: 80 }}>
          <MirrorCtaButton onClick={onBegin} size="sm">Begin the conversation</MirrorCtaButton>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px 40px',
        display: 'flex', justifyContent: 'space-between',
        fontFamily: "'Lato', sans-serif",
        fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase',
        color: '#58666F',
      }}>
        <span>© 2026 Mirror</span>
        <span>Anonymous · No accounts · 30-day session</span>
      </footer>
    </div>
  );
}

window.LandingPage = LandingPage;
