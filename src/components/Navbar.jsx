import { Link, useLocation } from 'react-router-dom'
import { usePanier } from '../context/PanierContext'

export default function Navbar() {
  const { panier } = usePanier()
  const location = useLocation()
  const nbArticles = panier.reduce((a, p) => a + p.quantite, 0)

  return (
    <nav className="navbar-blur fade-down" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        <Link to="/" style={{ textDecoration: 'none' }}>
          <span className="font-display" style={{ fontSize: 21, fontWeight: 700, color: 'var(--text-heading)', letterSpacing: '0.2em' }}>WYL</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <Link to="/catalogue" style={{
            textDecoration: 'none', fontFamily: 'Space Grotesk', fontSize: 13, fontWeight: location.pathname.startsWith('/catalogue') || location.pathname.startsWith('/produit') ? 600 : 400,
            letterSpacing: '0.04em', color: location.pathname.startsWith('/catalogue') || location.pathname.startsWith('/produit') ? 'var(--text-heading)' : 'var(--text-muted)',
            borderBottom: location.pathname.startsWith('/catalogue') || location.pathname.startsWith('/produit') ? '2px solid var(--accent)' : '2px solid transparent',
            paddingBottom: 2, transition: 'all 0.2s',
          }}>Catalogue</Link>

          <Link to="/contact" style={{
            textDecoration: 'none', fontFamily: 'Space Grotesk', fontSize: 13, fontWeight: location.pathname === '/contact' ? 600 : 400,
            letterSpacing: '0.04em', color: location.pathname === '/contact' ? 'var(--text-heading)' : 'var(--text-muted)',
            borderBottom: location.pathname === '/contact' ? '2px solid var(--accent)' : '2px solid transparent',
            paddingBottom: 2, transition: 'all 0.2s',
          }}>Contact</Link>

          <Link to="/panier" style={{ textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <svg width="22" height="22" fill="none" stroke="var(--text-heading)" strokeWidth="1.7" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {nbArticles > 0 && (
              <span style={{
                position: 'absolute', top: -7, right: -7,
                background: 'var(--accent)', color: 'white',
                borderRadius: '50%', width: 17, height: 17,
                fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{nbArticles}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}
