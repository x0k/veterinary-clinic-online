import { isString } from '@/lib/guards'
import { type ReactNode, Children, isValidElement } from 'react'

export interface LinksProps {
  children: ReactNode
  pathname: string
  linkClassName: string
  activeLinkClassName: string
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Links({
  linkClassName,
  activeLinkClassName,
  children,
  pathname,
}: LinksProps) {
  return (
    <>
      {Children.map(children, (child) => {
        if (!isValidElement(child) || !('href' in child.props)) {
          return child
        }
        const href = child.props.href
        return isString(href)
          ? {
              ...child,
              props: {
                ...child.props,
                className: (
                  child.props['data-exact']
                    ? child.props.href === pathname
                    : pathname.startsWith(href)
                )
                  ? activeLinkClassName
                  : linkClassName,
              },
            }
          : child
      })}
    </>
  )
}
