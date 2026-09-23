'use client';

import { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, Check, Palette, Music, Users, MapPin, Image as ImageIcon, Gift, Upload, Video } from 'lucide-react';
import Image from 'next/image';
import type { InvitationContentData, Package } from '@/types/invitation';

const themes = [
  { id: 'elegant', name: 'Elegant', gradient: 'from-primary/20 to-accent/20' },
  { id: 'rustic', name: 'Rustic', gradient: 'from-amber-100 to-orange-100' },
  { id: 'minimalist', name: 'Minimalist', gradient: 'from-gray-100 to-slate-100' },
  { id: 'floral', name: 'Floral', gradient: 'from-pink-100 to-rose-100' },
  { id: 'luxury', name: 'Luxury', gradient: 'from-yellow-100 to-amber-100' },
];

const musicOptions = [
  { id: 'default', name: 'Default (Piano)' },
  { id: 'romantic', name: 'Romantic Violin' },
  { id: 'modern', name: 'Modern Acoustic' },
  { id: 'classic', name: 'Classic Orchestra' },
];

interface FormEditorProps {
  formData: InvitationContentData;
  onUpdate: (updater: (prev: InvitationContentData) => InvitationContentData) => void;
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  selectedPackage: Package | null;
}

export function FormEditor({ formData, onUpdate, currentStep, onNext, onPrev, selectedPackage }: FormEditorProps) {
  const [expandedStep, setExpandedStep] = useState(0);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;

    const currentCount = formData.media.gallery.length;
    const availableSlots = (selectedPackage?.max_photos || 10) - currentCount;
    const filesToProcess = Array.from(files).slice(0, Math.max(availableSlots, 0));

    if (!filesToProcess.length) {
      alert('Maksimal foto untuk paket ini sudah tercapai');
      return;
    }

    const base64Images = await Promise.all(filesToProcess.map((file) => toBase64(file)));

    onUpdate((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        gallery: [...prev.media.gallery, ...base64Images],
      },
    }));
  };

  const handleVideoUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;

    const file = files[0];
    if (!file.type.startsWith('video/')) {
      alert('File harus berupa video');
      return;
    }

    const base64Video = await toBase64(file);

    onUpdate((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        video: base64Video,
      },
    }));
  };

  const toggleStep = (step: number) => {
    setExpandedStep(expandedStep === step ? -1 : step);
  };

  const isStepCompleted = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return !!formData.theme;
      case 1:
        return !!formData.couple.groom.full_name && !!formData.couple.bride.full_name;
      case 2:
        return formData.events.some((e) => e.date && e.location);
      case 3:
        return formData.love_stories.length > 0 && !!formData.love_stories[0].title;
      case 4:
        return formData.digital_gifts.accounts.some((a) => a.bank_name && a.account_number);
      default:
        return false;
    }
  };

  const steps = [
    {
      step: 1,
      title: 'Pilih Tema & Musik',
      icon: Palette,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-dark mb-3">Tema Undangan</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onUpdate((prev) => ({ ...prev, theme: theme.id }))}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.theme === theme.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/30'
                  }`}
                >
                  <div className={`w-full h-16 rounded-lg bg-gradient-to-br ${theme.gradient} mb-2`} />
                  <p className="text-sm font-medium text-dark text-center">{theme.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-3">Musik Background</label>
            <div className="grid grid-cols-2 gap-3">
              {musicOptions.map((music) => (
                <button
                  key={music.id}
                  type="button"
                  onClick={() => onUpdate((prev) => ({ ...prev, media: { ...prev.media, music: music.id } }))}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm ${
                    formData.media.music === music.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/30'
                  }`}
                >
                  {music.name}
                </button>
              ))}
            </div>
          </div>

          {selectedPackage?.allow_custom_domain && (
            <div>
              <label className="block text-sm font-medium text-dark mb-3">Custom Domain</label>
              <input
                type="text"
                value={formData.meta.title || ''}
                onChange={(e) =>
                  onUpdate((prev) => ({
                    ...prev,
                    meta: { ...prev.meta, title: e.target.value },
                  }))
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="contoh: undangan.pernikahan-sosi-dan-mamih.com"
              />
              <p className="text-xs text-dark/50 mt-1">Tersedia untuk paket {selectedPackage.name}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      step: 2,
      title: 'Data Pengantin',
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-dark uppercase tracking-wider">Pengantin Pria</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-dark/70 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.couple.groom.full_name}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      couple: {
                        ...prev.couple,
                        groom: { ...prev.couple.groom, full_name: e.target.value },
                      },
                    }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Nama lengkap pengantin pria"
                />
              </div>
              <div>
                <label className="block text-sm text-dark/70 mb-1">Nama Panggilan</label>
                <input
                  type="text"
                  value={formData.couple.groom.nickname || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      couple: {
                        ...prev.couple,
                        groom: { ...prev.couple.groom, nickname: e.target.value },
                      },
                    }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Nama panggilan"
                />
              </div>
              <div>
                <label className="block text-sm text-dark/70 mb-1">Nama Ayah</label>
                <input
                  type="text"
                  value={formData.couple.groom.father || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      couple: {
                        ...prev.couple,
                        groom: { ...prev.couple.groom, father: e.target.value },
                      },
                    }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Nama ayah"
                />
              </div>
              <div>
                <label className="block text-sm text-dark/70 mb-1">Nama Ibu</label>
                <input
                  type="text"
                  value={formData.couple.groom.mother || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      couple: {
                        ...prev.couple,
                        groom: { ...prev.couple.groom, mother: e.target.value },
                      },
                    }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Nama ibu"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-4">
            <h4 className="text-sm font-semibold text-dark uppercase tracking-wider">Pengantin Wanita</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-dark/70 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.couple.bride.full_name}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      couple: {
                        ...prev.couple,
                        bride: { ...prev.couple.bride, full_name: e.target.value },
                      },
                    }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Nama lengkap pengantin wanita"
                />
              </div>
              <div>
                <label className="block text-sm text-dark/70 mb-1">Nama Panggilan</label>
                <input
                  type="text"
                  value={formData.couple.bride.nickname || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      couple: {
                        ...prev.couple,
                        bride: { ...prev.couple.bride, nickname: e.target.value },
                      },
                    }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Nama panggilan"
                />
              </div>
              <div>
                <label className="block text-sm text-dark/70 mb-1">Nama Ayah</label>
                <input
                  type="text"
                  value={formData.couple.bride.father || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      couple: {
                        ...prev.couple,
                        bride: { ...prev.couple.bride, father: e.target.value },
                      },
                    }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Nama ayah"
                />
              </div>
              <div>
                <label className="block text-sm text-dark/70 mb-1">Nama Ibu</label>
                <input
                  type="text"
                  value={formData.couple.bride.mother || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      couple: {
                        ...prev.couple,
                        bride: { ...prev.couple.bride, mother: e.target.value },
                      },
                    }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Nama ibu"
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      step: 3,
      title: 'Acara & Lokasi',
      icon: MapPin,
      content: (
        <div className="space-y-6">
          {formData.events.map((event, index) => (
            <div key={event.id} className="p-6 bg-secondary rounded-xl space-y-4">
              <h4 className="font-semibold text-dark capitalize">{event.type} {index + 1}</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark/70 mb-1">Judul Acara</label>
                  <input
                    type="text"
                    value={event.title}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        events: prev.events.map((ev) => (ev.id === event.id ? { ...ev, title: e.target.value } : ev)),
                      }))
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Contoh: Akad Nikah"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark/70 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={event.date}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        events: prev.events.map((ev) => (ev.id === event.id ? { ...ev, date: e.target.value } : ev)),
                      }))
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark/70 mb-1">Waktu</label>
                  <input
                    type="time"
                    value={event.time}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        events: prev.events.map((ev) => (ev.id === event.id ? { ...ev, time: e.target.value } : ev)),
                      }))
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark/70 mb-1">Lokasi</label>
                  <input
                    type="text"
                    value={event.location}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        events: prev.events.map((ev) => (ev.id === event.id ? { ...ev, location: e.target.value } : ev)),
                      }))
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Nama tempat"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-dark/70 mb-1">Alamat Lengkap</label>
                  <textarea
                    value={event.address}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        events: prev.events.map((ev) => (ev.id === event.id ? { ...ev, address: e.target.value } : ev)),
                      }))
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    rows={2}
                    placeholder="Alamat lengkap lokasi acara"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-dark/70 mb-1">Google Maps URL</label>
                  <input
                    type="url"
                    value={event.maps_url || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        events: prev.events.map((ev) => (ev.id === event.id ? { ...ev, maps_url: e.target.value } : ev)),
                      }))
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      step: 4,
      title: 'Galeri & Cerita Cinta',
      icon: ImageIcon,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-dark mb-3">Galeri Foto</label>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleGalleryUpload(e.target.files)}
            />
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-dark/70 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Foto
            </button>
            <p className="text-xs text-dark/50 mt-1">
              {formData.media.gallery.length} / {selectedPackage?.max_photos || 10} foto
            </p>
            {formData.media.gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {formData.media.gallery.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image src={url} alt={`Gallery ${index + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        onUpdate((prev) => ({
                          ...prev,
                          media: {
                            ...prev.media,
                            gallery: prev.media.gallery.filter((_, i) => i !== index),
                          },
                        }))
                      }
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedPackage?.allow_video && (
            <div>
              <label className="block text-sm font-medium text-dark mb-3">Video Undangan</label>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleVideoUpload(e.target.files)}
              />
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-dark/70 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" />
                {formData.media.video ? 'Ganti Video' : 'Upload Video'}
              </button>
              {formData.media.video && (
                <div className="mt-2 relative">
                  <video src={formData.media.video} controls className="w-full rounded-lg" />
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate((prev) => ({
                        ...prev,
                        media: {
                          ...prev.media,
                          video: '',
                        },
                      }))
                    }
                    className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white rounded text-xs"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark mb-3">Cerita Cinta</label>
            {formData.love_stories.map((story, index) => (
              <div key={story.id} className="p-4 bg-secondary rounded-xl space-y-3 mb-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block-xs text-dark/70 mb-1">Judul Cerita</label>
                    <input
                      type="text"
                      value={story.title}
                      onChange={(e) =>
                        onUpdate((prev) => ({
                          ...prev,
                          love_stories: prev.love_stories.map((s) =>
                            s.id === story.id ? { ...s, title: e.target.value } : s
                          ),
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                      placeholder="Contoh: Pertama Kali Bertemu"
                    />
                  </div>
                  <div>
                    <label className="block-xs text-dark/70 mb-1">Tanggal</label>
                    <input
                      type="date"
                      value={story.date}
                      onChange={(e) =>
                        onUpdate((prev) => ({
                          ...prev,
                          love_stories: prev.love_stories.map((s) =>
                            s.id === story.id ? { ...s, date: e.target.value } : s
                          ),
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block-xs text-dark/70 mb-1">Deskripsi</label>
                  <textarea
                    value={story.description}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        love_stories: prev.love_stories.map((s) =>
                          s.id === story.id ? { ...s, description: e.target.value } : s
                        ),
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-sm"
                    rows={2}
                    placeholder="Ceritakan momen spesial ini..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      step: 5,
      title: 'Amplop Digital',
      icon: Gift,
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="enable-gifts"
              checked={formData.digital_gifts.enabled}
              onChange={(e) =>
                onUpdate((prev) => ({
                  ...prev,
                  digital_gifts: { ...prev.digital_gifts, enabled: e.target.checked },
                }))
              }
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <label htmlFor="enable-gifts" className="text-sm font-medium text-dark">
              Aktifkan Amplop Digital
            </label>
          </div>

          {formData.digital_gifts.enabled && (
            <div className="space-y-4">
              {formData.digital_gifts.accounts.map((account, index) => (
                <div key={index} className="p-4 bg-secondary rounded-xl space-y-3">
                  <h4 className="text-sm font-semibold text-dark">Rekening {index + 1}</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-dark/70 mb-1">Nama Bank</label>
                      <input
                        type="text"
                        value={account.bank_name}
                        onChange={(e) =>
                          onUpdate((prev) => ({
                            ...prev,
                            digital_gifts: {
                              ...prev.digital_gifts,
                              accounts: prev.digital_gifts.accounts.map((acc, i) =>
                                i === index ? { ...acc, bank_name: e.target.value } : acc
                              ),
                            },
                          }))
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                        placeholder="Contoh: BCA"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-dark/70 mb-1">Nomor Rekening</label>
                      <input
                        type="text"
                        value={account.account_number}
                        onChange={(e) =>
                          onUpdate((prev) => ({
                            ...prev,
                            digital_gifts: {
                              ...prev.digital_gifts,
                              accounts: prev.digital_gifts.accounts.map((acc, i) =>
                                i === index ? { ...acc, account_number: e.target.value } : acc
                              ),
                            },
                          }))
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                        placeholder="1234567890"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-dark/70 mb-1">Atas Nama</label>
                      <input
                        type="text"
                        value={account.account_name}
                        onChange={(e) =>
                          onUpdate((prev) => ({
                            ...prev,
                            digital_gifts: {
                              ...prev.digital_gifts,
                              accounts: prev.digital_gifts.accounts.map((acc, i) =>
                                i === index ? { ...acc, account_name: e.target.value } : acc
                              ),
                            },
                          }))
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                        placeholder="Nama pemilik rekening"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isExpanded = expandedStep === index;
        const isCompleted = isStepCompleted(index);

        return (
          <div
            key={step.step}
            className={`border-2 rounded-xl transition-all duration-300 ${
              isExpanded ? 'border-primary bg-white shadow-lg' : 'border-gray-200 bg-white hover:border-primary/30'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleStep(index)}
              className="w-full px-6 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-dark">Step {step.step}: {step.title}</h3>
                  <p className="text-sm text-dark/60">Lengkapi data untuk langkah ini</p>
                </div>
              </div>
              {isExpanded ? <ChevronUp className="w-5 h-5 text-dark/50" /> : <ChevronDown className="w-5 h-5 text-dark/50" />}
            </button>

            {isExpanded && (
              <div className="px-6 pb-6">
                <div className="border-t border-gray-100 pt-6">
                  {step.content}
                </div>
                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={onPrev}
                    disabled={index === 0}
                    className="px-6 py-2 rounded-lg border-2 border-gray-200 text-dark font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary/30 transition-colors"
                  >
                    Sebelumnya
                  </button>
                  {index < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={onNext}
                      className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-light transition-colors"
                    >
                      Selanjutnya
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onNext}
                      className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-light transition-colors"
                    >
                      Selesai
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
