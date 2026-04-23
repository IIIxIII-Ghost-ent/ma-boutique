import { useState, useEffect } from 'react'
import { usePanier } from '../context/PanierContext'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'
import waveQR from '../assets/wave_qr.png'

const IBAN       = 'MA64 2308 1558 6090 7211 0074 0060'
const IBAN_CLEAN = 'MA64230815586090721100740060'

/* ── Logos ── */
const VisaLogo = ({ h = 28 }) => (
  <svg viewBox="0 0 750 471" xmlns="http://www.w3.org/2000/svg" style={{ height: h, width: 'auto', display: 'block' }}>
    <rect width="750" height="471" rx="40" fill="#1A1F71"/>
    <path d="M278.2 334.5L309.4 137h49.4l-31.2 197.5h-49.4zm227.4-192.6c-9.8-3.7-25.2-7.7-44.4-7.7-49 0-83.5 24.8-83.8 60.3-.3 26.2 24.6 40.9 43.4 49.6 19.3 8.9 25.8 14.6 25.7 22.5-.1 12.1-15.4 17.7-29.7 17.7-19.9 0-30.4-2.8-46.7-9.6l-6.4-2.9-7 41.2c11.6 5.1 33 9.6 55.2 9.8 52.1 0 85.9-24.5 86.3-62.4.2-20.8-13-36.6-41.5-49.6-17.3-8.4-27.8-14-27.7-22.5 0-7.5 8.9-15.6 28.2-15.6 16.1-.3 27.7 3.3 36.8 7l4.4 2.1 6.2-39.9zm127.7-5.4h-38.3c-11.9 0-20.7 3.3-25.9 15.1l-73.5 166.3h52s8.5-22.5 10.5-27.5c5.7 0 56.6.1 63.8.1 1.5 6.4 6 27.4 6 27.4h46l-40.6-181.4zm-62.2 115.5c4.1-10.6 19.8-51.2 19.8-51.2-.3.5 4.1-10.6 6.6-17.5l3.4 15.8s9.5 44 11.5 53h-41.3zm-352.1-115.5l-48.5 134.4-5.2-25.3c-9-29-37.3-60.5-68.9-76.2l44.4 168 52.4-.1 78-200.8h-52.2z" fill="#fff"/>
    <path d="M152.3 136.8H74.1l-.6 3.7c60.9 14.8 101.2 50.6 117.9 93.6l-17-81.8c-2.9-11.3-11.6-14.9-22.1-15.5z" fill="#F9A533"/>
  </svg>
)
const MastercardLogo = ({ h = 28 }) => (
  <svg viewBox="0 0 750 471" xmlns="http://www.w3.org/2000/svg" style={{ height: h, width: 'auto', display: 'block' }}>
    <rect width="750" height="471" rx="40" fill="#1c1c1c"/>
    <circle cx="271" cy="235.5" r="150" fill="#EB001B"/>
    <circle cx="479" cy="235.5" r="150" fill="#F79E1B"/>
    <path d="M375 106.8a150 150 0 0 1 0 257.4 150 150 0 0 1 0-257.4z" fill="#FF5F00"/>
  </svg>
)
const WaveLogo = ({ h = 26 }) => (
  <svg viewBox="0 0 200 64" xmlns="http://www.w3.org/2000/svg" style={{ height: h, width: 'auto', display: 'block' }}>
    <rect width="200" height="64" rx="8" fill="#1BA5E0"/>
    <text x="100" y="44" textAnchor="middle" fill="white" fontFamily="Arial Black,sans-serif" fontWeight="900" fontSize="36" letterSpacing="1">Wave</text>
  </svg>
)
const CashLogo = ({ h = 28 }) => (
  <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" style={{ height: h, width: 'auto', display: 'block' }}>
    <circle cx="28" cy="28" r="28" fill="url(#cashGrad)"/>
    <defs><linearGradient id="cashGrad" x1="0" y1="0" x2="56" y2="56"><stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="#15803d"/></linearGradient></defs>
    <text x="28" y="36" textAnchor="middle" fontSize="26">💵</text>
  </svg>
)

/* ── Stepper ── */
const STEPS = [{ n:1, label:'Panier' }, { n:2, label:'Livraison' }, { n:3, label:'Paiement' }, { n:4, label:'Confirmation' }]

