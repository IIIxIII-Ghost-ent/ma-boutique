import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

/* ─── Constantes ─── */
const STATUTS = ['en_attente','confirme','expedie','livre','annule']
const STATUT_COLOR = { en_attente:'#f59e0b', confirme:'#3b82f6', expedie:'#8b5cf6', livre:'#16a34a', annule:'#dc2626' }
const STATUT_BG    = { en_attente:'#fef3c7', confirme:'#dbeafe', expedie:'#ede9fe', livre:'#dcfce7', annule:'#fee2e2' }
const STATUT_LABEL = { en_attente:'En attente', confirme:'Confirmé', expedie:'Expédié', livre:'Livré', annule:'Annulé' }
const FORM_VIDE = { nom:'', description:'', prix:'', categorie:'', stock:'', disponible:true, vedette:false }

/* ─── Styles inline partagés ─── */
const S = {
  card: { background:'white', border:'1px solid #eaecf0', borderRadius:12, padding:'20px 22px' },
  label: { display:'block', fontFamily:'Barlow', fontSize:11, fontWeight:700, color:'#6b7280', letterSpacing:'.14em', textTransform:'uppercase', marginBottom:6 },
  input: { width:'100%', padding:'10px 13px', border:'1.5px solid #e5e7eb', borderRadius:8, fontFamily:'Barlow', fontSize:14, color:'#111', background:'white', outline:'none', boxSizing:'border-box', transition:'border-color .2s', display:'block' },
}

