import { Fragment, Suspense, type ComponentProps } from "react"
import { getUrlFromQuery } from "./lib/parse-url"
import type { NextPageProps } from "./lib/next-types"
import { cn } from "lazy-cn"
import { getEnvironment, getVersion } from "./lib/version"
import { ThemeSwitcher } from "./theme-switch"
import { changelog } from "../../changelog"
import { HomeErrorCard } from "./module/error/ErrorCard"
import { getUserSettings } from "./lib/get-settings"
import { LinkPreviewPanel } from "./components/LinkPreviewPanel"
import { InputForm } from "./components/inputs/InputForm"
import { RecentSuggestions } from "./components/inputs/InputSuggestions"
import { AdvancedPanel } from "./components/advanced/AdvancedPanel"
import { $ } from "./util"
import { MetaInfoPanel } from "./components/SummaryPanel"
import { getSiteMetadata } from "./page.data"
import { LocalContextProvider } from "./context"
import { registerContext, searchParams } from "./lib/page-context"
import { AppDescription } from "./components/home/AppDescription"
import { silence } from "./lib/silence"

// Structure:
// 
//  query
//   ↓
//  url
//   ↓
//  root
//   ↓
//  metadata    
//   ↓
//  resolved metadata  ← descriptions
//   ↓             ↓
//  fields       previews
//


// Main Metadata Data -----------------------------

export default async function Home(context: NextPageProps) {
  registerContext(context)

  const query = await searchParams()
  const hasURL = !!query.url
  const searchId = Math.random()
  const url = getUrlFromQuery(query.url)

  const userSettings = await getUserSettings()
  const siteMetadata = url &&  silence(getSiteMetadata(url))
  

  return (
    <>
      <main className={cn(
        "min-h-screen",
        "container-sm lg:container-2xl font-medium font-sans",
        "px-8 lg:px-12 xl:px-24 ",
        "pb-40",
        "lg:grid lg:grid-cols-2 gap-x-8",
      )}>
        <div className="fcol min-h-[80vh] py-12">
          {/* Home Page */}
          <Header hidden={hasURL} />
          <InputForm query={query} settings={userSettings} />
          <RecentSuggestions hidden={hasURL} />
          {/* Detail Page */}
          <div className="fcol-8 pt-8">
            <Suspense key={searchId} fallback={<Loading />}>
              <$ truthy
                await={siteMetadata}
                then={metadata => <MetaInfoPanel metadata={metadata} />}
                catch={error => <HomeErrorCard error={error} />}
              />
            </Suspense>
          </div>
        </div>
        <div className="fcol-8/center pt-15 pb-12">
          {/* Home Page */}
          <div className="">
            <AppDescription closed={hasURL} version={getVersion()} />
            <Changelog hidden={hasURL} />
          </div>

          {/* Detail Page */}
          <Suspense key={searchId}>
            <$ truthy
              await={siteMetadata}
              then={metadata => <LinkPreviewPanel metadata={metadata} />}
            />
          </Suspense>
        </div>
        <div className="col-span-2">
          {/* Detail Page */}
          <Suspense key={searchId}>
            <$ truthy
              await={siteMetadata}
              then={metadata =>
                <LocalContextProvider>
                  <AdvancedPanel metadata={metadata} />
                </LocalContextProvider>
              }
            />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}

async function WithPageData(props: {
  url: string,
  children: (metadata: Awaited<ReturnType<typeof getSiteMetadata>>) => React.JSX.Element | null,
  fallback?: (err: unknown) => React.JSX.Element | null,
}) {
  if (!props.url) return
  try {
    const metadata = await getSiteMetadata(props.url)
    if (!metadata) 
      return <HomeErrorCard error={new Error("No metadata found")} />
    return props.children(metadata)
  } catch (error) {
    return props.fallback?.(error)
  }
}

// Components -----------------------------

async function Header(props: {
  hidden: boolean
}) {
  return (
    <header className="grid-rows-animate-data-closed duration-700 group no-overflow-anchor fadeIn-0"
      data-closed={props.hidden ? "" : undefined}>
      <div className="min-h-0">
        {/* Header Content */}
        <div className="mb-12 mt-20 lg:text-start fcol-0 lg:block g-closed:opacity-0 g-closed:translate-y-10 transition duration-700">
          <div className="text-5xl md:text-6xl lg:text-5xl xl:text-6xl tracking-[-0.08em] font-mono header-fill font-bold">
            check-site-meta
          </div>
          <div className="text-foreground-muted max-w-100 mt-2 font-sans text-xl g-closed:opacity-0 g-closed:translate-y-10 transition duration-700">
            100% local site metadata checker
          </div>
        </div>

      </div>
    </header>
  )
}


function Footer(props: ComponentProps<"footer">) {
  return (
    <footer {...props} className={cn("w-full min-h-[50vh] pb-40 pt-10 border-t border-border bg-background shadow-2xl", props.className)}>

      <div className="flex flex-wrap gap-y-8 container-md lg:container-2xl px-8 lg:px-12 xl:px-24 text-foreground-body  ">
        <div className="fcol grow font-mono">
          <div className="text-[1rem]/none font-semibold tracking-tight">
            npx check-site-meta
          </div>
          <div className="text-xs">
            {getVersion()} ({getEnvironment()})
          </div>
          <div className="text-xs mt-4 max-w-120">
            <span className="font-bold">check-site-meta</span> is a free, open-source npx executable that extracts metadata from
            web pages, including those served on localhost, and displays the results in a browser-based
            interface for review.
          </div>
          <div className="text-xs mt-4">
            Links:<br />
            https://checksitemeta.vercel.app/<br />
            https://checksitemeta.alfon.dev/<br />
          </div>
          <div className="mt-10 flex flex-wrap gap-6">
            {[
              ['npm', 'https://www.npmjs.com/package/check-site-meta'],
              ['github', 'https://github.com/alfonsusac/check-site-meta'],
              ['twitter', 'https://x.com/alfonsusac/status/1899798175512412648'],
              ['discord', 'https://discord.gg/DCNgFtCm'],
            ].map(e => (
              <a key={e[0]} className="button transition underline" href={e[1]} target="_blank">{e[0]}</a>
            ))}
          </div>
          <div className="mt-4">
            Made by <a href="https://alfon.dev">alfonsusac</a> • ©{new Date().getFullYear()} alfonsusac. All rights reserved.
          </div>
        </div>
        <div className="shrink-0">
          <ThemeSwitcher />
        </div>
      </div>

    </footer>
  )
}

function Loading() {
  return (
    <div>
      <div className="fadeIn-200">Loading...</div>
      <div className="fadeIn-2000">This takes longer than expected...</div>
    </div>
  )
}

function Changelog(props: {
  hidden?: boolean
}) {
  return (
    <div className="pt-15 w-full grid grid-rows-[1fr] closed:grid-rows-[0fr] overflow-hidden group transition-[grid-template-rows] duration-700" data-closed={props.hidden ? "" : undefined}>
      <div className="min-h-0 closed:opacity-0 transition-all duration-300 delay-100" data-closed={props.hidden ? "" : undefined}>
        <div className=" pb-4 text-foreground-muted-3 font-medium">
          changelog
        </div>
        <div className="grid grid-cols-[6rem_1fr] gap-y-4 text-foreground-muted text-base">
          {Object.entries(changelog).map(([version, changes]) => (
            <Fragment key={version}>
              <div className="text-foreground-muted-3">{version}</div>
              <ul className="">
                {changes.map((change, i) => <li key={i} className="text-foreground-muted-2/80 py-0.5 list-['-___']">{change}</li>)}
              </ul>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}