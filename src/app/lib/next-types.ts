export type NextSearchQuery = Record<string, string | string[] | undefined>

export type NextPageProps = {
  searchParams: Promise<NextSearchQuery>
}
