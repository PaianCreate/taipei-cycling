import { useState, useEffect, useRef, useCallback } from 'react'
import { ROUTES, CATEGORY_CONFIG, DIFFICULTY_CONFIG } from '../data/routes.js'

// ─── Card palette：每張卡用「三色」暈染漸層（dreamy bloom）── primary 兼當 hover/maps 主色 ───
const CARD_PALETTES = [
  { name: 'Sunset',   primary: '#ff7a6b', secondary: '#ffa05c', tertiary: '#c44d8c' },
  { name: 'Aurora',   primary: '#6fc8d1', secondary: '#8ce7c4', tertiary: '#b094e6' },
  { name: 'Berry',    primary: '#c178c9', secondary: '#f491c9', tertiary: '#9180e3' },
  { name: 'Citrus',   primary: '#ff9f7a', secondary: '#ffd166', tertiary: '#f87ca8' },
  { name: 'Ocean',    primary: '#5a8fc4', secondary: '#6bbed1', tertiary: '#a99cdb' },
  { name: 'Sage',     primary: '#7ea88d', secondary: '#a0b576', tertiary: '#9bc4ad' },
  { name: 'Dusk',     primary: '#c4738e', secondary: '#d4a574', tertiary: '#7e6da8' },
  { name: 'Mist',     primary: '#a3c0d6', secondary: '#c8b8e4', tertiary: '#f0bdd1' },
]

// 文字一律白色（per design spec）
const CARD_TEXT = '#ffffff'

