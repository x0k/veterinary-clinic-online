import { type ReactNode } from 'react'

export interface MainLayoutProps {
  header: ReactNode
  children: ReactNode
}

export function MainLayout({ header, children }: MainLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-inherit flex flex-col scrollbar-gutter">
      <div className="w-full top-0 sticky mx-auto max-w-2xl z-10 bg-inherit">
        {header}
      </div>
      <div className="px-4 grow flex flex-col items-center">{children}</div>
    </div>
  )
}
