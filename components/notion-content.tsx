'use client'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import type { ExtendedRecordMap } from 'notion-types'
import { type NotionComponents, NotionRenderer } from 'react-notion-x'
import { useColorMode } from '@chakra-ui/react'
import { Link } from '@chakra-ui/next-js'
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
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'
  return (
    <NotionRenderer
      darkMode={isDarkMode}
      recordMap={recordMap}
      components={notionComponents}
      mapPageUrl={pageUrlPrefix ? (id) => `${pageUrlPrefix}/${id}` : undefined}
      linkTableTitleProperties={false}
    />
  )
}
