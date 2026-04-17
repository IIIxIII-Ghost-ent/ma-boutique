import { useState } from 'react'
import { usePanier } from '../context/PanierContext'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'

const NUMERO_WHATSAPP = '212675014485'

export default function Panier() {
  const navigate = useNavigate()
  const { panier, retirerDuPanier, viderPanier, total, ajouterAuPanier } = usePanier()
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [adresse, setAdresse] = useState('')
  const [envoye, setEnvoye] = useState(false)
  const [loading, setLoading] = useState(false)

  const augmenter = (produit) => ajouterAuPanier(produit)
  const diminuer = (p) => {
    if (p.quantite <= 1) { retirerDuPanier(p.id); return }
    const { ajouterAuPanier: _, ...rest } = p
    retirerDuPanier(p.id)
    for (let i = 0; i < p.quantite - 1; i++) ajouterAuPanier(p)
  }

  const passerCommande = async () => {
    if (!nom) { alert('Merci de renseigner votre nom et téléphone'); return }
    if (panier.length === 0) return
    setLoading(true)
    const { error } = await supabase.from('commandes').insert({
      client_nom: nom, client_telephone: telephone,
      client_adresse: adresse, articles: panier, total, statut: 'en_attente'
    })
    if (error) { alert('Erreur. Réessaye.'); setLoading(false); return }
    const lignes = panier.map(p => `• ${p.nom}${p.taille ? ` (${p.taille}/${p.couleur})` : ''} ×${p.quantite} — ${p.prix * p.quantite} MAD`).join('\n')
    const message = `🛍️ *Nouvelle commande WYL*\n\n*Client :* ${nom}\n*Tél :* ${telephone}\n*Adresse :* ${adresse || 'Non précisée'}\n\n*Articles :*\n${lignes}\n\n*Total : ${total} MAD*`
    viderPanier(); setEnvoye(true); setLoading(false)
    window.location.href = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`
  }

  if (envoye) return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 32 }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: 'white', marginBottom: 24 }}>✓</div>
      <h2 className="font-display" style={{ fontSize: 34, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 12 }}>Commande envoyée !</h2>
      <p style={{ color: 'var(--text-body)', maxWidth: 400, lineHeight: 1.7 }}>Le gestionnaire WYL vous contacte sur WhatsApp pour confirmer votre commande et le paiement.</p>
      <Link to="/catalogue" className="btn-primary" style={{ marginTop: 32, padding: '13px 28px', textDecoration: 'none', display: 'inline-block', fontSize: 13 }}>
        Continuer mes achats
      </Link>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '56px 32px' }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: 48 }}>
          <div className="accent-line line-accent-anim" style={{ marginBottom: 18 }} />
          <h1 className="font-display" style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, color: 'var(--text-heading)' }}>Panier</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6, fontFamily: 'Space Grotesk' }}>
            {panier.length === 0 ? "Rien pour l'instant." : `${panier.reduce((a, p) => a + p.quantite, 0)} article${panier.reduce((a, p) => a + p.quantite, 0) > 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Panier vide */}
        {panier.length === 0 ? (
          <div className="fade-up delay-2" style={{ textAlign: 'center', padding: '72px 0' }}>
            <div style={{ animation: 'levitate 3s ease-in-out infinite', display: 'inline-block', marginBottom: 20 }}>
              <svg width="52" height="52" fill="none" stroke="var(--border)" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </div>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk', fontSize: 15, marginBottom: 28 }}>Votre panier est vide</p>
            <Link to="/catalogue" className="btn-primary" style={{ padding: '13px 28px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              Voir le catalogue <span>→</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 40 }}>

            {/* Articles */}
            <div>
              {panier.map((p, i) => (
                <div key={`${p.id}-${p.taille}-${p.couleur}`} className={`fade-up delay-${i + 1}`} style={{
                  display: 'flex', gap: 18, alignItems: 'flex-start',
                  padding: '20px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <img src={p.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200'} alt={p.nom}
                    onClick={() => navigate(`/produit/${p.id}`)}
                    style={{ width: 80, height: 96, objectFit: 'cover', borderRadius: 10, flexShrink: 0, cursor: 'pointer', transition: 'transform 0.25s', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={e => e.target.style.transform = 'scale(1)'}
                  />
                  <div style={{ flex: 1 }}>
                    <p className="font-display" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 4 }}>{p.nom}</p>
                    {(p.taille || p.couleur) && (
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, fontFamily: 'Space Grotesk' }}>
                        {[p.taille, p.couleur].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {/* Qty controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button className="qty-btn" onClick={() => diminuer(p)}>−</button>
                      <span style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 600, color: 'var(--text-heading)', minWidth: 20, textAlign: 'center' }}>{p.quantite}</span>
                      <button className="qty-btn" onClick={() => augmenter(p)}>+</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                    <span className="font-display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)' }}>{p.prix * p.quantite} MAD</span>
                    <button onClick={() => retirerDuPanier(p.id)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                      transition: 'color 0.2s, transform 0.2s', fontSize: 13, display: 'flex', alignItems: 'center',
                    }}
                      onMouseOver={e => { e.currentTarget.style.color='#dc2626'; e.currentTarget.style.transform='scale(1.15)'; }}
                      onMouseOut={e => { e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.transform='scale(1)'; }}
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {/* Récap */}
              <div style={{ paddingTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Sous-total</span>
                  <span className="font-display" style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: 15 }}>{total} MAD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Livraison</span>
                  <span style={{ color: '#16a34a', fontFamily: 'Space Grotesk', fontWeight: 500, fontSize: 14 }}>Offerte</span>
                </div>
                <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-display" style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-heading)' }}>Total</span>
                  <span className="font-display" style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-heading)' }}>{total} MAD</span>
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 24 }}>Vos coordonnées</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Nom complet *', value: nom, setter: setNom, type: 'text', placeholder: 'Ahmed Benali' },
                  { label: 'Adresse de livraison', value: adresse, setter: setAdresse, type: 'text', placeholder: 'Rue, Ville, Code postal' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ display: 'block', fontFamily: 'Space Grotesk', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>
                      {f.label}
                    </label>
                    <input type={f.type} placeholder={f.placeholder} value={f.value} onChange={e => f.setter(e.target.value)} className="wyl-input" />
                  </div>
                ))}
              </div>
              <button onClick={passerCommande} disabled={loading} className="btn-primary"
                style={{ width: '100%', padding: '16px', marginTop: 24, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                {loading ? 'Envoi...' : <><span>📲</span> Commander via WhatsApp</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
