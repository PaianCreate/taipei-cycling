import { useState, useMemo } from 'react'
import { ROUTES } from '../data/routes.js'
import FilterBar from '../components/FilterBar.jsx'
import RouteCard from '../components/RouteCard.jsx'
import RouteModal from '../components/RouteModal.jsx'

export default function RoutesPage() {
  const [activeCat, setActiveCat] = useState('all')
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const counts = useMemo(() => {
    const c = { all: ROUTES.length }
    ROUTES.forEach(r => {
      c[r.cat] = (c[r.cat] ?? 0) + 1
    })
    return c
  }, [])

  const filteredRoutes = useMemo(() => {
    let routes = ROUTES
    if (activeCat !== 'all') {
      routes = routes.filter(r => r.cat === activeCat)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      routes = routes.filter(r =>
        r.zh.toLowerCase().includes(q) ||
        r.en.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q)) ||
        r.desc.toLowerCase().includes(q)
      )
    }
    return routes
  }, [activeCat, searchQuery])

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7' }}>
      {/* Hero header */}
      <div
        style={{
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          background: 'linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%)',
          padding: '32px 0 24px',
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          {/* 返回首頁 */}
          <a
            href="/"
            onClick={e => { e.preventDefault(); window.__navigate?.('home') }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: 500,
              color: '#0071e3',
              textDecoration: 'none',
              marginBottom: '16px',
              transition: 'opacity 0.15s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            回首頁
          </a>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              {/* Eyebrow */}
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '11px',
                  letterSpacing: '0.2em',
                  color: '#0071e3',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '24px',
                    height: '1px',
                    background: '#0071e3',
                  }}
                />
                Taipei Classic Cycling Routes
              </div>
              {/* Title */}
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(32px, 6vw, 56px)',
                  fontWeight: 800,
                  lineHeight: 0.95,
                  letterSpacing: '-0.02em',
                  color: '#1d1d1f',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                Roll the <span style={{ color: '#0071e3' }}>Route</span>
              </h1>
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="搜尋路線..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  color: '#1d1d1f',
                  fontFamily: 'var(--font-cjk)',
                  fontSize: '13px',
                  padding: '10px 16px 10px 36px',
                  width: '220px',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={e => e.target.style.borderColor = '#0071e3'}
                onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.12)'}
              />
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#86868b"
                strokeWidth="2"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              >
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

        </div>
      </div>

      {/* Filter bar */}
      <FilterBar activeCat={activeCat} onFilter={setActiveCat} counts={counts} />

      {/* Card grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Results count */}
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '12px',
            color: '#86868b',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}
        >
          Showing {filteredRoutes.length} routes
          {searchQuery && ` for "${searchQuery}"`}
        </div>

        {filteredRoutes.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 24px',
              color: '#86868b',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '48px',
                marginBottom: '12px',
              }}
            >
              ⊘
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              No routes found
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredRoutes.map(route => (
              <RouteCard
                key={route.id}
                route={route}
                onClick={setSelectedRoute}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedRoute && (
        <RouteModal
          route={selectedRoute}
          onClose={() => setSelectedRoute(null)}
        />
      )}
    </div>
  )
}
