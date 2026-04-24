import { Link, useLocation, useNavigate } from 'react-router-dom'
import { usePanier } from '../context/PanierContext'
import { useState, useEffect } from 'react'

const ANNOUNCE_ITEMS = [
  '🇲🇦 LIVRAISON OFFERTE PARTOUT AU MAROC',
  '✦ NOUVELLE COLLECTION SS 2026',
  '✦ PAIEMENT À LA LIVRAISON DISPONIBLE',
  '✦ SUPPORT WHATSAPP 7J/7',
  '🇲🇦 LIVRAISON OFFERTE PARTOUT AU MAROC',
  '✦ NOUVELLE COLLECTION SS 2026',
  '✦ PAIEMENT À LA LIVRAISON DISPONIBLE',
  '✦ SUPPORT WHATSAPP 7J/7',
]

const WylLogo = () => (
  <Link to="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
    <span style={{
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 900,
      fontSize: 28,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: '#111',
      lineHeight: 1,
    }}>WYL</span>
    <span style={{
      fontFamily: "'Barlow', sans-serif",
      fontWeight: 600,
      fontSize: 9,
      letterSpacing: '0.45em',
      textTransform: 'uppercase',
      color: '#888',
      marginTop: 2,
    }}>Wear Your Legacy</span>
  </Link>
)

const BurgerIcon = () => (
  <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="0" y1="1" x2="22" y2="1" stroke="#111" strokeWidth="2"/>
    <line x1="0" y1="8" x2="22" y2="8" stroke="#111" strokeWidth="2"/>
    <line x1="0" y1="15" x2="22" y2="15" stroke="#111" strokeWidth="2"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="1" y1="1" x2="19" y2="19" stroke="#111" strokeWidth="2.2"/>
    <line x1="19" y1="1" x2="1" y2="19" stroke="#111" strokeWidth="2.2"/>
  </svg>
)

const SearchIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const CartIcon = () => (
  <svg width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
)

