import React from 'react';
import { 
  Home, 
  Mic, 
  User, 
  Sparkles, 
  BookOpen, 
  Layers 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function MobileBottomNav({ activeTab, onSelectTab }) {
  const { t } = useLanguage();
  const m = t.mobileNav || {};

  const items = [
    { id: 'home', label: m.home || 'Home', icon: Home },
    { id: 'voice', label: m.voice || 'Voice', icon: Mic, isCenter: true },
    { id: 'profile', label: m.profile || 'Profile', icon: User },
    { id: 'recommendations', label: m.courses || 'Courses', icon: BookOpen },
    { id: 'progress', label: m.progress || 'Progress', icon: Sparkles },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                aria-label={`Open ${item.label} Input Assessment`}
                className="flex flex-col items-center -mt-5 group min-w-[56px] min-h-[56px] focus:outline-hidden"
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform group-active:scale-95
                  ${isActive 
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                    : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                  }
                `}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 mt-1">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              aria-label={`Navigate to ${item.label}`}
              className={`flex flex-col items-center justify-center py-1.5 px-3 min-w-[48px] min-h-[48px] rounded-xl transition ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
