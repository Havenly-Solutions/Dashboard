'use client'
import styles from './ConsentPreferencesTrigger.module.css'

interface ConsentPreferencesTriggerProps {
  text?: string
  className?: string
}

export default function ConsentPreferencesTrigger({ 
  text = 'Consent Preferences', 
  className = '' 
}: ConsentPreferencesTriggerProps) {
  const openPreferences = () => {
    // Dispatch custom event to trigger cookie preferences modal
    window.dispatchEvent(new CustomEvent('openCookiePreferences'))
  }

  return (
    <>
      <button
        onClick={openPreferences}
        className={`${styles.trigger} ${className}`}
      >
        {text}
      </button>
    </>
  )
}