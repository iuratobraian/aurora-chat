import { useState, useEffect } from 'react';
import { Noticia } from '../types';
import logger from '../utils/logger';
import { api } from "../../convex/_generated/api";
import { getConvexClient } from '../../lib/convex/client';

const convex = getConvexClient();

export const useNews = () => {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        if (convex) {
          const news = await convex.query(api.market.marketNews.getRecentNews, { hours: 24 });
          
          if (news && news.length > 0) {
            const mappedNews: Noticia[] = (news || []).slice(0, 6).map((n: any) => ({
              id: n._id || n.id,
              fuente: n.source || 'Unknown',
              tiempo: n.publishedAt ? new Date(n.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ahora',
              titulo: n.title || '',
              resumen: n.summary || n.content?.substring(0, 150) || '',
              contenidoExtenso: n.content || '',
              sentimiento: n.sentiment === 'bullish' ? 'alcista' : n.sentiment === 'bearish' ? 'bajista' : 'neutral',
              pares: n.relatedPairs || n.relatedAssets || ['MERCADO'],
              urlImagen: n.imageUrl || '',
              url: n.sourceUrl || ''
            }));
            
            setNoticias(mappedNews);
          } else {
            setNoticias([]);
          }
        } else {
          setNoticias([]);
        }
      } catch (error) {
        logger.error("Error fetching news from Convex:", error);
        setNoticias([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    
    const interval = setInterval(fetchNews, 300000);
    return () => clearInterval(interval);
  }, []);

  return { noticias, loading };
};