import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import DocsSidebar from './components/DocsSidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Documentation - Blockchain Tool Management',
  description: 'Documentation for the decentralized tool management platform',
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <DocsSidebar />
      <main className="flex-1 p-8 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}