'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { InvitationContentData } from '@/types/invitation';

interface HeroSectionProps {
  contentData: InvitationContentData;
}

export function HeroSection({ contentData }: HeroSectionProps) {
  const { couple, media } = contentData;

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-secondary-light to-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_rgba(212,175,55,0.08),transparent_60%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-primary text-sm tracking-[0.3em] uppercase mb-6"
        >
          Pernikahan
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-serif text-dark mb-4"
        >
          {couple.groom.full_name} <span className="text-primary">&</span> {couple.bride.full_name}
        </motion.h1>

        {media.cover && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 mb-8 relative max-w-2xl mx-auto"
          >
            <Image
              src={media.cover}
              alt="Cover"
              fill
              className="rounded-2xl shadow-2xl object-cover aspect-video"
            />
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-dark/60 text-lg max-w-xl mx-auto"
        >
          Dengan memohon rahmat dan ridho Allah SWT, kami akan menyelenggarakan pernikahan
        </motion.p>
      </motion.div>
    </section>
  );
}
