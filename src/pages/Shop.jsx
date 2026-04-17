import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePanier } from '../context/PanierContext'

const TICKER = ['NOUVELLE COLLECTION','LIVRAISON OFFERTE','QUALITÉ PREMIUM','WEAR YOUR LEGACY','SS 2026','STREETWEAR MAROC','ÉDITION LIMITÉE']

export default function Shop() {
  const navigate   = useNavigate()
  const { panier } = usePanier()
  const nbArticles = panier.reduce((a, p) => a + p.quantite, 0)
  const bgRef      = useRef(null)

  useEffect(() => {
    const move = (e) => {
      if (!bgRef.current) return
      const x = (e.clientX / window.innerWidth  - 0.5) * 18
      const y = (e.clientY / window.innerHeight - 0.5) * 12
      bgRef.current.style.transform = `translate(${x}px,${y}px) scale(1.07)`
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  const tItems = [...TICKER,...TICKER].map((t,i) => (
    <span key={i} style={{ padding:'0 28px', fontSize:10, letterSpacing:'0.35em', fontFamily:'Space Grotesk', color:'rgba(255,255,255,0.45)', fontWeight:500 }}>
      {t}<span style={{ color:'var(--accent)', marginLeft:28 }}>✦</span>
    </span>
  ))

  return (
    <div style={{ minHeight:'100vh', background:'#0c0e14', position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>

      {/* ── Background streetwear : texture tissu/textile abstrait ── */}
      <div ref={bgRef} style={{ position:'absolute', inset:'-6%', zIndex:0, transition:'transform 0.15s ease-out', willChange:'transform' }}>
        {/* Dégradé de base */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, #0c0e14 0%, #161820 40%, #0e1018 100%)' }}/>
        {/* Texture SVG abstraite — motif textile/streetwear */}
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.06 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="weave" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="10" height="10" fill="white" opacity="0.5"/>
              <rect x="10" y="10" width="10" height="10" fill="white" opacity="0.5"/>
            </pattern>
            <pattern id="grid-fine" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#weave)"/>
          <rect width="100%" height="100%" fill="url(#grid-fine)"/>
        </svg>
        {/* Ligne diagonale signature */}
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.04 }} xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="0" x2="100%" y2="100%" stroke="white" strokeWidth="80"/>
          <line x1="100%" y1="0" x2="0" y2="100%" stroke="white" strokeWidth="40"/>
        </svg>
        {/* Halo accent derrière logo */}
        <div style={{ position:'absolute', top:'42%', left:'50%', transform:'translate(-50%,-50%)', width:520, height:520, borderRadius:'50%', background:'radial-gradient(circle, rgba(183,100,72,0.22) 0%, transparent 65%)', filter:'blur(24px)' }}/>
        {/* Halo secondaire froid */}
        <div style={{ position:'absolute', top:'60%', left:'20%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(100,120,200,0.08) 0%, transparent 70%)', filter:'blur(20px)' }}/>
        {/* Cercles décoratifs */}
        <div style={{ position:'absolute', top:'18%', right:'12%', width:260, height:260, border:'1px solid rgba(255,255,255,0.06)', borderRadius:'50%', animation:'spin-slow 28s linear infinite' }}/>
        <div style={{ position:'absolute', top:'16%', right:'10%', width:260, height:260, border:'1px solid rgba(183,100,72,0.1)', borderRadius:'50%', animation:'spin-slow 42s linear infinite reverse' }}/>
        <div style={{ position:'absolute', bottom:'18%', left:'10%', width:200, height:200, border:'1px solid rgba(255,255,255,0.05)', transform:'rotate(45deg)', animation:'spin-slow 22s linear infinite' }}/>
        {/* Points lumineux */}
        {[[14,22],[88,16],[18,78],[92,72],[52,8],[48,94],[75,45]].map(([x,y],i) => (
          <div key={i} style={{ position:'absolute', left:`${x}%`, top:`${y}%`, width:2, height:2, borderRadius:'50%', background:'rgba(255,255,255,0.6)', animation:`twinkle ${2.2+i*0.6}s ease-in-out infinite ${i*0.4}s` }}/>
        ))}
      </div>

      {/* Dégradé bas */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:220, zIndex:2, background:'linear-gradient(to top,#0c0e14 0%,transparent 100%)' }}/>
      {/* Dégradé haut */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:120, zIndex:2, background:'linear-gradient(to bottom,rgba(12,14,20,0.6) 0%,transparent 100%)' }}/>

      {/* Top bar */}
      <div style={{ position:'relative', zIndex:10, display:'flex', justifyContent:'flex-end', padding:'28px 40px 0' }}>
        <button onClick={() => navigate('/panier')} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)', fontFamily:'Space Grotesk', fontSize:11, letterSpacing:'0.14em' }}>
          PANIER
          {nbArticles > 0 && <span style={{ background:'var(--accent)', color:'white', borderRadius:'50%', width:20, height:20, fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{nbArticles}</span>}
        </button>
      </div>

      {/* Centre */}
      <div style={{ position:'relative', zIndex:10, flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 24px', textAlign:'center' }}>

        <p className="fade-up delay-1" style={{ color:'rgba(255,255,255,0.55)', fontFamily:'Space Grotesk', fontSize:10, letterSpacing:'0.55em', textTransform:'uppercase', marginBottom:36 }}>
          Streetwear · Premium · Culture
        </p>

        {/* Logo : lévite ET tourne simultanément */}
        <div className="fade-up delay-2" style={{ marginBottom:12 }}>
          <div style={{ display:'inline-block', animation:'levitate 4s ease-in-out infinite' }}>
            <div style={{ display:'inline-block', perspective:'800px' }}>
              <span style={{ display:'inline-block', animation:'spin-y 8s linear infinite', transformStyle:'preserve-3d', fontFamily:'Space Grotesk', fontWeight:700, fontSize:'clamp(90px,18vw,152px)', color:'white', letterSpacing:'0.22em', lineHeight:1, textShadow:'0 0 80px rgba(255,255,255,0.25),0 0 200px rgba(183,100,72,0.15)' }}>
                WYL
              </span>
            </div>
          </div>
        </div>

        <p className="fade-up delay-3" style={{ color:'rgba(255,255,255,0.45)', fontFamily:'Space Grotesk', fontSize:11, letterSpacing:'0.4em', textTransform:'uppercase', marginBottom:32 }}>
          Wear Your Legacy
        </p>

        {/* Séparateur */}
        <div className="fade-up delay-4" style={{ marginBottom:44, display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:1, background:'rgba(255,255,255,0.1)' }}/>
          <div style={{ width:32, height:2, background:'var(--accent)', borderRadius:1, animation:'line-grow 1s 0.5s cubic-bezier(0.22,1,0.36,1) forwards', opacity:0 }}/>
          <div style={{ width:40, height:1, background:'rgba(255,255,255,0.1)' }}/>
        </div>

        {/* Boutons */}
        <div className="fade-up delay-5" style={{ display:'flex', flexDirection:'column', gap:12, width:'100%', maxWidth:300 }}>
          <button className="glass-strong" onClick={() => navigate('/catalogue')} style={{ padding:'16px 24px', borderRadius:12, color:'white', fontFamily:'Space Grotesk', fontWeight:600, fontSize:13, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
            Entrer dans le Shop
            <span style={{ display:'inline-block', animation:'arrow-bounce 1.2s ease-in-out infinite', fontSize:16 }}>→</span>
          </button>
          <button className="glass" onClick={() => navigate('/catalogue')} style={{ padding:'13px 24px', borderRadius:12, color:'rgba(255,255,255,0.72)', fontFamily:'Space Grotesk', fontWeight:500, fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>Catalogue</button>
          <button className="glass" onClick={() => navigate('/panier')} style={{ padding:'13px 24px', borderRadius:12, color:'rgba(255,255,255,0.72)', fontFamily:'Space Grotesk', fontWeight:500, fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>
            Panier {nbArticles > 0 ? `(${nbArticles})` : ''}
          </button>
        </div>
      </div>

      {/* Ticker */}
      <div style={{ position:'relative', zIndex:10, borderTop:'1px solid rgba(255,255,255,0.06)', padding:'10px 0', overflow:'hidden' }}>
        <div style={{ display:'inline-flex', animation:'ticker 26s linear infinite' }}>{tItems}</div>
      </div>

      {/* Bas */}
      <div className="fade-in delay-8" style={{ position:'relative', zIndex:10, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 40px 28px' }}>
        <div style={{ display:'flex', gap:18 }}>
          {[
            <svg key="ig" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
            <svg key="tw" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.743l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          ].map((icon, i) => (
            <a key={i} href="#" style={{ color:'rgba(255,255,255,0.32)', transition:'all 0.2s', display:'block' }}
              onMouseOver={e => { e.currentTarget.style.color='white'; e.currentTarget.style.transform='scale(1.2) translateY(-2px)' }}
              onMouseOut={e  => { e.currentTarget.style.color='rgba(255,255,255,0.32)'; e.currentTarget.style.transform='scale(1)' }}>
              {icon}
            </a>
          ))}
        </div>
        <p style={{ color:'rgba(255,255,255,0.18)', fontFamily:'Space Grotesk', fontSize:10, letterSpacing:'0.15em' }}>© 2026 WYL</p>
      </div>
    </div>
  )
}
