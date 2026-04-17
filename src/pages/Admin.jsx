import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

/* ─── Constantes ─── */
const STATUTS = ['en_attente','confirme','expedie','livre','annule']
const STATUT_COLOR = { en_attente:'#f59e0b', confirme:'#3b82f6', expedie:'#8b5cf6', livre:'#16a34a', annule:'#dc2626' }
const STATUT_BG    = { en_attente:'#fef3c7', confirme:'#dbeafe', expedie:'#ede9fe', livre:'#dcfce7', annule:'#fee2e2' }
const FORM_VIDE = { nom:'', description:'', prix:'', categorie:'', stock:'', disponible:true, vedette:false }

/* ─── Upload helper ─── */
// Le bucket "images" est déjà créé dans Supabase Storage (Public).
// On n'utilise plus listBuckets() qui nécessite des droits admin non disponibles via clé anon.
async function uploadImage(file) {
  const ext  = file.name.split('.').pop().toLowerCase()
  const path = `produits/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('images').upload(path, file, {
    upsert: true,
    contentType: file.type || 'image/jpeg',
  })
  if (error) throw new Error('Upload échoué : ' + error.message)
  const { data } = supabase.storage.from('images').getPublicUrl(path)
  return data.publicUrl
}

/* ─── Composant Toggle ─── */
function Toggle({ on, onChange, label }) {
  return (
    <div className="toggle-wrap" onClick={() => onChange(!on)}>
      <div className={`toggle-track ${on ? 'on' : ''}`}>
        <div className="toggle-thumb" />
      </div>
      {label && <span style={{ fontFamily:'Space Grotesk', fontSize:13, color:'var(--text-heading)', userSelect:'none' }}>{label}</span>}
    </div>
  )
}

/* ─── Zone upload image ─── */
function UploadZone({ onFiles }) {
  const ref = useRef()
  const [drag, setDrag] = useState(false)

  const handle = (files) => {
    const valids = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (valids.length) onFiles(valids)
  }

  return (
    <div
      className={`upload-zone ${drag ? 'drag' : ''}`}
      onClick={() => ref.current.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files) }}
    >
      <input ref={ref} type="file" accept="image/*" multiple onChange={e => handle(e.target.files)} />
      <div style={{ fontSize: 28, marginBottom: 10 }}>🖼️</div>
      <p style={{ fontFamily:'Space Grotesk', fontWeight:600, fontSize:13, color:'var(--text-heading)', marginBottom:4 }}>
        Glisser des images ici
      </p>
      <p style={{ fontSize:12, color:'var(--text-muted)' }}>ou cliquer pour choisir · JPG, PNG, WEBP · Plusieurs images possibles</p>
    </div>
  )
}

export default function Admin() {
  /* Auth */
  const [session, setSession]   = useState(null)
  const [email, setEmail]       = useState('')
  const [mdp, setMdp]           = useState('')
  /* Navigation */
  const [onglet, setOnglet]     = useState('dashboard')
  /* Données */
  const [commandes, setCommandes] = useState([])
  const [produits, setProduits]   = useState([])
  /* UI état */
  const [loadingCmd, setLoadingCmd]   = useState(true)
  const [loadingProd, setLoadingProd] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState('tous')
  const [searchProd, setSearchProd]   = useState('')
  const [showForm, setShowForm]       = useState(false)
  const [editingId, setEditingId]     = useState(null)
  const [saving, setSaving]           = useState(false)
  const [confirmDel, setConfirmDel]   = useState(null)
  /* Formulaire produit */
  const [form, setForm]         = useState(FORM_VIDE)
  const [images, setImages]     = useState([])   // [{ url, file?, uploading? }]
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState(null)

  /* ── Auth ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    supabase.auth.onAuthStateChange((_e, s) => setSession(s))
  }, [])

  useEffect(() => {
    if (!session) return
    chargerCommandes()
    chargerProduits()
  }, [session])

  const chargerCommandes = async () => {
    setLoadingCmd(true)
    const { data } = await supabase.from('commandes').select('*').order('created_at', { ascending: false })
    if (data) setCommandes(data)
    setLoadingCmd(false)
  }

  const chargerProduits = async () => {
    setLoadingProd(true)
    const { data } = await supabase.from('produits').select('*').order('created_at', { ascending: false })
    if (data) setProduits(data)
    setLoadingProd(false)
  }

  /* ── Commandes ── */
  const changerStatut = async (id, statut) => {
    await supabase.from('commandes').update({ statut }).eq('id', id)
    chargerCommandes()
  }

  /* ── Produits : ouvrir formulaire ── */
  const ouvrirAjout = () => {
    setForm(FORM_VIDE)
    setImages([])
    setEditingId(null)
    setUploadError(null)
    setShowForm(true)
  }

  const ouvrirEdit = (p) => {
    setForm({
      nom: p.nom, description: p.description || '',
      prix: String(p.prix), categorie: p.categorie || '',
      stock: String(p.stock || 0),
      disponible: p.stock > 0,
      vedette: p.vedette === true,
    })
    /* Récupérer les images (images_url = tableau JSON stocké, ou image_url seule) */
    let imgs = []
    if (p.images_url) {
      try {
        const parsed = JSON.parse(p.images_url)
        imgs = Array.isArray(parsed) ? parsed.filter(u => u && u.startsWith('http')) : []
      } catch { imgs = [] }
    }
    if (imgs.length === 0 && p.image_url) imgs = [p.image_url]
    setImages(imgs.map(url => ({ url })))
    setEditingId(p.id)
    setUploadError(null)
    setShowForm(true)
  }

  /* ── Upload images ── */
  const ajouterFichiers = async (files) => {
    const nouvelles = files.map(f => ({ url: URL.createObjectURL(f), file: f, uploading: true }))
    setImages(prev => [...prev, ...nouvelles])
    let done = 0
    let erreurs = []
    for (const nv of nouvelles) {
      try {
        const url = await uploadImage(nv.file)
        setImages(prev => prev.map(im => im.url === nv.url ? { url } : im))
      } catch (err) {
        const msg = err?.message || String(err)
        console.error('Erreur upload image :', msg)
        erreurs.push(msg)
        setImages(prev => prev.map(im => im.url === nv.url ? { ...im, uploading: false, local: true, erreur: msg } : im))
      }
      done++
      setUploadProgress(Math.round((done / nouvelles.length) * 100))
    }
    setUploadProgress(0)
    if (erreurs.length > 0) {
      setUploadError(erreurs[0])
    }
  }

  const supprimerImage = (idx) => setImages(prev => prev.filter((_,i) => i !== idx))
  const setPrimaire    = (idx) => setImages(prev => [prev[idx], ...prev.filter((_,i) => i !== idx)])

  /* ── Sauvegarder produit ── */
  const sauvegarder = async () => {
    if (!form.nom || !form.prix) { alert('Nom et prix obligatoires'); return }
    setSaving(true)

    // Filtrer les URLs blob:// (images locales non uploadées) — ne jamais sauvegarder une blob URL
    const urls = images.map(im => im.url).filter(u => u && u.startsWith('http'))
    const hasLocalImages = images.some(im => im.url && im.url.startsWith('blob:'))
    if (hasLocalImages) {
      const proceed = window.confirm("Certaines images n'ont pas pu être uploadées (bucket Supabase manquant ?). Continuer sans ces images ?")
      if (!proceed) { setSaving(false); return }
    }
    const stock  = form.disponible ? (Number(form.stock) || 10) : 0

    const payload = {
      nom: form.nom, description: form.description,
      prix: Number(form.prix), categorie: form.categorie,
      stock,
      vedette: form.vedette,
      image_url:   urls[0] || null,
      images_url:  JSON.stringify(urls),
    }

    if (editingId) {
      await supabase.from('produits').update(payload).eq('id', editingId)
    } else {
      await supabase.from('produits').insert(payload)
    }
    setSaving(false)
    setShowForm(false)
    chargerProduits()
  }

  /* ── Supprimer produit ── */
  const supprimerProduit = async (id) => {
    await supabase.from('produits').delete().eq('id', id)
    setConfirmDel(null)
    chargerProduits()
  }

  /* ── Toggle vedette / disponibilité rapide ── */
  const toggleVedette = async (p) => {
    await supabase.from('produits').update({ vedette: !p.vedette }).eq('id', p.id)
    chargerProduits()
  }
  const toggleDispo = async (p) => {
    const newStock = p.stock > 0 ? 0 : 10
    await supabase.from('produits').update({ stock: newStock }).eq('id', p.id)
    chargerProduits()
  }

  /* ── Statistiques ── */
  const totalRevenu  = commandes.filter(c => c.statut === 'livre').reduce((a,c) => a + c.total, 0)
  const nbEnAttente  = commandes.filter(c => c.statut === 'en_attente').length
  const cmdFiltrées  = filtreStatut === 'tous' ? commandes : commandes.filter(c => c.statut === filtreStatut)
  const prodFiltres  = searchProd
    ? produits.filter(p => p.nom.toLowerCase().includes(searchProd.toLowerCase()) || (p.categorie||'').toLowerCase().includes(searchProd.toLowerCase()))
    : produits

  /* ══ LOGIN ══ */
  if (!session) return (
    <div style={{ minHeight:'100vh', background:'hsl(220,18%,10%)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:360, background:'white', borderRadius:16, padding:40 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <p className="font-display" style={{ fontSize:28, fontWeight:700, color:'var(--text-heading)', letterSpacing:'0.12em' }}>WYL</p>
          <p style={{ fontFamily:'Space Grotesk', fontSize:11, color:'var(--text-muted)', letterSpacing:'0.2em', marginTop:4 }}>ESPACE ADMINISTRATEUR</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="admin-input" style={{ padding:'12px 14px', fontSize:14 }} />
          <input type="password" placeholder="Mot de passe" value={mdp} onChange={e=>setMdp(e.target.value)} className="admin-input" style={{ padding:'12px 14px', fontSize:14 }} onKeyDown={e=>e.key==='Enter'&&seConnecter()} />
          <button onClick={async()=>{ const {error}=await supabase.auth.signInWithPassword({email,password:mdp}); if(error)alert('Identifiants incorrects') }} className="btn-primary" style={{ padding:'14px', fontSize:13, marginTop:4 }}>
            Se connecter
          </button>
        </div>
      </div>
    </div>
  )

  const NAV = [
    { id:'dashboard',  icon:'📊', label:'Dashboard' },
    { id:'commandes',  icon:'📦', label:'Commandes', badge: nbEnAttente||null },
    { id:'produits',   icon:'👕', label:'Produits' },
    { id:'parametres', icon:'⚙️', label:'Paramètres' },
  ]

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--background)' }}>

      {/* ══ SIDEBAR ══ */}
      <aside style={{ width:230, background:'hsl(220,18%,13%)', display:'flex', flexDirection:'column', padding:'28px 14px', flexShrink:0, position:'sticky', top:0, height:'100vh', overflowY:'auto' }}>
        <div style={{ marginBottom:36, paddingLeft:8 }}>
          <p className="font-display" style={{ fontSize:22, fontWeight:700, color:'white', letterSpacing:'0.15em' }}>WYL</p>
          <p style={{ fontFamily:'Space Grotesk', fontSize:9, color:'rgba(255,255,255,0.28)', letterSpacing:'0.25em', marginTop:2 }}>ADMIN PANEL</p>
        </div>
        <nav style={{ display:'flex', flexDirection:'column', gap:3, flex:1 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={()=>setOnglet(n.id)} className={`admin-nav-item ${onglet===n.id?'active':''}`}>
              <span style={{ fontSize:15 }}>{n.icon}</span>
              <span style={{ flex:1 }}>{n.label}</span>
              {n.badge && <span style={{ background:'var(--accent)', color:'white', borderRadius:999, fontSize:10, fontWeight:700, padding:'2px 7px' }}>{n.badge}</span>}
            </button>
          ))}
        </nav>
        <a href="/" target="_blank" style={{ display:'block', color:'rgba(255,255,255,0.25)', fontFamily:'Space Grotesk', fontSize:11, textDecoration:'none', padding:'8px 16px', marginBottom:8, letterSpacing:'0.06em', transition:'color 0.2s' }}
          onMouseOver={e=>e.currentTarget.style.color='white'} onMouseOut={e=>e.currentTarget.style.color='rgba(255,255,255,0.25)'}>
          🔗 Voir la boutique
        </a>
        <button onClick={()=>supabase.auth.signOut()} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.28)', fontFamily:'Space Grotesk', fontSize:11, textAlign:'left', padding:'8px 16px', letterSpacing:'0.06em', transition:'color 0.2s' }}
          onMouseOver={e=>e.currentTarget.style.color='white'} onMouseOut={e=>e.currentTarget.style.color='rgba(255,255,255,0.28)'}>
          ← Déconnexion
        </button>
      </aside>

      {/* ══ MAIN ══ */}
      <main style={{ flex:1, padding:'36px 36px', overflowY:'auto', minWidth:0 }}>

        {/* ════════ DASHBOARD ════════ */}
        {onglet==='dashboard' && (
          <div>
            <div style={{ marginBottom:32 }}>
              <h1 className="font-display" style={{ fontSize:28, fontWeight:700, color:'var(--text-heading)' }}>Dashboard</h1>
              <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>{new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
            </div>
            {/* KPIs */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:14, marginBottom:36 }}>
              {[
                { label:'Revenus livrés',    value:`${totalRevenu.toLocaleString()} MAD`, icon:'💰', color:'#16a34a' },
                { label:'Commandes',         value:commandes.length, icon:'📦', color:'#3b82f6' },
                { label:'En attente',        value:nbEnAttente,      icon:'⏳', color:'#f59e0b' },
                { label:'Produits en vente', value:produits.filter(p=>p.stock>0).length, icon:'👕', color:'#8b5cf6' },
                { label:'Produits vedettes', value:produits.filter(p=>p.vedette).length, icon:'⭐', color:'var(--accent)' },
              ].map(k=>(
                <div key={k.label} className="admin-card" style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:42, height:42, borderRadius:10, background:k.color+'1a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{k.icon}</div>
                  <div>
                    <p className="font-display" style={{ fontSize:20, fontWeight:700, color:'var(--text-heading)' }}>{k.value}</p>
                    <p style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'Space Grotesk', marginTop:1 }}>{k.label}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Dernières commandes */}
            <div className="admin-card" style={{ marginBottom:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                <h2 className="font-display" style={{ fontSize:18, fontWeight:700, color:'var(--text-heading)' }}>Dernières commandes</h2>
                <button onClick={()=>setOnglet('commandes')} style={{ fontFamily:'Space Grotesk', fontSize:12, color:'var(--accent)', background:'none', border:'none', cursor:'pointer' }}>Voir tout →</button>
              </div>
              {commandes.slice(0,5).map(cmd=>(
                <div key={cmd.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontFamily:'Space Grotesk', fontWeight:600, fontSize:14, color:'var(--text-heading)' }}>{cmd.client_nom}</p>
                    <p style={{ fontSize:12, color:'var(--text-muted)' }}>{new Date(cmd.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span className="font-display" style={{ fontWeight:700, fontSize:14, color:'var(--text-heading)' }}>{cmd.total} MAD</span>
                    <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:600, fontFamily:'Space Grotesk', background:STATUT_BG[cmd.statut]||'#f3f4f6', color:STATUT_COLOR[cmd.statut]||'#666' }}>{cmd.statut.replace('_',' ')}</span>
                  </div>
                </div>
              ))}
              {commandes.length===0&&<p style={{ color:'var(--text-muted)', fontSize:13, textAlign:'center', padding:'20px 0' }}>Aucune commande.</p>}
            </div>
            {/* Ruptures */}
            {produits.filter(p=>p.stock===0).length>0&&(
              <div className="admin-card" style={{ borderLeft:'3px solid #f59e0b' }}>
                <h2 className="font-display" style={{ fontSize:15, fontWeight:700, color:'var(--text-heading)', marginBottom:10 }}>⚠ Ruptures de stock</h2>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {produits.filter(p=>p.stock===0).map(p=>(
                    <span key={p.id} style={{ padding:'4px 12px', borderRadius:999, background:'#fee2e2', color:'#dc2626', fontSize:12, fontFamily:'Space Grotesk', fontWeight:500 }}>{p.nom}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════ COMMANDES ════════ */}
        {onglet==='commandes' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
              <div>
                <h1 className="font-display" style={{ fontSize:28, fontWeight:700, color:'var(--text-heading)' }}>Commandes</h1>
                <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>{commandes.length} au total</p>
              </div>
              <button onClick={chargerCommandes} style={{ background:'none', border:'1.5px solid var(--border)', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontFamily:'Space Grotesk', fontSize:12, color:'var(--text-muted)' }}>↻ Actualiser</button>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:22 }}>
              {['tous','en_attente','confirme','expedie','livre','annule'].map(s=>(
                <button key={s} onClick={()=>setFiltreStatut(s)}
                  style={{ padding:'6px 14px', borderRadius:999, fontFamily:'Space Grotesk', fontSize:12, fontWeight:500, cursor:'pointer', border:'1.5px solid', transition:'all 0.18s',
                    background: filtreStatut===s ? (STATUT_COLOR[s]||'var(--primary)') : 'white',
                    color: filtreStatut===s ? 'white' : (STATUT_COLOR[s]||'var(--text-muted)'),
                    borderColor: filtreStatut===s ? (STATUT_COLOR[s]||'var(--primary)') : 'var(--border)',
                  }}>
                  {s==='tous'?'Toutes':s.replace('_',' ')}
                  {s!=='tous'&&<span style={{ opacity:0.7, marginLeft:4 }}>({commandes.filter(c=>c.statut===s).length})</span>}
                </button>
              ))}
            </div>
            {loadingCmd ? <p style={{ textAlign:'center', color:'var(--text-muted)', padding:'60px 0', fontFamily:'Space Grotesk', fontSize:13 }}>Chargement…</p> : (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {cmdFiltrées.map(cmd=>(
                  <div key={cmd.id} className="admin-card">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                      <div>
                        <p className="font-display" style={{ fontSize:17, fontWeight:700, color:'var(--text-heading)' }}>{cmd.client_nom}</p>
                        <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>📞 {cmd.client_telephone}</p>
                        {cmd.client_adresse&&<p style={{ fontSize:12, color:'var(--text-muted)' }}>📍 {cmd.client_adresse}</p>}
                        <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{new Date(cmd.created_at).toLocaleString('fr-FR')}</p>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <span style={{ padding:'4px 12px', borderRadius:999, fontSize:12, fontWeight:600, fontFamily:'Space Grotesk', background:STATUT_BG[cmd.statut]||'#f3f4f6', color:STATUT_COLOR[cmd.statut]||'#666' }}>{cmd.statut.replace('_',' ')}</span>
                        <p className="font-display" style={{ fontSize:18, fontWeight:700, color:'var(--text-heading)', marginTop:6 }}>{cmd.total} MAD</p>
                      </div>
                    </div>
                    <div style={{ background:'hsl(30,15%,97%)', borderRadius:8, padding:'10px 14px', marginBottom:12 }}>
                      {cmd.articles.map((a,i)=>(
                        <p key={i} style={{ fontSize:13, color:'var(--text-body)', fontFamily:'Space Grotesk', marginBottom:i<cmd.articles.length-1?3:0 }}>
                          • {a.nom}{a.taille?` (${a.taille}/${a.couleur})`:''} ×{a.quantite} — {a.prix*a.quantite} MAD
                        </p>
                      ))}
                    </div>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {STATUTS.map(s=>(
                        <button key={s} onClick={()=>changerStatut(cmd.id,s)}
                          style={{ padding:'5px 12px', borderRadius:999, fontSize:11, fontWeight:600, fontFamily:'Space Grotesk', cursor:'pointer', border:'1.5px solid', transition:'all 0.18s',
                            background: cmd.statut===s ? STATUT_COLOR[s] : 'white',
                            color: cmd.statut===s ? 'white' : STATUT_COLOR[s],
                            borderColor: STATUT_COLOR[s]||'var(--border)',
                          }}>
                          {s.replace('_',' ')}
                        </button>
                      ))}
                      <a href={`https://wa.me/${(cmd.client_telephone||'').replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                        style={{ padding:'5px 12px', borderRadius:999, fontSize:11, fontWeight:600, fontFamily:'Space Grotesk', cursor:'pointer', border:'1.5px solid #16a34a', color:'#16a34a', background:'white', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:4, transition:'all 0.18s' }}
                        onMouseOver={e=>{e.currentTarget.style.background='#16a34a';e.currentTarget.style.color='white'}}
                        onMouseOut={e=>{e.currentTarget.style.background='white';e.currentTarget.style.color='#16a34a'}}>
                        💬 WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
                {cmdFiltrées.length===0&&<div style={{ textAlign:'center', padding:'60px 0' }}><p style={{ color:'var(--text-muted)', fontFamily:'Space Grotesk' }}>Aucune commande.</p></div>}
              </div>
            )}
          </div>
        )}

        {/* ════════ PRODUITS ════════ */}
        {onglet==='produits' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
              <div>
                <h1 className="font-display" style={{ fontSize:28, fontWeight:700, color:'var(--text-heading)' }}>Produits</h1>
                <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>{produits.length} produit{produits.length>1?'s':''} · {produits.filter(p=>p.vedette).length} vedette{produits.filter(p=>p.vedette).length>1?'s':''}</p>
              </div>
              <button onClick={ouvrirAjout} className="btn-primary" style={{ padding:'10px 20px', fontSize:13, display:'flex', alignItems:'center', gap:8 }}>
                + Ajouter un produit
              </button>
            </div>

            {/* Légende */}
            <div style={{ display:'flex', gap:16, marginBottom:20, flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text-muted)', fontFamily:'Space Grotesk' }}>
                <span style={{ background:'#dcfce7', color:'#16a34a', padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:600 }}>EN VENTE</span> Stock &gt; 0
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text-muted)', fontFamily:'Space Grotesk' }}>
                <span style={{ background:'#fee2e2', color:'#dc2626', padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:600 }}>ÉPUISÉ</span> Stock = 0
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text-muted)', fontFamily:'Space Grotesk' }}>
                <span style={{ fontSize:14 }}>⭐</span> Produit vedette (affiché en priorité sur la page d'accueil)
              </div>
            </div>

            <div style={{ position:'relative', marginBottom:20 }}>
              <input type="text" placeholder="Rechercher…" value={searchProd} onChange={e=>setSearchProd(e.target.value)} className="admin-input" style={{ paddingLeft:36 }} />
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'var(--text-muted)' }}>🔍</span>
            </div>

            {loadingProd ? <p style={{ textAlign:'center', color:'var(--text-muted)', padding:'60px 0', fontFamily:'Space Grotesk', fontSize:13 }}>Chargement…</p> : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {prodFiltres.map(p => {
                  let imgs = []
                  if (p.images_url) { try { const pa = JSON.parse(p.images_url); imgs = Array.isArray(pa) ? pa.filter(u=>u&&u.startsWith('http')) : [] } catch {} }
                  if (imgs.length === 0 && p.image_url) imgs = [p.image_url]
                  return (
                    <div key={p.id} className="admin-card" style={{ display:'flex', gap:14, alignItems:'center' }}>
                      {/* Image principale + compteur */}
                      <div style={{ position:'relative', flexShrink:0 }}>
                        <img src={imgs[0]||'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&q=70'} alt={p.nom}
                          style={{ width:60, height:60, objectFit:'cover', borderRadius:8 }} />
                        {imgs.length>1&&<span style={{ position:'absolute', bottom:-4, right:-4, background:'var(--primary)', color:'white', fontSize:9, fontWeight:700, padding:'1px 5px', borderRadius:999, fontFamily:'Space Grotesk' }}>{imgs.length}</span>}
                      </div>
                      {/* Infos */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <p className="font-display" style={{ fontSize:14, fontWeight:700, color:'var(--text-heading)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.nom}</p>
                          {p.vedette&&<span style={{ fontSize:13 }}>⭐</span>}
                        </div>
                        <p style={{ fontSize:12, color:'var(--text-muted)', fontFamily:'Space Grotesk' }}>{p.categorie} · {p.prix} MAD</p>
                      </div>
                      {/* Toggles rapides */}
                      <div style={{ display:'flex', flexDirection:'column', gap:6, flexShrink:0 }}>
                        <div onClick={()=>toggleDispo(p)} style={{ cursor:'pointer' }}>
                          <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:600, fontFamily:'Space Grotesk', background:p.stock>0?'#dcfce7':'#fee2e2', color:p.stock>0?'#16a34a':'#dc2626', whiteSpace:'nowrap' }}>
                            {p.stock>0?`✓ ${p.stock} dispo`:'✕ Épuisé'}
                          </span>
                        </div>
                        <div onClick={()=>toggleVedette(p)} style={{ cursor:'pointer' }}>
                          <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:600, fontFamily:'Space Grotesk', background:p.vedette?'#fef3c7':'#f3f4f6', color:p.vedette?'#b45309':'#9ca3af', whiteSpace:'nowrap' }}>
                            {p.vedette?'⭐ Vedette':'☆ Standard'}
                          </span>
                        </div>
                      </div>
                      {/* Actions */}
                      <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                        <button onClick={()=>ouvrirEdit(p)} style={{ padding:'7px 13px', borderRadius:8, fontSize:12, fontFamily:'Space Grotesk', fontWeight:600, cursor:'pointer', border:'1.5px solid var(--border)', background:'white', color:'var(--text-heading)', transition:'all 0.18s' }}
                          onMouseOver={e=>e.currentTarget.style.borderColor='var(--primary)'}
                          onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}>
                          ✏️ Modifier
                        </button>
                        <button onClick={()=>setConfirmDel(p.id)} style={{ padding:'7px 10px', borderRadius:8, fontSize:12, cursor:'pointer', border:'1.5px solid #fee2e2', background:'#fee2e2', color:'#dc2626', transition:'all 0.18s' }}
                          onMouseOver={e=>e.currentTarget.style.background='#fecaca'}
                          onMouseOut={e=>e.currentTarget.style.background='#fee2e2'}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  )
                })}
                {prodFiltres.length===0&&<div style={{ textAlign:'center', padding:'60px 0' }}><p style={{ color:'var(--text-muted)', fontFamily:'Space Grotesk' }}>Aucun produit.</p></div>}
              </div>
            )}
          </div>
        )}

        {/* ════════ PARAMÈTRES ════════ */}
        {onglet==='parametres' && (
          <div>
            <h1 className="font-display" style={{ fontSize:28, fontWeight:700, color:'var(--text-heading)', marginBottom:32 }}>Paramètres</h1>
            <div style={{ display:'flex', flexDirection:'column', gap:16, maxWidth:540 }}>
              {/* Info bucket */}
              <div className="admin-card" style={{ borderLeft:'3px solid #3b82f6' }}>
                <h3 className="font-display" style={{ fontSize:16, fontWeight:700, color:'var(--text-heading)', marginBottom:8 }}>📸 Activer l'upload d'images</h3>
                <p style={{ fontSize:13, color:'var(--text-body)', lineHeight:1.7 }}>
                  Pour uploader des images depuis ton ordinateur, crée un <strong>Storage Bucket</strong> nommé <code style={{ background:'#f3f4f6', padding:'2px 6px', borderRadius:4 }}>images</code> dans Supabase :<br/><br/>
                  Supabase → Storage → New bucket → nom : <strong>images</strong> → Public ✓
                </p>
              </div>
              {[
                { titre:'Boutique', desc:'WYL — Wear Your Legacy', icon:'🏪' },
                { titre:'WhatsApp', desc:'+212 675-014485', icon:'💬' },
                { titre:'Base de données', desc:'Supabase connectée ✓', icon:'🗄️' },
                { titre:'Hébergement', desc:'Vercel — déploiement automatique', icon:'🌐' },
              ].map(item=>(
                <div key={item.titre} className="admin-card" style={{ display:'flex', gap:14, alignItems:'center' }}>
                  <span style={{ fontSize:22 }}>{item.icon}</span>
                  <div>
                    <p className="font-display" style={{ fontSize:14, fontWeight:700, color:'var(--text-heading)' }}>{item.titre}</p>
                    <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ══ MODAL : Formulaire produit ══ */}
      {showForm&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div style={{ background:'white', borderRadius:16, padding:32, width:'100%', maxWidth:560, maxHeight:'92vh', overflowY:'auto' }}>
            <h2 className="font-display" style={{ fontSize:22, fontWeight:700, color:'var(--text-heading)', marginBottom:24 }}>
              {editingId ? 'Modifier le produit' : 'Ajouter un produit'}
            </h2>

            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

              {/* Nom */}
              <div>
                <label style={{ display:'block', fontFamily:'Space Grotesk', fontSize:11, fontWeight:500, color:'var(--text-muted)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:7 }}>Nom du produit *</label>
                <input type="text" placeholder="T-shirt WYL Classic" value={form.nom} onChange={e=>setForm(p=>({...p,nom:e.target.value}))} className="admin-input" />
              </div>

              {/* Prix + Catégorie */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ display:'block', fontFamily:'Space Grotesk', fontSize:11, fontWeight:500, color:'var(--text-muted)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:7 }}>Prix (MAD) *</label>
                  <input type="number" placeholder="199" value={form.prix} onChange={e=>setForm(p=>({...p,prix:e.target.value}))} className="admin-input" />
                </div>
                <div>
                  <label style={{ display:'block', fontFamily:'Space Grotesk', fontSize:11, fontWeight:500, color:'var(--text-muted)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:7 }}>Catégorie</label>
                  <input type="text" placeholder="T-shirts, Pantalons…" value={form.categorie} onChange={e=>setForm(p=>({...p,categorie:e.target.value}))} className="admin-input" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display:'block', fontFamily:'Space Grotesk', fontSize:11, fontWeight:500, color:'var(--text-muted)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:7 }}>Description</label>
                <textarea rows={3} placeholder="Description du produit…" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} className="admin-input" style={{ resize:'vertical', lineHeight:1.65 }} />
              </div>

              {/* Disponibilité + Stock */}
              <div style={{ background:'hsl(30,15%,97%)', borderRadius:10, padding:16 }}>
                <label style={{ display:'block', fontFamily:'Space Grotesk', fontSize:11, fontWeight:500, color:'var(--text-muted)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:12 }}>Disponibilité & stock</label>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                  <Toggle on={form.disponible} onChange={v=>setForm(p=>({...p,disponible:v}))} label={form.disponible ? '✓ Disponible à la vente' : '✕ Hors vente (stock = 0)'} />
                  {form.disponible && (
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <label style={{ fontFamily:'Space Grotesk', fontSize:12, color:'var(--text-muted)' }}>Stock :</label>
                      <input type="number" min="1" value={form.stock} onChange={e=>setForm(p=>({...p,stock:e.target.value}))} className="admin-input" style={{ width:80, textAlign:'center' }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Produit vedette */}
              <div style={{ background:'#fef3c7', borderRadius:10, padding:16, border:'1px solid #fde68a' }}>
                <label style={{ display:'block', fontFamily:'Space Grotesk', fontSize:11, fontWeight:500, color:'#92400e', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Mise en avant</label>
                <Toggle on={form.vedette} onChange={v=>setForm(p=>({...p,vedette:v}))} label={form.vedette ? '⭐ Produit vedette — affiché en priorité sur le site' : '☆ Produit standard'} />
                <p style={{ fontSize:11, color:'#b45309', marginTop:8, fontFamily:'Space Grotesk' }}>Les produits vedettes apparaissent dans la section "Coups de cœur" de la page d'accueil.</p>
              </div>

              {/* Upload images */}
              <div>
                <label style={{ display:'block', fontFamily:'Space Grotesk', fontSize:11, fontWeight:500, color:'var(--text-muted)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>
                  Images du produit {images.length>0&&<span style={{ color:'var(--accent)' }}>({images.length})</span>}
                </label>
                <UploadZone onFiles={ajouterFichiers} />
                {uploadProgress>0&&(
                  <div style={{ marginTop:10 }}>
                    <div style={{ height:4, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${uploadProgress}%`, background:'var(--accent)', borderRadius:2, transition:'width 0.3s' }}/>
                    </div>
                    <p style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'Space Grotesk', marginTop:4 }}>Upload {uploadProgress}%…</p>
                  </div>
                )}
                {uploadError&&(
                  <div style={{ marginTop:8, padding:'10px 14px', background:'#fee2e2', borderRadius:8, border:'1px solid #fecaca' }}>
                    <p style={{ fontSize:12, color:'#dc2626', fontFamily:'Space Grotesk', fontWeight:600 }}>❌ Erreur upload</p>
                    <p style={{ fontSize:11, color:'#991b1b', marginTop:4, fontFamily:'Space Grotesk' }}>{uploadError}</p>
                    <p style={{ fontSize:11, color:'#b91c1c', marginTop:6, fontFamily:'Space Grotesk' }}>
                      → Vérifiez dans Supabase : Storage → images → Policies → policy INSERT doit être sur <strong>authenticated</strong>
                    </p>
                    <button onClick={()=>setUploadError(null)} style={{ marginTop:8, fontSize:11, color:'#dc2626', background:'none', border:'none', cursor:'pointer', fontFamily:'Space Grotesk', textDecoration:'underline' }}>Fermer</button>
                  </div>
                )}
                {/* Galerie d'images */}
                {images.length>0&&(
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginTop:14 }}>
                    {images.map((im,idx)=>(
                      <div key={idx} className={`img-thumb ${idx===0?'primary':''}`}>
                        <img src={im.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                        {im.uploading&&<div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:18, animation:'spin-slow 1s linear infinite', display:'inline-block' }}>⏳</span></div>}
                        {im.local&&!im.uploading&&<div style={{ position:'absolute', inset:0, background:'rgba(220,38,38,0.7)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:4 }}><span style={{ fontSize:16 }}>⚠️</span><span style={{ fontSize:8, color:'white', textAlign:'center', fontFamily:'Space Grotesk', lineHeight:1.2 }}>Upload échoué</span></div>}
                        <div className="img-thumb-actions">
                          {idx!==0&&<button onClick={()=>setPrimaire(idx)} title="Mettre en avant" style={{ background:'rgba(255,255,255,0.9)', border:'none', borderRadius:4, width:26, height:26, cursor:'pointer', fontSize:12 }}>⭐</button>}
                          <button onClick={()=>supprimerImage(idx)} style={{ background:'rgba(220,38,38,0.9)', border:'none', borderRadius:4, width:26, height:26, cursor:'pointer', color:'white', fontSize:13 }}>✕</button>
                        </div>
                        {idx===0&&<div style={{ position:'absolute', bottom:0, left:0, right:0, background:'rgba(183,100,72,0.85)', padding:'2px 0', textAlign:'center' }}><span style={{ fontFamily:'Space Grotesk', fontSize:8, color:'white', letterSpacing:'0.1em', fontWeight:700 }}>PRINCIPALE</span></div>}
                      </div>
                    ))}
                  </div>
                )}
                <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:8, fontFamily:'Space Grotesk' }}>
                  Cliquez ⭐ pour définir l'image principale · Plusieurs formats acceptés · La 1ère image est l'image principale
                </p>
              </div>

              {/* Boutons */}
              <div style={{ display:'flex', gap:12, marginTop:4 }}>
                <button onClick={()=>setShowForm(false)} className="btn-outline" style={{ flex:1, padding:'13px' }}>Annuler</button>
                <button onClick={sauvegarder} disabled={saving} className="btn-primary" style={{ flex:2, padding:'13px' }}>
                  {saving ? 'Sauvegarde…' : editingId ? '✓ Enregistrer' : '+ Créer le produit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL : Confirmation suppression ══ */}
      {confirmDel&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div style={{ background:'white', borderRadius:16, padding:36, width:'100%', maxWidth:380, textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:14 }}>🗑️</div>
            <h2 className="font-display" style={{ fontSize:20, fontWeight:700, color:'var(--text-heading)', marginBottom:10 }}>Supprimer ce produit ?</h2>
            <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:28, lineHeight:1.65 }}>Cette action est irréversible.</p>
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={()=>setConfirmDel(null)} className="btn-outline" style={{ flex:1, padding:'12px' }}>Annuler</button>
              <button onClick={()=>supprimerProduit(confirmDel)} className="btn-danger" style={{ flex:1, padding:'12px', fontSize:13 }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
