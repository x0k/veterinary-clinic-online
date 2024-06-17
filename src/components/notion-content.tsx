'use client'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import type { ExtendedRecordMap } from 'notion-types'
import { type NotionComponents, NotionRenderer } from 'react-notion-x'
import 'react-notion-x/src/styles.css'

export interface ContentProps {
  recordMap: ExtendedRecordMap
  pageUrlPrefix?: string
}

const Collection = dynamic(async () => {
  const { Collection } = await import(
    'react-notion-x/build/third-party/collection'
  )
  return Collection
})

const notionComponents: Partial<NotionComponents> = {
  Collection,
  nextImage: Image,
  nextLink: Link,
}

export function NotionContent({
  recordMap,
  pageUrlPrefix,
}: ContentProps): JSX.Element {
  return (
    <NotionRenderer
      darkMode
      recordMap={recordMap}
      components={notionComponents}
      mapPageUrl={pageUrlPrefix ? (id) => `${pageUrlPrefix}/${id}` : undefined}
      linkTableTitleProperties={false}
    />
  )
}
