import React from 'react';

interface MobileTabItem {
  id: string;
  icon: string;
  activeIcon?: string;
  label: string;
  badge?: number;
}

interface MobileBottomTabBarProps {
  items: MobileTabItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export const MobileBottomTabBar: React.FC<MobileBottomTabBarProps> = ({
  items,
  activeTab,
  onTabChange,
  className = '',
}) => {
  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 md:hidden ${className}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="bg-[#0f1115]/95 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-center justify-around px-2 py-1">
          {items.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300 min-w-[56px] ${
                  isActive
                    ? 'text-primary'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {isActive && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
                )}
                <span className="material-symbols-outlined text-xl">
                  {isActive && item.activeIcon ? item.activeIcon : item.icon}
                </span>
                <span className={`text-[10px] font-medium mt-0.5 ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                  {item.label}
                </span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute top-1 right-2 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