function Stepper({ step }) {
  return (
    <nav style={{ display:'flex', alignItems:'center', marginBottom:36, overflowX:'auto', paddingBottom:2 }}>
      {STEPS.map((s, i) => {
        const done = step > s.n
        const current = step === s.n
        return (
          <div key={s.n} style={{ display:'flex', alignItems:'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, flexShrink:0 }}>
              <div style={{
                width:26, height:26, borderRadius:'50%', flexShrink:0,
                background: done || current ? '#111' : '#f0eeec',
                border: done || current ? 'none' : '1.5px solid #d8d5d0',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                {done
                  ? <svg width="11" height="11" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  : <span style={{ fontFamily:'Barlow Condensed', fontWeight:800, fontSize:11, color: current ? 'white' : '#bbb' }}>{s.n}</span>
                }
              </div>
              <span style={{ fontFamily:'Barlow', fontSize:10, fontWeight: current ? 700 : 500, letterSpacing:'0.07em', textTransform:'uppercase', color: current ? '#111' : done ? '#111' : '#bbb', whiteSpace:'nowrap' }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex:1, height:1, background: done ? '#111' : '#e0ddd9', margin:'0 10px', minWidth:16 }}/>
            )}
          </div>
        )
      })}
    </nav>
  )
}

/* ── Résumé commande ── */
function OrderSummary({ panier, total, paiement }) {
  const PAY_LABELS = { cod:'Cash à la livraison', wave:'Wave Sénégal', visa:'Carte Visa (IBAN)', mastercard:'Mastercard (IBAN)' }
  const livraison = 0 // offerte
  const totalFinal = total + livraison

  return (
    <aside style={{ background:'#fafaf8', border:'1px solid #e8e5e0', borderRadius:12, overflow:'hidden', position:'sticky', top:88 }}>
      <div style={{ padding:'14px 18px', borderBottom:'1px solid #ede9e4' }}>
        <p style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:11, letterSpacing:'.18em', textTransform:'uppercase', color:'#999', margin:0 }}>Votre commande</p>
      </div>

      {/* Articles */}
      <div style={{ padding:'10px 18px' }}>
        {panier.map((p, i) => (
          <div key={`${p.id}-${p.taille}-${i}`} style={{ display:'flex', gap:10, alignItems:'center', padding:'8px 0', borderBottom:'1px solid #f2f0ed' }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <img src={p.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=80&q=60'} alt={p.nom}
                loading="lazy"
                style={{ width:42, height:50, objectFit:'cover', borderRadius:6, display:'block', border:'1px solid #ede9e4' }}/>
              <span style={{ position:'absolute', top:-5, right:-5, background:'#111', color:'white', borderRadius:'50%', width:16, height:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, fontFamily:'Barlow' }}>{p.quantite}</span>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:13, color:'#111', textTransform:'uppercase', letterSpacing:'.03em', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.nom}</p>
              {(p.taille || p.couleur) && <p style={{ fontFamily:'Barlow', fontSize:10, color:'#aaa', margin:'2px 0 0' }}>{[p.taille, p.couleur].filter(Boolean).join(' · ')}</p>}
            </div>
            <span style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:13, color:'#111', flexShrink:0 }}>{p.prix * p.quantite} MAD</span>
          </div>
        ))}
      </div>

      {/* Totaux */}
      <div style={{ padding:'10px 18px 14px', borderTop:'1px solid #ede9e4' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
          <span style={{ fontFamily:'Barlow', fontSize:12, color:'#888' }}>Sous-total</span>
          <span style={{ fontFamily:'Barlow', fontSize:12, color:'#111', fontWeight:600 }}>{total} MAD</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
          <span style={{ fontFamily:'Barlow', fontSize:12, color:'#888' }}>Livraison</span>
          <span style={{ fontFamily:'Barlow', fontSize:12, color:'#16a34a', fontWeight:600 }}>Offerte 🎁</span>
        </div>
        <div style={{ height:1, background:'#e8e5e0', margin:'10px 0' }}/>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:13, textTransform:'uppercase', letterSpacing:'.06em', color:'#111' }}>Total à payer</span>
          <span style={{ fontFamily:'Barlow Condensed', fontWeight:900, fontSize:28, color:'#111' }}>
            {totalFinal}&nbsp;<span style={{ fontSize:13, fontWeight:700 }}>MAD</span>
          </span>
        </div>
      </div>

      {paiement && (
        <div style={{ padding:'10px 18px', borderTop:'1px solid #ede9e4', display:'flex', alignItems:'center', gap:10, background:'#f5f2ef' }}>
          {paiement === 'cod' && <CashLogo h={22}/>}
          {paiement === 'wave' && <WaveLogo h={20}/>}
          {paiement === 'visa' && <VisaLogo h={20}/>}
          {paiement === 'mastercard' && <MastercardLogo h={20}/>}
          <span style={{ fontFamily:'Barlow', fontSize:11, fontWeight:600, color:'#555' }}>{PAY_LABELS[paiement]}</span>
        </div>
      )}

      <div style={{ padding:'9px 18px', borderTop:'1px solid #ede9e4', display:'flex', gap:8, alignItems:'center' }}>
        <svg width="13" height="13" fill="none" stroke="#aaa" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span style={{ fontFamily:'Barlow', fontSize:10, color:'#aaa', letterSpacing:'.05em' }}>Commande sécurisée · Retours 30 jours</span>
      </div>
    </aside>
  )
}

