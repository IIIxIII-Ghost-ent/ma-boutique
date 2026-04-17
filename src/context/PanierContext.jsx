import { createContext, useContext, useState } from 'react'

const PanierContext = createContext()

export function PanierProvider({ children }) {
  const [panier, setPanier] = useState([])

  const ajouterAuPanier = (produit) => {
    setPanier(prev => {
      const existe = prev.find(p => p.id === produit.id)
      if (existe) {
        return prev.map(p => p.id === produit.id ? { ...p, quantite: p.quantite + 1 } : p)
      }
      return [...prev, { ...produit, quantite: 1 }]
    })
  }

  const retirerDuPanier = (id) => {
    setPanier(prev => prev.filter(p => p.id !== id))
  }

  const viderPanier = () => setPanier([])

  const total = panier.reduce((acc, p) => acc + p.prix * p.quantite, 0)

  return (
    <PanierContext.Provider value={{ panier, ajouterAuPanier, retirerDuPanier, viderPanier, total }}>
      {children}
    </PanierContext.Provider>
  )
}

export const usePanier = () => useContext(PanierContext)