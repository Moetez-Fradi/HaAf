'use client';


import React from 'react';
import Link from 'next/link';


export default function HomePage() {
 


  const values = [
    {
      icon: '🔓',
      title: 'Decentralization First',
      description: 'No single point of failure. Truly distributed AI execution across global node network.'
    },
    {
      icon: '⚡',
      title: 'Performance & Scale',
      description: 'Leverage distributed computing for massive parallel AI task execution.'
    },
    {
      icon: '🌍',
      title: 'Accessibility',
      description: 'Make advanced AI capabilities available to everyone, not just tech giants.'
    },
    {
      icon: '💰',
      title: 'Fair Economy',
      description: 'Direct value transfer to contributors - developers, node hosts, and builders.'
    }
  ];


  const features = [
    {
      title: 'Visual Workflow Builder',
      description: 'Drag-and-drop interface to compose complex AI pipelines without coding',
      capabilities: ['Node-based editor', 'Real-time preview', 'Template library', 'Version control']
    },
    {
      title: 'AI Marketplace',
      description: 'Discover, use, and monetize AI tools in our decentralized ecosystem',
      capabilities: ['Tool discovery', 'Usage analytics', 'Revenue sharing', 'Community ratings']
    },
    {
      title: 'DePIN Network',
      description: 'Global distributed computing network for reliable AI execution',
      capabilities: ['Auto-scaling', 'Geographic distribution', 'Fault tolerance', 'Low latency']
    },
    {
      title: 'HBAR Economy',
      description: 'Seamless micropayments and revenue distribution on Hedera network',
      capabilities: ['Instant settlements', 'Low fees', 'Transparent ledger', 'Multi-currency support']
    }
  ];


  return (
    <div className="min-h-screen bg-[#0a0b14] relative overflow-hidden flex flex-col">
      {/* Top Navigation Bar */}
      <div className="relative z-20 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-cyan-400">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.6"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span className="text-white text-xl font-bold">AgentHive</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
          <a href="#values" className="text-gray-300 hover:text-white transition-colors">Values</a>
          <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
          <a href="#team" className="text-gray-300 hover:text-white transition-colors">Team</a>
          <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
          <Link 
            href="/login" 
            className="px-4 py-2 rounded-md bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
          >
            Login In
          </Link>
        </div>
      </div>


      {/* Decorative waves */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-24 h-56 md:h-64 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-24 h-56 md:h-64 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 blur-3xl"
      />
     
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-4 py-20">
        <div className="w-full max-w-6xl text-center">
          {/* Logo and Title */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none" className="text-cyan-400">
              <path d="M16 2L2 9L16 16L30 9L16 2Z" fill="currentColor" opacity="0.8"/>
              <path d="M2 23L16 30L30 23" stroke="currentColor" strokeWidth="2.5"/>
              <path d="M2 16L16 23L30 16" stroke="currentColor" strokeWidth="2.5"/>
            </svg>
            <span className="text-white text-4xl font-bold">AgentHive</span>
          </div>
         
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
            Decentralize <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Intelligence</span>
          </h1>
          <p className="text-xl md:text-2xl text-cyan-400 mb-12 max-w-3xl mx-auto">
            Build the Future of AI. A DePIN + AI Agents Marketplace for limitless innovation.
          </p>


          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
            <Link
              href="/home"
              className="px-8 py-4 rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
            >
             Explore  Workflows & Tools
            </Link>
            <Link
              href="/builder"
              className="px-8 py-4 rounded-md bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold hover:bg-white/20 transition-all"
            >
              Become a Builder
            </Link>
          </div>


          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <div className="text-3xl font-bold text-cyan-400">100+</div>
              <div className="text-gray-400">AI Tools Available</div>
            </div>
            <div className="rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <div className="text-3xl font-bold text-cyan-400">500+</div>
              <div className="text-gray-400">Active Node Hosts</div>
            </div>
            <div className="rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <div className="text-3xl font-bold text-cyan-400">1k+</div>
              <div className="text-gray-400">Workflows Created</div>
            </div>
          </div>
        </div>
      </div>


      {/* Features Section */}
      <section id="features" className="relative z-10 px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">Powerful Features</h2>
          <p className="text-cyan-400 text-center mb-16 max-w-2xl mx-auto">
            Everything you need to build, deploy, and monetize AI applications in a decentralized ecosystem
          </p>
         
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:border-cyan-400/30 transition-all group">
                <h3 className="text-2xl font-bold text-cyan-400 mb-4 group-hover:text-cyan-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 mb-6">{feature.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  {feature.capabilities.map((capability, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                      {capability}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Values Section */}
      <section id="values" className="relative z-10 px-8 py-20 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">Our Values</h2>
          <p className="text-cyan-400 text-center mb-16 max-w-2xl mx-auto">
            The principles that guide everything we build at AgentHive
          </p>
         
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-2xl mb-6 mx-auto">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* About Section */}
      <section id="about" className="relative z-10 px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">About AgentHive</h2>
              <p className="text-gray-400 mb-6">
                AgentHive was born from a simple observation: while AI capabilities are advancing rapidly,
                access to these technologies remains centralized in the hands of a few tech giants.
              </p>
              <p className="text-gray-400 mb-6">
                We're building a decentralized platform where anyone can access, build, and monetize
                AI tools without gatekeepers. By combining DePIN (Decentralized Physical Infrastructure Networks)
                with containerized AI agents, we're creating a truly open AI ecosystem.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-2xl font-bold text-cyan-400 mb-2">2025</div>
                  <div className="text-gray-400 text-sm">Founded</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-cyan-400 mb-2">$4.2M</div>
                  <div className="text-gray-400 text-sm">Seed Funding</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-cyan-400 mb-2">15+</div>
                  <div className="text-gray-400 text-sm">Countries</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-cyan-400 mb-2">24/7</div>
                  <div className="text-gray-400 text-sm">Global Network</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Our Mission</h3>
              <p className="text-cyan-400 text-lg mb-6">
                "To democratize artificial intelligence by building the world's largest decentralized
                network of AI tools and compute resources, empowering developers and users alike."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">AC</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Alex Chen</div>
                  <div className="text-cyan-400 text-sm">Founder & CEO</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Contact Section */}
      <section id="contact" className="relative z-10 px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">Get In Touch</h2>
          <p className="text-cyan-400 text-center mb-12 max-w-2xl mx-auto">
            Have questions? Want to partner with us? We'd love to hear from you.
          </p>
         
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                />
                <textarea
                  placeholder="Your Message"
                  rows={6}
                  className="w-full rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all resize-none"
                ></textarea>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all"
                >
                  Send Message
                </button>
              </form>
            </div>
           
            <div className="space-y-6">
              <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Contact Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-cyan-400">
                      <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>Tunis,Tunisia</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-cyan-400">
                      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>hello@agenthive.ai</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-cyan-400">
                      <path d="M22 16.92V19.92C22 20.52 21.53 21 20.94 21C10.47 21 2 12.53 2 3.06C2 2.47 2.48 2 3.08 2H6.08C6.67 2 7.15 2.48 7.15 3.08C7.15 4.03 7.35 4.95 7.74 5.79C7.87 6.08 7.83 6.42 7.62 6.67L5.85 8.88C7.36 12.2 10.38 15.22 13.7 16.73L15.91 14.96C16.16 14.75 16.5 14.71 16.79 14.84C17.63 15.23 18.55 15.43 19.5 15.43C20.09 15.43 20.57 15.91 20.57 16.5L20.58 16.92H22Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>+216 58175046</span>
                  </div>
                </div>
              </div>
             
              <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  {['Twitter', 'GitHub', 'Discord', 'LinkedIn'].map((social) => (
                    <button
                      key={social}
                      className="flex-1 py-2 rounded-md bg-white/10 text-gray-400 hover:text-cyan-400 hover:bg-white/20 transition-all text-sm"
                    >
                      {social}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <div className="relative z-10 border-t border-white/10 px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-cyan-400">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.6"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span className="text-white text-xl font-bold">AgentHive</span>
              </div>
              <p className="text-gray-400 text-sm">Decentralized AI Agents Marketplace powered by Hedera Hashgraph.</p>
            </div>
           
            {[
              { title: 'Platform', links: ['Marketplace', 'Builder', 'Documentation', 'API Reference'] },
              { title: 'Company', links: ['About', 'Team', 'Careers', 'Blog'] },
              { title: 'Support', links: ['Contact', 'Help Center', 'Status', 'Community'] }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-bold text-white mb-4">{section.title}</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="hover:text-cyan-400 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
         
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-xs text-gray-500">
              © 2025 AgentHive. All rights reserved. Built on Hedera Hashgraph.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
