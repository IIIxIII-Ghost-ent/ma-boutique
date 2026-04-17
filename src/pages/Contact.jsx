const NUMERO_WHATSAPP = '212675014485'

export default function Contact() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '56px 32px' }}>

        <div className="fade-up" style={{ marginBottom: 52 }}>
          <div className="accent-line line-accent-anim" style={{ marginBottom: 18 }} />
          <p style={{ fontFamily: 'Space Grotesk', fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Nous trouver</p>
          <h1 className="font-display" style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 700, color: 'var(--text-heading)' }}>Contactez-nous</h1>
        </div>

        <div className="fade-up delay-1" style={{ marginBottom: 44 }}>
          {[
            { num: '01', label: 'Localisation', value: 'Maroc' },
            { num: '02', label: 'Téléphone', value: '+212 675-014485' },
            { num: '03', label: 'WhatsApp', value: 'Disponible 9h – 19h' },
            { num: '04', label: 'Horaires', value: 'Lundi – Samedi' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', width: 24 }}>{item.num}</span>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.label}</span>
              </div>
              <span className="font-display" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-heading)' }}>{item.value}</span>
            </div>
          ))}
        </div>

        <div className="fade-up delay-2">
          <a href={"https://wa.me/" + NUMERO_WHATSAPP + "?text=" + encodeURIComponent('Bonjour, je voudrais des informations sur vos produits WYL.')}
            target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, width: '100%', padding: '18px', background: '#16a34a', color: 'white', textDecoration: 'none', borderRadius: 12, fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 14, letterSpacing: '0.06em', transition: 'opacity 0.2s, transform 0.2s', marginBottom: 12 }}
            onMouseOver={e => { e.currentTarget.style.opacity='0.9'; e.currentTarget.style.transform='translateY(-2px)'; }}
            onMouseOut={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)'; }}
          >
            <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Écrire sur WhatsApp
          </a>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Réponse garantie sous 24h</p>
        </div>
      </div>
    </div>
  )
}
