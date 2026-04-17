import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PanierProvider } from './context/PanierContext'
import Navbar from './components/Navbar'

/* ── Lazy loading : chaque page chargée uniquement quand visitée ── */
const Shop         = lazy(() => import('./pages/Shop'))
const Catalogue    = lazy(() => import('./pages/Catalogue'))
const ProduitDetail = lazy(() => import('./pages/ProduitDetail'))
const Contact      = lazy(() => import('./pages/Contact'))
const Panier       = lazy(() => import('./pages/Panier'))
const Admin        = lazy(() => import('./pages/Admin'))

/* ── Skeleton de chargement minimal ── */
function PageLoader() {
  return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:32, height:32, border:'2px solid var(--border)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin-slow 0.8s linear infinite', margin:'0 auto 12px' }}/>
        <p style={{ fontFamily:'Space Grotesk', fontSize:11, color:'var(--text-muted)', letterSpacing:'0.2em' }}>CHARGEMENT…</p>
      </div>
    </div>
  )
}

/* ── Footer ── */
function Footer() {
  return (
    <footer style={{ background:'var(--primary)', padding:'48px 40px', marginTop:80 }}>
      <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:28 }}>
        <div>
          <p className="font-display" style={{ fontSize:22, fontWeight:700, color:'white', letterSpacing:'0.12em', marginBottom:6 }}>WYL</p>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13 }}>Wear Your Legacy · Maroc</p>
        </div>
        <div style={{ display:'flex', gap:36, fontSize:13 }}>
          {[['Catalogue','/catalogue'],['Contact','/contact'],['Panier','/panier']].map(([l,h]) => (
            <a key={h} href={h} style={{ color:'rgba(255,255,255,0.4)', textDecoration:'none', fontFamily:'Space Grotesk', transition:'color 0.2s' }}
              onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='rgba(255,255,255,0.4)'}>{l}</a>
          ))}
        </div>
        <p style={{ color:'rgba(255,255,255,0.2)', fontSize:12 }}>© 2026 WYL. Tous droits réservés.</p>
      </div>
    </footer>
  )
}

function WithNav({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <PanierProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Shop />} />
            <Route path="/catalogue" element={<WithNav><Catalogue /></WithNav>} />
            <Route path="/produit/:id" element={<WithNav><ProduitDetail /></WithNav>} />
            <Route path="/contact" element={<WithNav><Contact /></WithNav>} />
            <Route path="/panier" element={<WithNav><Panier /></WithNav>} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </PanierProvider>
  )
}
