import { CATEGORY_CONFIG, DIFFICULTY_CONFIG, SVG_VIEWBOX } from '../data/routes.js'
import { useState } from 'react'

export default function RouteCard({ route, onClick }) {
  const [hovered, setHovered] = useState(false)

  const cat = CATEGORY_CONFIG[route.cat] ?? { label: route.cat, color: '#888' }
  const diff = DIFFICULTY_CONFIG[route.diff] ?? { label: route.diff, textColor: '#888', bgColor: '#222' }

  return (
    <div
      onClick={() => onClick(route)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`查看路線 ${route.id} ${route.zh} 詳情`}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(route)
        }
      }}
      onFocus={e => { e.currentTarget.style.boxShadow = `0 24px 48px rgba(0,0,0,0.55), 0 0 0 3px ${cat.color}` }}
      onBlur={e => {
        e.currentTarget.style.boxShadow = hovered
          ? `0 24px 48px rgba(0,0,0,0.55), 0 0 0 1px ${cat.color}40`
          : '0 4px 16px rgba(0,0,0,0.3)'
      }}
      style={{
        background: '#1c1c1e',
        border: `1px solid ${hovered ? cat.color + '66' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease',
        boxShadow: hovered
          ? `0 24px 48px rgba(0,0,0,0.55), 0 0 0 1px ${cat.color}40`
          : '0 4px 16px rgba(0,0,0,0.3)',
        transform: hovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        outline: 'none',
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          height: '2px',
          background: `linear-gradient(90deg, ${cat.color}, ${cat.color}00)`,
          width: hovered ? '100%' : '40%',
          transition: 'width 0.3s ease',
        }}
      />

      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          {/* Names */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Route ID */}
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '11px',
                color: '#6e6e73',
                letterSpacing: '0.1em',
                marginBottom: '2px',
              }}
            >
              #{String(route.id).padStart(2, '0')}
            </div>
            {/* Chinese name */}
            <h3
              style={{
                fontFamily: 'var(--font-cjk)',
                fontSize: '17px',
                fontWeight: 700,
                color: '#f5f5f7',
                lineHeight: 1.25,
                marginBottom: '3px',
              }}
            >
              {route.zh}
            </h3>
            {/* English name */}
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '12px',
                color: '#86868b',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {route.en}
            </p>
          </div>

          {/* Difficulty badge */}
          <div
            style={{
              background: diff.bgColor,
              color: diff.textColor,
              fontFamily: 'var(--font-display)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '3px 8px',
              borderRadius: '8px',
              border: `1px solid ${diff.textColor}44`,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {diff.label}
          </div>
        </div>

        {/* SVG Profile */}
        <div
          style={{
            background: '#2a2a2c',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <svg
            viewBox={SVG_VIEWBOX}
            style={{ display: 'block', width: '100%', height: '72px' }}
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            <line x1="0" y1="40" x2="174" y2="40" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
            <line x1="0" y1="80" x2="174" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

            {/* Filled area under path */}
            <defs>
              <linearGradient id={`grad-${route.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={cat.color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={cat.color} stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Area fill - create closed path */}
            <path
              d={`${route.svgPath} L174,120 L0,120 Z`}
              fill={`url(#grad-${route.id})`}
            />

            {/* Route line */}
            <path
              d={route.svgPath}
              fill="none"
              stroke={cat.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Category label overlay */}
          <div
            style={{
              position: 'absolute',
              top: '5px',
              left: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: cat.color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '10px',
                color: cat.color,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                opacity: 0.85,
              }}
            >
              {cat.label}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
          }}
        >
          {[
            { label: 'KM', value: route.km, unit: '' },
            { label: 'CLIMB', value: route.elev, unit: 'm' },
            { label: 'AVG', value: route.avgGrade + '%', unit: '' },
          ].map(({ label, value, unit }) => (
            <div
              key={label}
              style={{
                background: '#2a2a2c',
                borderRadius: '8px',
                padding: '8px 6px',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#f5f5f7',
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
                  letterSpacing: '0.12em',
                  marginTop: '3px',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {route.tags.map(tag => (
            <span
              key={tag}
              style={{
                fontFamily: 'var(--font-cjk)',
                fontSize: '11px',
                color: '#86868b',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '2px 7px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-cjk)',
            fontSize: '11px',
            color: '#86868b',
          }}
        >
          {route.startPoint?.split('（')[0]}
        </span>
        <a
          href={route.gmapUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: '#ff6b1a',
            background: 'rgba(255,107,26,0.08)',
            border: '1px solid rgba(255,107,26,0.25)',
            borderRadius: '8px',
            padding: '4px 10px',
            textDecoration: 'none',
            textTransform: 'uppercase',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,107,26,0.18)'
            e.currentTarget.style.color = '#ff8c4a'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,107,26,0.08)'
            e.currentTarget.style.color = '#ff6b1a'
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          Maps
        </a>
      </div>
    </div>
  )
}
