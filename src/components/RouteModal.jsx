import { useEffect } from 'react'
import { CATEGORY_CONFIG, DIFFICULTY_CONFIG, SVG_VIEWBOX } from '../data/routes.js'

export default function RouteModal({ route, onClose }) {
  useEffect(() => {
    const handleKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!route) return null

  const cat = CATEGORY_CONFIG[route.cat] ?? { label: route.cat, color: '#888' }
  const diff = DIFFICULTY_CONFIG[route.diff] ?? { label: route.diff, textColor: '#888', bgColor: '#222' }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1c1c1e',
          border: `1px solid ${cat.color}33`,
          borderRadius: '16px',
          maxWidth: '640px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.7)`,
          animation: 'slideUp 0.25s ease',
          position: 'relative',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            height: '3px',
            background: `linear-gradient(90deg, ${cat.color}, ${cat.color}44, transparent)`,
            borderRadius: '16px 16px 0 0',
          }}
        />

        {/* Header */}
        <div style={{ padding: '20px 24px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '11px',
                  color: cat.color,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: cat.color,
                    display: 'inline-block',
                  }}
                />
                Route #{String(route.id).padStart(2, '0')} · {cat.label}
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-cjk)',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#f5f5f7',
                  lineHeight: 1.2,
                  marginBottom: '4px',
                }}
              >
                {route.zh}
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  color: '#86868b',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {route.en}
              </p>
            </div>

            {/* Diff + Close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <div
                style={{
                  background: diff.bgColor,
                  color: diff.textColor,
                  fontFamily: 'var(--font-display)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: `1px solid ${diff.textColor}44`,
                }}
              >
                {diff.label}
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  color: '#888',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#f5f5f7'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#86868b'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* SVG Profile */}
        <div style={{ padding: '16px 24px' }}>
          <div
            style={{
              background: '#000',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            <svg
              viewBox={SVG_VIEWBOX}
              style={{ display: 'block', width: '100%', height: '100px' }}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={`modal-grad-${route.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={cat.color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={cat.color} stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {[20, 40, 60, 80, 100].map(y => (
                <line key={y} x1="0" y1={y} x2="174" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              ))}
              <path
                d={`${route.svgPath} L174,120 L0,120 Z`}
                fill={`url(#modal-grad-${route.id})`}
              />
              <path
                d={route.svgPath}
                fill="none"
                stroke={cat.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ padding: '0 24px 16px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
            }}
          >
            {[
              { label: '距離', value: `${route.km}`, unit: 'km' },
              { label: '爬升', value: `${route.elev}`, unit: 'm' },
              { label: '均坡', value: `${route.avgGrade}%`, unit: '' },
              { label: '最大坡', value: `${route.maxGrade}%`, unit: '' },
              { label: '難度', value: diff.label, unit: '', color: diff.textColor },
            ].map(({ label, value, unit, color }) => (
              <div
                key={label}
                style={{
                  background: '#111',
                  border: '1px solid #1e1e1e',
                  borderRadius: '2px',
                  padding: '10px 8px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: color ?? '#f0ede8',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {value}{unit}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '9px',
                    color: '#6e6e73',
                    letterSpacing: '0.1em',
                    marginTop: '4px',
                    textTransform: 'uppercase',
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start / End */}
        <div style={{ padding: '0 24px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { icon: '▶', label: '起點', value: route.startPoint },
            { icon: '⏹', label: '終點', value: route.endPoint },
          ].map(({ icon, label, value }) => (
            <div
              key={label}
              style={{
                background: '#2a2a2c',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '10px 12px',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '9px',
                  color: '#6e6e73',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ color: cat.color, fontSize: '8px' }}>{icon}</span>
                {label}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-cjk)',
                  fontSize: '12px',
                  color: '#d2d2d7',
                  lineHeight: 1.4,
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{ padding: '0 24px 16px' }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '10px',
              color: cat.color,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            路線介紹
          </div>
          <p
            style={{
              fontFamily: 'var(--font-cjk)',
              fontSize: '13px',
              color: '#a1a1a6',
              lineHeight: 1.75,
            }}
          >
            {route.desc}
          </p>
        </div>

        {/* Tips */}
        <div style={{ padding: '0 24px 16px' }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '10px',
              color: '#ff6b1a',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            騎行小提示
          </div>
          <div
            style={{
              background: 'rgba(255,107,26,0.06)',
              border: '1px solid rgba(255,107,26,0.18)',
              borderRadius: '10px',
              padding: '12px 14px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-cjk)',
                fontSize: '13px',
                color: '#8e8e93',
                lineHeight: 1.75,
              }}
            >
              {route.tips}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div style={{ padding: '0 24px 16px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {route.tags.map(tag => (
            <span
              key={tag}
              style={{
                fontFamily: 'var(--font-cjk)',
                fontSize: '12px',
                color: '#86868b',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px',
                padding: '3px 10px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer CTA */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '14px 24px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <a
            href={route.gmapUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#0e0e0e',
              background: '#ff6b1a',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#ff8c4a'}
            onMouseLeave={e => e.currentTarget.style.background = '#ff6b1a'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            在 Google Maps 開啟
          </a>
        </div>
      </div>
    </div>
  )
}
