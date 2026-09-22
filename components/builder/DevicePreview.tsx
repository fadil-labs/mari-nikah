'use client';

import { motion } from 'framer-motion';
import { Smartphone, Monitor, Tablet } from 'lucide-react';
import type { InvitationContentData } from '@/types/invitation';

interface DevicePreviewProps {
  formData: InvitationContentData;
}

export function DevicePreview({ formData }: DevicePreviewProps) {
  return (
    <div className="sticky top-8 h-fit">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-dark px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 text-center">
            <div className="text-xs text-white/60">Preview Undangan</div>
          </div>
        </div>

        <div className="relative aspect-[9/16] bg-gradient-to-br from-secondary via-secondary-light to-white overflow-hidden">
          <motion.div
            layout
            className="p-6 h-full flex flex-col"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex-1 space-y-6">
              {formData.media.cover && (
                <motion.div layout className="w-full h-48 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <span className="text-4xl">📸</span>
                </motion.div>
              )}

              <motion.div layout className="text-center space-y-2">
                <h2 className="text-2xl font-serif text-dark">
                  {formData.couple.groom.full_name} & {formData.couple.bride.full_name}
                </h2>
                <p className="text-sm text-dark/60">The Wedding</p>
              </motion.div>

              {formData.events[0] && (
                <motion.div layout className="bg-white/80 backdrop-blur-sm rounded-xl p-4 space-y-2">
                  <h3 className="font-semibold text-dark text-center">{formData.events[0].title}</h3>
                  <p className="text-sm text-dark/70 text-center">
                    {formData.events[0].date && new Date(formData.events[0].date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  {formData.events[0].time && (
                    <p className="text-sm text-primary text-center">{formData.events[0].time} WIB</p>
                  )}
                  {formData.events[0].location && (
                    <p className="text-sm text-dark/60 text-center">{formData.events[0].location}</p>
                  )}
                </motion.div>
              )}

              {formData.love_stories.length > 0 && formData.love_stories[0].title && (
                <motion.div layout className="bg-white/60 rounded-xl p-4">
                  <h4 className="font-semibold text-dark text-sm mb-1">{formData.love_stories[0].title}</h4>
                  <p className="text-xs text-dark/60 line-clamp-2">{formData.love_stories[0].description}</p>
                </motion.div>
              )}

              {formData.digital_gifts.enabled && formData.digital_gifts.accounts[0]?.bank_name && (
                <motion.div layout className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4">
                  <h4 className="font-semibold text-dark text-sm mb-2">Amplop Digital</h4>
                  <div className="space-y-1">
                    <p className="text-xs text-dark/70">
                      {formData.digital_gifts.accounts[0].bank_name} - {formData.digital_gifts.accounts[0].account_number}
                    </p>
                    <p className="text-xs text-dark/60">{formData.digital_gifts.accounts[0].account_name}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-dark/50">
        <div className="flex items-center gap-1">
          <Monitor className="w-4 h-4" />
          <span className="text-xs">Desktop</span>
        </div>
        <div className="flex items-center gap-1">
          <Tablet className="w-4 h-4" />
          <span className="text-xs">Tablet</span>
        </div>
        <div className="flex items-center gap-1">
          <Smartphone className="w-4 h-4" />
          <span className="text-xs">Mobile</span>
        </div>
      </div>
    </div>
  );
}
