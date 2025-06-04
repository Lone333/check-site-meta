import type { HTMLElement } from "node-html-parser"

export function resolveFaviconElements(
  element: HTMLElement[]
) {
  const els = element.map(e => {
    return {
      rel: e.getAttribute("rel"),
      type: e.getAttribute("type"),
      sizes: e.getAttribute("sizes"),
      href: e.getAttribute("href"),
    }
  }).filter(e => e.href)

  const favicons = els.map(e => ({
    value: e.href,
    label: e.type ?? "unknown",
    source: `link[rel="${e.rel}"]`,
    sizes: e.sizes,
  }))

  // Add default favicons to try later

  favicons.push({
    value: "/favicon.ico",
    label: 'image/x-icon',
    source: 'direct link to /favicon.ico',
    sizes: undefined,
  })

  favicons.push({
    value: "/favicon.png",
    label: 'image/png',
    source: 'direct link to /favicon.png',
    sizes: undefined,
  })

  return favicons
}