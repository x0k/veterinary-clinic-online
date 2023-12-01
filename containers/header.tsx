'use client'
import { type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { FaSignOutAlt, FaSignInAlt } from 'react-icons/fa'

import { AppRoute } from '@/models/app'
import { isAuthenticatedUser, isUnauthenticatedUser } from '@/models/user'
import { useUser } from '@/domains/user'
import { Links } from '@/components/links'

export interface HeaderContainerProps {
  title: ReactNode
}

export function HeaderContainer({ title }: HeaderContainerProps): JSX.Element {
  const pathname = usePathname() ?? ''
  const user = useUser()
  return (
    <div className="drawer">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col bg-base-100">
        {/* Navbar */}
        <div className="navbar gap-2 max-w-3xl mx-auto">
          <div className="flex-none sm:hidden">
            <label
              htmlFor="app-drawer"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-6 h-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          <div className="hidden sm:flex flex-1 flex-row gap-2 text-xl sm:text-3xl font-bold">
            <Links
              linkClassName="link link-hover text-neutral-content"
              activeLinkClassName="link link-hover text-white"
              pathname={pathname}
            >
              <Link href={AppRoute.Home} data-exact>
                Запись
              </Link>
              <Link href={AppRoute.Services}>Услуги</Link>
              <Link href={AppRoute.Info}>Информация</Link>
            </Links>
          </div>
          <div className="sm:hidden flex-1 text-xl font-bold text-white">
            {title}
          </div>
          <div className="flex-none">
            {isAuthenticatedUser(user) && (
              <button
                className="btn btn-ghost btn-sm sm:btn-md"
                onClick={() => {
                  void signOut()
                }}
              >
                Выйти
                <FaSignOutAlt />
              </button>
            )}
            {isUnauthenticatedUser(user) && (
              <button
                className="btn btn-ghost btn-sm sm:btn-md"
                onClick={() => {
                  void signIn()
                }}
              >
                Войти
                <FaSignInAlt />
              </button>
            )}
          </div>
        </div>
        {/* Page content here */}
      </div>
      <div className="drawer-side">
        <label
          htmlFor="app-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu p-4 w-80 min-h-full bg-base-200">
          {/* Sidebar content here */}
          <li>
            <a href={AppRoute.Home}>Запись</a>
          </li>
          <li>
            <a href={AppRoute.Services}>Услуги</a>
          </li>
          <li>
            <a href={AppRoute.Info}>Информация</a>
          </li>
        </ul>
      </div>
    </div>
  )
}