/* ── Étape 1 Panier ── */
function StepPanier({ panier, retirerDuPanier, modifierQuantite, total, goNext }) {
  const navigate = useNavigate()

  if (panier.length === 0) return (
    <div style={{ textAlign:'center', padding:'80px 0' }}>
      <div style={{ width:68, height:68, borderRadius:'50%', background:'#f5f3f0', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
        <svg width="26" height="26" fill="none" stroke="#ccc" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
      </div>
      <p style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:20, color:'#ccc', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:22 }}>Votre panier est vide</p>
      <Link to="/catalogue" className="btn btn-dark" style={{ textDecoration:'none' }}>Découvrir la collection →</Link>
    </div>
  )

  return (
    <div>
      {/* Header tableau — masqué sur mobile */}
      <div className="panier-table-header">
        {['Produit', 'Prix unit.', 'Quantité', 'Total'].map((h, i) => (
          <span key={h} style={{ fontFamily:'Barlow', fontSize:10, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:'#888', textAlign: i > 0 ? 'center' : 'left' }}>{h}</span>
        ))}
      </div>

      {panier.map((p, i) => (
        <div key={`${p.id}-${p.taille || ''}-${i}`} className="panier-row">
          {/* Produit */}
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <img
              src={p.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=160&q=60'}
              alt={p.nom}
              loading="lazy"
              onClick={() => navigate(`/produit/${p.id}`)}
              style={{ width:58, height:72, objectFit:'cover', borderRadius:8, cursor:'pointer', display:'block', border:'1px solid #f0eeec', flexShrink:0 }}
            />
            <div>
              <p style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:14, textTransform:'uppercase', letterSpacing:'.04em', color:'#111', margin:'0 0 2px' }}>{p.nom}</p>
              {(p.taille || p.couleur) && <p style={{ fontFamily:'Barlow', fontSize:11, color:'#aaa', margin:'0 0 6px' }}>{[p.taille, p.couleur].filter(Boolean).join(' · ')}</p>}
              {/* Prix sur mobile */}
              <p className="panier-mobile-price">{p.prix} MAD</p>
              <button
                onClick={() => retirerDuPanier(p.id, p.taille, p.couleur)}
                style={{ fontFamily:'Barlow', fontSize:10, fontWeight:600, color:'#ccc', background:'none', border:'none', cursor:'pointer', padding:0, letterSpacing:'.06em', textTransform:'uppercase', transition:'color .2s' }}
                onMouseOver={e => e.currentTarget.style.color='#dc2626'}
                onMouseOut={e => e.currentTarget.style.color='#ccc'}
              >Retirer</button>
            </div>
          </div>

          {/* Prix unitaire — desktop */}
          <div className="panier-desktop-cell" style={{ textAlign:'center' }}>
            <span style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:14, color:'#111' }}>{p.prix} MAD</span>
          </div>

          {/* Quantité */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ display:'flex', alignItems:'center', border:'1px solid #e0ddd9', borderRadius:6, overflow:'hidden', width:90 }}>
              <button
                onClick={() => modifierQuantite(p.id, p.taille, p.couleur, -1)}
                style={{ width:28, height:30, background:'none', border:'none', cursor:'pointer', fontSize:15, color:'#444', display:'flex', alignItems:'center', justifyContent:'center' }}
                onMouseOver={e => e.currentTarget.style.background='#f5f3f0'}
                onMouseOut={e => e.currentTarget.style.background='none'}
              >−</button>
              <span style={{ fontFamily:'Barlow', fontWeight:700, fontSize:13, width:34, textAlign:'center', borderLeft:'1px solid #e0ddd9', borderRight:'1px solid #e0ddd9', height:30, display:'flex', alignItems:'center', justifyContent:'center' }}>{p.quantite}</span>
              <button
                onClick={() => modifierQuantite(p.id, p.taille, p.couleur, 1)}
                style={{ width:28, height:30, background:'none', border:'none', cursor:'pointer', fontSize:15, color:'#444', display:'flex', alignItems:'center', justifyContent:'center' }}
                onMouseOver={e => e.currentTarget.style.background='#f5f3f0'}
                onMouseOut={e => e.currentTarget.style.background='none'}
              >+</button>
            </div>
          </div>

          {/* Total ligne */}
          <div style={{ textAlign:'center' }}>
            <span style={{ fontFamily:'Barlow Condensed', fontWeight:800, fontSize:15, color:'#111' }}>{p.prix * p.quantite} MAD</span>
          </div>
        </div>
      ))}

      {/* Total visible côté gauche sur mobile */}
      <div className="panier-mobile-total">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderTop:'2px solid #111' }}>
          <span style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:15, textTransform:'uppercase', letterSpacing:'.06em' }}>Total</span>
          <span style={{ fontFamily:'Barlow Condensed', fontWeight:900, fontSize:26, color:'#111' }}>{total} <span style={{ fontSize:13 }}>MAD</span></span>
        </div>
        <p style={{ fontFamily:'Barlow', fontSize:11, color:'#16a34a', fontWeight:600 }}>🎁 Livraison offerte incluse</p>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:22, gap:14, flexWrap:'wrap' }}>
        <Link to="/catalogue" style={{ fontFamily:'Barlow', fontSize:11, fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase', color:'#aaa', textDecoration:'none', display:'flex', alignItems:'center', gap:5, transition:'color .2s' }}
          onMouseOver={e => e.currentTarget.style.color='#111'}
          onMouseOut={e => e.currentTarget.style.color='#aaa'}
        >← Continuer mes achats</Link>
        <button onClick={goNext} className="btn btn-dark">Livraison →</button>
      </div>
    </div>
  )
}

