import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PanierProvider } from './context/PanierContext'
import Navbar from './components/Navbar'
import Shop from './pages/Shop'
import Catalogue from './pages/Catalogue'
import ProduitDetail from './pages/ProduitDetail'
import Contact from './pages/Contact'
import Panier from './pages/Panier'
import Admin from './pages/Admin'

function Footer() {
  return (
    <footer style={{ background: 'var(--primary)', padding: '52px 40px', marginTop: 80 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32 }}>
        <div>
          <p className="font-display" style={{ fontSize: 24, fontWeight: 700, color: 'white', letterSpacing: '0.12em', marginBottom: 8 }}>WYL</p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>Wear Your Legacy · Maroc</p>
        </div>
        <div style={{ display: 'flex', gap: 40, fontSize: 13 }}>
          {[['Catalogue', '/catalogue'], ['Contact', '/contact'], ['Panier', '/panier']].map(([l, h]) => (
            <a key={h} href={h} style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontFamily: 'Space Grotesk', letterSpacing: '0.05em', transition: 'color 0.2s' }}
              onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.45)'}>{l}</a>
          ))}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>© 2026 WYL. Tous droits réservés.</p>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 4 }}>Collection SS 2026</p>
        </div>
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
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/catalogue" element={<WithNav><Catalogue /></WithNav>} />
          <Route path="/produit/:id" element={<WithNav><ProduitDetail /></WithNav>} />
          <Route path="/contact" element={<WithNav><Contact /></WithNav>} />
          <Route path="/panier" element={<WithNav><Panier /></WithNav>} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </PanierProvider>
  )
}
