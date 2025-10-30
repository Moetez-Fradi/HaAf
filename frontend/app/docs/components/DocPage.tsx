'use client'

import { darkThemeClasses } from '../styles/theme'

interface DocPageProps {
  children: React.ReactNode
}

export default function DocPage({ children }: DocPageProps) {
  return (
    <div className={`${darkThemeClasses.prose}
      prose-headings:${darkThemeClasses.heading}
      prose-p:${darkThemeClasses.text}
      prose-a:${darkThemeClasses.link}
      prose-strong:${darkThemeClasses.heading}
      prose-ul:${darkThemeClasses.text}
      prose-ol:${darkThemeClasses.text}
      prose-li:${darkThemeClasses.text}
      prose-pre:${darkThemeClasses.codeBlock}
      prose-code:${darkThemeClasses.code}
      [&_pre]:p-4
      [&_code]:px-1
      [&_code]:py-0.5
      [&_code]:rounded-md
      [&_blockquote]:border-l-4
      [&_blockquote]:border-gray-700
      [&_blockquote]:bg-gray-800/30`}>
      {children}
    </div>
  )
}