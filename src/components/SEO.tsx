import React from 'react';
import { Helmet } from 'react-helmet-async';
import { URLS } from '../config/urls';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  author?: string;
}

const DEFAULT_TITLE = 'TradePortal 2025 | Comunidad de Trading Profesional en Latam';
const DEFAULT_DESCRIPTION = 'La comunidad de traders más grande de Latinoamérica. Análisis reales, señales verificadas y aprendizaje de traders institucionales. Sin ruido, solo señal.';
const BASE_URL = URLS.app;
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&h=630&fit=crop';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'TradePortal',
  description: DEFAULT_DESCRIPTION,
  url: BASE_URL,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    lowPrice: '0',
    highPrice: '49.99',
    offerCount: '4',
  },
  provider: {
    '@type': 'Organization',
    name: 'TradePortal',
    url: BASE_URL,
  },
};

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  publishedTime,
  author,
}) => {
  const fullTitle = title ? `${title} | TradeHub` : DEFAULT_TITLE;
  const canonicalUrl = url || BASE_URL;
  const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="author" content="TradePortal" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonicalUrl} />

      <script type="application/ld+json">
        {JSON.stringify({ ...jsonLd, url: canonicalUrl, description })}
      </script>

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="TradePortal" />
      <meta property="og:locale" content="es_LA" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@TradePortal" />
      <meta name="twitter:creator" content="@TradePortal" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'profile' && (
        <meta property="profile:username" content={author || ''} />
      )}
    </Helmet>
  );
};

export default SEO;
