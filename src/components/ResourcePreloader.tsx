"use client";
import { useEffect } from 'react';
import { apiCache } from '@/lib/cache';
import logger from '@/lib/logger';

interface PreloadResource {
  url: string;
  type: 'api' | 'image' | 'font' | 'script' | 'style';
  priority: 'high' | 'medium' | 'low';
  condition?: () => boolean;
}

/**
 * Resource Preloader Component
 * Intelligently preloads critical resources based on user behavior
 */
export default function ResourcePreloader() {
  const preloadCriticalResources = async () => {
    const API = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!API) return;

    const criticalResources: PreloadResource[] = [
      // Critical API endpoints
      {
        url: `${API}/StatusHome`,
        type: 'api',
        priority: 'high'
      },
      {
        url: `${API}/News`,
        type: 'api', 
        priority: 'medium',
        condition: () => window.location.pathname === '/'
      },
      {
        url: `${API}/Slides`,
        type: 'api',
        priority: 'medium',
        condition: () => window.location.pathname === '/'
      },
      
      // Note: Font preloading removed to prevent unused preload warnings
      // Fonts will be loaded automatically when CSS @font-face rules are processed
      
      // Critical images
      {
        url: '/icon-192x192.png',
        type: 'image',
        priority: 'high'
      },
      {
        url: '/image/logo.png',
        type: 'image',
        priority: 'high'
      }
    ];

    // Preload resources based on priority
    for (const resource of criticalResources) {
      if (resource.condition && !resource.condition()) {
        continue;
      }

      try {
        await preloadResource(resource);
        logger.info(`Preloaded ${resource.type}: ${resource.url}`);
      } catch {
        logger.warn(`Failed to preload ${resource.url}`);  
      }
    }
  };

  const preloadResource = async (resource: PreloadResource): Promise<void> => {
    switch (resource.type) {
      case 'api':
        await preloadAPI(resource.url);
        break;
      case 'image':
        await preloadImage(resource.url);
        break;
      case 'font':
        await preloadFont(resource.url);
        break;
      case 'script':
        await preloadScript(resource.url);
        break;
      case 'style':
        await preloadStyle(resource.url);
        break;
    }
  };

  const preloadAPI = async (url: string) => {
    try {
      await apiCache.preload(url, async () => {
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        return response.json();
      });
    } catch {
      // Silently fail for preloading
      logger.warn(`API preload failed for ${url}`);
    }
  };

  const preloadImage = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  };

  const preloadFont = (url: string): Promise<void> => {
    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.crossOrigin = 'anonymous';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => resolve(); // Don't fail on font errors
      document.head.appendChild(link);
    });
  };

  const preloadScript = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload script: ${url}`));
      document.head.appendChild(link);
    });
  };

  const preloadStyle = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload style: ${url}`));
      document.head.appendChild(link);
    });
  };

  const setupIntelligentPrefetching = () => {
    // Prefetch on mouse hover
    document.addEventListener('mouseover', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.hostname === window.location.hostname) {
        prefetchPage(link.href);
      }
    });

    // Prefetch on touch start (mobile)
    document.addEventListener('touchstart', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.hostname === window.location.hostname) {
        prefetchPage(link.href);
      }
    });

    // Prefetch pages when they enter viewport
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLAnchorElement;
            if (link.href && link.hostname === window.location.hostname) {
              prefetchPage(link.href);
            }
          }
        });
      }, { rootMargin: '50px' });

      // Observe all internal links
      document.querySelectorAll('a[href]').forEach((link) => {
        const anchor = link as HTMLAnchorElement;
        if (anchor.hostname === window.location.hostname) {
          observer.observe(anchor);
        }
      });
    }
  };

  const prefetchPage = (url: string) => {
    // Create prefetch link
    if (!document.querySelector(`link[rel="prefetch"][href="${url}"]`)) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
      
      logger.info(`Prefetching page: ${url}`);
    }
  };

  const setupInteractionBasedPreload = () => {
    let scrollDepth = 0;
    const API = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    document.addEventListener('scroll', () => {
      const currentScroll = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      if (currentScroll > scrollDepth) {
        scrollDepth = currentScroll;
        
        // Preload more content as user scrolls
        if (scrollDepth > 25 && API) {
          // User is engaged, preload more data
          preloadEngagedUserContent(API);
        }
        
        if (scrollDepth > 50 && API) {
          // User is highly engaged, preload even more
          preloadHighlyEngagedContent(API);
        }
      }
    });
  };

  const preloadEngagedUserContent = async (API: string) => {
    const engagedContent = [
      `${API}/Interest`
    ];
    
    for (const url of engagedContent) {
      try {
        await preloadAPI(url);
      } catch {
        // Silent fail for engagement-based preloading
      }
    }
  };

  const preloadHighlyEngagedContent = async (API: string) => {
    const highEngagementContent = [
      `${API}/PhotosCover`
    ];
    
    for (const url of highEngagementContent) {
      try {
        await preloadAPI(url);
      } catch {
        // Silent fail for engagement-based preloading
      }
    }
  };

  useEffect(() => {
    // Delay preloading slightly to let CSS load first
    const timer = setTimeout(() => {
      // Preload critical resources
      preloadCriticalResources();
      
      // Setup intelligent prefetching
      setupIntelligentPrefetching();
      
      // Preload based on user interactions
      setupInteractionBasedPreload();
    }, 1000); // Wait 1 second for CSS to load

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This component doesn't render anything
  return null;
}