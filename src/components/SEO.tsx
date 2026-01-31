import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  ogUrl?: string
  noIndex?: boolean
}

const DEFAULT_TITLE = 'Charge Finder - EV Charging Station Locator | Full-Stack Demo Portfolio Project'
const DEFAULT_DESCRIPTION =
  'A full-stack demo web application that helps electric vehicle owners find nearby charging stations. Frontend: React, TypeScript, Leaflet. Backend: Node.js, Express, Redis, MongoDB. A portfolio project showcasing modern full-stack web development skills.'
const DEFAULT_OG_IMAGE = '/og-image.png'
const SITE_URL = 'https://charge-finder-demo.vercel.app'

export function SEO({
  title,
  description,
  keywords,
  ogImage,
  ogUrl,
  noIndex = false,
}: SEOProps) {
  useEffect(() => {
    document.title = title ? `${title} | Charge Finder Demo` : DEFAULT_TITLE

    // Update or create meta tags
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name'
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attr, name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    // Description
    setMetaTag('description', description || DEFAULT_DESCRIPTION)

    // Keywords
    if (keywords) {
      setMetaTag('keywords', keywords)
    }

    // Open Graph
    setMetaTag('og:title', title ? `${title} | Charge Finder Demo` : DEFAULT_TITLE, true)
    setMetaTag('og:description', description || DEFAULT_DESCRIPTION, true)
    setMetaTag('og:image', ogImage || `${SITE_URL}${DEFAULT_OG_IMAGE}`, true)
    setMetaTag('og:url', ogUrl || SITE_URL, true)

    // Twitter
    setMetaTag('twitter:title', title ? `${title} | Charge Finder Demo` : DEFAULT_TITLE, true)
    setMetaTag('twitter:description', description || DEFAULT_DESCRIPTION, true)
    setMetaTag('twitter:image', ogImage || `${SITE_URL}${DEFAULT_OG_IMAGE}`, true)

    // No index
    if (noIndex) {
      setMetaTag('robots', 'noindex, nofollow')
    } else {
      setMetaTag('robots', 'index, follow')
    }

    // Cleanup on unmount
    return () => {
      // Optionally reset to defaults
    }
  }, [title, description, keywords, ogImage, ogUrl, noIndex])

  return null
  // This component doesn't render anything - it only manages document head
}