// 組三色暈染：cream 底 → 左上 primary、右上 secondary、下方 tertiary，三色互滲
function paletteGradient(p) {
  return `
    radial-gradient(circle at 25% 28%, ${p.primary} 0%, transparent 52%),
    radial-gradient(circle at 72% 25%, ${p.secondary} 0%, transparent 50%),
    radial-gradient(circle at 50% 78%, ${p.tertiary} 0%, transparent 55%),
    linear-gradient(135deg, #faf6ee 0%, #ffffff 100%)
  `
}

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
        cursor: 'pointer',
        aspectRatio: '3/4',
        transition: 'box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: hovered
          ? `0 28px 56px rgba(0,0,0,0.15), 0 0 0 1px ${palette.primary}33`
          : '0 6px 16px rgba(0,0,0,0.06)',
        borderRadius: '20px',
        outline: 'none',
        position: 'relative',
        ...style,
      }}
      onFocus={e => { e.currentTarget.style.boxShadow = `0 28px 56px rgba(0,0,0,0.15), 0 0 0 3px #ff6b1a` }}
      onBlur={e => {
        e.currentTarget.style.boxShadow = hovered
          ? `0 28px 56px rgba(0,0,0,0.15), 0 0 0 1px ${palette.primary}33`
          : '0 6px 16px rgba(0,0,0,0.06)'
      }}
    >
      {/* 3D context 包進來，不暴露給 CSS columns 流佈局 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        perspective: '1000px',
        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        ...(hovered ? { transform: 'translateY(-8px) scale(1.02)' } : {}),
      }}>
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
          className="card-hover-target"
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #faf6ee 0%, #ffffff 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '20px',
            overflow: 'hidden',
          }}
        >
          {/* 漸層 blob 層（hover 時呼吸） */}
          <div className="gradient-blob" style={{ background: paletteGradient(palette) }} />
          {/* 顆粒材質 */}
          <div className="grain" />
          {/* big decorative text */}
          <div
            className="card-content"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(52px, 8vw, 80px)',
              fontWeight: 900,
              lineHeight: 0.88,
              color: CARD_TEXT,
              textTransform: 'uppercase',
              letterSpacing: '-0.03em',
              userSelect: 'none',
            }}
          >
            Flip<br />It
          </div>

          {/* route number bottom */}
          <div className="card-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                color: CARD_TEXT,
                opacity: 0.6,
                textTransform: 'uppercase',
              }}
            >
              #{String(route.id).padStart(2, '0')}
            </span>
            <svg
              width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={CARD_TEXT} strokeWidth="2"
              style={{
                opacity: hovered ? 0.9 : 0.5,
                transform: hovered ? 'translateX(6px)' : 'translateX(0)',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
              }}
            >
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>

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
            background: '#ffffff',
            border: `1px solid ${cat?.color ?? '#9d8df1'}44`,
            display: 'flex',
            flexDirection: 'column',
            padding: '12px',
            overflow: 'hidden',
            gap: '6px',
          }}
        >
          {/* top accent */}
          <div style={{ height: '2px', background: `linear-gradient(90deg, ${cat?.color}, transparent)`, borderRadius: '1px', flexShrink: 0 }} />

          {/* cat + diff */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <span style={{
              fontFamily: 'var(--font-display)',
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
              fontFamily: 'var(--font-display)',
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
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-cjk)',
              fontSize: 'clamp(13px, 2.2vw, 20px)',
              fontWeight: 700,
              color: '#333333',
              lineHeight: 1.15,
              marginBottom: '2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {route.zh}
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '10px',
              color: '#86868b',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {route.en}
            </div>
          </div>

          {/* SVG profile */}
          <div style={{ background: '#f2f2f7', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
            <svg viewBox="0 0 174 120" style={{ display: 'block', width: '100%', height: '40px' }} preserveAspectRatio="none">
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
              <div key={u} style={{ background: '#f2f2f7', borderRadius: '8px', padding: '4px 2px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.08)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: '#333333', lineHeight: 1 }}>{v}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '8px', color: '#86868b', letterSpacing: '0.08em', marginTop: '2px', textTransform: 'uppercase' }}>{u}</div>
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
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              fontFamily: 'var(--font-display)',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#9d8df1', background: 'rgba(157,141,241,0.1)',
              border: '1px solid rgba(157,141,241,0.3)', borderRadius: '6px',
              padding: '6px', textDecoration: 'none', flexShrink: 0,
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
    </div>
  )
}

// ─── 8-card 3D coverflow carousel ──────────────────────────────────
// 持續顯示在頁面上；按鈕觸發旋轉 2 秒後，正中央那張翻面顯示路線
function CardCarousel({ rotation, phase, route }) {
  const radius = 300 // 卡牌離旋轉中心的距離（拉開不重疊）
  const showRouteInfo = phase === 'flipping' || phase === 'show'

  return (
    <div className="carousel-wrapper" style={{
      width: '100%',
      maxWidth: '200px',
      aspectRatio: '3/4',
      perspective: '1400px',
      position: 'relative',
      margin: '0 auto',
    }}>
      <div className="carousel-stage" style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        transformStyle: 'preserve-3d',
        transition: 'transform 2s cubic-bezier(0.05, 0.7, 0.1, 1)',
        transform: `rotateY(${rotation}deg)`,
      }}>
        {CARD_PALETTES.map((p, i) => {
          const angle = (i / CARD_PALETTES.length) * 360
          const isFront = i === 0
          // 翻面 / show 階段：側邊卡牌淡出，只留中央
          const sideFaded = !isFront && showRouteInfo
          // 中央卡牌翻面時放大 1.4 倍，讓路線資訊容易看
          const frontScaled = isFront && showRouteInfo
          return (
            <div key={i} className="carousel-card" style={{
              position: 'absolute',
              inset: 0,
              transform: `rotateY(${angle}deg) translateZ(${radius}px) ${frontScaled ? 'scale(1.3)' : 'scale(1)'}`,
              transformStyle: 'preserve-3d',
              opacity: sideFaded ? 0 : 1,
              transition: 'opacity 0.5s ease, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: sideFaded ? 'none' : 'auto',
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: (isFront && showRouteInfo) ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}>
                {/* 正面 — Flip It */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #faf6ee 0%, #ffffff 100%)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
                }}>
                  <div className="gradient-blob" style={{ background: paletteGradient(p), animation: 'blobBreathe 6s ease-in-out infinite' }} />
                  <div className="grain" />
                  <div className="card-content" style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(48px, 7vw, 72px)',
                    fontWeight: 900,
                    lineHeight: 0.88,
                    color: CARD_TEXT,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.03em',
                  }}>Roll<br />ing</div>
                </div>
                {/* 背面 — 路線資訊（只渲染在正中央那張） */}
                {isFront && route && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                  }}>
                    <SurpriseCard route={route} palette={getPalette(route.id)} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Surprise Me Spotlight ──────────────────────────────────────────
function SurpriseSpotlight({ route, onNext, phase, rotation }) {
  const palette = route ? getPalette(route.id) : CARD_PALETTES[0]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '96px',
      padding: '80px 24px 64px',
      position: 'relative',
    }}>
      {/* bg glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: route ? `radial-gradient(circle, ${palette.primary}22 0%, transparent 70%)` : 'transparent',
        transition: 'background 0.6s ease',
        pointerEvents: 'none',
      }} />

      {/* eyebrow */}
      <div className="serif-italic" style={{
        fontSize: '18px',
        color: '#86868b',
      }}>
        Today's ride?
      </div>

      {/* persistent 3D carousel */}
      <CardCarousel rotation={rotation} phase={phase} route={route} />

      {/* Surprise Me button */}
      <button
        onClick={onNext}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '18px',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#ffffff',
          background: '#9d8df1',
          border: 'none',
          borderRadius: '999px',
          padding: '14px 40px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease, box-shadow 0.25s ease',
          boxShadow: '0 8px 24px rgba(157,141,241,0.3), 0 0 0 0.5px rgba(255,255,255,0.1) inset',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#b09cf5'; e.currentTarget.style.transform = 'scale(1.03)' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#9d8df1'; e.currentTarget.style.transform = 'scale(1)' }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1.03)'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>
        Surprise Me
      </button>

      {phase === 'show' && (
        <div style={{
          fontFamily: 'var(--font-cjk)',
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
      background: 'linear-gradient(135deg, #faf6ee 0%, #ffffff 100%)',
      padding: '22px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      aspectRatio: '3/4',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: `0 20px 60px ${palette.primary}33`,
    }}>
      <div className="gradient-blob" style={{ background: paletteGradient(palette), animation: 'blobBreathe 7s ease-in-out infinite' }} />
      <div className="grain" />

      <div className="card-content" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', color: CARD_TEXT, opacity: 0.7, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          #{String(route.id).padStart(2,'0')} · {cat?.label}
        </span>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.1em', color: diff?.textColor,
          background: diff?.bgColor, border: `1px solid ${diff?.textColor}55`,
          padding: '2px 7px', borderRadius: '2px', textTransform: 'uppercase',
        }}>
          {diff?.label}
        </span>
      </div>

      <div className="card-content" style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-cjk)', fontSize: '22px', fontWeight: 700, color: CARD_TEXT, lineHeight: 1.2, marginBottom: '4px' }}>
          {route.zh}
        </div>
        <div className="serif-italic" style={{ fontSize: '14px', color: CARD_TEXT, opacity: 0.7, letterSpacing: '0.02em' }}>
          {route.en}
        </div>
      </div>

      <div className="card-content" style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '8px', overflow: 'hidden' }}>
        <svg viewBox="0 0 174 120" style={{ display: 'block', width: '100%', height: '56px' }} preserveAspectRatio="none">
          <path d={`${route.svgPath} L174,120 L0,120 Z`} fill={CARD_TEXT} opacity="0.15" />
          <path d={route.svgPath} fill="none" stroke={CARD_TEXT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
        </svg>
      </div>

      <div className="card-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px' }}>
        {[
          { v: route.km, u: 'km' },
          { v: route.elev + 'm', u: '爬升' },
          { v: route.avgGrade + '%', u: '均坡' },
        ].map(({ v, u }) => (
          <div key={u} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '7px 4px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: CARD_TEXT, lineHeight: 1 }}>{v}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '9px', color: CARD_TEXT, opacity: 0.6, letterSpacing: '0.1em', marginTop: '2px' }}>{u}</div>
          </div>
        ))}
      </div>

      <a
        className="card-content"
        href={route.gmapUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
          fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: palette.primary, background: '#ffffff',
          borderRadius: '999px', padding: '10px', textDecoration: 'none',
          boxShadow: `0 4px 16px rgba(0,0,0,0.12)`,
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
  const [phase, setPhase] = useState('idle') // idle | spinning | flipping | show
  const [rotation, setRotation] = useState(0) // 每次點按累加 1080deg（3 圈）
  const usedIds = useRef(new Set())

  const handleSurprise = useCallback(() => {
    if (phase === 'spinning' || phase === 'flipping') return

    // 全部抽完後重置
    if (usedIds.current.size >= ROUTES.length) usedIds.current.clear()

    const remaining = ROUTES.filter(r => !usedIds.current.has(r.id))
    const pick = remaining[Math.floor(Math.random() * remaining.length)]
    usedIds.current.add(pick.id)

    // 三段動畫：spinning 2s（轉 3 圈）→ flipping 0.7s（中央卡翻面）→ show
    setSurpriseRoute(pick)
    setRotation(r => r + 1080)
    setPhase('spinning')
    setTimeout(() => {
      setPhase('flipping')
      setTimeout(() => setPhase('show'), 700)
    }, 2000)
  }, [phase])

  const toggleFlip = (id) => {
    setFlipped(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf6ee' }}>
      {/* ── Header ── */}
      <header style={{
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        background: 'linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%)',
        padding: '28px 0 24px',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="serif-italic" style={{
              fontSize: '15px',
              color: '#9d8df1',
              marginBottom: '6px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{ display: 'inline-block', width: '24px', height: '1px', background: '#9d8df1' }} />
              Taipei Classic Cycling Routes
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 7vw, 64px)',
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: '-0.02em',
              color: '#333333',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              Roll the <span className="serif-italic" style={{ color: '#9d8df1', fontWeight: 400 }}>Route</span>
            </h1>
          </div>
          <a
            href="/routes"
            onClick={e => { e.preventDefault(); window.__navigate?.('routes') }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#86868b',
              border: '1px solid rgba(0,0,0,0.12)', borderRadius: '10px',
              padding: '10px 20px', textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#faf6ee'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#86868b'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)' }}
          >
            全部路線 →
          </a>
        </div>
      </header>

      {/* ── Section 1: Surprise Me ── */}
      <section style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', background: '#f3eee2' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <SurpriseSpotlight
            route={surpriseRoute}
            onNext={handleSurprise}
            phase={phase}
            rotation={rotation}
          />
        </div>
      </section>

      {/* ── Section 2: Waterfall grid ── */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* section header */}
        <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: '#333333',
          }}>
            <span style={{ color: '#9d8df1' }}>40</span> Routes <span className="serif-italic" style={{ fontWeight: 400, textTransform: 'none' }}>to Nowhere</span>
          </h2>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '12px',
            color: '#86868b',
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
            @media (max-width: 720px)  { .card-grid { columns: 2 !important; column-gap: 12px !important; } }
            .flip-card-wrap { break-inside: avoid; margin-bottom: 16px; -webkit-column-break-inside: avoid; page-break-inside: avoid; }
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
        borderTop: '1px solid rgba(0,0,0,0.08)',
        padding: '20px 24px',
        textAlign: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', color: '#86868b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          40 Routes to Nowhere
        </span>
      </footer>
    </div>
  )
}
