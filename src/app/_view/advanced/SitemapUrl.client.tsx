import { cn } from "lazy-cn";
import type { GetSitemapActionResponse } from "./Sitemap.action";
import { ListPaginationMenu, ListSearchInputField, MaterialSymbolsSearchRounded, MdiSortReverseVariant, MdiSortVariant } from "./Sitemap.client";
import { MaterialSymbolsOpenInNew } from "../inputs/InputForm";
import type { ComponentProps } from "react";
import { usePagination, useSearchedEntries, useSortedEntries } from "@/app/lib/Table";
import { useAppNavigation } from "@/app/lib/searchParams";
import { formatDate } from "@/app/lib/date";

export function SitemapUrlList(props: {
  urls:
  NonNullable<
    NonNullable<
      GetSitemapActionResponse
    >['validated']['res']['urls']
  >,
  fullUrl: string,
}) {
  const { urls } = props
  const {
    search,
    searchedEntries,
    setSearch,
  } = useSearchedEntries(urls)
  const {
    sorts,
    sortedEntries,
    toggleSort
  } = useSortedEntries({ loc: 'string', lastmod: 'string' }, searchedEntries)
  const LIMIT = 10
  const {
    paginatedEntries,
    nextPage,
    prevPage,
    totalPages,
    page,
    hasNextPage,
    hasPrevPage,
  } = usePagination(LIMIT, sortedEntries)

  const navigation = useAppNavigation()

  return (
    <>
      {sortedEntries.length > 0
        && <ListSearchInputField search={search} setSearch={setSearch} />
      }
      <div className="px-2 relative">
        {/* TABLES CONTAINER */}
        <div className="items-end top-0  overflow-x-auto overflow-y-clip px-2">
          {/* Table */}
          <div className={cn(
            "bg-background-card text-foreground-muted rounded-t-xl  sticky min-w-200",
            "grid grid-cols-[2rem_4fr_9rem_1fr_1fr] gap-x-2",
            "-mx-2 px-2 *:pt-2 *:pb-1.5"
          )}>
            <div className=""></div>
            <button onClick={() => toggleSort('loc')} className="flex gap-2 items-center rounded-none text-xs font-semibold text-start">
              URL
              <SortIconTableHeader status={sorts.loc} />
            </button>
            <button onClick={() => toggleSort('lastmod')} className="flex gap-2 items-center rounded-none text-xs font-semibold place-self-center">
              Last Modified
              <SortIconTableHeader status={sorts.lastmod} />
            </button>
            <button onClick={() => toggleSort('changefreq')} className="flex gap-2 items-center rounded-none text-xs font-semibold place-self-center">
              Frequency
              <SortIconTableHeader status={sorts.changefreq} />
            </button>
            <button onClick={() => toggleSort('priority')} className="flex gap-2 items-center rounded-none text-xs font-semibold place-self-center">
              Priority
              <SortIconTableHeader status={sorts.priority} />
            </button>
          </div>

          <div className={cn(
            "fadeIn-0 col-span-5",
            "-mx-2 px-2",
            // "outline",
            "*:grid *:grid-cols-[2rem_4fr_9rem_1fr_1fr] *:gap-x-2",
            "*:min-w-200"
          )}>
            {paginatedEntries
              .map((url, i) => {
                return (
                  <div key={i} className="hover:bg-background-card-box -mx-2 px-2 py-1 bg-background-card">
                    <div className="flex gap-1 mt-0.5">
                      <a href={url.loc} target="_blank" className="underline opacity-60 hover:opacity-100">
                        <MaterialSymbolsOpenInNew className="w-3.5 h-3.5" />
                      </a>
                      <div
                        onClick={() => navigation.navigate('url', url.loc)}
                        className="underline opacity-60 hover:opacity-100 clickable">
                        <MaterialSymbolsSearchRounded className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="overflow-clip break-word">
                      {url.loc.split(props.fullUrl.split('://')[1])[1] || url.loc}
                    </div>
                    <div className="grid grid-cols-[5rem_4rem] overflow-hidden break-word">
                      <div className="overflow-hidden">
                        {formatDate(url.lastmod, 'mediumDate')}
                      </div>
                      <div className="overflow-hidden place-self-end">
                        {formatDate(url.lastmod, 'shortTime')}
                      </div>
                    </div>
                    <div className="break-word place-self-center">{url.changefreq ?? "-"}</div>
                    <div className="break-word place-self-center">{url.priority ?? "-"}</div>
                  </div>
                )
              })}
            <div className="h-2 rounded-b-md -mx-2 bg-background-card" />
          </div>
        </div>

        <ListPaginationMenu
          entriesCount={sortedEntries.length}
          LIMIT={LIMIT}
          page={page}
          totalPages={totalPages}
          nextPage={nextPage}
          prevPage={prevPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
        />
      </div>
    </>
  )
}


function SortIconTableHeader(props: {
  status: "asc" | "desc" | undefined,
}) {
  return <>
    {props.status === "asc" && <MdiSortReverseVariant />}
    {props.status === "desc" && <MdiSortVariant />}
  </>
}

// function CardDetailButton(props: ComponentProps<"button">) {
//   return (
//     <button
//       {...props}
//       className={cn(
//         "text-nowrap text-xs text-foreground-muted bg-background-button hover:bg-background-button-hover p-2 px-4 flex items-center gap-1 rounded-lg", props.className
//       )}
//     />
//   )
// }