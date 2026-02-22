import { useEffect } from 'react'
import axios from 'axios'

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'https://lyriczfashion.com'

interface MetaData {
  site_name: string
  logo_url: string | null
  favicon_url: string | null
  meta_title: string
  meta_description: string
  meta_keywords: string
  og_title: string
  og_description: string
  og_image: string
  og_url: string
  og_type: string
  twitter_card: string
  twitter_site: string
  twitter_title: string
  twitter_description: string
  twitter_image: string
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  if (!content) return
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel: string, href: string, type?: string) {
  if (!href) return
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
  if (type) el.setAttribute('type', type)
}

export default function MetaTags() {
  useEffect(() => {
    axios.get<MetaData>(`${API_BASE}/settings/meta-tags`)
      .then(({ data }) => {
        // Title
        if (data.meta_title) document.title = data.meta_title

        // Favicon
        if (data.favicon_url) {
          setLink('icon', data.favicon_url, 'image/png')
          setLink('shortcut icon', data.favicon_url)
          setLink('apple-touch-icon', data.favicon_url)
        }

        // SEO
        setMeta('description', data.meta_description)
        setMeta('keywords', data.meta_keywords)
        setMeta('author', data.site_name)

        // Open Graph
        setMeta('og:type', data.og_type, 'property')
        setMeta('og:url', data.og_url, 'property')
        setMeta('og:title', data.og_title, 'property')
        setMeta('og:description', data.og_description, 'property')
        setMeta('og:image', data.og_image, 'property')
        setMeta('og:image:width', '1200', 'property')
        setMeta('og:image:height', '630', 'property')
        setMeta('og:site_name', data.site_name, 'property')
        setMeta('og:locale', 'en_US', 'property')

        // Twitter Card
        setMeta('twitter:card', data.twitter_card)
        setMeta('twitter:title', data.twitter_title)
        setMeta('twitter:description', data.twitter_description)
        setMeta('twitter:image', data.twitter_image)
        if (data.twitter_site) setMeta('twitter:site', data.twitter_site)
      })
      .catch(() => {
        // Silently fail — default HTML meta tags remain
      })
  }, [])

  return null
}
