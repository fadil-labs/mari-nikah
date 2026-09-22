'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CoverOverlay } from './CoverOverlay';
import { HeroSection } from './HeroSection';
import { CountdownTimer } from './CountdownTimer';
import { EventDetails } from './EventDetails';
import { Gallery } from './Gallery';
import { LoveStory } from './LoveStory';
import { DigitalGifts } from './DigitalGifts';
import { RSVPForm } from './RSVPForm';
import { Footer } from './Footer';
import type { InvitationContentData } from '@/types/invitation';

interface InvitationTemplateProps {
  contentData: InvitationContentData;
}

export function InvitationTemplate({ contentData }: InvitationTemplateProps) {
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const [guestName, setGuestName] = useState('');

  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const to = params.get('to');
    if (to && !guestName) {
      setGuestName(decodeURIComponent(to));
    }
  }

  const eventsWithDates = contentData.events.filter((e) => e.date);
  const targetDate = eventsWithDates[0]?.date || new Date().toISOString();

  return (
    <div className="min-h-screen">
      <AnimatePresence>
        {!isCoverOpen && (
          <CoverOverlay
            guestName={guestName}
            onOpen={() => setIsCoverOpen(true)}
            musicUrl={contentData.media.music}
          />
        )}
      </AnimatePresence>

      {isCoverOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <HeroSection contentData={contentData} />
          <CountdownTimer targetDate={targetDate} />
          <EventDetails events={contentData.events} />
          <Gallery gallery={contentData.media.gallery} />
          <LoveStory loveStories={contentData.love_stories} />
          <DigitalGifts digitalGifts={contentData.digital_gifts} />
          <RSVPForm contactWA={contentData.rsvp_settings.contact_wa} />
          <Footer />
        </motion.div>
      )}
    </div>
  );
}
