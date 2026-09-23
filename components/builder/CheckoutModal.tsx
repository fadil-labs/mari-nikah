'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Smartphone, Check, Copy, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { InvitationContentData, Package } from '@/types/invitation';
import { getMidtransClientKey } from '@/lib/payment/midtrans';
import { generateInvitationSlug } from '@/lib/invitation';

const MIDTRANS_CLIENT_KEY = getMidtransClientKey();

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: InvitationContentData;
  selectedPackage: Package | null;
}

export function CheckoutModal({ isOpen, onClose, formData, selectedPackage }: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [snapToken, setSnapToken] = useState('');
  const [isSnapLoaded, setIsSnapLoaded] = useState(false);

  const bankAccount = {
    bank: 'BCA',
    number: '1234567890',
    name: 'PT Mari Nikah Digital',
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  useEffect(() => {
    if (!snapToken || !isOpen) return;

    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
    script.onload = () => setIsSnapLoaded(true);
    script.onerror = () => console.error('Failed to load Midtrans Snap JS');
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      setIsSnapLoaded(false);
    };
  }, [snapToken, isOpen]);

  useEffect(() => {
    if (!isSnapLoaded || !snapToken || typeof window === 'undefined') return;

    try {
      if ((window as any).snap) {
        (window as any).snap.pay(snapToken, {
          onSuccess: (result: any) => {
            if (result.status_code === '200' && result.transaction_status === 'settlement') {
              alert('Pembayaran berhasil! Undangan Anda akan segera aktif.');
              onClose();
            } else if (result.transaction_status === 'pending') {
              alert('Pembayaran sedang diproses. Undangan akan aktif setelah pembayaran dikonfirmasi.');
              onClose();
            }
          },
          onPending: () => {
            alert('Pembayaran sedang diproses. Anda akan mendapatkan notifikasi setelah pembayaran berhasil.');
            onClose();
          },
          onError: () => {
            alert('Pembayaran gagal. Silakan coba lagi.');
          },
          onClose: () => {
            console.log('Midtrans popup closed');
          },
        });
      }
    } catch (error) {
      console.error('Midtrans Snap error:', error);
    }
  }, [isSnapLoaded, snapToken, onClose]);

  const handlePayment = async () => {
    if (!selectedPackage || !customerName || !customerEmail || !customerPhone) {
      alert('Mohon lengkapi data diri Anda');
      return;
    }

    if (!selectedPackage?.id) {
      alert('Silakan pilih paket terlebih dahulu');
      return;
    }

    setIsProcessing(true);

    try {
      const slug = generateInvitationSlug(formData.couple.groom.full_name, formData.couple.bride.full_name);

      const response = await fetch('/api/invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_phone: customerPhone,
          slug,
          theme_id: formData.theme,
          package_id: selectedPackage.id,
          content_data: formData,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const token = result.data.snap_token;

        if (token) {
          setSnapToken(token);
        } else {
          alert('Pembayaran berhasil! Undangan Anda akan segera aktif.');
          onClose();
        }
      } else {
        alert(result.message || 'Gagal membuat undangan');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Terjadi kesalahan saat memproses pembayaran');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedPackage) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-serif text-dark">Konfirmasi Pembayaran</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-dark/60" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-secondary rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-dark">Ringkasan Pesanan</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dark/60">Paket</span>
                    <span className="font-medium text-dark">{selectedPackage.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark/60">Masa Aktif</span>
                    <span className="font-medium text-dark">{selectedPackage.active_days} hari</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark/60">Tema</span>
                    <span className="font-medium text-dark capitalize">{formData.theme}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark/60">Maksimal Foto</span>
                    <span className="font-medium text-dark">{selectedPackage.max_photos} foto</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="font-semibold text-dark">Total</span>
                    <span className="font-bold text-primary text-lg">
                      Rp {selectedPackage.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-dark mb-3">Data Diri</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-dark/70 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Nama lengkap Anda"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-dark/70 mb-1">Email</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-dark/70 mb-1">Nomor WhatsApp</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="081234567890"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Pembayaran via Midtrans</p>
                    <p>Anda akan diarahkan ke halaman pembayaran Midtrans yang aman untuk menyelesaikan transaksi.</p>
                  </div>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={handlePayment}
                disabled={isProcessing || !customerName || !customerEmail || !customerPhone}
                className="w-full py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Bayar Sekarang
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
