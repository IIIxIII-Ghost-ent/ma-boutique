import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePanier } from '../context/PanierContext'

export default function ProduitCard({ produit, index = 0 }) {
  const navigate = useNavigate()
  const { ajouterAuPanier } = usePanier()
  const [added, setAdded] = useState(false)

  const handleAdd = (e) => {
    e.stopPropagation()
    ajouterAuPanier(produit)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div
      className={`product-card fade-up delay-${Math.min(index + 1, 6)}`}
      onClick={() => navigate(`/produit/${produit.id}`)}
      style={{ background: 'white', border: '1px solid var(--border)', cursor: 'pointer' }}
    >
      {/* Image */}
      <div className="card-img-wrap" style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: 'hsl(30,10%,94%)' }}>
        <img
          src={produit.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80'}
          alt={produit.nom}
          className="card-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Overlay gradient */}
        <div className="card-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.42) 0%, transparent 55%)' }} />
        {/* Voir le produit badge */}
        <div className="card-badge-hover" style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', borderRadius: 999, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
          <svg width="13" height="13" fill="none" stroke="var(--text-heading)" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <span style={{ fontFamily: 'Space Grotesk', fontSize: 11, fontWeight: 600, color: 'var(--text-heading)', letterSpacing: '0.05em' }}>Voir le produit</span>
        </div>
        {/* Badges stock */}
        {produit.stock > 0 && produit.stock < 5 && (
          <span style={{ position: 'absolute', top: 10, left: 10, background: 'var(--accent)', color: 'white', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.06em', fontFamily: 'Space Grotesk' }}>DERNIÈRES PIÈCES</span>
        )}
        {produit.stock === 0 && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Space Grotesk', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>ÉPUISÉ</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px 14px' }}>
        <p style={{ fontFamily: 'Space Grotesk', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 5 }}>{produit.categorie}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <p className="card-name font-display" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{produit.nom}</p>
            <p className="font-display" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-heading)' }}>{produit.prix} MAD</p>
          </div>
          <button onClick={handleAdd} disabled={produit.stock === 0}
            className={added ? 'btn-success' : 'btn-primary'}
            style={{ padding: '7px 10px', fontSize: 10, flexShrink: 0 }}>
            {added ? '✓' : '+'}
          </button>
        </div>
      </div>
    </div>
  )
}
