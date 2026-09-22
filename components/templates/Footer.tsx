'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-dark text-white/80 py-8">
      <div className="container mx-auto px-6 text-center">
        <p className="text-sm">
          Powered by Mari Nikah | Developed by{' '}
          <Link
            href="https://fadil-labs.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-light transition-colors duration-200"
          >
            Fadil Labs
          </Link>
        </p>
      </div>
    </footer>
  );
}
