'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  {
    title: 'Getting Started',
    links: [
      { title: 'Introduction', href: '/docs' },
      { title: 'Quick Start', href: '/docs/quick-start' },
    ],
  },
  {
    title: 'Core Concepts',
    links: [
      { title: 'Tools', href: '/docs/tools' },
      { title: 'Workflows', href: '/docs/workflows' },
      { title: 'Hedera Integration', href: '/docs/hedera' },
      { title: 'Node System', href: '/docs/nodes' },
    ],
  },
  {
    title: 'User Guide',
    links: [
    //   { title: 'User Management', href: '' },
    //   { title: 'Tool Management', href: '' },
    //   { title: 'Workflow Creation', href: '' },
      { title: 'Wallet Integration', href: '/docs/wallet-integration' },
    ],
  },
    {
    title: 'Security',
    links: [
    //   { title: 'User Management', href: '' },
    //   { title: 'Tool Management', href: '' },
    //   { title: 'Workflow Creation', href: '' },
      { title: 'How we secure our platform', href: '/docs/security' },
    ],
  },
]

export default function DocsSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 min-h-screen bg-gray-800 border-r border-gray-700 px-4 py-6">
      <div className="space-y-8">
        {navigation.map((section) => (
          <div key={section.title}>
            <h5 className="mb-3 font-semibold text-gray-100">{section.title}</h5>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block px-3 py-2 text-sm rounded-md ${
                      pathname === link.href
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}