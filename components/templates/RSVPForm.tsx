'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

interface RSVPFormProps {
  contactWA?: string;
}

export function RSVPForm({ contactWA }: RSVPFormProps) {
  const [formData, setFormData] = useState({ name: '', attendance: 'yes', message: '', guests: 1 });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      submittedAt: new Date().toISOString(),
    };

    if (contactWA) {
      window.open(`https://wa.me/${contactWA.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`RSVP dari ${formData.name}: ${formData.message}`)}`, '_blank');
    }

    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
    setFormData({ name: '', attendance: 'yes', message: '', guests: 1 });
  };

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-serif text-dark mb-4">
            RSVP & <span className="text-primary">Ucapan</span>
          </h2>
          <p className="text-dark/60">Konfirmasi kehadiran dan kirim ucapan</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          {isSubmitted ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-dark mb-2">Terima Kasih!</h3>
              <p className="text-dark/60">RSVP Anda telah kami terima</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Nama lengkap Anda"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">Konfirmasi Kehadiran</label>
                <select
                  value={formData.attendance}
                  onChange={(e) => setFormData({ ...formData, attendance: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option value="yes">Hadir</option>
                  <option value="maybe">Masih Ragu</option>
                  <option value="no">Tidak Hadir</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">Jumlah Tamu</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">Ucapan & Doa</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  placeholder="Tulis ucapan dan doa untuk kami..."
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-light transition-colors"
              >
                <Send className="w-5 h-5" />
                Kirim RSVP
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
