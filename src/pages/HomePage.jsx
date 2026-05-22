import { useState, useEffect, useRef, useCallback } from 'react'
import { ROUTES, CATEGORY_CONFIG, DIFFICULTY_CONFIG } from '../data/routes.js'

// ─── Card color palette (Apple product colorways) ───────────────
const CARD_PALETTES = [
  { bg: '#1d1d1f', text: '#f5f5f7', accent: '#86868b' }, // Space Black
  { bg: '#4a6b88', text: '#f0f4f9', accent: '#7a99b8' }, // Sierra Blue
  { bg: '#4a6356', text: '#eaf0eb', accent: '#7a9088' }, // Alpine Green
  { bg: '#514458', text: '#f0e8f0', accent: '#867693' }, // Deep Purple
  { bg: '#ebe5d8', text: '#2a2520', accent: '#a8957a' }, // Starlight
  { bg: '#2a3854', text: '#e8edf5', accent: '#5c6e8c' }, // Midnight
  { bg: '#b86b54', text: '#fbe9e0', accent: '#8a4e3d' }, // Sunset Coral
  { bg: '#c9a872', text: '#3a2e1f', accent: '#a08660' }, // Gold
]

function getPalette(id) {
  return CARD_PALETTES[(id - 1) % CARD_PALETTES.length]
}

