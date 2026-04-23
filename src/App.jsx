import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PanierProvider } from './context/PanierContext'
import Navbar from './components/Navbar'
import FooterComponent from './components/Footer'
import Shop from './pages/Shop'
import Catalogue from './pages/Catalogue'
import ProduitDetail from './pages/ProduitDetail'
import Contact from './pages/Contact'
import Panier from './pages/Panier'
import Admin from './pages/Admin'

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <FooterComponent />
    </>
  )
}

export default function App() {
  return (
    <PanierProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/catalogue" element={<Layout><Catalogue /></Layout>} />
          <Route path="/produit/:id" element={<Layout><ProduitDetail /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/panier" element={<Layout><Panier /></Layout>} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </PanierProvider>
  )
}
