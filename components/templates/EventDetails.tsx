'use client';

import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Navigation } from 'lucide-react';
import type { InvitationContentData } from '@/types/invitation';

interface EventDetailsProps {
  events: InvitationContentData['events'];
}

export function EventDetails({ events }: EventDetailsProps) {
  const akad = events.find((e) => e.type === 'akad');
  const resepsi = events.find((e) => e.type === 'resepsi');

  const EventCard = ({ event }: { event: typeof events[0] }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
    >
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-2xl font-serif text-dark">{event.title}</h3>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-dark">
              {event.date && new Date(event.date).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {event.time && (
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="font-medium text-dark">{event.time} WIB</p>
          </div>
        )}

        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-dark">{event.location}</p>
            {event.address && <p className="text-sm text-dark/60 mt-1">{event.address}</p>}
          </div>
        </div>
      </div>

      {event.maps_url && (
        <div className="flex gap-3">
          <a
            href={event.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors"
          >
            <Navigation className="w-4 h-4" />
            Google Maps
          </a>
        </div>
      )}
    </motion.div>
  );

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
            Detail <span className="text-primary">Acara</span>
          </h2>
          <p className="text-dark/60">Kami tunggu kehadiran Anda</p>
        </motion.div>

        <div className="space-y-8">
          {akad && <EventCard event={akad} />}
          {resepsi && <EventCard event={resepsi} />}
        </div>
      </div>
    </section>
  );
}