// ─── Single flip card ───────────────────────────────────────────────
function FlipCard({ route, isFlipped, onClick, style = {} }) {
  const palette = getPalette(route.id)
  const cat = CATEGORY_CONFIG[route.cat]
  const diff = DIFFICULTY_CONFIG[route.diff]
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`路線 ${route.id} ${route.zh}，按 Enter 翻面`}
      aria-pressed={isFlipped}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      style={{
        perspective: '1000px',
        cursor: 'pointer',
        aspectRatio: '3/4',
        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: hovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered
          ? `0 28px 56px rgba(0,0,0,0.55), 0 0 0 1px ${palette.accent}33`
          : '0 6px 16px rgba(0,0,0,0.3)',
        borderRadius: '20px',
        outline: 'none',
        ...style,
      }}
      onFocus={e => { e.currentTarget.style.boxShadow = `0 28px 56px rgba(0,0,0,0.55), 0 0 0 3px #ff6b1a` }}
      onBlur={e => {
        e.currentTarget.style.boxShadow = hovered
          ? `0 28px 56px rgba(0,0,0,0.55), 0 0 0 1px ${palette.accent}33`
          : '0 6px 16px rgba(0,0,0,0.3)'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── FRONT (face down) ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: '20px',
            background: palette.bg,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '20px',
            overflow: 'hidden',
          }}
        >
          {/* big decorative text */}
          <div
            style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: 'clamp(52px, 8vw, 80px)',
              fontWeight: 900,
              lineHeight: 0.88,
              color: palette.text,
              textTransform: 'uppercase',
              letterSpacing: '-0.03em',
              userSelect: 'none',
            }}
          >
            Flip<br />It
          </div>

          {/* route number bottom */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span
              style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                color: palette.text,
                opacity: 0.6,
                textTransform: 'uppercase',
              }}
            >
              #{String(route.id).padStart(2, '0')}
            </span>
            <svg
              width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={palette.text} strokeWidth="2"
              style={{
                opacity: hovered ? 0.9 : 0.5,
                transform: hovered ? 'translateX(6px)' : 'translateX(0)',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
              }}
            >
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>

          {/* subtle bg circle */}
          <div style={{
            position: 'absolute',
            bottom: '-30%',
            right: '-20%',
            width: '80%',
            paddingBottom: '80%',
            borderRadius: '50%',
            background: palette.text,
            opacity: 0.06,
          }} />
        </div>

        {/* ── BACK (route info) ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: '20px',
            background: '#1c1c1e',
            border: `2px solid ${cat?.color ?? '#ff6b1a'}44`,
            display: 'flex',
            flexDirection: 'column',
            padding: '18px',
            overflow: 'hidden',
            gap: '10px',
          }}
        >
          {/* top accent */}
          <div style={{ height: '2px', background: `linear-gradient(90deg, ${cat?.color}, transparent)`, borderRadius: '1px', flexShrink: 0 }} />

          {/* cat + diff */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <span style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '11px',
              color: cat?.color,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: cat?.color, display: 'inline-block' }} />
              {cat?.label}
            </span>
            <span style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: diff?.textColor,
              background: diff?.bgColor,
              border: `1px solid ${diff?.textColor}44`,
              padding: '2px 7px',
              borderRadius: '2px',
              textTransform: 'uppercase',
            }}>
              {diff?.label}
            </span>
          </div>

          {/* names */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <div style={{
              fontFamily: 'Noto Sans TC, sans-serif',
              fontSize: 'clamp(15px, 2.5vw, 22px)',
              fontWeight: 700,
              color: '#f5f5f7',
              lineHeight: 1.2,
              marginBottom: '4px',
            }}>
              {route.zh}
            </div>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '11px',
              color: '#86868b',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              {route.en}
            </div>
          </div>

          {/* SVG profile */}
          <div style={{ background: '#0e0e0e', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
            <svg viewBox="0 0 174 120" style={{ display: 'block', width: '100%', height: '52px' }} preserveAspectRatio="none">
              <defs>
                <linearGradient id={`hg-${route.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={cat?.color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={cat?.color} stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path d={`${route.svgPath} L174,120 L0,120 Z`} fill={`url(#hg-${route.id})`} />
              <path d={route.svgPath} fill="none" stroke={cat?.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', flexShrink: 0 }}>
            {[
              { v: route.km, u: 'km' },
              { v: route.elev, u: 'm↑' },
              { v: `${route.avgGrade}%`, u: 'avg' },
            ].map(({ v, u }) => (
              <div key={u} style={{ background: '#2a2a2c', borderRadius: '8px', padding: '6px 4px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '16px', fontWeight: 700, color: '#f5f5f7', lineHeight: 1 }}>{v}</div>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '9px', color: '#6e6e73', letterSpacing: '0.1em', marginTop: '2px', textTransform: 'uppercase' }}>{u}</div>
              </div>
            ))}
          </div>

          {/* maps link */}
          <a
            href={route.gmapUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#ff6b1a', background: 'rgba(255,107,26,0.08)',
              border: '1px solid rgba(255,107,26,0.25)', borderRadius: '4px',
              padding: '8px', textDecoration: 'none', flexShrink: 0,
              transition: 'background 0.15s',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Google Maps
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Surprise Me Spotlight ──────────────────────────────────────────
function SurpriseSpotlight({ route, onNext, isAnimating }) {
  const palette = route ? getPalette(route.id) : CARD_PALETTES[0]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '28px',
      padding: '48px 24px 32px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* bg glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: route ? `radial-gradient(circle, ${palette.bg}22 0%, transparent 70%)` : 'transparent',
        transition: 'background 0.6s ease',
        pointerEvents: 'none',
      }} />

      {/* eyebrow */}
      <div style={{
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: '11px',
        letterSpacing: '0.25em',
        color: '#6e6e73',
        textTransform: 'uppercase',
      }}>
        今天騎哪條？
      </div>

      {/* card area */}
      <div style={{
        width: '100%',
        maxWidth: '260px',
        position: 'relative',
      }}>
        {/* shuffle ghost cards behind */}
        {[2, 1].map(i => (
          <div key={i} style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '20px',
            background: CARD_PALETTES[(i * 3) % CARD_PALETTES.length].bg,
            opacity: isAnimating ? 0.5 - i * 0.15 : 0.18 - i * 0.06,
            transform: `rotate(${isAnimating ? (i * 8 - 6) : (i * 3 - 2)}deg) translateY(${i * 4}px)`,
            transition: 'all 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
          }} />
        ))}

        {route && (
          <div style={{
            position: 'relative',
            animation: isAnimating ? 'cardLand 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards' : 'none',
          }}>
            <style>{`
              @keyframes cardLand {
                0%   { transform: translateY(-40px) rotate(-6deg) scale(0.88); opacity: 0; }
                60%  { transform: translateY(6px) rotate(1deg) scale(1.02); opacity: 1; }
                100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
              }
            `}</style>
            <SurpriseCard route={route} palette={palette} />
          </div>
        )}
      </div>

      {/* Surprise Me button */}
      <button
        onClick={onNext}
        style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: '18px',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#0e0e0e',
          background: '#ff6b1a',
          border: 'none',
          borderRadius: '999px',
          padding: '14px 40px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease, box-shadow 0.25s ease',
          boxShadow: '0 8px 24px rgba(255,107,26,0.25), 0 0 0 0.5px rgba(255,255,255,0.1) inset',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#ff8c4a'; e.currentTarget.style.transform = 'scale(1.03)' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#ff6b1a'; e.currentTarget.style.transform = 'scale(1)' }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1.03)'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>
        Surprise Me
      </button>

      {route && (
        <div style={{
          fontFamily: 'Noto Sans TC, sans-serif',
          fontSize: '13px',
          color: '#86868b',
          textAlign: 'center',
        }}>
          點擊下方卡牌也可自己選
        </div>
      )}
    </div>
  )
}

// ─── Surprise card (always face up, big) ───────────────────────────
function SurpriseCard({ route, palette }) {
  const cat = CATEGORY_CONFIG[route.cat]
  const diff = DIFFICULTY_CONFIG[route.diff]
  return (
    <div style={{
      borderRadius: '20px',
      background: palette.bg,
      padding: '22px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      aspectRatio: '3/4',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: `0 20px 60px ${palette.bg}66`,
    }}>
      {/* deco circle */}
      <div style={{ position: 'absolute', bottom: '-25%', right: '-25%', width: '70%', paddingBottom: '70%', borderRadius: '50%', background: palette.text, opacity: 0.07 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '11px', color: palette.text, opacity: 0.7, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          #{String(route.id).padStart(2,'0')} · {cat?.label}
        </span>
        <span style={{
          fontFamily: 'Barlow Condensed, sans-serif', fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.1em', color: diff?.textColor,
          background: diff?.bgColor, border: `1px solid ${diff?.textColor}55`,
          padding: '2px 7px', borderRadius: '2px', textTransform: 'uppercase',
        }}>
          {diff?.label}
        </span>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Noto Sans TC, sans-serif', fontSize: '22px', fontWeight: 700, color: palette.text, lineHeight: 1.2, marginBottom: '4px' }}>
          {route.zh}
        </div>
        <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '11px', color: palette.text, opacity: 0.5, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {route.en}
        </div>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '8px', overflow: 'hidden' }}>
        <svg viewBox="0 0 174 120" style={{ display: 'block', width: '100%', height: '56px' }} preserveAspectRatio="none">
          <path d={`${route.svgPath} L174,120 L0,120 Z`} fill={palette.text} opacity="0.15" />
          <path d={route.svgPath} fill="none" stroke={palette.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
        </svg>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px' }}>
        {[
          { v: route.km, u: 'km' },
          { v: route.elev + 'm', u: '爬升' },
          { v: route.avgGrade + '%', u: '均坡' },
        ].map(({ v, u }) => (
          <div key={u} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '7px 4px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '16px', fontWeight: 700, color: palette.text, lineHeight: 1 }}>{v}</div>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '9px', color: palette.text, opacity: 0.6, letterSpacing: '0.1em', marginTop: '2px' }}>{u}</div>
          </div>
        ))}
      </div>

      <a
        href={route.gmapUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
          fontFamily: 'Barlow Condensed, sans-serif', fontSize: '12px', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: palette.bg, background: palette.text,
          borderRadius: '6px', padding: '9px', textDecoration: 'none',
          boxShadow: `0 2px 12px ${palette.text}44`,
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        開啟導航
      </a>
    </div>
  )
}

// ─── Main HomePage ──────────────────────────────────────────────────
export default function HomePage() {
  const [flipped, setFlipped] = useState({})
  const [surpriseRoute, setSurpriseRoute] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const usedIds = useRef(new Set())

  const handleSurprise = useCallback(() => {
    if (isAnimating) return

    // reset after all 40 used
    if (usedIds.current.size >= ROUTES.length) usedIds.current.clear()

    const remaining = ROUTES.filter(r => !usedIds.current.has(r.id))
    const pick = remaining[Math.floor(Math.random() * remaining.length)]
    usedIds.current.add(pick.id)

    setIsAnimating(true)
    setSurpriseRoute(null)

    // brief blank pause → card lands
    setTimeout(() => {
      setSurpriseRoute(pick)
      setTimeout(() => setIsAnimating(false), 500)
    }, 120)
  }, [isAnimating])

  const toggleFlip = (id) => {
    setFlipped(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e' }}>
      {/* ── Header ── */}
      <header style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'linear-gradient(180deg, #141414 0%, #0e0e0e 100%)',
        padding: '28px 0 24px',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '11px',
              letterSpacing: '0.22em',
              color: '#ff6b1a',
              textTransform: 'uppercase',
              marginBottom: '6px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ display: 'inline-block', width: '24px', height: '1px', background: '#ff6b1a' }} />
              台北公路車路線資料庫
            </div>
            <h1 style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: 'clamp(36px, 7vw, 64px)',
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: '-0.02em',
              color: '#f5f5f7',
              textTransform: 'uppercase',
            }}>
              Taipei<br />
              <span style={{ color: '#ff6b1a' }}>Cycling</span>
            </h1>
          </div>
          <a
            href="/routes"
            style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#86868b',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
              padding: '10px 20px', textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f5f5f7'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#86868b'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            全部路線 →
          </a>
        </div>
      </header>

      {/* ── Section 1: Surprise Me ── */}
      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#141416' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <SurpriseSpotlight
            route={surpriseRoute}
            onNext={handleSurprise}
            isAnimating={isAnimating}
          />
        </div>
      </section>

      {/* ── Section 2: Waterfall grid ── */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* section header */}
        <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          <h2 style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: '#f5f5f7',
          }}>
            All <span style={{ color: '#ff6b1a' }}>40</span> Routes
          </h2>
          <span style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: '12px',
            color: '#6e6e73',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            點牌翻面查看
          </span>
        </div>

        {/* 4-col masonry grid */}
        <div className="card-grid" style={{
          columns: '4',
          columnGap: '16px',
          columnFill: 'balance',
        }}>
          <style>{`
            @media (max-width: 1024px) { .card-grid { columns: 3 !important; } }
            @media (max-width: 720px)  { .card-grid { columns: 2 !important; } }
            @media (max-width: 440px)  { .card-grid { columns: 1 !important; } }
            .flip-card-wrap { break-inside: avoid; margin-bottom: 16px; }
          `}</style>
          {ROUTES.map(route => (
            <div key={route.id} className="flip-card-wrap">
              <FlipCard
                route={route}
                isFlipped={!!flipped[route.id]}
                onClick={() => toggleFlip(route.id)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '20px 24px',
        textAlign: 'center',
      }}>
        <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '11px', color: '#48484a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          40 Routes · Taipei Cycling · 台北公路車
        </span>
      </footer>
    </div>
  )
}
