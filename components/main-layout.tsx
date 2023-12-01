import { type ReactNode } from 'react'

export interface MainLayoutProps {
  header: ReactNode
  children: ReactNode
}

export function MainLayout({ header, children }: MainLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-inherit flex flex-col">
      <div className="flex top-0 sticky mx-auto w-full max-w-3xl gap-2 p-4 text-xl md:text-3xl font-bold z-10 bg-inherit">
        {header}
      </div>
      <div className="mx-auto max-w-3xl px-4 grow flex flex-col">
        {children}
      </div>
    </div>
  )
}
