'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import type { InvitationContentData } from '@/types/invitation';

interface LoveStoryProps {
  loveStories: InvitationContentData['love_stories'];
}

export function LoveStory({ loveStories }: LoveStoryProps) {
  if (!loveStories.length) return null;

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-serif text-dark mb-4">
            Cerita <span className="text-primary">Cinta</span>
          </h2>
          <p className="text-dark/60">Perjalanan cinta kami</p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-primary/20 hidden md:block" />

          <div className="space-y-12">
            {loveStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative flex gap-8 items-start"
              >
                <div className="hidden md:flex w-16 h-16 rounded-full bg-primary/10 items-center justify-center flex-shrink-0 z-10">
                  <Heart className="w-6 h-6 text-primary" />
                </div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="flex-1 bg-white rounded-2xl p-6 shadow-md"
                >
                  {story.photo && (
                    <img
                      src={story.photo}
                      alt={story.title}
                      className="w-full h-48 object-cover rounded-xl mb-4"
                    />
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-primary font-medium">
                      {story.date && new Date(story.date).toLocaleDateString('id-ID', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif text-dark mb-2">{story.title}</h3>
                  <p className="text-dark/60 text-sm leading-relaxed">{story.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
