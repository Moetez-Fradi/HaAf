import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';


export const metadata: Metadata = {
  title: 'AgentHive - Decentralize Intelligence',
  description: 'A DePIN + AI Agents Marketplace for limitless innovation. Build the future of AI with decentralized intelligence.',
  keywords: 'AI, decentralized, marketplace, DePIN, Hedera, HBAR, AI agents, workflow builder',
  authors: [{ name: 'AgentHive Team' }],
  viewport: 'width=device-width, initial-scale=1',
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}

