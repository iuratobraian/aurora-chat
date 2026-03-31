import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import logger from '../../../lib/utils/logger';

interface DM {
    _id: string;
    senderId: string;
    senderUsername: string;
    messageType?: string;
    text?: string;
    content?: string;
    mediaUrl?: string;
    isRead: boolean;
    read?: boolean;
    createdAt: number;
    timestamp?: number;
    lastMessage?: string;
    lastMessageAt?: number;
    unreadCount?: number;
    thread?: any;
}

interface InstagramInboxProps {
    accountId: string;
    onSelectConversation?: (conversationId: string) => void;
}

export default function InstagramInbox({ accountId, onSelectConversation }: InstagramInboxProps) {
    const [selectedDM, setSelectedDM] = useState<DM | null>(null);
    const [replyText, setReplyText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
    const [aiAssistEnabled, setAiAssistEnabled] = useState(true);

    const messages = useQuery(api["instagram/messages"]?.getThreads, { accountId });
    const conversations = useQuery(api["instagram/messages"]?.getThreads, { accountId });

    const sendDM = useMutation(api["instagram/messages"]?.sendMessage);

    const filteredConversations = (conversations || []).filter((conv: any) => {
        if (filter === 'unread' && conv.isRead) return false;
        if (filter === 'archived') return false;
        if (searchQuery && !conv.senderUsername?.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        return true;
    });

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedDM) return;
        
        try {
            await sendDM({
                accountId,
                recipientId: selectedDM.senderId,
                recipientUsername: selectedDM.senderUsername,
                text: replyText.trim(),
            });
            setReplyText('');
        } catch (error) {
            logger.error('Error sending DM:', error);
        }
    };

    const handleAIAssist = async () => {
        if (!selectedDM) return;
        setReplyText('Gracias por tu mensaje. Te respondo en breve...');
    };

    const unreadCount = (messages || []).filter((c: DM) => !c.isRead).length;

    return (
        <div className="flex h-full bg-gray-900 rounded-lg overflow-hidden">
            <div className="w-80 border-r border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800">
                    <h2 className="text-lg font-semibold text-white mb-3">Mensajes Directos</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar conversaciones..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-2 mt-3">
                        {(['all', 'unread', 'archived'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                    filter === f
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                            >
                                {f === 'all' ? 'Todos' : f === 'unread' ? `No leídos ${unreadCount > 0 ? `(${unreadCount})` : ''}` : 'Archivados'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            {filter === 'unread' ? 'No hay mensajes no leídos' : 'No hay conversaciones'}
                        </div>
                    ) : (
                        filteredConversations.map((conv: DM) => (
                            <button
                                key={conv._id}
                                onClick={() => {
                                    setSelectedDM(conv);
                                    onSelectConversation?.(conv._id as unknown as string);
                                }}
                                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-800 transition-colors border-b border-gray-800 ${
                                    selectedDM?._id === conv._id ? 'bg-gray-800' : ''
                                }`}
                            >
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                                        {conv.senderUsername[0].toUpperCase()}
                                    </div>
                                    {!conv.read && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-gray-900" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex items-center justify-between">
                                        <span className={`font-medium truncate ${conv.read ? 'text-gray-300' : 'text-white'}`}>
                                            {conv.senderUsername}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(conv.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className={`text-sm truncate mt-1 ${conv.read ? 'text-gray-500' : 'text-gray-300'}`}>
                                        {conv.content}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                {selectedDM ? (
                    <>
                        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                                    {selectedDM.senderUsername[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{selectedDM.senderUsername}</h3>
                                    <p className="text-xs text-gray-500">Instagram</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setAiAssistEnabled(!aiAssistEnabled)}
                                    className={`p-2 rounded-lg transition-colors ${
                                        aiAssistEnabled ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                                    }`}
                                    title="AI Assist"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                    {selectedDM.senderUsername[0].toUpperCase()}
                                </div>
                                <div className="bg-gray-800 rounded-2xl rounded-tl-none p-3 max-w-md">
                                    <p className="text-white text-sm">{selectedDM.content}</p>
                                    <span className="text-xs text-gray-500 mt-1 block">
                                        {new Date(selectedDM.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            {selectedDM.thread?.map((msg, idx) => (
                                <div key={idx} className={`flex gap-3 ${msg.senderId === 'me' ? 'justify-end' : ''}`}>
                                    {msg.senderId !== 'me' && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                            {selectedDM.senderUsername[0].toUpperCase()}
                                        </div>
                                    )}
                                    <div className={`rounded-2xl p-3 max-w-md ${
                                        msg.senderId === 'me'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-gray-800 text-white rounded-tl-none'
                                    }`}>
                                        <p className="text-sm">{msg.content}</p>
                                        <span className="text-xs opacity-70 mt-1 block">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-gray-800">
                            {aiAssistEnabled && (
                                <button
                                    onClick={handleAIAssist}
                                    className="mb-2 w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Generar respuesta con IA
                                </button>
                            )}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={handleSendReply}
                                    disabled={!replyText.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p>Selecciona una conversación</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