/* ── Étape 2 Livraison ── */
function StepLivraison({ nom, setNom, telephone, setTelephone, adresse, setAdresse, goBack, goNext }) {
  const [errors, setErrors] = useState({})
  const [focus, setFocus] = useState(null)

  const validate = () => {
    const e = {}
    if (!nom.trim()) e.nom = 'Champ requis'
    if (!telephone.trim()) e.telephone = 'Champ requis'
    if (!adresse.trim()) e.adresse = 'Champ requis'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const inputStyle = (key) => ({
    width:'100%', padding:'12px 15px',
    border:`1.5px solid ${errors[key] ? '#dc2626' : focus === key ? '#111' : '#e0ddd9'}`,
    borderRadius:8, fontFamily:'Barlow', fontSize:14, color:'#111',
    background:'white', outline:'none', boxSizing:'border-box', transition:'border-color .2s', display:'block',
  })

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:'Barlow Condensed', fontWeight:800, fontSize:22, textTransform:'uppercase', letterSpacing:'.05em', color:'#111', margin:'0 0 3px' }}>Adresse de livraison</h2>
        <p style={{ fontFamily:'Barlow', fontSize:13, color:'#aaa', margin:0 }}>Vos informations resteront confidentielles.</p>
      </div>

      <div style={{ display:'grid', gap:14, gridTemplateColumns:'1fr 1fr' }} className="form-grid">
        <div style={{ gridColumn:'1 / -1' }}>
          <label style={{ display:'block', fontFamily:'Barlow', fontSize:10, fontWeight:700, color: errors.nom ? '#dc2626' : '#888', letterSpacing:'.18em', textTransform:'uppercase', marginBottom:6 }}>Nom complet *</label>
          <input type="text" value={nom} placeholder="Ahmed Benali" onChange={e => { setNom(e.target.value); setErrors(p => ({...p, nom:''})) }}
            style={inputStyle('nom')} onFocus={() => setFocus('nom')} onBlur={() => setFocus(null)}/>
          {errors.nom && <p style={{ fontFamily:'Barlow', fontSize:11, color:'#dc2626', marginTop:4 }}>⚠ {errors.nom}</p>}
        </div>

        <div>
          <label style={{ display:'block', fontFamily:'Barlow', fontSize:10, fontWeight:700, color: errors.telephone ? '#dc2626' : '#888', letterSpacing:'.18em', textTransform:'uppercase', marginBottom:6 }}>Téléphone *</label>
          <input type="tel" value={telephone} placeholder="+212 6XX XXX XXX" onChange={e => { setTelephone(e.target.value); setErrors(p => ({...p, telephone:''})) }}
            style={inputStyle('telephone')} onFocus={() => setFocus('telephone')} onBlur={() => setFocus(null)}/>
          {errors.telephone && <p style={{ fontFamily:'Barlow', fontSize:11, color:'#dc2626', marginTop:4 }}>⚠ {errors.telephone}</p>}
        </div>

        <div>
          <label style={{ display:'block', fontFamily:'Barlow', fontSize:10, fontWeight:700, color:'#888', letterSpacing:'.18em', textTransform:'uppercase', marginBottom:6 }}>Ville</label>
          <input type="text" placeholder="Casablanca, Rabat…"
            style={{ ...inputStyle('ville'), border:`1.5px solid ${focus === 'ville' ? '#111' : '#e0ddd9'}` }}
            onFocus={() => setFocus('ville')} onBlur={() => setFocus(null)}/>
        </div>

        <div style={{ gridColumn:'1 / -1' }}>
          <label style={{ display:'block', fontFamily:'Barlow', fontSize:10, fontWeight:700, color: errors.adresse ? '#dc2626' : '#888', letterSpacing:'.18em', textTransform:'uppercase', marginBottom:6 }}>Adresse complète *</label>
          <textarea value={adresse} placeholder="N° rue, quartier, code postal…" rows={3}
            onChange={e => { setAdresse(e.target.value); setErrors(p => ({...p, adresse:''})) }}
            style={{ ...inputStyle('adresse'), resize:'vertical', lineHeight:1.6 }}
            onFocus={() => setFocus('adresse')} onBlur={() => setFocus(null)}/>
          {errors.adresse && <p style={{ fontFamily:'Barlow', fontSize:11, color:'#dc2626', marginTop:4 }}>⚠ {errors.adresse}</p>}
        </div>
      </div>

      <div style={{ marginTop:18, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'12px 14px', display:'flex', gap:10, alignItems:'center' }}>
        <svg width="18" height="18" fill="none" stroke="#16a34a" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        <p style={{ fontFamily:'Barlow', fontSize:13, fontWeight:700, color:'#15803d', margin:0 }}>Livraison offerte partout au Maroc · 24–48h ouvrés 🎁</p>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', marginTop:24, gap:10, flexWrap:'wrap' }}>
        <button onClick={goBack} className="btn btn-outline-dark btn-sm">← Panier</button>
        <button onClick={() => { if (validate()) goNext() }} className="btn btn-dark">Paiement →</button>
      </div>
    </div>
  )
}

/* ── Étape 3 Paiement ── */
const METHODS = [
  { id:'cod',        label:'Cash à la livraison', description:'Payez en espèces à la réception', logo:<CashLogo h={30}/>, color:'#16a34a', badge:'Le plus populaire' },
  { id:'wave',       label:'Wave Sénégal',         description:'QR Code — instantané',            logo:<WaveLogo h={26}/>, color:'#1BA5E0', badge:'Instantané' },
  { id:'visa',       label:'Visa',                 description:'Virement IBAN — CIH Bank',        logo:<VisaLogo h={26}/>, color:'#1A1F71' },
  { id:'mastercard', label:'Mastercard',            description:'Virement IBAN — CIH Bank',        logo:<MastercardLogo h={26}/>, color:'#EB001B' },
]

