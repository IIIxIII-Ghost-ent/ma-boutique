import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { usePanier } from '../context/PanierContext'
import ProduitCard from '../components/ProduitCard'

const TAILLES  = ['XS','S','M','L','XL','XXL']
const COULEURS = ['Noir','Blanc','Gris','Beige','Kaki']

/* ── Helper images ── */
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

export default function ProduitDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { ajouterAuPanier } = usePanier()
  const [produit, setProduit]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [taille, setTaille]     = useState(null)
  const [couleur, setCouleur]   = useState(null)
  const [added, setAdded]       = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [error, setError]       = useState('')
  const [similaires, setSimilaires] = useState([])
  const [activeImg, setActiveImg]   = useState(0)

  useEffect(() => {
    setTaille(null); setCouleur(null); setAdded(false); setError('')
    setLoading(true); setActiveImg(0); setImgLoaded(false)
    supabase.from('produits').select('*').eq('id', id).single().then(({ data }) => {
      setProduit(data)
      setLoading(false)
      if (data?.categorie) {
        supabase.from('produits').select('*').eq('categorie', data.categorie).neq('id', id).limit(4)
          .then(({ data: sim }) => { if (sim) setSimilaires(sim) })
      }
    })
  }, [id])

  const handleAdd = () => {
    if (!taille)  { setError('Veuillez sélectionner une taille');  return }
    if (!couleur) { setError('Veuillez sélectionner une couleur'); return }
    setError('')
    ajouterAuPanier({ ...produit, taille, couleur })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px 32px' }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:64 }}>
        <div className="shimmer" style={{ borderRadius:20, aspectRatio:'3/4', minHeight:420 }}/>
        <div style={{ paddingTop:20 }}>
          {[32,100,40,80].map((w,i) => <div key={i} className="shimmer" style={{ height:i===1?40:16, width:`${w}%`, borderRadius:6, marginBottom:20 }}/>)}
        </div>
      </div>
    </div>
  )

  if (!produit) return <div style={{ textAlign:'center', padding:'80px 32px' }}><p style={{ fontFamily:'Space Grotesk', color:'var(--text-muted)' }}>Produit introuvable.</p></div>

  const images = parseImages(produit)
  const imgSrc = images[activeImg] || images[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=85'

  return (
    <div style={{ minHeight:'100vh', background:'var(--background)', position:'relative' }}>

      {/* Filigrane cercles */}
      <div style={{ position:'fixed', top:'30%', right:'-5%', zIndex:0, pointerEvents:'none', opacity:0.028 }}>
        {[500,380,260,140].map((s,i) => <div key={i} style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:s, height:s, borderRadius:'50%', border:'1px solid #1a1a1a' }}/>)}
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px 32px', position:'relative', zIndex:1 }}>

        {/* Retour */}
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, color:'var(--text-muted)', fontFamily:'Space Grotesk', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:40, transition:'color 0.2s' }}
          onMouseOver={e => e.currentTarget.style.color='var(--text-heading)'}
          onMouseOut={e  => e.currentTarget.style.color='var(--text-muted)'}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Retour au catalogue
        </button>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:64, alignItems:'start', marginBottom:80 }}>

          {/* ── Colonne image ── */}
          <div>
            {/* Image principale grande */}
            <div className="fade-in" style={{ borderRadius:20, overflow:'hidden', background:'hsl(30,10%,93%)', position:'relative', cursor:'crosshair', aspectRatio:'3/4', minHeight:420, marginBottom:images.length>1?12:0 }}>
              <img src={imgSrc} alt={produit.nom} onLoad={() => setImgLoaded(true)}
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', opacity:imgLoaded?1:0, transition:'opacity 0.5s ease, transform 0.7s ease' }}
                onMouseOver={e => e.target.style.transform='scale(1.07)'}
                onMouseOut={e  => e.target.style.transform='scale(1)'}/>
              {/* Badge catégorie */}
              <div style={{ position:'absolute', top:16, left:16, background:'rgba(255,255,255,0.92)', backdropFilter:'blur(10px)', borderRadius:999, padding:'6px 14px' }}>
                <span style={{ fontFamily:'Space Grotesk', fontSize:10, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-heading)' }}>{produit.categorie}</span>
              </div>
              {produit.stock > 0 && produit.stock < 5 && (
                <div style={{ position:'absolute', top:16, right:16, background:'var(--accent)', borderRadius:999, padding:'6px 14px' }}>
                  <span style={{ fontFamily:'Space Grotesk', fontSize:10, fontWeight:600, color:'white' }}>DERNIÈRES PIÈCES</span>
                </div>
              )}
            </div>
            {/* Miniatures */}
            {images.length > 1 && (
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {images.map((url, i) => (
                  <div key={i} onClick={() => { setActiveImg(i); setImgLoaded(false) }}
                    style={{ width:72, height:72, borderRadius:10, overflow:'hidden', cursor:'pointer', border: i===activeImg ? '2px solid var(--accent)' : '2px solid transparent', transition:'border-color 0.2s', flexShrink:0 }}>
                    <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Colonne infos ── */}
          <div className="fade-up delay-2">
            <div className="accent-line line-accent-anim" style={{ marginBottom:20, animationDelay:'0.4s' }}/>
            <p style={{ fontFamily:'Space Grotesk', fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:10 }}>{produit.categorie}</p>
            <h1 className="font-display" style={{ fontSize:'clamp(28px,4vw,40px)', fontWeight:700, color:'var(--text-heading)', lineHeight:1.1, marginBottom:14 }}>{produit.nom}</h1>
            <p className="font-display" style={{ fontSize:34, fontWeight:700, color:'var(--text-heading)', marginBottom:20 }}>{produit.prix} MAD</p>
            <p style={{ fontSize:14, lineHeight:1.8, color:'var(--text-body)', marginBottom:28 }}>
              {produit.description || 'Pièce premium de la collection WYL. Coupe soignée, matières de qualité, finitions impeccables.'}
            </p>

            {/* Avantages */}
            <div style={{ display:'flex', gap:10, marginBottom:28, flexWrap:'wrap' }}>
              {[['🚚','Livraison offerte'],['🛡','Qualité garantie'],['🔄','Retour 30j']].map(([ic,lb]) => (
                <div key={lb} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', background:'white', border:'1px solid var(--border)', borderRadius:8 }}>
                  <span style={{ fontSize:13 }}>{ic}</span>
                  <span style={{ fontFamily:'Space Grotesk', fontSize:11, color:'var(--text-muted)', fontWeight:500 }}>{lb}</span>
                </div>
              ))}
            </div>

            <div style={{ height:1, background:'var(--border)', marginBottom:26 }}/>

            {/* Taille */}
            <div style={{ marginBottom:22 }}>
              <p style={{ fontFamily:'Space Grotesk', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:12 }}>Taille</p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {TAILLES.map(t => <button key={t} onClick={() => setTaille(t)} className={`size-btn ${taille===t?'active':''}`}>{t}</button>)}
              </div>
            </div>

            {/* Couleur */}
            <div style={{ marginBottom:24 }}>
              <p style={{ fontFamily:'Space Grotesk', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:12 }}>Couleur</p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {COULEURS.map(c => <button key={c} onClick={() => setCouleur(c)} className={`colour-btn ${couleur===c?'active':''}`}>{c}</button>)}
              </div>
            </div>

            {error && <p style={{ fontFamily:'Space Grotesk', fontSize:12, color:'#dc2626', marginBottom:12 }}>⚠ {error}</p>}

            <button onClick={handleAdd} disabled={produit.stock===0} className={added?'btn-success':'btn-primary'}
              style={{ width:'100%', padding:'18px', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow:added?'0 8px 24px rgba(22,163,74,0.25)':'0 8px 24px rgba(0,0,0,0.12)', transition:'all 0.3s ease' }}>
              {added ? '✓ Ajouté au panier' : produit.stock===0 ? 'Épuisé' : (
                <><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>Ajouter au panier</>
              )}
            </button>
            {produit.stock > 0 && produit.stock < 5 && (
              <p style={{ textAlign:'center', fontFamily:'Space Grotesk', fontSize:11, color:'var(--accent)', marginTop:10 }}>Plus que {produit.stock} en stock !</p>
            )}
          </div>
        </div>

        {/* Similaires */}
        {similaires.length > 0 && (
          <section className="fade-up" style={{ marginBottom:60 }}>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:28 }}>
              <div className="accent-line" style={{ width:32, flexShrink:0 }}/>
              <div>
                <p className="section-label" style={{ marginBottom:4 }}>Du même univers</p>
                <h2 className="font-display section-title" style={{ fontSize:22 }}>Vous aimerez aussi</h2>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'24px 16px' }} className="catalogue-grid">
              {similaires.map((p, i) => {
                const imgs = parseImages(p)
                return <ProduitCard key={p.id} produit={{ ...p, image_url: imgs[0] || p.image_url }} index={i}/>
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
