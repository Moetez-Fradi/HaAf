'use client'

interface ProseContentProps {
  children: React.ReactNode
}

export default function ProseContent({ children }: ProseContentProps) {
  return (
    <div className="prose prose-invert max-w-none 
      prose-headings:text-gray-100
      prose-p:text-gray-300
      prose-a:text-blue-400
      prose-strong:text-gray-100
      prose-ul:text-gray-300
      prose-ol:text-gray-300
      prose-li:text-gray-300
      prose-pre:bg-gray-800
      prose-code:text-blue-300
      prose-code:bg-gray-800
      prose-code:before:content-none
      prose-code:after:content-none">
      {children}
    </div>
  )
}