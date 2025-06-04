import type { HTMLElement } from "node-html-parser"

export function extractAuthorData(elements: HTMLElement[]) {
  const authors = new Map<string, { name: string, href?: string }>
  for (const curr of elements) {
    if (curr.tagName === "LINK") {
      const href = curr.getAttribute('href')
      const name = curr.nextElementSibling?.tagName === 'META' && curr.nextElementSibling.getAttribute('content')
      if (!href || !name || authors.has(name)) continue // Avoid overriding existing authors
      authors.set(name, { name, href })
    } else { // curr.tagName === META
      const name = curr.getAttribute('content')
      if (!name || authors.has(name)) continue // Avoid overriding existing authors
      authors.set(name, { name })
    }
  }
  return [...authors.values()]
}