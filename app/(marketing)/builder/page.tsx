'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FormEditor } from '@/components/builder/FormEditor';
import { DevicePreview } from '@/components/builder/DevicePreview';
import { CheckoutModal } from '@/components/builder/CheckoutModal';
import { TabSwitcher } from '@/components/builder/TabSwitcher';
import { useBuilderForm } from '@/components/builder/useBuilderForm';
import type { Package } from '@/types/invitation';

const packages: Package[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 25000,
    active_days: 30,
    max_photos: 10,
    allow_custom_domain: false,
    allow_custom_music: false,
    allow_video: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 50000,
    active_days: 60,
    max_photos: 30,
    allow_custom_domain: false,
    allow_custom_music: true,
    allow_video: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 150000,
    active_days: 180,
    max_photos: 100,
    allow_custom_domain: true,
    allow_custom_music: true,
    allow_video: true,
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 300000,
    active_days: 270,
    max_photos: 300,
    allow_custom_domain: true,
    allow_custom_music: true,
    allow_video: true,
  },
  {
    id: 'exclusive',
    name: 'Exclusive',
    price: 1000000,
    active_days: 365,
    max_photos: 1000,
    allow_custom_domain: true,
    allow_custom_music: true,
    allow_video: true,
  },
];

function BuilderContent() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get('package') || 'basic';
  const selectedPackage = packages.find((pkg) => pkg.id === packageId) || packages[0];
  
  const {
    formData,
    setFormData,
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    isCheckoutOpen,
    setIsCheckoutOpen,
  } = useBuilderForm(selectedPackage);

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    setFormData((prev) => ({ ...prev, theme: selectedPackage.id === 'basic' ? 'elegant' : prev.theme }));
  }, [packageId, selectedPackage, setFormData]);

  return (
    <div className="min-h-screen bg-secondary">
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
        .bg-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        }
      `}</style>

      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-dark hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium hidden sm:inline">Kembali</span>
              </Link>
              <div className="h-6 w-px bg-gray-200 hidden sm:block" />
              <h1 className="text-lg font-serif text-dark">Buat Undangan</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                <ShoppingBag className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">{selectedPackage.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-dark/60">
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">Live Preview</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <h2 className="text-2xl font-serif text-dark mb-2">Editor Undangan</h2>
              <p className="text-dark/60">
                Isi data undangan Anda dan lihat perubahan secara real-time di preview
              </p>
            </motion.div>

            <FormEditor
              formData={formData}
              onUpdate={setFormData}
              currentStep={currentStep}
              onNext={nextStep}
              onPrev={prevStep}
              selectedPackage={selectedPackage}
            />
          </div>

          <div className="order-1 lg:order-2 hidden lg:block">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="sticky top-24"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-dark">Preview</h3>
                <span className="text-xs text-dark/50 bg-gray-100 px-2 py-1 rounded-full">
                  Real-time
                </span>
              </div>
              <DevicePreview formData={formData} />
            </motion.div>
          </div>
        </div>
      </main>

      <div className="lg:hidden">
        {activeTab === 'edit' ? (
          <div className="pb-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <FormEditor
                formData={formData}
                onUpdate={setFormData}
                currentStep={currentStep}
                onNext={nextStep}
                onPrev={prevStep}
                selectedPackage={selectedPackage}
              />
            </div>
          </div>
        ) : (
          <div className="pb-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <DevicePreview formData={formData} />
            </div>
          </div>
        )}
      </div>

      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      <motion.button
        type="button"
        onClick={() => setIsCheckoutOpen(true)}
        className="fixed bottom-20 lg:bottom-8 right-8 z-40 px-6 py-4 bg-primary text-white rounded-full shadow-2xl font-semibold flex items-center gap-2 hover:bg-primary-light transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="hidden sm:inline">Aktifkan Undangan</span>
        <span className="sm:hidden">Aktifkan</span>
      </motion.button>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        formData={formData}
        selectedPackage={selectedPackage}
      />
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BuilderContent />
    </Suspense>
  );
}
