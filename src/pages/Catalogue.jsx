import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import ProduitCard from '../components/ProduitCard'

/* ── Helper : parse images_url (JSON string ou tableau) ── */
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

/* ── Icônes SVG inline (pas de lucide-react) ── */
const Icon = {
  Star:    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Zap:     <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Bag:     <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  Arrow:   <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Award:   <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  Truck:   <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  Refresh: <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.65"/></svg>,
  Msg:     <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
}

export default function Catalogue() {
  const [produits, setProduits]   = useState([])
  const [categories, setCategories] = useState([])
  const [filtre, setFiltre]       = useState('Tout')
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    supabase.from('produits').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) {
        setProduits(data)
        const cats = ['Tout', ...new Set(data.map(p => p.categorie).filter(Boolean))]
        setCategories(cats)
      }
      setLoading(false)
    })
  }, [])

  const produitsFiltres = filtre === 'Tout' ? produits : produits.filter(p => p.categorie === filtre)

  /* ── BUG CORRIGÉ : vedettes filtrées par p.vedette === true ── */
  const vedettes   = produits.filter(p => p.vedette === true && p.stock > 0)
  const nouveautes = [...produits].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4)

  const renderGrille = (liste) => (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'24px 16px' }} className="catalogue-grid">
      {liste.map((p, i) => {
        const imgs = parseImages(p)
        return <ProduitCard key={p.id} produit={{ ...p, image_url: imgs[0] || p.image_url }} index={i} />
      })}
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--background)', position:'relative' }}>

      {/* ── Filigrane cercles concentriques ── */}
      <div style={{ position:'fixed', top:'50%', right:'-8%', transform:'translateY(-50%)', zIndex:0, pointerEvents:'none', opacity:0.032 }}>
        {[600,480,360,240,120].map((s,i) => (
          <div key={i} style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:s, height:s, borderRadius:'50%', border:'1px solid #1a1a1a' }}/>
        ))}
      </div>
      <div style={{ position:'fixed', bottom:'-10%', left:'-6%', zIndex:0, pointerEvents:'none', opacity:0.025 }}>
        {[500,380,260,140].map((s,i) => (
          <div key={i} style={{ position:'absolute', bottom:0, left:0, transform:'translate(-50%,50%)', width:s, height:s, borderRadius:'50%', border:'1px solid #1a1a1a' }}/>
        ))}
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'56px 24px 0', position:'relative', zIndex:1 }}>

        {/* ── En-tête ── */}
        <div className="fade-up" style={{ marginBottom:48 }}>
          <div className="accent-line line-accent-anim" style={{ marginBottom:16 }}/>
          <h1 className="font-display section-title" style={{ fontSize:'clamp(36px,5vw,52px)', marginBottom:8 }}>Collection</h1>
          <p style={{ fontSize:14, color:'var(--text-muted)', maxWidth:440 }}>Pièces essentielles, qualité premium. Chaque article est conçu pour durer.</p>
        </div>

        {/* ── Produits vedettes ── */}
        {vedettes.length > 0 && (
          <section style={{ marginBottom:64 }}>
            <div className="fade-up delay-1" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
              <div>
                <p className="section-label" style={{ marginBottom:6, display:'flex', alignItems:'center', gap:6 }}>
                  {Icon.Star} Sélection
                </p>
                <h2 className="font-display section-title" style={{ fontSize:26 }}>Produits vedettes</h2>
              </div>
              <button onClick={() => setFiltre('Tout')} className="btn-outline" style={{ padding:'8px 18px', fontSize:11, display:'flex', alignItems:'center', gap:8 }}>
                Tout voir {Icon.Arrow}
              </button>
            </div>
            {renderGrille(vedettes)}
          </section>
        )}

        {/* ── Nouveautés ── */}
        {nouveautes.length > 0 && (
          <section style={{ marginBottom:64 }}>
            <div className="fade-up delay-2" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
              <div>
                <p className="section-label" style={{ marginBottom:6, display:'flex', alignItems:'center', gap:6 }}>
                  {Icon.Zap} Arrivages
                </p>
                <h2 className="font-display section-title" style={{ fontSize:26 }}>Nouveautés</h2>
              </div>
            </div>
            {renderGrille(nouveautes)}
          </section>
        )}

        {/* ── Bannière promo ── */}
        <div className="fade-up delay-2" style={{ background:'var(--primary)', borderRadius:16, padding:'36px 40px', marginBottom:64, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:20, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', right:-40, top:-40, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.03)' }}/>
          <div style={{ position:'absolute', right:60, bottom:-60, width:280, height:280, borderRadius:'50%', background:'rgba(183,100,72,0.12)' }}/>
          <div style={{ position:'relative', zIndex:1 }}>
            <p className="section-label" style={{ color:'rgba(255,255,255,0.4)', marginBottom:8 }}>Offre exclusive</p>
            <h3 className="font-display" style={{ fontSize:28, fontWeight:700, color:'white', marginBottom:6 }}>Livraison offerte</h3>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13 }}>Sur toutes vos commandes — Partout au Maroc</p>
          </div>
          <div style={{ animation:'float-badge 3s ease-in-out infinite', position:'relative', zIndex:1, background:'var(--accent)', color:'white', borderRadius:16, padding:'20px 28px', textAlign:'center', transform:'rotate(-2deg)' }}>
            <p style={{ fontFamily:'Space Grotesk', fontSize:28, fontWeight:700, lineHeight:1 }}>100%</p>
            <p style={{ fontFamily:'Space Grotesk', fontSize:11, letterSpacing:'0.15em', opacity:0.85, marginTop:4 }}>GRATUITE</p>
          </div>
        </div>

        {/* ── Tous les produits ── */}
        <section style={{ marginBottom:80 }}>
          <div className="fade-up" style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:16 }}>
            <div>
              <p className="section-label" style={{ marginBottom:6, display:'flex', alignItems:'center', gap:6 }}>{Icon.Bag} Catalogue complet</p>
              <h2 className="font-display section-title" style={{ fontSize:26 }}>Toute la collection</h2>
            </div>
            <p style={{ fontSize:12, color:'var(--text-muted)', fontFamily:'Space Grotesk' }}>
              {loading ? '…' : `${produitsFiltres.length} article${produitsFiltres.length>1?'s':''}`}
            </p>
          </div>

          <div className="fade-up delay-1" style={{ display:'flex', gap:8, flexWrap:'nowrap', overflowX:'auto', marginBottom:32, paddingBottom:4 }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFiltre(cat)} className={`filter-chip ${filtre===cat?'active':''}`}>{cat}</button>
            ))}
          </div>

          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'24px 16px' }} className="catalogue-grid">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ borderRadius:10, overflow:'hidden' }}>
                  <div className="shimmer" style={{ aspectRatio:'3/4' }}/>
                  <div style={{ padding:'12px 0' }}>
                    <div className="shimmer" style={{ height:14, borderRadius:4, marginBottom:8 }}/>
                    <div className="shimmer" style={{ height:12, borderRadius:4, width:'60%' }}/>
                  </div>
                </div>
              ))}
            </div>
          ) : produitsFiltres.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 0' }}>
              <p style={{ color:'var(--text-muted)', fontFamily:'Space Grotesk', fontSize:15 }}>Aucun produit dans cette catégorie.</p>
            </div>
          ) : renderGrille(produitsFiltres)}
        </section>

        {/* ── Pourquoi WYL ── */}
        <section className="fade-up" style={{ marginBottom:80 }}>
          <p className="section-label" style={{ marginBottom:8, textAlign:'center' }}>Notre engagement</p>
          <h2 className="font-display section-title" style={{ fontSize:26, textAlign:'center', marginBottom:40 }}>Pourquoi choisir WYL ?</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:20 }}>
            {[
              { icon:Icon.Award,   titre:'Qualité premium',   desc:'Matières soigneusement sélectionnées pour durer.' },
              { icon:Icon.Truck,   titre:'Livraison rapide',   desc:'Expédition sous 24h, offerte au Maroc.' },
              { icon:Icon.Refresh, titre:'Retours faciles',    desc:'Retour gratuit sous 30 jours.' },
              { icon:Icon.Msg,     titre:'Support WhatsApp',   desc:'Équipe disponible 7j/7.' },
            ].map((item, i) => (
              <div key={item.titre} className={`fade-up delay-${i+1} admin-card`} style={{ textAlign:'center', padding:'28px 20px' }}>
                <div style={{ color:'var(--accent)', marginBottom:14, display:'flex', justifyContent:'center' }}>{item.icon}</div>
                <h3 className="font-display" style={{ fontSize:16, fontWeight:700, color:'var(--text-heading)', marginBottom:8 }}>{item.titre}</h3>
                <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.65 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
