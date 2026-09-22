'use client';

import { Edit3, Eye } from 'lucide-react';

interface TabSwitcherProps {
  activeTab: 'edit' | 'preview';
  onTabChange: (tab: 'edit' | 'preview') => void;
}

export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex">
        <button
          type="button"
          onClick={() => onTabChange('edit')}
          className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${
            activeTab === 'edit'
              ? 'text-primary border-t-2 border-primary bg-primary/5'
              : 'text-dark/60 hover:text-dark'
          }`}
        >
          <Edit3 className="w-5 h-5" />
          <span>Edit Data</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('preview')}
          className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${
            activeTab === 'preview'
              ? 'text-primary border-t-2 border-primary bg-primary/5'
              : 'text-dark/60 hover:text-dark'
          }`}
        >
          <Eye className="w-5 h-5" />
          <span>Lihat Preview</span>
        </button>
      </div>
    </div>
  );
}
