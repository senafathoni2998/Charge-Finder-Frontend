import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  ogUrl?: string
  noIndex?: boolean
}

const DEFAULT_OG_IMAGE = '/og-image.png'
const SITE_URL = 'https://chargefinder.senafathoni.dev'

// Manages document title + meta tags and keeps them in sync with the active
// language. Rendered once at the app root; individual pages may override the
// title/description via props.
export function SEO({
  title,
  description,
  keywords,
  ogImage,
  ogUrl,
  noIndex = false,
}: SEOProps) {
  const { t, i18n } = useTranslation('seo')
  const lang = i18n.language?.startsWith('id') ? 'id' : 'en'

  useEffect(() => {
    const titleSuffix = t('titleSuffix')
    const defaultTitle = t('title')
    const resolvedDescription = description || t('description')
    const resolvedKeywords = keywords || t('keywords')
    const resolvedTitle = title ? `${title} | ${titleSuffix}` : defaultTitle
    const ogLocale = lang === 'id' ? 'id_ID' : 'en_US'
    const languageName = lang === 'id' ? 'Indonesian' : 'English'

    document.title = resolvedTitle

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

    // Primary
    setMetaTag('description', resolvedDescription)
    setMetaTag('keywords', resolvedKeywords)
    setMetaTag('language', languageName)

    // Open Graph
    setMetaTag('og:title', resolvedTitle, true)
    setMetaTag('og:description', resolvedDescription, true)
    setMetaTag('og:image', ogImage || `${SITE_URL}${DEFAULT_OG_IMAGE}`, true)
    setMetaTag('og:url', ogUrl || SITE_URL, true)
    setMetaTag('og:locale', ogLocale, true)

    // Twitter
    setMetaTag('twitter:title', resolvedTitle, true)
    setMetaTag('twitter:description', resolvedDescription, true)
    setMetaTag('twitter:image', ogImage || `${SITE_URL}${DEFAULT_OG_IMAGE}`, true)

    // No index
    setMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow')
  }, [t, lang, title, description, keywords, ogImage, ogUrl, noIndex])

  return null
  // This component doesn't render anything - it only manages document head
}