function StepPaiement({ nom, telephone, adresse, total, paiement, setPaiement, goBack, onConfirm, loading }) {
  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:'Barlow Condensed', fontWeight:800, fontSize:22, textTransform:'uppercase', letterSpacing:'.05em', color:'#111', margin:'0 0 3px' }}>Mode de paiement</h2>
        <p style={{ fontFamily:'Barlow', fontSize:13, color:'#aaa', margin:0 }}>Choisissez comment vous souhaitez régler.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:24 }} className="pay-methods-grid">
        {METHODS.map(m => {
          const active = paiement === m.id
          return (
            <button key={m.id} onClick={() => setPaiement(m.id)}
              style={{
                display:'flex', alignItems:'center', gap:10, padding:'12px 14px',
                border: active ? `2px solid ${m.color}` : '1.5px solid #e0ddd9',
                borderRadius:10, background: active ? `${m.color}08` : 'white',
                cursor:'pointer', textAlign:'left', transition:'all .18s',
                position:'relative',
              }}>
              <div style={{ width:17, height:17, borderRadius:'50%', border: active ? `5px solid ${m.color}` : '2px solid #d0cdc8', background:'white', flexShrink:0 }}/>
              <div style={{ flexShrink:0 }}>{m.logo}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontFamily:'Barlow', fontWeight:700, fontSize:13, color: active ? m.color : '#111', margin:0 }}>{m.label}</p>
                <p style={{ fontFamily:'Barlow', fontSize:10, color:'#aaa', margin:'2px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.description}</p>
              </div>
              {m.badge && <span style={{ position:'absolute', top:-8, right:8, background:m.color, color:'white', fontFamily:'Barlow', fontSize:8, fontWeight:800, letterSpacing:'.08em', textTransform:'uppercase', padding:'2px 7px', borderRadius:20 }}>{m.badge}</span>}
            </button>
          )
        })}
      </div>

      {/* Instructions contextuelles */}
      {paiement === 'cod' && (
        <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:10, padding:'14px 18px', marginBottom:22 }}>
          <p style={{ fontFamily:'Barlow Condensed', fontWeight:800, fontSize:15, color:'#15803d', textTransform:'uppercase', letterSpacing:'.04em', margin:'0 0 10px' }}>Comment ça fonctionne</p>
          {[['1','Confirmez votre commande maintenant'],['2','Nous préparons et expédions sous 24h'],['3','À la livraison, payez en espèces'],['4','Inspectez le colis avant de payer']].map(([n,t]) => (
            <div key={n} style={{ display:'flex', gap:8, marginBottom:7, alignItems:'flex-start' }}>
              <span style={{ width:18, height:18, borderRadius:'50%', background:'#16a34a', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Barlow', fontSize:10, fontWeight:800, flexShrink:0 }}>{n}</span>
              <span style={{ fontFamily:'Barlow', fontSize:13, color:'#333', lineHeight:1.5 }}>{t}</span>
            </div>
          ))}
        </div>
      )}

      {(paiement === 'visa' || paiement === 'mastercard') && (
        <div style={{ background:'#eef0fb', border:'1px solid #a5b4fc', borderRadius:10, padding:'14px 18px', marginBottom:22 }}>
          <p style={{ fontFamily:'Barlow Condensed', fontWeight:800, fontSize:15, color:'#1A1F71', textTransform:'uppercase', letterSpacing:'.04em', margin:'0 0 10px' }}>Virement bancaire · CIH Bank</p>
          {[['1','Confirmez la commande ci-dessous'],["2","L'IBAN apparaîtra après confirmation"],['3','Effectuez le virement depuis votre banque'],['4','Commande expédiée après réception']].map(([n,t]) => (
            <div key={n} style={{ display:'flex', gap:8, marginBottom:7, alignItems:'flex-start' }}>
              <span style={{ width:18, height:18, borderRadius:'50%', background:'#1A1F71', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Barlow', fontSize:10, fontWeight:800, flexShrink:0 }}>{n}</span>
              <span style={{ fontFamily:'Barlow', fontSize:13, color:'#333', lineHeight:1.5 }}>{t}</span>
            </div>
          ))}
        </div>
      )}

      {/* Résumé client */}
      <div style={{ background:'#fafaf8', border:'1px solid #e8e5e0', borderRadius:10, padding:'13px 16px', marginBottom:22 }}>
        <p style={{ fontFamily:'Barlow', fontSize:9, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:'#bbb', margin:'0 0 10px' }}>Livraison à</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[['Nom',nom],['Téléphone',telephone]].map(([l,v]) => (
            <div key={l}>
              <p style={{ fontFamily:'Barlow', fontSize:9, color:'#bbb', letterSpacing:'.14em', textTransform:'uppercase', margin:'0 0 2px' }}>{l}</p>
              <p style={{ fontFamily:'Barlow', fontWeight:600, fontSize:13, color:'#111', margin:0 }}>{v}</p>
            </div>
          ))}
          <div style={{ gridColumn:'1 / -1' }}>
            <p style={{ fontFamily:'Barlow', fontSize:9, color:'#bbb', letterSpacing:'.14em', textTransform:'uppercase', margin:'0 0 2px' }}>Adresse</p>
            <p style={{ fontFamily:'Barlow', fontWeight:600, fontSize:13, color:'#111', margin:0 }}>{adresse}</p>
          </div>
        </div>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
        <button onClick={goBack} className="btn btn-outline-dark btn-sm">← Livraison</button>
        <button onClick={onConfirm} disabled={loading}
          style={{ background: loading ? '#aaa' : '#111', color:'white', border:'none', padding:'14px 28px', fontFamily:'Barlow', fontSize:11, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', cursor: loading ? 'not-allowed' : 'pointer', borderRadius:0, display:'flex', alignItems:'center', gap:8, transition:'background .2s' }}
          onMouseOver={e => !loading && (e.currentTarget.style.background='#333')}
          onMouseOut={e => !loading && (e.currentTarget.style.background='#111')}>
          {loading ? '⏳ Traitement…' : '🔒 Confirmer la commande'}
        </button>
      </div>
    </div>
  )
}

/* ── Étape 4 Confirmations ── */
function ConfirmationCOD({ commande, total }) {
  return (
    <div style={{ textAlign:'center', padding:'20px 0 40px' }}>
      <div style={{ width:76, height:76, borderRadius:'50%', background:'linear-gradient(135deg,#22c55e,#16a34a)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 22px', boxShadow:'0 10px 28px rgba(22,163,74,.22)', animation:'popIn .5s cubic-bezier(.22,1,.36,1)' }}>
        <svg width="32" height="32" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2 style={{ fontFamily:'Barlow Condensed', fontWeight:900, fontSize:34, textTransform:'uppercase', letterSpacing:'.04em', color:'#111', margin:'0 0 8px' }}>Merci pour votre commande !</h2>
      <p style={{ fontFamily:'Barlow', fontSize:13, color:'#888', lineHeight:1.8, marginBottom:28, maxWidth:440, margin:'0 auto 28px' }}>
        Commande <strong style={{ color:'#111' }}>#{commande.id?.slice(-6).toUpperCase() || 'WYL001'}</strong> enregistrée. Vous serez contacté pour confirmer la livraison.
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2, maxWidth:520, margin:'0 auto 32px' }} className="steps-confirm-grid">
        {[{ icon:'📦', title:'Préparation', desc:'Colis préparé\nsous 24h' },{ icon:'🚚', title:'Expédition', desc:'Livraison\n24h–48h' },{ icon:'💵', title:'Paiement', desc:'Cash à\nla réception' }].map(s => (
          <div key={s.title} style={{ padding:'18px 10px', background:'#fafaf8', border:'1px solid #e8e5e0', textAlign:'center' }}>
            <div style={{ fontSize:26, marginBottom:8 }}>{s.icon}</div>
            <p style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:12, textTransform:'uppercase', letterSpacing:'.06em', color:'#111', margin:'0 0 4px' }}>{s.title}</p>
            <p style={{ fontFamily:'Barlow', fontSize:11, color:'#aaa', margin:0, whiteSpace:'pre-line', lineHeight:1.5 }}>{s.desc}</p>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
        <Link to="/catalogue" className="btn btn-dark" style={{ textDecoration:'none' }}>Continuer mes achats</Link>
        <Link to="/" className="btn btn-outline-dark" style={{ textDecoration:'none' }}>Accueil</Link>
      </div>
    </div>
  )
}