export default function Navbar() {
  const { panier } = usePanier()
  const location = useLocation()
  const navigate = useNavigate()
  const nbArticles = panier.reduce((a, p) => a + p.quantite, 0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isActive = (path) => {
    if (path === '/catalogue') return location.pathname.startsWith('/catalogue') || location.pathname.startsWith('/produit')
    return location.pathname === path
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  // Bloquer le scroll du body quand le menu est ouvert
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const NAV_LINKS = [
    ['/catalogue', 'Catalogue'],
    ['/catalogue?cat=hoodies', 'Hoodies'],
    ['/catalogue?cat=t-shirts', 'T-Shirts'],
    ['/catalogue?cat=pantalons', 'Pantalons'],
    ['/contact', 'Contact'],
  ]

  return (
    <>
      {/* ── ANNOUNCE BAR ── */}
      <div style={{
        background: '#111',
        height: 34,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 300,
      }}>
        <div style={{
          display: 'inline-flex',
          whiteSpace: 'nowrap',
          animation: 'navTick 30s linear infinite',
        }}>
          {ANNOUNCE_ITEMS.map((item, i) => (
            <span key={i} style={{
              padding: '0 36px',
              fontSize: 10,
              fontFamily: 'Barlow, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)',
            }}>{item}</span>
          ))}
        </div>
      </div>

      {/* ── HEADER ── */}
      <header style={{
        position: 'sticky',
        top: 0,
        /* zIndex INFÉRIEUR au drawer (600) mais au-dessus du contenu page */
        zIndex: 200,
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,1)',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: '1px solid #e8e5e0',
        transition: 'background 0.3s, box-shadow 0.3s',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          height: 62,
          padding: '0 20px',
          maxWidth: '100%',
        }}>

          {/* GAUCHE : Burger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '10px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginLeft: -10, color: '#111',
                /* Placer le bouton burger au-dessus du drawer overlay */
                position: 'relative', zIndex: 620,
              }}
            >
              {menuOpen ? <CloseIcon /> : <BurgerIcon />}
            </button>

            {/* Nav desktop */}
            <nav style={{ display: 'flex', gap: 0, marginLeft: 8 }} className="nav-desktop">
              {NAV_LINKS.slice(0, 3).map(([path, label]) => (
                <Link key={path} to={path}
                  style={{
                    fontFamily: 'Barlow, sans-serif',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: isActive(path) ? '#111' : '#888',
                    padding: '0 14px',
                    height: 62,
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: isActive(path) ? '2px solid #111' : '2px solid transparent',
                    transition: 'color 0.2s, border-color 0.2s',
                    textDecoration: 'none',
                  }}
                  onMouseOver={e => { e.currentTarget.style.color = '#111'; e.currentTarget.style.borderBottomColor = '#111' }}
                  onMouseOut={e => { if (!isActive(path)) { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderBottomColor = 'transparent' } }}
                >{label}</Link>
              ))}
            </nav>
          </div>

          {/* CENTRE : Logo — zIndex élevé pour rester visible sur le drawer */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 620 }}>
            <WylLogo />
          </div>

          {/* DROITE : Search + Panier */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4,
            position: 'relative', zIndex: 620,
          }}>
            <button
              aria-label="Rechercher"
              style={{ background: 'none', border: 'none', cursor: 'pointer', width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111', opacity: 0.8, transition: 'opacity 0.2s' }}
              onMouseOver={e => e.currentTarget.style.opacity = '1'}
              onMouseOut={e => e.currentTarget.style.opacity = '0.8'}
            >
              <SearchIcon />
            </button>

            <Link to="/panier" aria-label="Panier"
              style={{ background: 'none', border: 'none', cursor: 'pointer', width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111', opacity: 0.8, position: 'relative', transition: 'opacity 0.2s', marginRight: -8 }}
              onMouseOver={e => e.currentTarget.style.opacity = '1'}
              onMouseOut={e => e.currentTarget.style.opacity = '0.8'}
            >
              <CartIcon />
              {nbArticles > 0 && (
                <span style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 16, height: 16,
                  background: '#111', color: 'white',
                  borderRadius: '50%',
                  fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Barlow, sans-serif',
                }}>{nbArticles}</span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ── OVERLAY ── placé AVANT le drawer dans le DOM, même z-index inférieur */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 590,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ── DRAWER MENU ── */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        width: '100%',
        maxWidth: 420,
        background: 'white',
        zIndex: 600,
        transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.38s cubic-bezier(0.22,1,0.36,1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header drawer — logo + croix */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', height: 62, borderBottom: '1px solid #e8e5e0', flexShrink: 0,
        }}>
          <WylLogo />
          <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 10, color: '#111' }}>
            <CloseIcon />
          </button>
        </div>

        {/* Links */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {NAV_LINKS.map(([path, label], i) => (
            <Link key={path} to={path} onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 28px',
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: isActive(path) ? '#111' : '#333',
                borderBottom: '1px solid #f0eeec',
                textDecoration: 'none',
                animation: menuOpen ? `slideIn 0.4s ${i * 0.05 + 0.1}s both` : 'none',
              }}
            >
              {label}
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          ))}
          <Link to="/panier" onClick={() => setMenuOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 28px',
              fontFamily: 'Barlow Condensed, sans-serif', fontSize: 26, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase', color: '#333',
              borderBottom: '1px solid #f0eeec', textDecoration: 'none',
              animation: menuOpen ? `slideIn 0.4s ${NAV_LINKS.length * 0.05 + 0.1}s both` : 'none',
            }}
          >
            Mon panier {nbArticles > 0 && (
              <span style={{ background: '#111', color: 'white', borderRadius: 20, fontSize: 12, padding: '2px 9px', fontFamily: 'Barlow', fontWeight: 700 }}>{nbArticles}</span>
            )}
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </nav>

        {/* Footer drawer */}
        <div style={{ padding: '20px 28px', borderTop: '1px solid #f0eeec', flexShrink: 0 }}>
          <p style={{ fontFamily: 'Barlow', fontSize: 11, color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>WYL — Wear Your Legacy · Maroc</p>
          <a href="https://wa.me/212675014485" target="_blank" rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'Barlow', fontSize: 13, fontWeight: 600, color: '#25D366', textDecoration: 'none' }}>
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp Support
          </a>
        </div>
      </div>

      <style>{`
        @keyframes navTick { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
        .nav-desktop { display: flex; }
        @media (max-width: 640px) { .nav-desktop { display: none !important; } }
      `}</style>
    </>
  )
}