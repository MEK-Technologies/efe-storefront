import { createElement, type ReactNode } from "react"
import { cn } from "utils/cn"

type RichTextNode = {
  type?: string
  children?: RichTextNode[]
  value?: string
  bold?: boolean
  italic?: boolean
  level?: number
  listType?: "ordered" | "unordered"
  url?: string
  target?: string
}

interface RichTextProps {
  data: string
  className?: string
}

function renderNodes(nodes: RichTextNode[] | undefined, keyPrefix: string): ReactNode[] {
  if (!nodes || nodes.length === 0) return []
  return nodes.map((node, index) => renderNode(node, `${keyPrefix}-${index}`))
}

function renderNode(node: RichTextNode, key: string): ReactNode {
  switch (node.type) {
    case "root":
      return <div key={key}>{renderNodes(node.children, key)}</div>
    case "paragraph":
      return (
        <p key={key} className="mb-4 text-gray-800 last:mb-0">
          {renderNodes(node.children, key)}
        </p>
      )
    case "heading": {
      const level = Math.min(Math.max(node.level ?? 2, 1), 6)
      const tagName = `h${level}` as const
      const headingClasses = {
        1: "text-3xl font-bold mb-6 last:mb-0",
        2: "text-2xl font-semibold mb-4 last:mb-0",
        3: "text-xl font-medium mb-3 last:mb-0",
        4: "text-lg font-medium mb-2 last:mb-0",
        5: "text-base font-medium mb-2 last:mb-0",
        6: "text-sm font-medium mb-1 last:mb-0",
      }

      return createElement(
        tagName,
        {
          key,
          className: headingClasses[level as keyof typeof headingClasses],
        },
        renderNodes(node.children, key)
      )
    }
    case "text": {
      let className = ""
      if (node.bold && node.italic) {
        className = "font-bold italic"
      } else if (node.bold) {
        className = "font-bold"
      } else if (node.italic) {
        className = "italic"
      }

      return className ? (
        <span key={key} className={className}>
          {node.value}
        </span>
      ) : (
        <span key={key}>{node.value}</span>
      )
    }
    case "list": {
      const ListTag = node.listType === "ordered" ? "ol" : "ul"
      const listClasses =
        node.listType === "ordered"
          ? cn("list-decimal list-outside mb-4 last:mb-0 pl-6")
          : cn("list-disc list-outside mb-4 last:mb-0 pl-6")

      return (
        <ListTag key={key} className={cn(listClasses, "text-balance")}> 
          {renderNodes(node.children, key)}
        </ListTag>
      )
    }
    case "list-item":
      return (
        <li key={key} className="mb-1 last:mb-0">
          {renderNodes(node.children, key)}
        </li>
      )
    case "link":
      return (
        <a
          key={key}
          href={node.url}
          className="text-blue-600 underline hover:text-blue-800"
          target={node.target || "_self"}
          rel={node.target === "_blank" ? "noreferrer" : undefined}
        >
          {renderNodes(node.children, key)}
        </a>
      )
    default:
      return <span key={key}>{renderNodes(node.children, key)}</span>
  }
}

export function RichText({ data, className }: RichTextProps) {
  if (!data) {
    return null
  }

  try {
    const parsed = JSON.parse(data) as RichTextNode
    return <div className={className}>{renderNode(parsed, "root")}</div>
  } catch {
    return <div className={className}>{data}</div>
  }
}
