import './index.css'
import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage.jsx'
import RoutesPage from './pages/RoutesPage.jsx'

export default function App() {
  const [page, setPage] = useState('home')

  useEffect(() => {
    const sync = () => {
      const path = window.location.pathname
      setPage(path.includes('routes') ? 'routes' : 'home')
    }
    sync()
    window.addEventListener('popstate', sync)
    window.__navigate = (p) => {
      window.history.pushState({}, '', p === 'home' ? '/' : '/routes')
      setPage(p)
    }
    return () => window.removeEventListener('popstate', sync)
  }, [])

  return (
    <div key={page} className="page-fade">
      {page === 'routes' ? <RoutesPage /> : <HomePage />}
    </div>
  )
}
