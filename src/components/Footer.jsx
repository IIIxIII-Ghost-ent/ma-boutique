import { Link } from 'react-router-dom'

const IcoIG = () => <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
const IcoTT = () => <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34l-.02-8.43a8.18 8.18 0 004.78 1.52V5.02a4.85 4.85 0 01-1-.33z"/></svg>
const IcoWA = () => <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>

// ─── Logos paiement réels ──────────────────────────────────────────────────

const FooterVisaLogo = () => (
  <div title="Visa" style={{ background: '#1A1F71', borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', height: 40 }}>
    <svg viewBox="0 0 750 471" xmlns="http://www.w3.org/2000/svg" style={{ width: 46, height: 28 }}>
      <path d="M278.2 334.5L309.4 137h49.4l-31.2 197.5h-49.4zm227.4-192.6c-9.8-3.7-25.2-7.7-44.4-7.7-49 0-83.5 24.8-83.8 60.3-.3 26.2 24.6 40.9 43.4 49.6 19.3 8.9 25.8 14.6 25.7 22.5-.1 12.1-15.4 17.7-29.7 17.7-19.9 0-30.4-2.8-46.7-9.6l-6.4-2.9-7 41.2c11.6 5.1 33 9.6 55.2 9.8 52.1 0 85.9-24.5 86.3-62.4.2-20.8-13-36.6-41.5-49.6-17.3-8.4-27.8-14-27.7-22.5 0-7.5 8.9-15.6 28.2-15.6 16.1-.3 27.7 3.3 36.8 7l4.4 2.1 6.2-39.9zm127.7-5.4h-38.3c-11.9 0-20.7 3.3-25.9 15.1l-73.5 166.3h52s8.5-22.5 10.5-27.5c5.7 0 56.6.1 63.8.1 1.5 6.4 6 27.4 6 27.4h46l-40.6-181.4zm-62.2 115.5c4.1-10.6 19.8-51.2 19.8-51.2-.3.5 4.1-10.6 6.6-17.5l3.4 15.8s9.5 44 11.5 53h-41.3zm-352.1-115.5l-48.5 134.4-5.2-25.3c-9-29-37.3-60.5-68.9-76.2l44.4 168 52.4-.1 78-200.8h-52.2z" fill="#fff"/>
      <path d="M152.3 136.8H74.1l-.6 3.7c60.9 14.8 101.2 50.6 117.9 93.6l-17-81.8c-2.9-11.3-11.6-14.9-22.1-15.5z" fill="#F9A533"/>
    </svg>
  </div>
)

const FooterMastercardLogo = () => (
  <div title="Mastercard" style={{ background: '#1c1c1c', borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', height: 40 }}>
    <svg viewBox="0 0 750 471" xmlns="http://www.w3.org/2000/svg" style={{ width: 46, height: 28 }}>
      <circle cx="271" cy="235.5" r="150" fill="#EB001B"/>
      <circle cx="479" cy="235.5" r="150" fill="#F79E1B"/>
      <path d="M375 106.8a150 150 0 0 1 0 257.4 150 150 0 0 1 0-257.4z" fill="#FF5F00"/>
    </svg>
  </div>
)

const FooterWaveLogo = () => (
  <div title="Wave Sénégal" style={{ background: '#1BA5E0', borderRadius: 8, padding: '6px 14px', display: 'flex', alignItems: 'center', height: 40 }}>
    <svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" style={{ width: 52, height: 22 }}>
      <text x="60" y="30" textAnchor="middle" fill="white" fontFamily="Arial Black, Impact, sans-serif" fontWeight="900" fontSize="28" letterSpacing="1">Wave</text>
    </svg>
  </div>
)

const FooterCashLogo = () => (
  <div title="Cash à la livraison" style={{ background: '#16a34a', borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, height: 40 }}>
    <span style={{ fontSize: 16 }}>💵</span>
    <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 800, fontSize: 10, color: 'white', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Cash</span>
  </div>
)

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">

          {/* Brand */}
          <div>
            <div className="footer-logo">WYL<span style={{ color: 'var(--accent)' }}>.</span></div>
            <p className="footer-tagline">
              Wear Your Legacy.<br />
              Streetwear authentique, fabriqué pour durer. Maroc.
            </p>
            <div className="social-links">
              {[
                { label: 'Instagram', href: '#', icon: <IcoIG /> },
                { label: 'TikTok', href: '#', icon: <IcoTT /> },
                { label: 'WhatsApp', href: 'https://wa.me/212675014485', icon: <IcoWA /> },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="social-link" aria-label={s.label}>{s.icon}</a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="footer-col-title">Navigation</p>
            <Link to="/" className="footer-link">Accueil</Link>
            <Link to="/catalogue" className="footer-link">Catalogue</Link>
            <Link to="/catalogue" className="footer-link">Nouveautés</Link>
            <Link to="/catalogue" className="footer-link">Best Sellers</Link>
          </div>

          {/* Service client */}
          <div>
            <p className="footer-col-title">Service client</p>
            <Link to="/contact" className="footer-link">Nous contacter</Link>
            <a href="https://wa.me/212675014485" target="_blank" rel="noreferrer" className="footer-link">WhatsApp</a>
            <span className="footer-link" style={{ cursor: 'default' }}>Livraison offerte au Maroc</span>
            <span className="footer-link" style={{ cursor: 'default' }}>Retours sous 30 jours</span>
            <span className="footer-link" style={{ cursor: 'default' }}>+212 675-014485</span>
          </div>

          {/* Paiement */}
          <div>
            <p className="footer-col-title">Paiement Sécurisé</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginBottom: 18, lineHeight: 1.7 }}>
              Transactions 100% sécurisées.<br />Paiement à la livraison disponible.
            </p>

            {/* Vrais logos paiement */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <FooterCashLogo />
              <FooterWaveLogo />
              <FooterVisaLogo />
              <FooterMastercardLogo />
            </div>

            {/* IBAN hint */}
            <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Barlow', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 5 }}>IBAN CIH Bank (Visa & Mastercard)</p>
              <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em' }}>MA64 2308 1558 6090 7211 0074 0060</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© 2026 WYL — Wear Your Legacy. Tous droits réservés.</p>
          <p className="footer-copy">Streetwear · Maroc · SS 2026</p>
        </div>
      </div>
    </footer>
  )
}
