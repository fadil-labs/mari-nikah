'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Volume2, VolumeX } from 'lucide-react';
import type { InvitationContentData } from '@/types/invitation';

interface CoverOverlayProps {
  guestName: string;
  onOpen: () => void;
  musicUrl?: string;
}

export function CoverOverlay({ guestName, onOpen, musicUrl }: CoverOverlayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (musicUrl && audioRef.current) {
      audioRef.current.src = musicUrl;
      audioRef.current.loop = true;
    }
  }, [musicUrl]);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleOpen = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
    onOpen();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-dark via-dark to-black"
      >
        {musicUrl && (
          <audio ref={audioRef} loop preload="none">
            <source src={musicUrl} type="audio/mpeg" />
          </audio>
        )}

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(212,175,55,0.1),transparent_70%)]" />
        </div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative z-10 text-center px-6 max-w-md mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-primary/20 flex items-center justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/30 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-primary/50" />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-primary text-sm tracking-[0.3em] uppercase mb-4"
          >
            Undangan Pernikahan
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-4xl sm:text-5xl font-serif text-white mb-4"
          >
            The Wedding
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-white/70 text-lg mb-12"
          >
            {guestName ? `Kepada Yth. ${guestName}` : 'Kepada Tamu Undangan'}
          </motion.p>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3, type: 'spring' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            className="px-10 py-4 bg-primary text-white rounded-full font-semibold text-lg hover:bg-primary-light transition-colors shadow-2xl"
          >
            Buka Undangan
          </motion.button>

          {musicUrl && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              onClick={toggleMusic}
              className="mt-8 mx-auto flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              <span className="text-sm">{isPlaying ? 'Matikan Musik' : 'Nyalakan Musik'}</span>
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
