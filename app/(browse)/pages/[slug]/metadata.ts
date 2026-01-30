import { Metadata } from "next"

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  await props.params

  return {
    title: "Page not found",
    description: "This page is not available.",
    referrer: "origin-when-cross-origin",
    creator: "Blazity",
    publisher: "Blazity",
  }
}
