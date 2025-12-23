'use client'

import { usePathname } from 'next/navigation'

interface PageWrapperProps {
  children: React.ReactNode
}

export default function PageWrapper({ children }: PageWrapperProps) {
  const pathname = usePathname()

  return (
    <div
      key={pathname}
      className="animate-page-in"
    >
      {children}
    </div>
  )
}