function ConfirmationWave({ commande, total }) {
  const [paid, setPaid] = useState(false)
  return (
    <div>
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <div style={{ width:66, height:66, borderRadius:'50%', background:'#1BA5E0', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', animation:'popIn .5s cubic-bezier(.22,1,.36,1)' }}>
          <WaveLogo h={30}/>
        </div>
        <h2 style={{ fontFamily:'Barlow Condensed', fontWeight:900, fontSize:28, textTransform:'uppercase', letterSpacing:'.04em', color:'#111', margin:'0 0 6px' }}>Finalisez votre paiement Wave</h2>
        <p style={{ fontFamily:'Barlow', fontSize:13, color:'#888', margin:0 }}>Commande #{commande.id?.slice(-6).toUpperCase() || 'WYL001'} · En attente</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, maxWidth:680, margin:'0 auto' }} className="wave-confirm-grid">
        <div style={{ background:'#e8f6fd', border:'2px solid #1BA5E0', borderRadius:14, padding:20, textAlign:'center' }}>
          <p style={{ fontFamily:'Barlow', fontSize:10, fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', color:'#1BA5E0', marginBottom:14 }}>Scannez avec Wave</p>
          <div style={{ background:'white', borderRadius:10, padding:8, display:'inline-block', boxShadow:'0 4px 16px rgba(27,165,224,.12)', border:'3px solid #1BA5E0', marginBottom:12 }}>
            <img src={waveQR} alt="QR Code Wave" loading="lazy" style={{ width:140, height:140, objectFit:'cover', borderRadius:6, display:'block' }}/>
          </div>
          <div style={{ background:'white', borderRadius:8, padding:'9px 14px', border:'1px solid #bae6fd' }}>
            <p style={{ fontFamily:'Barlow', fontSize:9, color:'#aaa', letterSpacing:'.12em', textTransform:'uppercase', margin:'0 0 2px' }}>Montant exact</p>
            <p style={{ fontFamily:'Barlow Condensed', fontWeight:900, fontSize:26, color:'#1BA5E0', margin:0 }}>{total} <span style={{ fontSize:13 }}>MAD</span></p>
          </div>
        </div>
        <div>
          {[['Ouvrez',"l'app Wave Sénégal"],['Scannez','le QR Code avec la caméra'],['Entrez',`le montant exact : ${total} MAD`],['Validez','et gardez la capture']].map(([b,r],i) => (
            <div key={b} style={{ display:'flex', gap:10, marginBottom:12 }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:'#f0f9ff', border:'1.5px solid #7dd3fc', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontFamily:'Barlow', fontSize:11, fontWeight:800, color:'#1BA5E0' }}>{i+1}</span>
              </div>
              <div style={{ paddingTop:4 }}>
                <span style={{ fontFamily:'Barlow', fontWeight:700, fontSize:13, color:'#111' }}>{b} </span>
                <span style={{ fontFamily:'Barlow', fontSize:13, color:'#666' }}>{r}</span>
              </div>
            </div>
          ))}
          {!paid ? (
            <button onClick={() => setPaid(true)}
              style={{ width:'100%', background:'#1BA5E0', color:'white', border:'none', padding:'12px 18px', fontFamily:'Barlow', fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer', borderRadius:8, marginTop:8 }}>
              ✓ J'ai effectué le paiement
            </button>
          ) : (
            <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:8, padding:'12px 14px', marginTop:8 }}>
              <p style={{ fontFamily:'Barlow', fontWeight:700, fontSize:13, color:'#15803d', margin:0 }}>✓ Paiement enregistré !</p>
              <p style={{ fontFamily:'Barlow', fontSize:11, color:'#4ade80', margin:'2px 0 0' }}>Commande préparée sous 24h.</p>
            </div>
          )}
        </div>
      </div>
      <div style={{ textAlign:'center', marginTop:24 }}>
        <Link to="/catalogue" className="btn btn-dark" style={{ textDecoration:'none' }}>Retour à la boutique</Link>
      </div>
    </div>
  )
}

function ConfirmationVirement({ commande, total, method }) {
  const [copied, setCopied] = useState(null)
  const color = method === 'visa' ? '#1A1F71' : '#EB001B'
  const ref = `WYL-${commande.id?.slice(-6).toUpperCase() || 'WYL001'}`
  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2200)
  }
  const CopyBtn = ({ text, k }) => (
    <button onClick={() => copy(text, k)}
      style={{ display:'flex', alignItems:'center', gap:5, background: copied === k ? '#16a34a' : color, color:'white', border:'none', borderRadius:6, padding:'6px 11px', fontFamily:'Barlow', fontSize:10, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', cursor:'pointer', flexShrink:0 }}>
      {copied === k ? '✓ Copié' : 'Copier'}
    </button>
  )
  return (
    <div>
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <h2 style={{ fontFamily:'Barlow Condensed', fontWeight:900, fontSize:28, textTransform:'uppercase', letterSpacing:'.04em', color:'#111', margin:'0 0 6px' }}>Effectuez votre virement</h2>
        <p style={{ fontFamily:'Barlow', fontSize:13, color:'#888', margin:0 }}>Commande #{ref} · En attente</p>
      </div>
      <div style={{ background:'#eef0fb', border:`1.5px solid ${color}25`, borderRadius:14, padding:22, maxWidth:560, margin:'0 auto 18px' }}>
        <div style={{ background:'white', borderRadius:10, overflow:'hidden', border:`1px solid ${color}15` }}>
          {[['IBAN du bénéficiaire', <code style={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color:'#111', letterSpacing:'.04em' }}>{IBAN}</code>, IBAN_CLEAN, 'iban'],
            ['Montant exact', <span style={{ fontFamily:'Barlow Condensed', fontWeight:900, fontSize:26, color }}>{total} <span style={{ fontSize:14 }}>MAD</span></span>, `${total}`, 'montant'],
            ['Référence obligatoire', <code style={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color:'#111' }}>{ref}</code>, ref, 'ref']
          ].map(([label, display, copyText, key]) => (
            <div key={key} style={{ padding:'13px 16px', borderBottom: key !== 'ref' ? `1px solid ${color}10` : 'none' }}>
              <p style={{ fontFamily:'Barlow', fontSize:9, color:'#bbb', letterSpacing:'.2em', textTransform:'uppercase', margin:'0 0 5px' }}>{label}</p>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, flexWrap:'wrap' }}>
                {display}
                <CopyBtn text={copyText} k={key}/>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ maxWidth:560, margin:'0 auto 22px', background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:10, padding:'12px 14px', display:'flex', gap:10 }}>
        <svg width="17" height="17" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink:0, marginTop:1 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <p style={{ fontFamily:'Barlow', fontSize:12, color:'#92400e', lineHeight:1.7, margin:0 }}>
          Mentionnez <strong>impérativement</strong> la référence <strong>{ref}</strong> dans votre virement.
        </p>
      </div>
      <div style={{ textAlign:'center' }}>
        <Link to="/catalogue" className="btn btn-dark" style={{ textDecoration:'none' }}>Retour à la boutique</Link>
      </div>
    </div>
  )
}

