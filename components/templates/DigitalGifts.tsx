'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Copy, QrCode, X, Check } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import type { InvitationContentData } from '@/types/invitation';

interface DigitalGiftsProps {
  digitalGifts: InvitationContentData['digital_gifts'];
}

export function DigitalGifts({ digitalGifts }: DigitalGiftsProps) {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!digitalGifts.enabled || !digitalGifts.accounts.length) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-serif text-dark mb-4">
            Amplop <span className="text-primary">Digital</span>
          </h2>
          <p className="text-dark/60">Doa restu Anda adalah karunia yang sangat berarti</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {digitalGifts.accounts.map((account, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-dark">{account.bank_name}</h3>
                <span className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full">
                  Rekening {index + 1}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-xs text-dark/60 mb-1">Nomor Rekening</p>
                  <div className="flex items-center justify-between bg-white rounded-lg px-4 py-2">
                    <span className="font-mono font-semibold text-dark">{account.account_number}</span>
                    <button
                      onClick={() => copyToClipboard(account.account_number, index)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-dark/60" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-dark/60 mb-1">Atas Nama</p>
                  <p className="font-medium text-dark">{account.account_name}</p>
                </div>
              </div>

              {account.qris_image && (
                <button
                  onClick={() => setIsQRModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors"
                >
                  <QrCode className="w-5 h-5" />
                  Lihat QRIS
                </button>
              )}
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {isQRModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsQRModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-sm w-full relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setIsQRModalOpen(false)}
                  className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-dark/60" />
                </button>

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-dark mb-4">QRIS Pembayaran</h3>
                  <div className="w-64 h-64 mx-auto bg-gray-100 rounded-xl flex items-center justify-center mb-4 relative">
                    {digitalGifts.accounts[0]?.qris_image ? (
                      <Image
                        src={digitalGifts.accounts[0].qris_image}
                        alt="QRIS"
                        fill
                        className="object-contain p-4"
                      />
                    ) : (
                      <div className="text-center text-dark/40">
                        <QrCode className="w-16 h-16 mx-auto mb-2" />
                        <p className="text-sm">QRIS tidak tersedia</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