/* ─── Upload ─── */
async function uploadImage(file) {
  const ext  = file.name.split('.').pop().toLowerCase()
  const path = `produits/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('images').upload(path, file, { upsert:true, contentType: file.type || 'image/jpeg' })
  if (error) throw new Error('Upload échoué : ' + error.message)
  const { data } = supabase.storage.from('images').getPublicUrl(path)
  return data.publicUrl
}

/* ─── Toggle ─── */
function Toggle({ on, onChange, label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={() => onChange(!on)}>
      <div style={{ width:40, height:22, borderRadius:11, background: on ? '#111' : '#d1d5db', position:'relative', transition:'background .2s', flexShrink:0 }}>
        <div style={{ position:'absolute', top:3, left: on ? 21 : 3, width:16, height:16, borderRadius:'50%', background:'white', transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,.2)' }}/>
      </div>
      {label && <span style={{ fontFamily:'Barlow', fontSize:13, color:'#374151', userSelect:'none' }}>{label}</span>}
    </div>
  )
}

/* ─── Zone upload ─── */
function UploadZone({ onFiles }) {
  const ref = useRef()
  const [drag, setDrag] = useState(false)
  const handle = (files) => {
    const valids = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (valids.length) onFiles(valids)
  }
  return (
    <div
      onClick={() => ref.current.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files) }}
      style={{ border:`2px dashed ${drag ? '#111' : '#d1d5db'}`, borderRadius:10, padding:'24px 16px', textAlign:'center', cursor:'pointer', background: drag ? '#f9fafb' : 'white', transition:'all .2s' }}
    >
      <input ref={ref} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={e => handle(e.target.files)} />
      <div style={{ fontSize:28, marginBottom:8 }}>🖼️</div>
      <p style={{ fontFamily:'Barlow', fontWeight:600, fontSize:13, color:'#374151', marginBottom:4 }}>Glisser des images ici</p>
      <p style={{ fontSize:12, color:'#9ca3af' }}>ou cliquer pour choisir · JPG, PNG, WEBP</p>
    </div>
  )
}

/* ─── Badge statut ─── */
function StatutBadge({ statut }) {
  return (
    <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, fontFamily:'Barlow', background:STATUT_BG[statut]||'#f3f4f6', color:STATUT_COLOR[statut]||'#666', whiteSpace:'nowrap', letterSpacing:'.04em' }}>
      {STATUT_LABEL[statut] || statut}
    </span>
  )
}

export default function Admin() {
  const [session,      setSession]      = useState(null)
  const [email,        setEmail]        = useState('')
  const [mdp,          setMdp]          = useState('')
  const [onglet,       setOnglet]       = useState('dashboard')
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [commandes,    setCommandes]    = useState([])
  const [produits,     setProduits]     = useState([])
  const [loadingCmd,   setLoadingCmd]   = useState(true)
  const [loadingProd,  setLoadingProd]  = useState(true)
  const [filtreStatut, setFiltreStatut] = useState('tous')
  const [searchProd,   setSearchProd]   = useState('')
  const [showForm,     setShowForm]     = useState(false)
  const [editingId,    setEditingId]    = useState(null)
  const [saving,       setSaving]       = useState(false)
  const [confirmDel,   setConfirmDel]   = useState(null)
  const [form,         setForm]         = useState(FORM_VIDE)
  const [images,       setImages]       = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError,  setUploadError]  = useState(null)
  const [loginError,   setLoginError]   = useState('')

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

  const changerStatut = async (id, statut) => {
    await supabase.from('commandes').update({ statut }).eq('id', id)
    chargerCommandes()
  }

  const ouvrirAjout = () => {
    setForm(FORM_VIDE); setImages([]); setEditingId(null); setUploadError(null); setShowForm(true)
  }

  const ouvrirEdit = (p) => {
    setForm({ nom:p.nom, description:p.description||'', prix:String(p.prix), categorie:p.categorie||'', stock:String(p.stock||0), disponible:p.stock>0, vedette:p.vedette===true })
    let imgs = []
    if (p.images_url) { try { const pa=JSON.parse(p.images_url); imgs=Array.isArray(pa)?pa.filter(u=>u&&u.startsWith('http')):[] } catch {} }
    if (imgs.length===0 && p.image_url) imgs=[p.image_url]
    setImages(imgs.map(url => ({ url })))
    setEditingId(p.id); setUploadError(null); setShowForm(true)
  }

  const ajouterFichiers = async (files) => {
    const nouvelles = files.map(f => ({ url: URL.createObjectURL(f), file: f, uploading: true }))
    setImages(prev => [...prev, ...nouvelles])
    let done=0, erreurs=[]
    for (const nv of nouvelles) {
      try {
        const url = await uploadImage(nv.file)
        setImages(prev => prev.map(im => im.url===nv.url ? { url } : im))
      } catch(err) {
        erreurs.push(err?.message||String(err))
        setImages(prev => prev.map(im => im.url===nv.url ? { ...im, uploading:false, local:true, erreur:err?.message } : im))
      }
      done++; setUploadProgress(Math.round((done/nouvelles.length)*100))
    }
    setUploadProgress(0)
    if (erreurs.length>0) setUploadError(erreurs[0])
  }

  const supprimerImage = (idx) => setImages(prev => prev.filter((_,i) => i!==idx))
  const setPrimaire    = (idx) => setImages(prev => [prev[idx], ...prev.filter((_,i) => i!==idx)])

  const sauvegarder = async () => {
    if (!form.nom || !form.prix) { alert('Nom et prix obligatoires'); return }
    setSaving(true)
    const urls = images.map(im=>im.url).filter(u=>u&&u.startsWith('http'))
    const hasLocal = images.some(im=>im.url&&im.url.startsWith('blob:'))
    if (hasLocal) {
      const ok = window.confirm("Certaines images n'ont pas pu être uploadées. Continuer sans ces images ?")
      if (!ok) { setSaving(false); return }
    }
    const stock = form.disponible ? (Number(form.stock)||10) : 0
    const payload = { nom:form.nom, description:form.description, prix:Number(form.prix), categorie:form.categorie, stock, vedette:form.vedette, image_url:urls[0]||null, images_url:JSON.stringify(urls) }
    if (editingId) { await supabase.from('produits').update(payload).eq('id',editingId) }
    else { await supabase.from('produits').insert(payload) }
    setSaving(false); setShowForm(false); chargerProduits()
  }

  const supprimerProduit = async (id) => {
    await supabase.from('produits').delete().eq('id',id)
    setConfirmDel(null); chargerProduits()
  }

  const toggleVedette = async (p) => {
    await supabase.from('produits').update({ vedette:!p.vedette }).eq('id',p.id)
    chargerProduits()
  }
  const toggleDispo = async (p) => {
    await supabase.from('produits').update({ stock:p.stock>0?0:10 }).eq('id',p.id)
    chargerProduits()
  }

  const totalRevenu = commandes.filter(c=>c.statut==='livre').reduce((a,c)=>a+c.total,0)
  const nbEnAttente = commandes.filter(c=>c.statut==='en_attente').length
  const cmdFiltrées = filtreStatut==='tous' ? commandes : commandes.filter(c=>c.statut===filtreStatut)
  const prodFiltres = searchProd ? produits.filter(p=>p.nom.toLowerCase().includes(searchProd.toLowerCase())||(p.categorie||'').toLowerCase().includes(searchProd.toLowerCase())) : produits

  /* ══════════════════════
     PAGE LOGIN
  ══════════════════════ */
  if (!session) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:380, background:'white', borderRadius:16, padding:'40px 36px', boxShadow:'0 24px 64px rgba(0,0,0,.4)' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:52, height:52, background:'#111', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <span style={{ fontFamily:'Barlow Condensed', fontWeight:900, fontSize:20, color:'white', letterSpacing:'.1em' }}>WYL</span>
          </div>
          <p style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:18, color:'#111', letterSpacing:'.08em', textTransform:'uppercase', margin:'0 0 4px' }}>Espace Admin</p>
          <p style={{ fontFamily:'Barlow', fontSize:12, color:'#9ca3af', margin:0 }}>Connexion sécurisée</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <label style={S.label}>Email</label>
            <input type="email" placeholder="admin@wyl.ma" value={email} onChange={e=>{ setEmail(e.target.value); setLoginError('') }}
              style={S.input} onKeyDown={e=>e.key==='Enter'&&document.getElementById('btn-login').click()}/>
          </div>
          <div>
            <label style={S.label}>Mot de passe</label>
            <input type="password" placeholder="••••••••" value={mdp} onChange={e=>{ setMdp(e.target.value); setLoginError('') }}
              style={S.input} onKeyDown={e=>e.key==='Enter'&&document.getElementById('btn-login').click()}/>
          </div>
          {loginError && <p style={{ fontFamily:'Barlow', fontSize:12, color:'#dc2626', margin:0, textAlign:'center' }}>⚠ {loginError}</p>}
          <button id="btn-login"
            onClick={async()=>{ const {error}=await supabase.auth.signInWithPassword({email,password:mdp}); if(error) setLoginError('Email ou mot de passe incorrect') }}
            style={{ background:'#111', color:'white', border:'none', borderRadius:8, padding:'13px', fontFamily:'Barlow', fontSize:13, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer', marginTop:4, transition:'background .2s' }}
            onMouseOver={e=>e.currentTarget.style.background='#333'} onMouseOut={e=>e.currentTarget.style.background='#111'}>
            Se connecter →
          </button>
        </div>
      </div>
    </div>
  )

  const NAV = [
    { id:'dashboard',  icon:'📊', label:'Dashboard' },
    { id:'commandes',  icon:'📦', label:'Commandes', badge:nbEnAttente||null },
    { id:'produits',   icon:'👕', label:'Produits' },
    { id:'parametres', icon:'⚙️', label:'Paramètres' },
  ]

  /* ══════════════════════
     LAYOUT PRINCIPAL
  ══════════════════════ */
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f8f9fb', fontFamily:'Barlow' }}>

      {/* ══ SIDEBAR ══ */}
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:90 }} onClick={()=>setSidebarOpen(false)}/>
      )}

      <aside style={{
        width:220, background:'#0f172a', display:'flex', flexDirection:'column',
        padding:'0', flexShrink:0, position:'fixed', top:0, left:0, height:'100vh',
        overflowY:'auto', zIndex:100,
        transform: `translateX(${sidebarOpen ? 0 : '-100%'})`,
        transition:'transform .28s cubic-bezier(.22,1,.36,1)',
      }}
      className="admin-sidebar">
        {/* Logo */}
        <div style={{ padding:'24px 20px 20px', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, background:'#b76448', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontFamily:'Barlow Condensed', fontWeight:900, fontSize:14, color:'white', letterSpacing:'.08em' }}>WYL</span>
            </div>
            <div>
              <p style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:15, color:'white', letterSpacing:'.12em', margin:0 }}>WYL Admin</p>
              <p style={{ fontFamily:'Barlow', fontSize:10, color:'rgba(255,255,255,.3)', margin:0, letterSpacing:'.14em' }}>Tableau de bord</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'16px 10px' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={()=>{ setOnglet(n.id); setSidebarOpen(false) }}
              style={{
                width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
                background: onglet===n.id ? 'rgba(183,100,72,.18)' : 'none',
                border: 'none', borderRadius:8, cursor:'pointer', marginBottom:3,
                color: onglet===n.id ? '#e8a080' : 'rgba(255,255,255,.55)',
                fontFamily:'Barlow', fontSize:13, fontWeight:600, textAlign:'left',
                transition:'all .18s',
              }}
              onMouseOver={e=>{ if(onglet!==n.id) e.currentTarget.style.background='rgba(255,255,255,.06)' }}
              onMouseOut={e=>{ if(onglet!==n.id) e.currentTarget.style.background='none' }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{n.icon}</span>
              <span style={{ flex:1 }}>{n.label}</span>
              {n.badge && <span style={{ background:'#f59e0b', color:'#111', borderRadius:999, fontSize:10, fontWeight:800, padding:'1px 7px', letterSpacing:'.04em' }}>{n.badge}</span>}
            </button>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div style={{ padding:'12px 10px 20px', borderTop:'1px solid rgba(255,255,255,.06)' }}>
          <a href="/" target="_blank" style={{ display:'flex', alignItems:'center', gap:8, color:'rgba(255,255,255,.3)', fontFamily:'Barlow', fontSize:12, textDecoration:'none', padding:'8px 12px', borderRadius:8, transition:'color .2s', marginBottom:4 }}
            onMouseOver={e=>e.currentTarget.style.color='white'} onMouseOut={e=>e.currentTarget.style.color='rgba(255,255,255,.3)'}>
            🔗 Voir la boutique
          </a>
          <button onClick={()=>supabase.auth.signOut()}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,.3)', fontFamily:'Barlow', fontSize:12, textAlign:'left', padding:'8px 12px', borderRadius:8, transition:'color .2s' }}
            onMouseOver={e=>e.currentTarget.style.color='#f87171'} onMouseOut={e=>e.currentTarget.style.color='rgba(255,255,255,.3)'}>
            ← Déconnexion
          </button>
        </div>
      </aside>

      {/* ══ MAIN AREA ══ */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, marginLeft:220 }} className="admin-main-area">

        {/* Top bar mobile */}
        <header style={{ height:56, background:'white', borderBottom:'1px solid #eaecf0', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', position:'sticky', top:0, zIndex:50 }}>
          <button onClick={()=>setSidebarOpen(v=>!v)}
            style={{ background:'none', border:'none', cursor:'pointer', color:'#374151', padding:4, display:'flex', alignItems:'center', gap:8, fontFamily:'Barlow', fontWeight:600, fontSize:13 }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            <span className="admin-title-mobile">{NAV.find(n=>n.id===onglet)?.label}</span>
          </button>
          <div style={{ fontFamily:'Barlow Condensed', fontSize:16, fontWeight:700, color:'#111', letterSpacing:'.1em' }}>WYL</div>
          <div style={{ width:28 }}/>
        </header>

        {/* Content */}
        <main style={{ flex:1, padding:'28px 24px', overflowY:'auto', maxWidth:1100, width:'100%', margin:'0 auto' }}>

          {/* ════ DASHBOARD ════ */}
          {onglet==='dashboard' && (
            <div>
              <div style={{ marginBottom:28 }}>
                <h1 style={{ fontFamily:'Barlow Condensed', fontWeight:900, fontSize:28, color:'#111', letterSpacing:'.04em', textTransform:'uppercase', margin:'0 0 4px' }}>Dashboard</h1>
                <p style={{ fontFamily:'Barlow', fontSize:13, color:'#9ca3af', margin:0 }}>{new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
              </div>

              {/* KPIs */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:28 }}>
                {[
                  { label:'Revenus livrés', value:`${totalRevenu.toLocaleString()} MAD`, icon:'💰', color:'#16a34a', bg:'#dcfce7' },
                  { label:'Commandes', value:commandes.length, icon:'📦', color:'#2563eb', bg:'#dbeafe' },
                  { label:'En attente', value:nbEnAttente, icon:'⏳', color:'#d97706', bg:'#fef3c7' },
                  { label:'Produits dispo', value:produits.filter(p=>p.stock>0).length, icon:'👕', color:'#7c3aed', bg:'#ede9fe' },
                  { label:'Vedettes', value:produits.filter(p=>p.vedette).length, icon:'⭐', color:'#b76448', bg:'#fef3e8' },
                ].map(k => (
                  <div key={k.label} style={{ ...S.card, display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:k.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{k.icon}</div>
                    <div>
                      <p style={{ fontFamily:'Barlow Condensed', fontSize:22, fontWeight:900, color:'#111', lineHeight:1, margin:'0 0 3px' }}>{k.value}</p>
                      <p style={{ fontFamily:'Barlow', fontSize:11, color:'#9ca3af', margin:0 }}>{k.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dernières commandes */}
              <div style={{ ...S.card, marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                  <h2 style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:18, color:'#111', textTransform:'uppercase', letterSpacing:'.04em', margin:0 }}>Dernières commandes</h2>
                  <button onClick={()=>setOnglet('commandes')} style={{ fontFamily:'Barlow', fontSize:12, fontWeight:600, color:'#b76448', background:'none', border:'none', cursor:'pointer', letterSpacing:'.06em' }}>Voir tout →</button>
                </div>
                {commandes.slice(0,5).map(cmd => (
                  <div key={cmd.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 0', borderBottom:'1px solid #f3f4f6' }}>
                    <div>
                      <p style={{ fontFamily:'Barlow', fontWeight:700, fontSize:14, color:'#111', margin:'0 0 2px' }}>{cmd.client_nom}</p>
                      <p style={{ fontFamily:'Barlow', fontSize:12, color:'#9ca3af', margin:0 }}>{new Date(cmd.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:14, color:'#111' }}>{cmd.total} MAD</span>
                      <StatutBadge statut={cmd.statut}/>
                    </div>
                  </div>
                ))}
                {commandes.length===0 && <p style={{ fontFamily:'Barlow', color:'#d1d5db', fontSize:13, textAlign:'center', padding:'20px 0' }}>Aucune commande pour l'instant.</p>}
              </div>

              {/* Ruptures */}
              {produits.filter(p=>p.stock===0).length>0 && (
                <div style={{ ...S.card, borderLeft:'4px solid #f59e0b' }}>
                  <h2 style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:15, color:'#92400e', textTransform:'uppercase', letterSpacing:'.04em', margin:'0 0 10px' }}>⚠ Ruptures de stock</h2>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {produits.filter(p=>p.stock===0).map(p => (
                      <span key={p.id} style={{ padding:'4px 12px', borderRadius:999, background:'#fee2e2', color:'#dc2626', fontSize:12, fontFamily:'Barlow', fontWeight:600 }}>{p.nom}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ COMMANDES ════ */}
          {onglet==='commandes' && (
            <div>
              {/* Header */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
                <div>
                  <h1 style={{ fontFamily:'Barlow Condensed', fontWeight:900, fontSize:28, color:'#111', textTransform:'uppercase', letterSpacing:'.04em', margin:'0 0 4px' }}>Commandes</h1>
                  <p style={{ fontFamily:'Barlow', fontSize:13, color:'#9ca3af', margin:0 }}>
                    {commandes.length} commande{commandes.length>1?'s':''} ·{' '}
                    <span style={{ color: nbEnAttente>0 ? '#d97706' : '#9ca3af', fontWeight: nbEnAttente>0 ? 700 : 400 }}>
                      {nbEnAttente} en attente
                    </span>
                  </p>
                </div>
                <button onClick={chargerCommandes}
                  style={{ background:'white', border:'1.5px solid #e5e7eb', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontFamily:'Barlow', fontSize:12, fontWeight:600, color:'#6b7280', display:'flex', alignItems:'center', gap:6, transition:'border-color .18s' }}
                  onMouseOver={e=>e.currentTarget.style.borderColor='#111'} onMouseOut={e=>e.currentTarget.style.borderColor='#e5e7eb'}>
                  ↻ Actualiser
                </button>
              </div>

              {/* Filtres statut */}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:20 }}>
                {[
                  { key:'tous', label:'Toutes', count:commandes.length },
                  ...['en_attente','confirme','expedie','livre','annule'].map(s => ({ key:s, label:STATUT_LABEL[s], count:commandes.filter(c=>c.statut===s).length }))
                ].map(({ key, label, count }) => (
                  <button key={key} onClick={()=>setFiltreStatut(key)}
                    style={{ padding:'6px 14px', borderRadius:8, fontFamily:'Barlow', fontSize:12, fontWeight:600, cursor:'pointer', border:'1.5px solid', transition:'all .18s', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:6,
                      background: filtreStatut===key ? (STATUT_COLOR[key]||'#111') : 'white',
                      color: filtreStatut===key ? 'white' : (STATUT_COLOR[key]||'#6b7280'),
                      borderColor: filtreStatut===key ? (STATUT_COLOR[key]||'#111') : '#e5e7eb',
                    }}>
                    {label}
                    <span style={{ background: filtreStatut===key ? 'rgba(255,255,255,.25)' : '#f3f4f6', color: filtreStatut===key ? 'white' : '#6b7280', borderRadius:4, fontSize:10, fontWeight:800, padding:'1px 6px', minWidth:20, textAlign:'center' }}>
                      {count}
                    </span>
                  </button>
                ))}
              </div>

              {loadingCmd ? (
                <div style={{ textAlign:'center', padding:'60px 0', color:'#d1d5db', fontFamily:'Barlow', fontSize:13 }}>Chargement…</div>
              ) : cmdFiltrées.length === 0 ? (
                <div style={{ ...S.card, textAlign:'center', padding:'60px 24px' }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
                  <p style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:16, color:'#d1d5db', textTransform:'uppercase', letterSpacing:'.06em', margin:0 }}>Aucune commande</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {cmdFiltrées.map(cmd => (
                    <div key={cmd.id} style={{ ...S.card, padding:0, overflow:'hidden' }}>

                      {/* ── Bande colorée statut en haut ── */}
                      <div style={{ height:4, background: STATUT_COLOR[cmd.statut]||'#e5e7eb' }}/>

                      <div style={{ padding:'18px 20px' }}>

                        {/* ── Ligne 1 : client + montant + statut ── */}
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:14, flexWrap:'wrap' }}>
                          <div style={{ flex:1, minWidth:200 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                              <div style={{ width:36, height:36, borderRadius:'50%', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Barlow Condensed', fontWeight:900, fontSize:14, color:'#6b7280', flexShrink:0 }}>
                                {cmd.client_nom?.charAt(0)?.toUpperCase()||'?'}
                              </div>
                              <div>
                                <p style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:17, color:'#111', margin:0, letterSpacing:'.02em' }}>{cmd.client_nom}</p>
                                <p style={{ fontFamily:'Barlow', fontSize:11, color:'#9ca3af', margin:0 }}>
                                  {new Date(cmd.created_at).toLocaleString('fr-FR',{ day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                                </p>
                              </div>
                            </div>
                            <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                              <span style={{ fontFamily:'Barlow', fontSize:12, color:'#374151', display:'flex', alignItems:'center', gap:4 }}>
                                📞 <a href={`tel:${cmd.client_telephone}`} style={{ color:'#374151', textDecoration:'none' }}>{cmd.client_telephone}</a>
                              </span>
                              {cmd.client_adresse && (
                                <span style={{ fontFamily:'Barlow', fontSize:12, color:'#374151', display:'flex', alignItems:'center', gap:4 }}>
                                  📍 {cmd.client_adresse}
                                </span>
                              )}
                            </div>
                          </div>
                          <div style={{ textAlign:'right', flexShrink:0 }}>
                            <StatutBadge statut={cmd.statut}/>
                            <p style={{ fontFamily:'Barlow Condensed', fontWeight:900, fontSize:24, color:'#111', margin:'8px 0 0', lineHeight:1 }}>
                              {cmd.total} <span style={{ fontSize:13, fontWeight:700 }}>MAD</span>
                            </p>
                            {cmd.mode_paiement && (
                              <p style={{ fontFamily:'Barlow', fontSize:11, color:'#9ca3af', margin:'3px 0 0' }}>
                                {cmd.mode_paiement==='cod' ? '💵 Cash livraison' : cmd.mode_paiement==='wave' ? '📱 Wave' : '🏦 Virement'}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* ── Articles ── */}
                        <div style={{ background:'#f8f9fb', borderRadius:8, padding:'10px 14px', marginBottom:14, border:'1px solid #f3f4f6' }}>
                          <p style={{ fontFamily:'Barlow', fontSize:10, fontWeight:700, color:'#9ca3af', letterSpacing:'.14em', textTransform:'uppercase', margin:'0 0 8px' }}>
                            {(cmd.articles||[]).reduce((a,x)=>a+x.quantite,0)} article{(cmd.articles||[]).reduce((a,x)=>a+x.quantite,0)>1?'s':''}
                          </p>
                          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                            {(cmd.articles||[]).map((a,i) => (
                              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                  <div style={{ width:6, height:6, borderRadius:'50%', background:STATUT_COLOR[cmd.statut]||'#d1d5db', flexShrink:0 }}/>
                                  <span style={{ fontFamily:'Barlow', fontSize:13, color:'#374151' }}>
                                    {a.nom}
                                    {a.taille && <span style={{ color:'#9ca3af', fontSize:11 }}> · {a.taille}{a.couleur?'/'+a.couleur:''}</span>}
                                    <span style={{ color:'#9ca3af', fontSize:11 }}> ×{a.quantite}</span>
                                  </span>
                                </div>
                                <span style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:13, color:'#111', flexShrink:0 }}>{a.prix*a.quantite} MAD</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* ── Actions ── */}
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                          {/* Changer statut */}
                          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                            <p style={{ fontFamily:'Barlow', fontSize:10, fontWeight:700, color:'#9ca3af', letterSpacing:'.14em', textTransform:'uppercase', margin:0 }}>Changer le statut</p>
                            <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                              {STATUTS.map(s => {
                                const isActive = cmd.statut === s
                                return (
                                  <button key={s} onClick={()=>changerStatut(cmd.id,s)}
                                    title={STATUT_LABEL[s]}
                                    style={{
                                      padding:'6px 12px', borderRadius:6, fontSize:11, fontWeight:700,
                                      fontFamily:'Barlow', cursor:'pointer', border:'1.5px solid',
                                      transition:'all .15s', letterSpacing:'.03em', whiteSpace:'nowrap',
                                      background: isActive ? STATUT_COLOR[s] : 'white',
                                      color: isActive ? 'white' : STATUT_COLOR[s],
                                      borderColor: STATUT_COLOR[s],
                                      boxShadow: isActive ? `0 2px 8px ${STATUT_COLOR[s]}40` : 'none',
                                      transform: isActive ? 'scale(1.04)' : 'scale(1)',
                                    }}>
                                    {isActive && '✓ '}{STATUT_LABEL[s]}
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          {/* Contact client */}
                          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                            <p style={{ fontFamily:'Barlow', fontSize:10, fontWeight:700, color:'#9ca3af', letterSpacing:'.14em', textTransform:'uppercase', margin:0 }}>Contact</p>
                            <a href={`https://wa.me/${(cmd.client_telephone||'').replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                              style={{ padding:'8px 16px', borderRadius:6, fontSize:12, fontWeight:700, fontFamily:'Barlow', cursor:'pointer', border:'1.5px solid #16a34a', color:'white', background:'#16a34a', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6, transition:'all .15s', letterSpacing:'.04em' }}
                              onMouseOver={e=>e.currentTarget.style.background='#15803d'}
                              onMouseOut={e=>e.currentTarget.style.background='#16a34a'}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                              WhatsApp
                            </a>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════ PRODUITS ════ */}
          {onglet==='produits' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
                <div>
                  <h1 style={{ fontFamily:'Barlow Condensed', fontWeight:900, fontSize:28, color:'#111', textTransform:'uppercase', letterSpacing:'.04em', margin:'0 0 4px' }}>Produits</h1>
                  <p style={{ fontFamily:'Barlow', fontSize:13, color:'#9ca3af', margin:0 }}>{produits.length} produit{produits.length>1?'s':''} · {produits.filter(p=>p.vedette).length} vedette{produits.filter(p=>p.vedette).length>1?'s':''}</p>
                </div>
                <button onClick={ouvrirAjout}
                  style={{ background:'#111', color:'white', border:'none', borderRadius:8, padding:'10px 18px', cursor:'pointer', fontFamily:'Barlow', fontSize:12, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', display:'flex', alignItems:'center', gap:7, transition:'background .2s' }}
                  onMouseOver={e=>e.currentTarget.style.background='#333'} onMouseOut={e=>e.currentTarget.style.background='#111'}>
                  + Ajouter
                </button>
              </div>

              {/* Recherche */}
              <div style={{ position:'relative', marginBottom:18 }}>
                <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:14, color:'#9ca3af' }}>🔍</span>
                <input type="text" placeholder="Rechercher un produit…" value={searchProd} onChange={e=>setSearchProd(e.target.value)}
                  style={{ ...S.input, paddingLeft:38 }}
                  onFocus={e=>e.currentTarget.style.borderColor='#111'} onBlur={e=>e.currentTarget.style.borderColor='#e5e7eb'}/>
              </div>

              {loadingProd ? (
                <div style={{ textAlign:'center', padding:'60px 0', color:'#d1d5db', fontFamily:'Barlow', fontSize:13 }}>Chargement…</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {prodFiltres.map(p => {
                    let imgs=[]
                    if (p.images_url) { try { const pa=JSON.parse(p.images_url); imgs=Array.isArray(pa)?pa.filter(u=>u&&u.startsWith('http')):[] } catch {} }
                    if (imgs.length===0 && p.image_url) imgs=[p.image_url]
                    return (
                      <div key={p.id} style={{ ...S.card, display:'flex', gap:14, alignItems:'center', padding:'14px 16px' }}>
                        {/* Image */}
                        <div style={{ position:'relative', flexShrink:0 }}>
                          <img src={imgs[0]||'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&q=60'} alt={p.nom}
                            loading="lazy"
                            style={{ width:56, height:56, objectFit:'cover', borderRadius:8, border:'1px solid #f3f4f6' }}/>
                          {imgs.length>1 && <span style={{ position:'absolute', bottom:-4, right:-4, background:'#111', color:'white', fontSize:9, fontWeight:700, padding:'1px 5px', borderRadius:999, fontFamily:'Barlow' }}>{imgs.length}</span>}
                        </div>

                        {/* Infos */}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
                            <p style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:15, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', margin:0 }}>{p.nom}</p>
                            {p.vedette && <span style={{ fontSize:13 }}>⭐</span>}
                          </div>
                          <p style={{ fontFamily:'Barlow', fontSize:12, color:'#9ca3af', margin:0 }}>{p.categorie||'—'} · {p.prix} MAD</p>
                        </div>

                        {/* Badges rapides */}
                        <div style={{ display:'flex', flexDirection:'column', gap:5, flexShrink:0 }}>
                          <div onClick={()=>toggleDispo(p)} style={{ cursor:'pointer' }}>
                            <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, fontFamily:'Barlow', background:p.stock>0?'#dcfce7':'#fee2e2', color:p.stock>0?'#16a34a':'#dc2626', whiteSpace:'nowrap', letterSpacing:'.03em' }}>
                              {p.stock>0?`✓ ${p.stock} dispo`:'✕ Épuisé'}
                            </span>
                          </div>
                          <div onClick={()=>toggleVedette(p)} style={{ cursor:'pointer' }}>
                            <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, fontFamily:'Barlow', background:p.vedette?'#fef3c7':'#f3f4f6', color:p.vedette?'#b45309':'#9ca3af', whiteSpace:'nowrap' }}>
                              {p.vedette?'⭐ Vedette':'☆ Standard'}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                          <button onClick={()=>ouvrirEdit(p)}
                            style={{ padding:'7px 12px', borderRadius:8, fontSize:12, fontFamily:'Barlow', fontWeight:600, cursor:'pointer', border:'1.5px solid #e5e7eb', background:'white', color:'#374151', transition:'all .15s', whiteSpace:'nowrap' }}
                            onMouseOver={e=>{ e.currentTarget.style.borderColor='#111'; e.currentTarget.style.color='#111' }}
                            onMouseOut={e=>{ e.currentTarget.style.borderColor='#e5e7eb'; e.currentTarget.style.color='#374151' }}>
                            ✏️ Modifier
                          </button>
                          <button onClick={()=>setConfirmDel(p.id)}
                            style={{ padding:'7px 10px', borderRadius:8, fontSize:12, cursor:'pointer', border:'1.5px solid #fee2e2', background:'#fef2f2', color:'#dc2626', transition:'all .15s' }}
                            onMouseOver={e=>e.currentTarget.style.background='#fecaca'}
                            onMouseOut={e=>e.currentTarget.style.background='#fef2f2'}>
                            🗑️
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  {prodFiltres.length===0 && <div style={{ textAlign:'center', padding:'60px 0', color:'#d1d5db', fontFamily:'Barlow', fontSize:13 }}>Aucun produit trouvé.</div>}
                </div>
              )}
            </div>
          )}

          {/* ════ PARAMÈTRES ════ */}
          {onglet==='parametres' && (
            <div>
              <h1 style={{ fontFamily:'Barlow Condensed', fontWeight:900, fontSize:28, color:'#111', textTransform:'uppercase', letterSpacing:'.04em', margin:'0 0 28px' }}>Paramètres</h1>
              <div style={{ display:'flex', flexDirection:'column', gap:14, maxWidth:520 }}>
                <div style={{ ...S.card, borderLeft:'4px solid #3b82f6' }}>
                  <h3 style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:15, color:'#111', textTransform:'uppercase', letterSpacing:'.04em', margin:'0 0 8px' }}>📸 Activer l'upload d'images</h3>
                  <p style={{ fontFamily:'Barlow', fontSize:13, color:'#6b7280', lineHeight:1.7, margin:0 }}>
                    Dans Supabase → Storage → New bucket → nom : <code style={{ background:'#f3f4f6', padding:'2px 6px', borderRadius:4, fontFamily:'monospace' }}>images</code> → activer <strong>Public</strong>
                  </p>
                </div>
                {[
                  { titre:'Boutique', desc:'WYL — Wear Your Legacy', icon:'🏪' },
                  { titre:'WhatsApp', desc:'+212 675-014485', icon:'💬' },
                  { titre:'Base de données', desc:'Supabase connectée ✓', icon:'🗄️' },
                  { titre:'Hébergement', desc:'Vercel — déploiement automatique', icon:'🌐' },
                ].map(item => (
                  <div key={item.titre} style={{ ...S.card, display:'flex', gap:14, alignItems:'center' }}>
                    <span style={{ fontSize:22, flexShrink:0 }}>{item.icon}</span>
                    <div>
                      <p style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:14, color:'#111', textTransform:'uppercase', letterSpacing:'.04em', margin:'0 0 2px' }}>{item.titre}</p>
                      <p style={{ fontFamily:'Barlow', fontSize:13, color:'#9ca3af', margin:0 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ══ MODAL Formulaire produit ══ */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div style={{ background:'white', borderRadius:16, padding:'28px 28px', width:'100%', maxWidth:560, maxHeight:'94vh', overflowY:'auto', boxShadow:'0 24px 64px rgba(0,0,0,.3)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h2 style={{ fontFamily:'Barlow Condensed', fontWeight:900, fontSize:22, color:'#111', textTransform:'uppercase', letterSpacing:'.04em', margin:0 }}>
                {editingId ? '✏️ Modifier le produit' : '+ Ajouter un produit'}
              </h2>
              <button onClick={()=>setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'#9ca3af', lineHeight:1 }}>✕</button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Nom */}
              <div>
                <label style={S.label}>Nom du produit *</label>
                <input type="text" placeholder="T-shirt WYL Classic" value={form.nom} onChange={e=>setForm(p=>({...p,nom:e.target.value}))}
                  style={S.input} onFocus={e=>e.currentTarget.style.borderColor='#111'} onBlur={e=>e.currentTarget.style.borderColor='#e5e7eb'}/>
              </div>

              {/* Prix + Catégorie */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={S.label}>Prix (MAD) *</label>
                  <input type="number" placeholder="199" value={form.prix} onChange={e=>setForm(p=>({...p,prix:e.target.value}))}
                    style={S.input} onFocus={e=>e.currentTarget.style.borderColor='#111'} onBlur={e=>e.currentTarget.style.borderColor='#e5e7eb'}/>
                </div>
                <div>
                  <label style={S.label}>Catégorie</label>
                  <input type="text" placeholder="T-shirts, Pantalons…" value={form.categorie} onChange={e=>setForm(p=>({...p,categorie:e.target.value}))}
                    style={S.input} onFocus={e=>e.currentTarget.style.borderColor='#111'} onBlur={e=>e.currentTarget.style.borderColor='#e5e7eb'}/>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={S.label}>Description</label>
                <textarea rows={3} placeholder="Description du produit…" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}
                  style={{ ...S.input, resize:'vertical', lineHeight:1.65 }}
                  onFocus={e=>e.currentTarget.style.borderColor='#111'} onBlur={e=>e.currentTarget.style.borderColor='#e5e7eb'}/>
              </div>

              {/* Stock */}
              <div style={{ background:'#f8f9fb', borderRadius:10, padding:'14px 16px' }}>
                <label style={{ ...S.label, marginBottom:12 }}>Disponibilité & stock</label>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                  <Toggle on={form.disponible} onChange={v=>setForm(p=>({...p,disponible:v}))}
                    label={form.disponible ? '✓ Disponible à la vente' : '✕ Hors vente (stock = 0)'}/>
                  {form.disponible && (
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <label style={{ fontFamily:'Barlow', fontSize:12, color:'#6b7280' }}>Stock :</label>
                      <input type="number" min="1" value={form.stock} onChange={e=>setForm(p=>({...p,stock:e.target.value}))}
                        style={{ ...S.input, width:80, textAlign:'center' }}/>
                    </div>
                  )}
                </div>
              </div>

              {/* Vedette */}
              <div style={{ background:'#fef9ec', borderRadius:10, padding:'14px 16px', border:'1px solid #fde68a' }}>
                <label style={{ ...S.label, color:'#92400e', marginBottom:10 }}>Mise en avant</label>
                <Toggle on={form.vedette} onChange={v=>setForm(p=>({...p,vedette:v}))}
                  label={form.vedette ? '⭐ Produit vedette — affiché en priorité sur le site' : '☆ Produit standard'}/>
                <p style={{ fontFamily:'Barlow', fontSize:11, color:'#b45309', marginTop:8, margin:'8px 0 0' }}>Les produits vedettes apparaissent dans la section "Best Sellers" de la page d'accueil.</p>
              </div>

              {/* Upload images */}
              <div>
                <label style={S.label}>Images du produit {images.length>0 && <span style={{ color:'#b76448' }}>({images.length})</span>}</label>
                <UploadZone onFiles={ajouterFichiers}/>
                {uploadProgress>0 && (
                  <div style={{ marginTop:10 }}>
                    <div style={{ height:4, background:'#e5e7eb', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${uploadProgress}%`, background:'#b76448', borderRadius:2, transition:'width .3s' }}/>
                    </div>
                    <p style={{ fontFamily:'Barlow', fontSize:11, color:'#9ca3af', marginTop:4 }}>Upload {uploadProgress}%…</p>
                  </div>
                )}
                {uploadError && (
                  <div style={{ marginTop:8, padding:'10px 14px', background:'#fee2e2', borderRadius:8, border:'1px solid #fecaca' }}>
                    <p style={{ fontFamily:'Barlow', fontSize:12, color:'#dc2626', fontWeight:600, margin:'0 0 4px' }}>❌ Erreur upload</p>
                    <p style={{ fontFamily:'Barlow', fontSize:11, color:'#991b1b', margin:0 }}>{uploadError}</p>
                    <button onClick={()=>setUploadError(null)} style={{ marginTop:6, fontSize:11, color:'#dc2626', background:'none', border:'none', cursor:'pointer', fontFamily:'Barlow', textDecoration:'underline' }}>Fermer</button>
                  </div>
                )}
                {/* Galerie */}
                {images.length>0 && (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginTop:12 }}>
                    {images.map((im,idx) => (
                      <div key={idx} style={{ position:'relative', aspectRatio:'1', borderRadius:8, overflow:'hidden', border: idx===0 ? '2px solid #b76448' : '1px solid #e5e7eb' }}>
                        <img src={im.url} alt="" loading="lazy" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                        {im.uploading && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.45)', display:'flex', alignItems:'center', justifyContent:'center' }}>⏳</div>}
                        {im.local && !im.uploading && <div style={{ position:'absolute', inset:0, background:'rgba(220,38,38,.65)', display:'flex', alignItems:'center', justifyContent:'center' }}>⚠️</div>}
                        <div style={{ position:'absolute', top:4, right:4, display:'flex', gap:3 }}>
                          {idx!==0 && <button onClick={()=>setPrimaire(idx)} style={{ background:'rgba(255,255,255,.9)', border:'none', borderRadius:4, width:22, height:22, cursor:'pointer', fontSize:10, display:'flex', alignItems:'center', justifyContent:'center' }}>⭐</button>}
                          <button onClick={()=>supprimerImage(idx)} style={{ background:'rgba(220,38,38,.9)', border:'none', borderRadius:4, width:22, height:22, cursor:'pointer', color:'white', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                        </div>
                        {idx===0 && <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'rgba(183,100,72,.85)', padding:'2px 0', textAlign:'center' }}><span style={{ fontFamily:'Barlow', fontSize:8, color:'white', letterSpacing:'.1em', fontWeight:700 }}>PRINCIPALE</span></div>}
                      </div>
                    ))}
                  </div>
                )}
                <p style={{ fontFamily:'Barlow', fontSize:11, color:'#9ca3af', marginTop:8 }}>⭐ = définir en image principale · La 1ère image est l'image principale</p>
              </div>

              {/* Boutons */}
              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button onClick={()=>setShowForm(false)}
                  style={{ flex:1, padding:'12px', fontFamily:'Barlow', fontSize:12, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', background:'white', border:'1.5px solid #e5e7eb', borderRadius:8, cursor:'pointer', color:'#6b7280', transition:'all .18s' }}
                  onMouseOver={e=>e.currentTarget.style.borderColor='#111'} onMouseOut={e=>e.currentTarget.style.borderColor='#e5e7eb'}>
                  Annuler
                </button>
                <button onClick={sauvegarder} disabled={saving}
                  style={{ flex:2, padding:'12px', fontFamily:'Barlow', fontSize:12, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', background: saving?'#9ca3af':'#111', color:'white', border:'none', borderRadius:8, cursor: saving?'not-allowed':'pointer', transition:'background .2s' }}
                  onMouseOver={e=>!saving&&(e.currentTarget.style.background='#333')} onMouseOut={e=>!saving&&(e.currentTarget.style.background='#111')}>
                  {saving ? '⏳ Sauvegarde…' : editingId ? '✓ Enregistrer' : '+ Créer le produit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL Confirmation suppression ══ */}
      {confirmDel && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'white', borderRadius:16, padding:36, width:'100%', maxWidth:360, textAlign:'center', boxShadow:'0 20px 60px rgba(0,0,0,.3)' }}>
            <div style={{ fontSize:40, marginBottom:14 }}>🗑️</div>
            <h2 style={{ fontFamily:'Barlow Condensed', fontWeight:900, fontSize:22, color:'#111', textTransform:'uppercase', letterSpacing:'.04em', margin:'0 0 10px' }}>Supprimer ce produit ?</h2>
            <p style={{ fontFamily:'Barlow', color:'#9ca3af', fontSize:13, marginBottom:24, lineHeight:1.65 }}>Cette action est irréversible et supprimera le produit définitivement.</p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>setConfirmDel(null)}
                style={{ flex:1, padding:'12px', fontFamily:'Barlow', fontSize:12, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', background:'white', border:'1.5px solid #e5e7eb', borderRadius:8, cursor:'pointer', transition:'all .18s' }}
                onMouseOver={e=>e.currentTarget.style.borderColor='#111'} onMouseOut={e=>e.currentTarget.style.borderColor='#e5e7eb'}>
                Annuler
              </button>
              <button onClick={()=>supprimerProduit(confirmDel)}
                style={{ flex:1, padding:'12px', fontFamily:'Barlow', fontSize:12, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', background:'#dc2626', color:'white', border:'none', borderRadius:8, cursor:'pointer', transition:'background .2s' }}
                onMouseOver={e=>e.currentTarget.style.background='#b91c1c'} onMouseOut={e=>e.currentTarget.style.background='#dc2626'}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ STYLES ══ */}
      <style>{`
        /* Sidebar toujours visible sur desktop */
        @media (min-width: 769px) {
          .admin-sidebar { transform: translateX(0) !important; }
        }
        /* Sur mobile : sidebar cachée, main sans margin */
        @media (max-width: 768px) {
          .admin-main-area { margin-left: 0 !important; }
          .admin-title-mobile { display: inline !important; }
        }
        @media (min-width: 769px) {
          .admin-title-mobile { display: none; }
        }
      `}</style>
    </div>
  )
}