/* ══ COMPOSANT PRINCIPAL ══ */
export default function Panier() {
  const { panier, retirerDuPanier, modifierQuantite, viderPanier, total } = usePanier()
  const [step, setStep]           = useState(1)
  const [nom, setNom]             = useState('')
  const [telephone, setTelephone] = useState('')
  const [adresse, setAdresse]     = useState('')
  const [paiement, setPaiement]   = useState('cod')
  const [loading, setLoading]           = useState(false)
  const [commande, setCommande]         = useState(null)
  const [totalConfirme, setTotalConfirme] = useState(0)  // sauvegardé avant viderPanier()

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [step])

  const confirmerCommande = async () => {
    setLoading(true)
    const totalSnapshot = total
    const articlesJson = JSON.parse(JSON.stringify(panier))
    const payload = {
      client_nom: nom,
      client_telephone: telephone,
      client_adresse: adresse,
      articles: articlesJson,
      total: Number(totalSnapshot),
      statut: 'en_attente',
      mode_paiement: paiement,
    }
    const { data, error } = await supabase
      .from('commandes')
      .insert(payload)
      .select()
      .single()
    if (error) {
      console.error('Supabase INSERT error:', JSON.stringify(error, null, 2))
      alert(`Erreur (${error.code}): ${error.message}${error.details ? '\nDetails: ' + error.details : ''}${error.hint ? '\nAide: ' + error.hint : ''}`)
      setLoading(false)
      return
    }
    setTotalConfirme(totalSnapshot)
    viderPanier()
    setCommande(data || { id: 'WYL' + Date.now() })
    setLoading(false)
    setStep(4)
  }

  const TITLES = { 1:'Mon panier', 2:'Livraison', 3:'Paiement', 4:'Confirmation' }

  return (
    <div style={{ minHeight:'100vh', background:'#fff' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'44px 20px 100px' }}>
        <div style={{ marginBottom: step < 4 ? 32 : 0 }}>
          <div style={{ width:36, height:3, background:'#b76448', marginBottom:12 }}/>
          <h1 style={{ fontFamily:'Barlow Condensed', fontWeight:900, fontSize:'clamp(26px,5vw,44px)', textTransform:'uppercase', letterSpacing:'.04em', color:'#111', margin:0 }}>
            {TITLES[step]}
          </h1>
          {step === 1 && panier.length > 0 && (
            <p style={{ fontFamily:'Barlow', fontSize:13, color:'#bbb', marginTop:5 }}>
              {panier.reduce((a,p) => a + p.quantite, 0)} article(s) · Livraison offerte
            </p>
          )}
        </div>

        {step < 4 && <Stepper step={step}/>}

        {step < 4 && panier.length > 0 ? (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:44, alignItems:'start' }} className="checkout-main-grid">
            <div>
              {step === 1 && <StepPanier panier={panier} retirerDuPanier={retirerDuPanier} modifierQuantite={modifierQuantite} total={total} goNext={() => setStep(2)}/>}
              {step === 2 && <StepLivraison nom={nom} setNom={setNom} telephone={telephone} setTelephone={setTelephone} adresse={adresse} setAdresse={setAdresse} goBack={() => setStep(1)} goNext={() => setStep(3)}/>}
              {step === 3 && <StepPaiement nom={nom} telephone={telephone} adresse={adresse} total={total} paiement={paiement} setPaiement={setPaiement} goBack={() => setStep(2)} onConfirm={confirmerCommande} loading={loading}/>}
            </div>
            <OrderSummary panier={panier} total={total} paiement={step === 3 ? paiement : null}/>
          </div>
        ) : step === 1 && panier.length === 0 ? (
          <StepPanier panier={panier} retirerDuPanier={retirerDuPanier} modifierQuantite={modifierQuantite} total={total} goNext={() => setStep(2)}/>
        ) : step === 4 ? (
          <div style={{ maxWidth:720, margin:'0 auto' }}>
            {paiement === 'cod' && <ConfirmationCOD commande={commande} total={totalConfirme}/>}
            {paiement === 'wave' && <ConfirmationWave commande={commande} total={totalConfirme}/>}
            {(paiement === 'visa' || paiement === 'mastercard') && <ConfirmationVirement commande={commande} total={totalConfirme} method={paiement}/>}
          </div>
        ) : null}
      </div>

      <style>{`
        @keyframes popIn { from { transform:scale(.4);opacity:0 } to { transform:scale(1);opacity:1 } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.4 } }

        /* Panier table */
        .panier-table-header { display:grid; grid-template-columns:1fr 90px 96px 80px; gap:10px; padding:'0 0 10px'; border-bottom:2px solid #111; margin-bottom:2px; }
        .panier-row { display:grid; grid-template-columns:1fr 90px 96px 80px; gap:10px; align-items:center; padding:16px 0; border-bottom:1px solid #f0eeec; }
        .panier-mobile-price { display:none; }
        .panier-mobile-total { display:none; }
        .panier-desktop-cell { display:block; }

        @media(max-width:860px) {
          .checkout-main-grid { grid-template-columns:1fr !important; }
        }
        @media(max-width:600px) {
          .pay-methods-grid { grid-template-columns:1fr !important; }
          .wave-confirm-grid { grid-template-columns:1fr !important; }
          .steps-confirm-grid { grid-template-columns:1fr !important; }
          .form-grid { grid-template-columns:1fr !important; }
          /* Panier mobile — masquer header, reformatter rows */
          .panier-table-header { display:none; }
          .panier-row { grid-template-columns:1fr auto; grid-template-rows:auto auto; gap:6px; padding:14px 0; }
          .panier-row > div:nth-child(1) { grid-column:1; grid-row:1; }
          .panier-row > div:nth-child(2) { display:none; }
          .panier-row > div:nth-child(3) { grid-column:2; grid-row:1; align-self:center; }
          .panier-row > div:nth-child(4) { grid-column:1 / -1; grid-row:2; text-align:left !important; }
          .panier-mobile-price { display:block !important; fontFamily:Barlow Condensed; fontWeight:700; fontSize:13px; color:#111; margin:4px 0; }
          .panier-desktop-cell { display:none !important; }
          .panier-mobile-total { display:block !important; padding:12px 0 4px; }
        }
      `}</style>
    </div>
  )
}
