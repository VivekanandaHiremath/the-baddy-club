import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' })

export const metadata = {
  title: 'The Baddy Club — We Jump & Smash.',
  description: 'A weekend-driven social badminton club. Book a slot, show up, smash.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased text-foreground" style={{ backgroundColor: '#FCFAF6' }}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
