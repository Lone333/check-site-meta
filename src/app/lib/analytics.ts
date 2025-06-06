"use client"

export function logEvent(ev: string) {
  try {
    const version = document.querySelector('meta[name="version"]')?.getAttribute('content')
    const disableAnalytics = document.querySelector('meta[name="disable_analytics"]')?.getAttribute('content')
    if (
      !disableAnalytics
      && process.env.NODE_ENV === 'production'
    ) {
      fetch('https://alfon.dev/api/public/analytics', {
        method: 'POST',
        body: JSON.stringify({
          p: 'check-site-meta',
          e: ev,
          m: { version: version, falseReferer: true }
        })
      }).catch()
    }
    if (process.env.NODE_ENV === 'development')
      console.log('analytics', ev)
  } catch { }
}

export const logCheckButton = () => logEvent('check-button-clicked')
