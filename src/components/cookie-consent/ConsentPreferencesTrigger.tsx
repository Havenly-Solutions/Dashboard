'use client'

import { useState } from 'react'

interface ConsentPreferencesTriggerProps {
  text?: string
  className?: string
}

export default function ConsentPreferencesTrigger({ 
  text = 'Consent Preferences', 
  className = '' 
}: ConsentPreferencesTriggerProps) {
  const [showModal, setShowModal] = useState(false)

  const openPreferences = () => {
    // Dispatch custom event to trigger cookie preferences modal
    window.dispatchEvent(new CustomEvent('openCookiePreferences'))
    setShowModal(true)
  }

  return (
    <>
      <button
        onClick={openPreferences}
        className={className}
        style={{
          background: 'none',
          border: 'none',
          color: '#3030F1',
          textDecoration: 'underline',
          cursor: 'pointer',
          fontSize: 'inherit',
          fontFamily: 'inherit',
          padding: 0
        }}
      >
        {text}
      </button>
    </>
  )
}