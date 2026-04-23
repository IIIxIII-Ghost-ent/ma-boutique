import { createContext, useContext, useState, useMemo } from 'react'

const PanierContext = createContext()

export function PanierProvider({ children }) {
  const [panier, setPanier] = useState([])

  const ajouterAuPanier = (produit) => {
    setPanier(prev => {
      const existe = prev.find(p => p.id === produit.id && p.taille === produit.taille && p.couleur === produit.couleur)
      if (existe) {
        return prev.map(p =>
          (p.id === produit.id && p.taille === produit.taille && p.couleur === produit.couleur)
            ? { ...p, quantite: p.quantite + 1 }
            : p
        )
      }
      return [...prev, { ...produit, quantite: 1 }]
    })
  }

  const retirerDuPanier = (id, taille, couleur) => {
    setPanier(prev => prev.filter(p => !(p.id === id && p.taille === taille && p.couleur === couleur)))
  }

  const modifierQuantite = (id, taille, couleur, delta) => {
    setPanier(prev => prev.map(p => {
      if (p.id === id && p.taille === taille && p.couleur === couleur) {
        const nq = p.quantite + delta
        return nq <= 0 ? null : { ...p, quantite: nq }
      }
      return p
    }).filter(Boolean))
  }

  const viderPanier = () => setPanier([])

  // Memoize total to avoid recalculating on every render
  const total = useMemo(
    () => panier.reduce((acc, p) => acc + p.prix * p.quantite, 0),
    [panier]
  )

  const nbArticles = useMemo(
    () => panier.reduce((acc, p) => acc + p.quantite, 0),
    [panier]
  )

  return (
    <PanierContext.Provider value={{
      panier,
      ajouterAuPanier,
      retirerDuPanier,
      modifierQuantite,
      viderPanier,
      total,
      nbArticles,
    }}>
      {children}
    </PanierContext.Provider>
  )
}

export const usePanier = () => useContext(PanierContext)
