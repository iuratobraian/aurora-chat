import DOMPurify from 'dompurify';

export const sanitizeHTML = (html: string): string => {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
};

export const sanitizeText = (text: string): string => {
    return DOMPurify.sanitize(text, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    });
};

export const escapeHTML = (str: string): string => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

export const formatTextWithMentions = (content: string): string => {
    const sanitized = sanitizeText(content);
    const parts = sanitized.split(/(@\w+)/g);
    return parts.map(part => {
        if (part.startsWith('@')) {
            return `<span class="text-primary font-black bg-primary/10 px-1 rounded">${escapeHTML(part)}</span>`;
        }
        return escapeHTML(part);
    }).join('');
};
