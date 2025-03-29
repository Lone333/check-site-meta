import { useState } from "react";

export function TableBase() { }

export function useTable<T extends Record<string, string | number>>(source: T) {
  const [search, setSearch] = useState<string>('')
}

export type AppTableRow = Record<string, string | number | undefined | null>

export function toSearchedEntries<T extends AppTableRow>(
  source: T[],
  search: string
) {
  return source
    .filter((entry) => {
      return Object
        .entries(entry)
        .some(([key, value]) => {
          if (value === undefined || value === null) return false
          return value
            .toString()
            .toLowerCase()
            .includes(search.toLowerCase())
        })
    })
}

export function toSortedEntries<T extends AppTableRow>(
  source: T[],
  sort: { [K in keyof T]: 'asc' | 'desc' | undefined }
) {
  return source
    .toSorted((first: T, second: T) => {
      if (!first || !second) return 0

      for (const x in sort) {
        const key = x as keyof T
        const sortValue = sort[key]
        if (!sortValue) continue

        const a = first[key]
        const b = second[key]

        if (typeof a === 'string' && typeof b === 'string') {
          if (sortValue === 'asc') return a.localeCompare(b)
          if (sortValue === 'desc') return b.localeCompare(a)
        }

        if (typeof a === 'number' && typeof b === 'number') {
          if (sortValue === 'asc') return a - b
          if (sortValue === 'desc') return b - a
        }
        continue
      }
      return 0
    })
}

export function useSearchedEntries<
  T extends AppTableRow,  
>(
  source: T[],
) {
  const [search, setSearch] = useState('')
  return {
    search,
    setSearch,
    searchedEntries: toSearchedEntries(source, search)
  }
}

export function useSortedEntries<
  T extends AppTableRow,
>(
  columns: { [K in keyof T]: 'string' | 'number' },
  source: T[],
) {
  const [sorts, setSorts] = useState(
    Object.fromEntries(
      Object.keys(columns).map((key) => [key, undefined])
    ) as { [K in keyof T]: 'asc' | 'desc' | undefined }
  )
  const toggleSort = (key: keyof T) => {
    setSorts((sorts) => {
      const sort = sorts[key]
      if (sort === 'asc') return { ...sorts, [key]: 'desc' }
      if (sort === 'desc') return { ...sorts, [key]: null }
      return { ...sorts, [key]: 'asc' }
    })
  }

  return {
    sorts,
    toggleSort,
    sortedEntries: toSortedEntries(source, sorts)
  }
}

export function usePagination<T>(
  limit: number,
  source: T[]
) {
  const [page, setPage] = useState(1)

  const hasNextPage = page * limit < source.length
  const hasPrevPage = page > 1
  const totalPages = Math.ceil(source.length / limit)

  function nextPage() { if (hasNextPage) setPage(page + 1) }
  function prevPage() { if (hasPrevPage) setPage(page - 1) }

  const paginatedEntries = source.slice((page - 1) * limit, page * limit)

  return {
    page,
    nextPage,
    prevPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    paginatedEntries
  }
}