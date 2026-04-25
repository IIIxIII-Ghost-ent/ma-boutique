import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ProduitCard from '../components/ProduitCard'
import Navbar from '../components/Navbar'
import FooterComponent from '../components/Footer'
import heroDesktop from '../assets/im1.png'
import heroMobile from '../assets/imMobile.png'

function parseImages(p) {
  if (!p) return []
  if (p.images_url) {
    try {
      const arr = JSON.parse(p.images_url)
      if (Array.isArray(arr) && arr.length) return arr.filter(u => u && u.startsWith('http'))
    } catch {}
  }
  return p.image_url ? [p.image_url] : []
}

const FEATURES = [
  {
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    title: 'Livraison offerte',
    desc: 'Partout au Maroc, 24–48h',
  },
  {
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'Qualité premium',
    desc: 'Matières soigneusement sélectionnées',
  },
  {
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.65"/></svg>,
    title: 'Retours 30 jours',
    desc: 'Sans frais, sans conditions',
  },
  {
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    title: 'Support 7j/7',
    desc: 'WhatsApp, réponse en 2h',
  },
]

export default function Shop() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [produits, setProduits] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [heroImgLoaded, setHeroImgLoaded] = useState(false)

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    const move = (e) => {
      if (!heroRef.current || isMobile) return
      const x = (e.clientX / window.innerWidth - 0.5) * 14
      const y = (e.clientY / window.innerHeight - 0.5) * 8
      heroRef.current.style.transform = `translate(${x}px,${y}px) scale(1.06)`
    }
    window.addEventListener('mousemove', move, { passive: true })
    setTimeout(() => setLoaded(true), 60)
    return () => window.removeEventListener('mousemove', move)
  }, [isMobile])

  useEffect(() => {
    supabase.from('produits').select('id,nom,prix,categorie,stock,vedette,image_url,images_url,created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setProduits(data)
        setLoading(false)
      })
  }, [])

  const bestSellers = produits.filter(p => p.vedette === true && p.stock > 0).slice(0, 4)
  const nouveautes = [...produits].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4)
  const displayBest = bestSellers.length > 0 ? bestSellers : nouveautes.slice(0, 4)
  const displayNew  = nouveautes.slice(0, 4)

  const heroSrc = isMobile ? heroMobile : heroDesktop

  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      <Navbar />

      {/* ══ HERO ══ */}
      <section style={{
        position: 'relative',
        width: '100%',
        height: isMobile ? '88vh' : '100vh',
        minHeight: isMobile ? 520 : 640,
        overflow: 'hidden',
        background: '#111',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
      }}>
        <div
          ref={heroRef}
          style={{
            position: 'absolute',
            inset: '-5%',
            transition: 'transform 0.18s ease-out, opacity 0.6s ease',
            willChange: 'transform',
            opacity: heroImgLoaded ? (isMobile ? 0.55 : 0.65) : 0,
          }}
        >
          <img
            src={heroSrc}
            alt="Hero WYL"
            loading="eager"
            fetchpriority="high"
            onLoad={() => setHeroImgLoaded(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: isMobile ? 'center 20%' : 'center 30%',
              display: 'block',
            }}
          />
        </div>

        {!heroImgLoaded && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }} />
        )}

        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.72) 75%, rgba(0,0,0,0.92) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 50%)' }} />

        <div style={{
          position: 'relative', zIndex: 10, width: '100%',
          padding: isMobile ? '0 20px 36px' : '0 52px 56px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          justifyContent: 'space-between',
          gap: isMobile ? 24 : 40,
        }}>
          <div style={{ flex: 1 }}>
            {loaded && (
              <div style={{ animation: 'heroFadeUp 1s cubic-bezier(0.22,1,0.36,1) 0s both' }}>
                <p style={{
                  fontFamily: 'Barlow, sans-serif', fontSize: isMobile ? 12 : 14, fontWeight: 700,
                  letterSpacing: '0.4em', textTransform: 'uppercase', color: 'white',
                  marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12
                }}>
                  <span style={{ width: 30, height: 1, background: '#b76448' }}></span>
                  Collection 2026
                </p>
                <h1 style={{
                  fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900,
                  fontSize: isMobile ? 'clamp(48px, 15vw, 72px)' : 'clamp(64px, 8vw, 110px)',
                  letterSpacing: '-0.02em', textTransform: 'uppercase', color: 'white',
                  lineHeight: 0.9, marginBottom: 24,
                }}>
                  SS COLLECTION <br />
                  <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.6)' }}>LIMITED EDITION</span>
                </h1>
                
                <button 
                  onClick={() => navigate('/catalogue')}
                  className="hero-shop-btn"
                >
                  Shop Now
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
              </div>
            )}
          </div>

          {loaded && (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 10,
              alignItems: isMobile ? 'flex-start' : 'flex-end',
              minWidth: isMobile ? 'auto' : 220,
              width: isMobile ? '100%' : 'auto',
              animation: 'heroFadeUp 1s cubic-bezier(0.22,1,0.36,1) 0.25s both',
            }}>
              {/* Optionnel : vous pouvez remettre ici des éléments à droite si besoin */}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @keyframes heroFadeUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        
        .hero-shop-btn {
          all: unset;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: white;
          color: #111;
          padding: 14px 32px;
          font-family: 'Barlow', sans-serif;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid white;
        }

        .hero-shop-btn:hover {
          background: transparent;
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }

        .shimmer { background:linear-gradient(90deg,#f0edea 25%,#e5e0db 50%,#f0edea 75%); background-size:600px 100%; animation:shimmer 1.4s ease-in-out infinite; }
        .shop-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:2px; }
        @media(max-width:1100px) { .shop-grid { grid-template-columns:repeat(3,1fr); } }
        @media(max-width:700px)  { .shop-grid { grid-template-columns:repeat(2,1fr); } }
        
        .btn-voir-tout {
          font-family: 'Barlow', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: #111;
          border: 1.5px solid #111;
          color: white;
          padding: 9px 18px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .btn-voir-tout:hover {
          background: #333;
          border-color: #333;
        }

        .promo-banner { background:#111; display:flex; align-items:center; justify-content:space-between; padding:56px 48px; gap:28px; flex-wrap:wrap; }
        @media(max-width:640px) { .promo-banner { padding:36px 20px; flex-direction:column; align-items:flex-start; } }
      `}</style>

      {/* ══ NEW RELEASES ══ */}
      <section style={{ padding: '60px 0' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22, paddingBottom: 14, borderBottom: '1px solid #e8e5e0', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ fontFamily: 'Barlow', fontSize: 10, fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#aaa', marginBottom: 2 }}>Arrivages récents</p>
              <h2 style={{ fontFamily: 'Barlow Condensed', fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#111', lineHeight: 1 }}>New Releases</h2>
            </div>
            <button onClick={() => navigate('/catalogue')} className="btn-voir-tout">Voir tout →</button>
          </div>

          {loading ? (
            <div className="shop-grid">
              {[1,2,3,4].map(i => (
                <div key={i}>
                  <div className="shimmer" style={{ aspectRatio: '3/4' }} />
                  <div style={{ padding: '12px 0' }}>
                    <div className="shimmer" style={{ height: 13, borderRadius: 2, marginBottom: 7 }} />
                    <div className="shimmer" style={{ height: 11, borderRadius: 2, width: '55%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="shop-grid">
              {displayNew.map((p, i) => {
                const imgs = parseImages(p)
                return <ProduitCard key={p.id} produit={{ ...p, image_url: imgs[0] || p.image_url }} index={i} />
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══ BEST SELLERS ══ */}
      <section id="best-sellers" style={{ padding: '60px 0' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22, paddingBottom: 14, borderBottom: '1px solid #e8e5e0', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ fontFamily: 'Barlow', fontSize: 10, fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#aaa', marginBottom: 2 }}>Incontournables</p>
              <h2 style={{ fontFamily: 'Barlow Condensed', fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#111', lineHeight: 1 }}>Best Sellers</h2>
            </div>
            <button onClick={() => navigate('/catalogue')} className="btn-voir-tout">Voir tout →</button>
          </div>

          {loading ? (
            <div className="shop-grid">
              {[1,2,3,4].map(i => (
                <div key={i}>
                  <div className="shimmer" style={{ aspectRatio: '3/4' }} />
                  <div style={{ padding: '12px 0' }}>
                    <div className="shimmer" style={{ height: 13, borderRadius: 2, marginBottom: 7 }} />
                    <div className="shimmer" style={{ height: 11, borderRadius: 2, width: '55%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="shop-grid">
              {displayBest.map((p, i) => {
                const imgs = parseImages(p)
                return <ProduitCard key={p.id} produit={{ ...p, image_url: imgs[0] || p.image_url }} index={i} />
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══ PROMO BANNER ══ */}
      <div className="promo-banner">
        <div>
          <p style={{ fontFamily: 'Barlow', fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>Offre permanente</p>
          <h3 style={{ fontFamily: 'Barlow Condensed', fontSize: 'clamp(28px,5vw,54px)', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'white', lineHeight: 1, marginBottom: 10 }}>
            Livraison <br />partout au Maroc
          </h3>
          <p style={{ fontFamily: 'Barlow', fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>Aucun minimum de commande requis.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ background: '#b76448', padding: '20px 32px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Barlow Condensed', fontSize: 46, fontWeight: 900, color: 'white', lineHeight: 1 }}>100%</p>
            <p style={{ fontFamily: 'Barlow', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Gratuite</p>
          </div>
          <button onClick={() => navigate('/catalogue')} style={{ background: 'white', color: '#111', border: 'none', padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}>
            Commander maintenant →
          </button>
        </div>
      </div>

      <FooterComponent />
    </div>
  )
}