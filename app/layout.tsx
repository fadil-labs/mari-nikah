import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mari Nikah - Undangan Digital Pernikahan Elegan',
  description: 'Platform undangan digital pernikahan elegan, ceria, dan serba otomatis. Buat undangan digital dalam hitungan menit.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-secondary antialiased">
        {children}
      </body>
    </html>
  );
}
