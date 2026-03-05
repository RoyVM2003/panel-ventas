import React from 'react'

const MASCOT_SRC = 'https://osdemsdigital.com/wp-content/uploads/2026/03/WhatsApp_Image_2026-03-05_at_10.04.46_AM-removebg-preview.png'

export function MascotAssistant({ size = 'md', message, variant = 'hero' }) {
  const sizeClass =
    size === 'lg' ? 'mascot--lg' :
    size === 'sm' ? 'mascot--sm' :
    'mascot--md'

  const variantClass =
    variant === 'hero' ? 'mascot--hero' :
    variant === 'inline' ? 'mascot--inline' :
    variant === 'warning' ? 'mascot--warning' :
    'mascot--inline'

  if (!message) return null

  return (
    <div className={`mascot ${sizeClass} ${variantClass}`} aria-hidden="true">
      <div className="mascot-image-wrap">
        <img
          src={MASCOT_SRC}
          alt=""
          className="mascot-image"
          loading="lazy"
        />
      </div>
      <div className="mascot-bubble">
        <span className="mascot-bubble-text">{message}</span>
      </div>
    </div>
  )
}

