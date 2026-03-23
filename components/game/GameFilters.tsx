'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, Download, Heart, Clock, ChevronDown, Filter } from 'lucide-react';

const sortOptions = [
  { label: 'Recentes', value: 'recent', icon: Clock },
  { label: 'Mais Vistos', value: 'views_desc', icon: Eye },
  { label: 'Menos Vistos', value: 'views_asc', icon: Eye },
  { label: 'Mais Baixados', value: 'downloads_desc', icon: Download },
  { label: 'Menos Baixados', value: 'downloads_asc', icon: Download },
  { label: 'Mais Votados', value: 'likes_desc', icon: Heart },
  { label: 'Menos Votados', value: 'likes_asc', icon: Heart },
];

export default function GameFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentSort = searchParams.get('sort') || 'recent';
  const currentLabel = sortOptions.find(opt => opt.value === currentSort)?.label || 'Recentes';

  const setSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(`/?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <div className="w-full lg:w-auto relative">
      {/* Botão para Mobile */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden w-full flex items-center justify-between px-5 py-4 bg-zinc-900 border border-white/10 rounded-2xl text-white font-bold text-sm"
      >
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-primary-500" />
          <span className="uppercase tracking-widest text-[10px]">Filtrar por:</span>
          <span className="text-primary-400">{currentLabel.toUpperCase()}</span>
        </div>
        <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Lista de Filtros (Desktop: Sempre visível | Mobile: Toggle) */}
      <div className={`
        ${isOpen ? 'flex animate-in fade-in slide-in-from-top-2 duration-300' : 'hidden'} 
        lg:flex flex-col lg:flex-row items-stretch lg:items-center gap-2 mt-3 lg:mt-0 
        p-2 lg:p-1 bg-zinc-900 lg:bg-zinc-900 border border-white/5 rounded-2xl lg:rounded-xl 
        absolute lg:relative z-50 w-full lg:w-auto shadow-2xl lg:shadow-none
      `}>
        {sortOptions.map((option) => {
          const Icon = option.icon;
          const isActive = currentSort === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => setSort(option.value)}
              className={`flex items-center gap-3 lg:gap-2 px-5 lg:px-4 py-3 lg:py-2 rounded-xl lg:rounded-lg text-xs font-black transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
                  : 'text-zinc-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : 'text-primary-500'} />
              {option.label.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Overlay para fechar ao clicar fora no mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
