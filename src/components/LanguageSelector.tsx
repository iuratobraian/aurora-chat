import React from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage, languages } from '../i18n';

interface LanguageSelectorProps {
    className?: string;
    variant?: 'dropdown' | 'buttons';
}

export default function LanguageSelector({ 
    className = '', 
    variant = 'dropdown' 
}: LanguageSelectorProps) {
    const { t } = useTranslation();
    const currentLang = getCurrentLanguage();

    if (variant === 'buttons') {
        return (
            <div className={`flex gap-2 ${className}`}>
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code as 'es' | 'en' | 'pt')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                            currentLang === lang.code
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                    >
                        <span>{lang.flag}</span>
                        <span>{lang.code.toUpperCase()}</span>
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            <select
                value={currentLang}
                onChange={(e) => changeLanguage(e.target.value as 'es' | 'en' | 'pt')}
                className="appearance-none bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 pr-10 text-white cursor-pointer hover:border-purple-500 focus:border-purple-500 focus:outline-none transition-colors"
            >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                    </option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    );
}
