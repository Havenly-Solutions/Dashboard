'use client'

import { useState, useEffect } from 'react'

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
}

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedPreferences = localStorage.getItem('cookie_preferences')
    if (!savedPreferences) {
      setShowBanner(true)
    } else {
      setPreferences(JSON.parse(savedPreferences))
    }

    // Listen for custom event to open preferences modal
    const handleOpenPreferences = () => {
      setShowPreferences(true)
      setShowBanner(false)
    }

    window.addEventListener('openCookiePreferences', handleOpenPreferences)
    return () => {
      window.removeEventListener('openCookiePreferences', handleOpenPreferences)
    }
  }, [])

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie_preferences', JSON.stringify(prefs))
    setPreferences(prefs)
    setShowBanner(false)
    setShowPreferences(false)
  }

  const acceptAll = () => {
    const allPrefs: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    }
    savePreferences(allPrefs)
  }

  const rejectAll = () => {
    const minimalPrefs: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    }
    savePreferences(minimalPrefs)
  }

  const handlePreferenceChange = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return // Necessary cookies cannot be disabled
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const saveCustomPreferences = () => {
    savePreferences(preferences)
  }

  if (!mounted) return null

  // Main banner
  if (showBanner && !showPreferences) {
    return (
      <>
        <style jsx global>{`
          .cookie-banner-overlay {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #ffffff;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            padding: 24px;
            font-family: Arial, sans-serif;
          }
          .cookie-banner-container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            flex-wrap: wrap;
          }
          .cookie-banner-content {
            flex: 1;
            min-width: 280px;
          }
          .cookie-banner-title {
            font-size: 18px;
            font-weight: 600;
            color: #000000;
            margin: 0 0 8px 0;
          }
          .cookie-banner-text {
            font-size: 14px;
            color: #595959;
            margin: 0;
            line-height: 1.5;
          }
          .cookie-banner-text a {
            color: #3030F1;
            text-decoration: underline;
          }
          .cookie-banner-buttons {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }
          .cookie-btn {
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
          }
          .cookie-btn-accept {
            background: #000000;
            color: #ffffff;
          }
          .cookie-btn-accept:hover {
            background: #333333;
          }
          .cookie-btn-reject {
            background: #ffffff;
            color: #000000;
            border: 1px solid #000000;
          }
          .cookie-btn-reject:hover {
            background: #f5f5f5;
          }
          .cookie-btn-preferences {
            background: transparent;
            color: #595959;
            text-decoration: underline;
            padding: 12px 16px;
          }
          .cookie-btn-preferences:hover {
            color: #000000;
          }
          @media (max-width: 768px) {
            .cookie-banner-container {
              flex-direction: column;
              align-items: flex-start;
            }
            .cookie-banner-buttons {
              width: 100%;
              justify-content: flex-start;
            }
          }
        `}</style>

        <div className="cookie-banner-overlay">
          <div className="cookie-banner-container">
            <div className="cookie-banner-content">
              <h3 className="cookie-banner-title">Cookie Policy</h3>
              <p className="cookie-banner-text">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                By clicking &quot;Accept All&quot;, you consent to our use of cookies. 
                Read our <a href="/cookie-policy">Cookie Policy</a>.
              </p>
            </div>
            <div className="cookie-banner-buttons">
              <button className="cookie-btn cookie-btn-preferences" onClick={() => setShowPreferences(true)}>
                Customize
              </button>
              <button className="cookie-btn cookie-btn-reject" onClick={rejectAll}>
                Reject All
              </button>
              <button className="cookie-btn cookie-btn-accept" onClick={acceptAll}>
                Accept All
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Preferences modal
  if (showPreferences) {
    return (
      <>
        <style jsx global>{`
          .cookie-preferences-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          .cookie-preferences-modal {
            background: #ffffff;
            border-radius: 12px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          }
          .cookie-preferences-header {
            padding: 24px;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .cookie-preferences-title {
            font-size: 20px;
            font-weight: 600;
            color: #000000;
            margin: 0;
          }
          .cookie-close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #595959;
            padding: 0;
            line-height: 1;
          }
          .cookie-close-btn:hover {
            color: #000000;
          }
          .cookie-preferences-body {
            padding: 24px;
          }
          .cookie-category {
            padding: 20px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .cookie-category:last-child {
            border-bottom: none;
          }
          .cookie-category-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }
          .cookie-category-title {
            font-size: 16px;
            font-weight: 600;
            color: #000000;
            margin: 0;
          }
          .cookie-category-required {
            font-size: 12px;
            color: #7f7f7f;
            background: #f5f5f5;
            padding: 4px 8px;
            border-radius: 4px;
          }
          .cookie-category-description {
            font-size: 14px;
            color: #595959;
            margin: 0 0 12px 0;
            line-height: 1.5;
          }
          .cookie-toggle {
            position: relative;
            width: 48px;
            height: 26px;
          }
          .cookie-toggle input {
            opacity: 0;
            width: 0;
            height: 0;
          }
          .cookie-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: 0.3s;
            border-radius: 26px;
          }
          .cookie-slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: 0.3s;
            border-radius: 50%;
          }
          .cookie-toggle input:checked + .cookie-slider {
            background-color: #000000;
          }
          .cookie-toggle input:checked + .cookie-slider:before {
            transform: translateX(22px);
          }
          .cookie-toggle input:disabled + .cookie-slider {
            background-color: #999;
            cursor: not-allowed;
          }
          .cookie-preferences-footer {
            padding: 24px;
            border-top: 1px solid #e0e0e0;
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            flex-wrap: wrap;
          }
          .cookie-btn {
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
          }
          .cookie-btn-save {
            background: #000000;
            color: #ffffff;
          }
          .cookie-btn-save:hover {
            background: #333333;
          }
          .cookie-btn-cancel {
            background: #ffffff;
            color: #000000;
            border: 1px solid #000000;
          }
          .cookie-btn-cancel:hover {
            background: #f5f5f5;
          }
        `}</style>

        <div className="cookie-preferences-overlay" onClick={(e) => e.target === e.currentTarget && setShowPreferences(false)}>
          <div className="cookie-preferences-modal">
            <div className="cookie-preferences-header">
              <h2 className="cookie-preferences-title">Cookie Preferences</h2>
              <button className="cookie-close-btn" onClick={() => setShowPreferences(false)}>×</button>
            </div>
            
            <div className="cookie-preferences-body">
              {/* Necessary Cookies */}
              <div className="cookie-category">
                <div className="cookie-category-header">
                  <h3 className="cookie-category-title">Necessary Cookies</h3>
                  <span className="cookie-category-required">Required</span>
                </div>
                <p className="cookie-category-description">
                  These cookies are essential for the website to function properly. They enable basic features like page navigation, secure areas access, and remembering your preferences. The website cannot function without these cookies.
                </p>
                <label className="cookie-toggle">
                  <input type="checkbox" checked={preferences.necessary} disabled />
                  <span className="cookie-slider"></span>
                </label>
              </div>

              {/* Analytics Cookies */}
              <div className="cookie-category">
                <div className="cookie-category-header">
                  <h3 className="cookie-category-title">Analytics Cookies</h3>
                </div>
                <p className="cookie-category-description">
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve the site performance and user experience.
                </p>
                <label className="cookie-toggle">
                  <input 
                    type="checkbox" 
                    checked={preferences.analytics} 
                    onChange={() => handlePreferenceChange('analytics')}
                  />
                  <span className="cookie-slider"></span>
                </label>
              </div>

              {/* Marketing Cookies */}
              <div className="cookie-category">
                <div className="cookie-category-header">
                  <h3 className="cookie-category-title">Marketing Cookies</h3>
                </div>
                <p className="cookie-category-description">
                  These cookies are used to track visitors across websites to display relevant and engaging advertisements. They help measure the effectiveness of advertising campaigns and may be set by our advertising partners.
                </p>
                <label className="cookie-toggle">
                  <input 
                    type="checkbox" 
                    checked={preferences.marketing} 
                    onChange={() => handlePreferenceChange('marketing')}
                  />
                  <span className="cookie-slider"></span>
                </label>
              </div>
            </div>

            <div className="cookie-preferences-footer">
              <button className="cookie-btn cookie-btn-cancel" onClick={() => setShowPreferences(false)}>
                Cancel
              </button>
              <button className="cookie-btn cookie-btn-save" onClick={saveCustomPreferences}>
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return null
}