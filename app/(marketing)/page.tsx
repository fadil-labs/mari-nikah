'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useInView } from 'framer-motion';
import { Heart, Sparkles, Check, Play, ChevronRight, Gift, Users, Calendar, CreditCard, Mail } from 'lucide-react';
import Link from 'next/link';

const themes = [
  {
    id: 'rustic',
    name: 'Rustic',
    description: 'Nuansa natural dan hangat dengan elemen kayu dan bunga kering',
    gradient: 'from-amber-100 to-orange-100',
    icon: '🌿',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Desain bersih dan elegan dengan fokus pada tipografi',
    gradient: 'from-gray-100 to-slate-100',
    icon: '◻️',
  },
  {
    id: 'floral',
    name: 'Floral',
    description: 'Keindahan bunga-bunga mewah dengan nuansa romantis',
    gradient: 'from-pink-100 to-rose-100',
    icon: '🌸',
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Kemewahan abadi dengan aksen gold dan velvet',
    gradient: 'from-yellow-100 to-amber-100',
    icon: '✨',
  },
];

const packages = [
  {
    id: 'basic',
    name: 'Basic',
    price: 25000,
    active_days: 30,
    max_photos: 10,
    allow_custom_domain: false,
    allow_custom_music: false,
    features: ['10 Foto', '1 Tema', '30 Hari Aktif', 'Support Email'],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 50000,
    active_days: 60,
    max_photos: 30,
    allow_custom_domain: false,
    allow_custom_music: true,
    features: ['30 Foto', 'Semua Tema', '60 Hari Aktif', 'Custom Music', 'Support WA'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 150000,
    active_days: 180,
    max_photos: 100,
    allow_custom_domain: true,
    allow_custom_music: true,
    features: ['100 Foto', 'Semua Tema', '180 Hari Aktif', 'Custom Domain', 'Custom Music', 'Priority Support'],
    bestValue: true,
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 300000,
    active_days: 270,
    max_photos: 300,
    allow_custom_domain: true,
    allow_custom_music: true,
    features: ['300 Foto', 'Semua Tema', '270 Hari Aktif', 'Custom Domain', 'Custom Music', 'Video Background', 'Dedicated Support'],
  },
  {
    id: 'exclusive',
    name: 'Exclusive',
    price: 1000000,
    active_days: 365,
    max_photos: 1000,
    allow_custom_domain: true,
    allow_custom_music: true,
    features: ['1000 Foto', 'Semua Tema', '365 Hari Aktif', 'Custom Domain', 'Custom Music', 'Video Background', 'White Label', '24/7 Support'],
  },
];

const steps = [
  {
    step: '01',
    title: 'Pilih Tema',
    description: 'Pilih dari berbagai tema elegan yang kami sediakan atau buat sesuai keinginan Anda',
    icon: Sparkles,
  },
  {
    step: '02',
    title: 'Isi Data Real-time',
    description: 'Masukkan data pernikahan, foto, dan informasi acara dengan editor yang mudah digunakan',
    icon: Users,
  },
  {
    step: '03',
    title: 'Bayar Instant & Aktif',
    description: 'Lakukan pembayaran dan undangan Anda langsung aktif dan siap dibagikan',
    icon: CreditCard,
  },
];

function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function MagneticButton({ children, href, className = '' }: { children: React.ReactNode; href: string; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.2);
    y.set((e.clientY - centerY) * 0.2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`relative inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-semibold rounded-full overflow-hidden group ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-primary-light to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="absolute inset-0 bg-shimmer bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-30" />
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.a>
  );
}

function FloatingCard() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className="relative w-full max-w-md aspect-[3/4] bg-white rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <div className="relative p-8 h-full flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Heart className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-2xl font-serif text-dark mb-2">The Wedding</h3>
        <p className="text-dark/60 mb-6">Undangan Digital Elegan</p>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-6" />
        <p className="text-sm text-dark/50">Saturday, 15 March 2025</p>
        <p className="text-primary font-medium mt-1">Grand Hotel Ballroom</p>
      </div>
      <div className="absolute top-4 right-4 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
    </motion.div>
  );
}

function ThemeCard({ theme }: { theme: typeof themes[0] }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.div
        className={`relative h-80 rounded-2xl overflow-hidden bg-gradient-to-br ${theme.gradient} p-6 cursor-pointer`}
        animate={{
          boxShadow: isHovered ? '0 20px 40px -10px rgba(212, 175, 55, 0.3)' : '0 4px 6px -1px rgba(0,0,0,0.1)',
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative h-full flex flex-col items-center justify-center text-center">
          <span className="text-6xl mb-4">{theme.icon}</span>
          <h3 className="text-2xl font-serif text-dark mb-2">{theme.name}</h3>
          <p className="text-sm text-dark/70 max-w-xs">{theme.description}</p>
        </div>
        <motion.div
          className="absolute inset-0 border-2 border-primary/0 rounded-2xl group-hover:border-primary/30 transition-colors duration-300"
          animate={{ borderColor: isHovered ? 'rgba(212, 175, 55, 0.3)' : 'rgba(212, 175, 55, 0)' }}
        />
      </motion.div>
      <motion.button
        className="mt-4 w-full py-3 bg-dark text-white rounded-xl font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Play className="w-4 h-4" />
        Live Preview
      </motion.button>
    </motion.div>
  );
}

function PricingCard({ pkg }: { pkg: typeof packages[0] }) {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <motion.div
      className={`relative h-full rounded-2xl p-6 transition-all duration-300 ${
        pkg.bestValue
          ? 'bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/30 scale-105'
          : 'bg-white border border-gray-100'
      }`}
      whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      onHoverStart={() => setIsSelected(true)}
      onHoverEnd={() => setIsSelected(false)}
    >
      {pkg.bestValue && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-bold rounded-full">
          BEST VALUE
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-xl font-serif text-dark mb-2">{pkg.name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-sm text-dark/60">Rp</span>
          <span className="text-3xl font-bold text-dark">{pkg.price.toLocaleString('id-ID')}</span>
        </div>
        <p className="text-sm text-dark/60 mt-1">{pkg.active_days} hari aktif</p>
      </div>
      <ul className="space-y-3 mb-6">
        {pkg.features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-dark/80">
            <Check className="w-4 h-4 text-primary flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={`/builder?package=${pkg.id}`}
        className={`block w-full py-3 rounded-xl font-medium text-center transition-all duration-300 ${
          pkg.bestValue
            ? 'bg-primary text-white hover:bg-primary-light'
            : 'bg-dark text-white hover:bg-dark/90'
        }`}
      >
        Buat Sekarang
      </Link>
    </motion.div>
  );
}

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="relative"
    >
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <step.icon className="w-8 h-8 text-primary" />
        </div>
        <div className="text-sm font-bold text-primary mb-2">{step.step}</div>
        <h3 className="text-xl font-serif text-dark mb-3">{step.title}</h3>
        <p className="text-dark/60 text-sm leading-relaxed">{step.description}</p>
      </div>
      {index < steps.length - 1 && (
        <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-transparent" />
      )}
    </motion.div>
  );
}

export default function LandingPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary via-secondary-light to-white">
        <FloatingParticles />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6"
              >
                <Sparkles className="w-4 h-4" />
                Platform Undangan Digital Terpercaya
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-serif text-dark mb-6 leading-tight"
              >
                Undangan Digital Pernikahan{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-primary">Elegan</span>
                  <motion.span
                    className="absolute bottom-1 left-0 w-full h-3 bg-primary/20 -z-10"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                </span>
                ,{' '}
                <span className="text-accent">Ceria</span>
                {' '}&{' '}
                <span className="text-primary-light">Serba Otomatis</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-dark/70 mb-8 max-w-lg mx-auto lg:mx-0"
              >
                Buat undangan digital yang memukau dalam hitungan menit. Pilih tema, isi data, dan bagikan ke tamu undangan Anda.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <MagneticButton href="/builder">
                  Buat Undangan Sekarang
                  <ChevronRight className="w-5 h-5" />
                </MagneticButton>
                <motion.a
                  href="#themes"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-dark font-semibold rounded-full border-2 border-dark/10 hover:border-primary/30 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Lihat Tema
                </motion.a>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex justify-center lg:justify-end"
            >
              <FloatingCard />
            </motion.div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-dark/30 rounded-full flex justify-center pt-2">
            <motion.div
              className="w-1 h-2 bg-dark/50 rounded-full"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Theme Catalog */}
      <section id="themes" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-serif text-dark mb-4">
              Katalog Tema <span className="text-primary">Undangan</span>
            </h2>
            <p className="text-dark/60 max-w-2xl mx-auto">
              Pilih dari berbagai tema yang telah kami desain dengan cermat untuk momen spesial Anda
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {themes.map((theme, index) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ThemeCard theme={theme} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-serif text-dark mb-4">
              Pilih Paket <span className="text-primary">Anda</span>
            </h2>
            <p className="text-dark/60 max-w-2xl mx-auto">
              Berbagai paket untuk memenuhi kebutuhan undangan digital Anda
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PricingCard pkg={pkg} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-serif text-dark mb-4">
              Cara <span className="text-primary">Kerja</span>
            </h2>
            <p className="text-dark/60 max-w-2xl mx-auto">
              Hanya 3 langkah mudah untuk memiliki undangan digital yang elegan
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <StepCard key={step.step} step={step} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl font-serif text-dark mb-6">
              Siap Membuat Undangan Digital Anda?
            </h2>
            <p className="text-lg text-dark/70 mb-8">
              Bergabung dengan ratusan pasangan yang telah mempercayai kami untuk momen spesial mereka
            </p>
            <MagneticButton href="/builder">
              Mulai Sekarang
              <ChevronRight className="w-5 h-5" />
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white/80 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
            <span>Powered by Mari Nikah</span>
            <span className="hidden sm:inline">|</span>
            <span>
              Developed by{' '}
              <a
                href="https://fadil-labs.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-light transition-colors duration-200"
              >
                Fadil Labs
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
