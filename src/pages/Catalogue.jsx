import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import ProduitCard from '../components/ProduitCard'

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

export default function Catalogue() {
  const [produits, setProduits] = useState([])
  const [categories, setCategories] = useState([])
  const [filtre, setFiltre] = useState('Tout')
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('recent')

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

  let produitsFiltres = filtre === 'Tout' ? produits : produits.filter(p => p.categorie === filtre)
  if (sortBy === 'price-asc') produitsFiltres = [...produitsFiltres].sort((a, b) => a.prix - b.prix)
  if (sortBy === 'price-desc') produitsFiltres = [...produitsFiltres].sort((a, b) => b.prix - a.prix)
  if (sortBy === 'recent') produitsFiltres = [...produitsFiltres].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const vedettes = produits.filter(p => p.vedette === true && p.stock > 0)
  const nouveautes = [...produits].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4)

  const renderGrid = (liste) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
      {liste.map((p, i) => {
        const imgs = parseImages(p)
        return <ProduitCard key={p.id} produit={{ ...p, image_url: imgs[0] || p.image_url }} index={i} />
      })}
    </div>
  )

  const SkeletonGrid = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
      {[1,2,3,4,5,6,8].map(i => (
        <div key={i}>
          <div className="shimmer" style={{ aspectRatio: '3/4' }} />
          <div style={{ padding: '14px 12px', background: 'white' }}>
            <div className="shimmer" style={{ height: 11, width: '50%', marginBottom: 6 }} />
            <div className="shimmer" style={{ height: 16, marginBottom: 6 }} />
            <div className="shimmer" style={{ height: 13, width: '35%' }} />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>

      {/* ── Page header ── */}
      <div style={{ background: '#111', padding: '48px 24px 40px', borderBottom: '1px solid #2a2a2a' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>WYL</p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'white', lineHeight: 0.9, marginBottom: 12 }}>Catalogue</h1>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Pièces essentielles, qualité premium. Chaque article est conçu pour durer.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 24px' }}>

        {/* ── BEST SELLERS ── */}
        {!loading && vedettes.length > 0 && (
          <section style={{ padding: '56px 0 40px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #e8e5e0', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ fontFamily: 'Barlow', fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#888', marginBottom: 2 }}>Incontournables</p>
                <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#111', lineHeight: 1 }}>Best Sellers</h2>
              </div>
            </div>
            {renderGrid(vedettes.slice(0, 4))}
          </section>
        )}

        {/* ── NOUVEAUTÉS ── */}
        {!loading && nouveautes.length > 0 && (
          <section style={{ padding: '40px 0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #e8e5e0', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#888', marginBottom: 2 }}>Arrivages</p>
                <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#111', lineHeight: 1 }}>New Releases</h2>
              </div>
            </div>
            {renderGrid(nouveautes)}
          </section>
        )}

        {/* ── PROMO BANNER ── */}
        {!loading && (
          <div style={{ background: '#111', padding: '40px 48px', margin: '8px 0 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Offre permanente</p>
              <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'white', lineHeight: 1, marginBottom: 6 }}>Livraison offerte au Maroc</h3>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Sur toutes vos commandes — sans minimum.</p>
            </div>
            <div style={{ background: '#b76448', padding: '16px 28px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 38, fontWeight: 900, color: 'white', lineHeight: 1 }}>100%</p>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>Gratuite</p>
            </div>
          </div>
        )}

        {/* ── TOUS LES PRODUITS ── */}
        <section id="catalogue-complet" style={{ paddingBottom: 80 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #e8e5e0', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#888', marginBottom: 2 }}>Catalogue complet</p>
              <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#111', lineHeight: 1 }}>
                Shop All {!loading && <span style={{ fontSize: '0.55em', fontWeight: 600, color: '#888', marginLeft: 8 }}>{produitsFiltres.length} articles</span>}
              </h2>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ fontFamily: 'Barlow, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', border: '1.5px solid #e8e5e0', background: 'white', color: '#111', padding: '8px 16px', cursor: 'pointer', outline: 'none' }}
            >
              <option value="recent">Récents</option>
              <option value="price-asc">Prix ↑</option>
              <option value="price-desc">Prix ↓</option>
            </select>
          </div>

          {/* Filter bar */}
          <div className="filter-bar" style={{ marginBottom: 28, display: 'flex', gap: 2, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFiltre(cat)}
                className={`filter-chip${filtre === cat ? ' active' : ''}`}
              >{cat}</button>
            ))}
          </div>

          {loading ? <SkeletonGrid /> : produitsFiltres.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 20, fontWeight: 700, textTransform: 'uppercase', color: '#888', letterSpacing: '0.08em' }}>Aucun produit dans cette catégorie</p>
            </div>
          ) : renderGrid(produitsFiltres)}
        </section>

        {/* ── Pourquoi WYL ── */}
        <section style={{ paddingBottom: 80 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 14, borderBottom: '1px solid #e8e5e0' }}>
            <div>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#888', marginBottom: 2 }}>Notre engagement</p>
              <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#111', lineHeight: 1 }}>Pourquoi WYL ?</h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            {[
              { icon: '🏆', titre: 'Qualité premium', desc: 'Matières soigneusement sélectionnées.' },
              { icon: '🚚', titre: 'Livraison 24-48h', desc: 'Expédition rapide, offerte au Maroc.' },
              { icon: '↩️', titre: 'Retours 30 jours', desc: 'Retour gratuit sans condition.' },
              { icon: '💬', titre: 'Support WhatsApp', desc: 'Équipe disponible 7j/7, 9h–19h.' },
            ].map((item) => (
              <div key={item.titre} style={{ background: '#f7f6f4', padding: '36px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 18, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#111', marginBottom: 8 }}>{item.titre}</h3>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: 13, color: '#888', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
