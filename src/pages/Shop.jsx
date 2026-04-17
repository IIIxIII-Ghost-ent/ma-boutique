import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePanier } from '../context/PanierContext'
import im1 from '../assets/im1.png'
import imMobile from '../assets/imMobile.png'

const TICKER = ['NOUVELLE COLLECTION','QUALITÉ PREMIUM','WEAR YOUR LEGACY','2026','STREETWEAR MAROC','ÉDITION LIMITÉE']

export default function Shop() {
  const navigate   = useNavigate()
  const { panier } = usePanier()
  const nbArticles = panier.reduce((a, p) => a + p.quantite, 0)
  const heroRef    = useRef(null)
  const [loaded, setLoaded]   = useState(false)

  /* Parallax léger sur la souris */
  useEffect(() => {
    const move = (e) => {
      if (!heroRef.current) return
      const x = (e.clientX / window.innerWidth  - 0.5) * 22
      const y = (e.clientY / window.innerHeight - 0.5) * 14
      heroRef.current.style.transform = `translate(${x}px,${y}px) scale(1.08)`
    }
    window.addEventListener('mousemove', move)
    setTimeout(() => setLoaded(true), 80)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  /* Ticker items */
  const tItems = [...TICKER, ...TICKER, ...TICKER].map((t, i) => (
    <span key={i} style={{ padding:'0 36px', fontSize:10, letterSpacing:'0.42em', fontFamily:'Space Grotesk', color:'rgba(255,255,255,0.42)', fontWeight:500, whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:32 }}>
      {t} <span style={{ color:'#b76448', fontSize:8 }}>✦</span>
    </span>
  ))

  return (
    <div style={{ minHeight:'100vh', background:'#080a0d', position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

        @keyframes shopTicker {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        @keyframes wylLevitate {
          0%, 100% { transform: translateY(0px) rotateX(0deg); }
          25%  { transform: translateY(-18px) rotateX(3deg); }
          75%  { transform: translateY(-8px) rotateX(-2deg); }
        }
        @keyframes wylGlow {
          0%, 100% { text-shadow: 0 0 60px rgba(255,255,255,0.12), 0 0 120px rgba(183,100,72,0.1); }
          50%  { text-shadow: 0 0 80px rgba(255,255,255,0.22), 0 0 200px rgba(183,100,72,0.22), 0 2px 0 rgba(183,100,72,0.4); }
        }
        @keyframes wylRotateY {
          0%   { transform: rotateY(0deg) skewX(0deg); }
          48%  { transform: rotateY(170deg) skewX(-2deg); }
          50%  { transform: rotateY(180deg) skewX(0deg); }
          98%  { transform: rotateY(350deg) skewX(2deg); }
          100% { transform: rotateY(360deg) skewX(0deg); }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(18px, -22px) scale(1.04); }
          66%  { transform: translate(-12px, 14px) scale(0.97); }
        }
        @keyframes orbPulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.78; }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(200vh); }
        }

        .shop-btn-primary {
          background: rgba(183,100,72,0.12);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(183,100,72,0.28);
          color: white;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 12px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 18px 32px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
          position: relative;
          overflow: hidden;
        }
        .shop-btn-primary:hover {
          background: rgba(183,100,72,0.22);
          border-color: rgba(183,100,72,0.55);
          transform: translateY(-2px);
        }

        .shop-btn-secondary {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.55);
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 400;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          padding: 14px 32px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .hero-bg-img {
          background-image: url(${im1});
          background-size: cover;
          background-position: 50% 38%;
        }

        .orb-top-right { width: 130px; height: 130px; top: 12%; right: 14%; }
        .orb-bottom-left { width: 500px; height: 500px; bottom: -14%; left: -9%; }
        
        @media (max-width: 768px) {
          .hero-bg-img {
            background-image: url(${imMobile});
            background-position: center center;
            opacity: 0.35 !important; /* Augmenté de 0.15 à 0.35 pour plus de clarté */
          }
          .orb-top-right { width: 80px !important; height: 80px !important; }
          .orb-bottom-left { width: 280px !important; height: 280px !important; }
        }

        .social-link {
          color: rgba(255,255,255,0.25);
          transition: all 0.25s ease;
        }
        .social-link:hover {
          color: rgba(255,255,255,0.7);
        }
      `}</style>

      {/* BACKGROUND LAYERS */}

      {/* Image hero - Opacité remontée de 0.22 à 0.38 pour Desktop */}
      <div ref={heroRef} className="hero-bg-img" style={{ position:'absolute', inset:'-5%', zIndex:0, transition:'transform 0.2s ease-out', willChange:'transform', opacity:0.38 }}/>

      {/* Vignette radiale - rgba(8,10,13,0.88) passé à 0.75 pour éclaircir le centre */}
      <div style={{ position:'absolute', inset:0, zIndex:1, background:'radial-gradient(ellipse 90% 80% at 50% 42%, transparent 0%, rgba(8,10,13,0.75) 100%)' }}/>

      {/* Dégradé bas */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:280, zIndex:2, background:'linear-gradient(to top, #080a0d 30%, transparent 100%)' }}/>

      {/* Orbes et Décorations */}
      <div style={{ position:'absolute', top:'38%', left:'50%', transform:'translate(-50%,-50%)', zIndex:3, width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(183,100,72,0.15) 0%, rgba(183,100,72,0.04) 40%, transparent 70%)', filter:'blur(50px)', animation:'floatOrb 9s ease-in-out infinite, orbPulse 5s ease-in-out infinite', pointerEvents:'none' }}/>

      <div className="orb-top-right" style={{ position:'absolute', zIndex:4, borderRadius:'50%', background:'radial-gradient(circle at 36% 33%, #3a3d46, #1e2028)', boxShadow:'0 10px 50px rgba(0,0,0,0.7)', opacity:0.55, pointerEvents:'none', animation:'floatOrb 14s ease-in-out infinite 2s' }}/>
      
      <div className="orb-bottom-left" style={{ position:'absolute', zIndex:4, borderRadius:'50%', background:'radial-gradient(circle at 38% 36%, #0c0d10, #050608)', boxShadow:'0 0 120px rgba(0,0,0,0.95)', opacity:0.7, pointerEvents:'none' }}/>

      {/* UI CONTENT */}
      <div style={{ position:'relative', zIndex:20, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'28px 44px 0' }}>
        <div style={{ opacity: loaded ? 0.6 : 0, transition:'opacity 0.8s ease', fontFamily:'Space Grotesk', fontSize:11, letterSpacing:'0.3em', color:'rgba(255,255,255,0.28)', textTransform:'uppercase', fontWeight:300 }}>WYL</div>
        <button onClick={() => navigate('/panier')} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)', fontFamily:'Space Grotesk', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase' }}>
          Panier {nbArticles > 0 && <span style={{ marginLeft:8, color:'#b76448' }}>({nbArticles})</span>}
        </button>
      </div>

      <div style={{ position:'relative', zIndex:20, flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px 24px', textAlign:'center' }}>
        <div style={{ opacity: loaded ? 0.8 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition:'all 0.9s ease 0.1s', marginBottom:44 }}>
          <span style={{ fontFamily:'Space Grotesk', fontSize:9, letterSpacing:'0.7em', textTransform:'uppercase', color:'rgba(255,255,255,0.45)' }}>Streetwear · Culture</span>
        </div>

        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(50px)', transition:'all 1.1s ease 0.2s', marginBottom:10 }}>
          <div style={{ display:'inline-block', animation:'wylLevitate 5s ease-in-out infinite' }}>
            <div style={{ perspective:'1200px' }}>
              <div style={{ display:'inline-block', animation:'wylRotateY 10s ease-in-out infinite', transformStyle:'preserve-3d' }}>
                <span style={{ display:'block', fontFamily:'Bebas Neue', fontSize:'clamp(96px, 20vw, 178px)', color:'transparent', letterSpacing:'0.08em', backgroundClip:'text', WebkitBackgroundClip:'text', backgroundImage:'linear-gradient(180deg, #ffffff 0%, #c8cdd6 55%, #7a8090 100%)', animation:'wylGlow 4s ease-in-out infinite' }}>WYL</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ opacity: loaded ? 0.7 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition:'all 0.9s ease 0.45s', marginBottom:36 }}>
          <span style={{ fontFamily:'Space Grotesk', fontSize:11, letterSpacing:'0.5em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)' }}>Wear Your Legacy</span>
        </div>

        <div style={{ opacity: loaded ? 1 : 0, display:'flex', flexDirection:'column', gap:10, width:'100%', maxWidth:310 }}>
          <button className="shop-btn-primary" onClick={() => navigate('/catalogue')}>Entrer dans le Shop →</button>
          <div style={{ display:'flex', gap:8 }}>
            <button className="shop-btn-secondary" onClick={() => navigate('/catalogue')} style={{ flex:1 }}>Catalogue</button>
            <button className="shop-btn-secondary" onClick={() => navigate('/panier')} style={{ flex:1 }}>Panier</button>
          </div>
        </div>
      </div>

      <div style={{ position:'relative', zIndex:20, borderTop:'1px solid rgba(255,255,255,0.06)', padding:'13px 0', overflow:'hidden', background:'rgba(255,255,255,0.02)' }}>
        <div style={{ display:'inline-flex', animation:'shopTicker 32s linear infinite', whiteSpace:'nowrap' }}>{tItems}</div>
      </div>

      {/* ── FOOTER CORRIGÉ ── */}
<div style={{ 
  position: 'relative', 
  zIndex: 10, 
  display: 'flex', 
  flexDirection: window.innerWidth < 768 ? 'column' : 'row', // Switch vertical sur mobile
  justifyContent: 'space-between', 
  alignItems: 'center', 
  padding: '20px 30px', // Un peu moins de padding pour gagner de la place
  gap: 16,
  marginTop: 'auto' // Force le footer à rester en bas
}}>
  <div style={{ display: 'flex', gap: 12 }}>
    {[
      <svg key="ig" width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
      <svg key="tw" width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.743l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
      <svg key="tt" width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34l-.02-8.43a8.18 8.18 0 004.78 1.52V5.02a4.85 4.85 0 01-1-.33z"/></svg>
    ].map((icon, i) => (
      <a key={i} href="#" className="social-link" style={{
        width: 32, height: 32, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,0.35)', transition: '0.3s'
      }}>
        {icon}
      </a>
    ))}
  </div>
  <p style={{ 
    fontSize: 9, 
    letterSpacing: '0.15em', 
    color: 'rgba(255,255,255,0.15)',
    textAlign: 'center',
    margin: 0 
  }}>
    © 2026 WYL. TOUS DROITS RÉSERVÉS.
  </p>
</div>
    </div>
  )
}