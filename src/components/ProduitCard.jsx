import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePanier } from '../context/PanierContext'

export default function ProduitCard({ produit, index = 0 }) {
  const navigate = useNavigate()
  const { ajouterAuPanier } = usePanier()
  const [added, setAdded] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const handleAdd = (e) => {
    e.stopPropagation()
    ajouterAuPanier(produit)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const isNew = () => {
    const created = new Date(produit.created_at)
    const diff = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)
    return diff < 14
  }

  // Optimized image URL
  const getOptimizedUrl = (url, w = 480) => {
    if (!url) return null
    if (url.includes('supabase') && url.includes('/storage/')) {
      return url + (url.includes('?') ? '&' : '?') + `width=${w}&quality=75&format=webp`
    }
    if (url.includes('unsplash.com')) {
      return url.replace(/w=\d+/, `w=${w}`).replace(/q=\d+/, 'q=70')
    }
    return url
  }

  const imgSrc = getOptimizedUrl(produit.image_url) ||
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=480&q=70'

  return (
    <div
      className={`product-card fade-up delay-${Math.min(index, 6)}`}
      onClick={() => navigate(`/produit/${produit.id}`)}
    >
      <div className="card-img-wrap">
        {!imgLoaded && <div className="shimmer" style={{ position: 'absolute', inset: 0 }} />}
        <img
          src={imgSrc}
          alt={produit.nom}
          className="card-img"
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
        />

        {produit.stock === 0 ? (
          <>
            <span className="card-badge badge-sold">Épuisé</span>
            <div className="sold-overlay">
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 14, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555' }}>SOLD OUT</span>
            </div>
          </>
        ) : produit.stock < 5 ? (
          <span className="card-badge badge-low">Dernières pièces</span>
        ) : isNew() ? (
          <span className="card-badge badge-new">New</span>
        ) : null}

        {produit.stock > 0 && (
          <button className="card-quick-btn" onClick={handleAdd}>
            {added ? '✓ Ajouté' : '+ Ajouter au panier'}
          </button>
        )}
      </div>

      <div className="card-info">
        {produit.categorie && <p className="card-category">{produit.categorie}</p>}
        <p className="card-name">{produit.nom}</p>
        <p className="card-price">{produit.prix} MAD</p>
      </div>
    </div>
  )
}
