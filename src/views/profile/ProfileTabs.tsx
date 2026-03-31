import React from 'react';

export type ProfileTab = 'posts' | 'medallas' | 'comunidades' | 'config' | 'mod';

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  isAdminMode: boolean;
  isOwnProfile: boolean;
}

const tabs: { id: ProfileTab; label: string; icon: string }[] = [
  { id: 'posts', label: 'Posts', icon: 'article' },
  { id: 'medallas', label: 'Logros', icon: 'emoji_events' },
  { id: 'comunidades', label: 'Comunidades', icon: 'groups' },
];

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onTabChange,
  isAdminMode,
  isOwnProfile
}) => {
  const ownProfileTabs = isOwnProfile ? [
    { id: 'config' as ProfileTab, label: 'Config', icon: 'settings' },
    ...tabs,
  ] : tabs;

  const allTabs = isAdminMode && isOwnProfile 
    ? [...ownProfileTabs, { id: 'mod' as ProfileTab, label: 'Admin', icon: 'admin_panel_settings' }]
    : ownProfileTabs;

  return (
    <div className="sticky top-0 z-10 bg-[#0f1115]/90 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-1 px-4 overflow-x-auto scrollbar-hide">
        {allTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileTabs;
