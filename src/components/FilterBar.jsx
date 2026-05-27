import { CATEGORY_CONFIG } from '../data/routes.js'

const ALL_CATS = [
  { key: 'all', label: '全部', color: '#0071e3' },
  ...Object.entries(CATEGORY_CONFIG).map(([key, val]) => ({ key, label: val.label, color: val.color })),
]

export default function FilterBar({ activeCat, onFilter, counts }) {
  return (
    <div style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }} className="sticky top-0 z-40 bg-white/75 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Label */}
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '11px',
              letterSpacing: '0.15em',
              color: '#86868b',
              textTransform: 'uppercase',
              marginRight: '4px',
            }}
          >
            Filter
          </span>

          {ALL_CATS.map(({ key, label, color }) => {
            const active = activeCat === key
            const count = key === 'all' ? counts?.all : counts?.[key]
            return (
              <button
                key={key}
                onClick={() => onFilter(key)}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  fontWeight: active ? 700 : 500,
                  letterSpacing: '0.05em',
                  padding: '5px 14px',
                  borderRadius: '8px',
                  border: active ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.08)',
                  background: active ? color + '22' : 'transparent',
                  color: active ? color : '#86868b',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.color = color
                    e.currentTarget.style.borderColor = color + '55'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.color = '#86868b'
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'
                  }
                }}
              >
                {/* color dot */}
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: color,
                    opacity: active ? 1 : 0.5,
                    flexShrink: 0,
                  }}
                />
                {label}
                {count !== undefined && (
                  <span
                    style={{
                      fontSize: '11px',
                      opacity: 0.6,
                      fontWeight: 400,
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
