'use client';

import { useState, useCallback } from 'react';
import type { InvitationContentData, Package } from '@/types/invitation';

const initialFormData: InvitationContentData = {
  theme: 'elegant',
  meta: {
    title: '',
    description: '',
    author: '',
    keywords: [],
  },
  couple: {
    groom: {
      full_name: '',
      nickname: '',
      photo: '',
      father: '',
      mother: '',
    },
    bride: {
      full_name: '',
      nickname: '',
      photo: '',
      father: '',
      mother: '',
    },
  },
  events: [
    {
      id: '1',
      type: 'akad',
      title: 'Akad Nikah',
      date: '',
      time: '',
      location: '',
      address: '',
      maps_url: '',
      note: '',
    },
    {
      id: '2',
      type: 'resepsi',
      title: 'Resepsi',
      date: '',
      time: '',
      location: '',
      address: '',
      maps_url: '',
      note: '',
    },
  ],
  media: {
    cover: '',
    hero: '',
    music: '',
    gallery: [],
    video: '',
  },
  love_stories: [
    {
      id: '1',
      date: '',
      title: '',
      description: '',
      photo: '',
    },
  ],
  digital_gifts: {
    enabled: true,
    accounts: [
      {
        bank_name: '',
        account_number: '',
        account_name: '',
        qris_image: '',
      },
    ],
  },
  rsvp_settings: {
    enabled: true,
    deadline: '',
    contact_wa: '',
    message: '',
  },
};

export function useBuilderForm(pkg: Package | null) {
  const [formData, setFormData] = useState<InvitationContentData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const updateFormData = useCallback((updater: (prev: InvitationContentData) => InvitationContentData) => {
    setFormData((prev) => updater(prev));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStep(0);
  }, []);

  return {
    formData,
    setFormData: updateFormData,
    currentStep,
    setCurrentStep: goToStep,
    nextStep,
    prevStep,
    isCheckoutOpen,
    setIsCheckoutOpen,
    resetForm,
  };
}
