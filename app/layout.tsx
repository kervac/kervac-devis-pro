import './globals.css'

export const metadata = {
  title: 'Kervac Devis PRO',
  description: 'Générateur de devis Kervac 3D & ArtTree Forge',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
