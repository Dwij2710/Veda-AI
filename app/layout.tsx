import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VedaAI — AI Teacher\'s Toolkit',
  description: 'Upload a question paper and a student answer sheet to auto-map answers to questions and grade them.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
