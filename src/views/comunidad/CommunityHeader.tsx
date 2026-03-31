import React, { memo } from 'react';
import { CategoriaPost, LiveStatus } from '../../types';
import { FILTER_CATEGORIES, TAG_FILTERS } from './index';

interface CommunityHeaderProps {
    filterType: CategoriaPost | 'Todos';
    filterTag: string | null;
    filterFollowing: boolean;
    isAdmin: boolean;
    isAgentLoading: boolean;
    onFilterType: (type: CategoriaPost | 'Todos') => void;
    onFilterTag: (tag: string | null) => void;
    onFilterFollowing: () => void;
    onAgentClick: () => void;
}

const LiveIndicator: React.FC = memo(() => (
    <div className="flex items-center gap-2">
        <span className="size-2 bg-signal-green rounded-full animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live Feed</span>
    </div>
));

const AgentButton: React.FC<{ isLoading: boolean; onClick: () => void }> = memo(({ isLoading, onClick }) => (
    <button
        disabled={isLoading}
        onClick={onClick}
        className="p-2 text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5 group disabled:opacity-50"
    >
        <span className="material-symbols-outlined text-sm">smart_toy</span>
    </button>
));

const CommunityHeader: React.FC<CommunityHeaderProps> = ({
    filterType,
    filterTag,
    filterFollowing,
    isAdmin,
    isAgentLoading,
    onFilterType,
    onFilterTag,
    onFilterFollowing,
    onAgentClick,
}) => {
    return (
        <div className="flex items-center justify-between mb-2">
            <LiveIndicator />
            <div className="flex gap-1">
                {isAdmin && (
                    <AgentButton isLoading={isAgentLoading} onClick={onAgentClick} />
                )}
            </div>
        </div>
    );
};

export default memo(CommunityHeader);
