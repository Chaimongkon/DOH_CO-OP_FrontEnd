"use client";
import { Suspense, useEffect, useState, useMemo, useCallback, memo, lazy, useRef } from "react";
import { usePathname } from "next/navigation";
import { LottieSectionLoading } from "@/components/LottieLoading";
import logger from "@/lib/logger";
import CookieConsent from "@/components/CookieConsent";
import ErrorBoundary from "@/components/ErrorBoundary";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import ResourcePreloader from "@/components/ResourcePreloader";
import { StatusChecker, isHTMLElement } from "@/types/homepage";
import { isValidApiUrl, RateLimiter } from "@/lib/validation";
import { fetchWithCache } from "@/lib/cache";
// Dynamic imports for better performance and code splitting
const AppDetails = lazy(() => import("@/app/(Home)/AppDetails/page"));
const ClientSections = lazy(() => import("@/components/ClientSections"));
const SlidesPage = lazy(() => import("@/app/(Home)/Slides/page"));
const DialogBoxes = lazy(() => import("@/app/(Home)/DialogBoxes/page"));
const NewsPage = lazy(() => import("@/app/(Home)/News/page"));
const CoopMiddle = lazy(() => import("@/app/(Home)/(PhotoVideoInterest)/CoopMiddle/page"));
const SnowParticles = lazy(() => import("@/components/SnowParticles"));
const FireworksParticles = lazy(() => import("@/components/Particles"));
const HomeApplication = lazy(() => import("@/layout/application/HomeApplication"));
const HomeElection = lazy(() => import("@/layout/election/HomeElection"));

import type { HomeClientProps } from "@/types/homepage";

/**
 * Main homepage client component for DOH Cooperative website
 * 
 * Features:
 * - Dynamic particle effects based on special events
 * - Lazy-loaded sections for better performance
 * - Error boundaries for graceful error handling
 * - Accessibility compliance with ARIA labels
 * - Rate limiting for API calls
 * - Input validation and sanitization
 * 
 * @component
 * @example
 * ```tsx
 * <HomeClient />
 * ```
 */
const HomeClient = memo(function HomeClient({}: HomeClientProps) {
  const [isHappyNewYear, setIsHappyNewYear] = useState(false);
  const [isElectionMode] = useState(false);
  const pathname = usePathname();
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  /** Rate limiter for API calls - prevents abuse */
  const rateLimiterRef = useRef(new RateLimiter(10, 60000)); // 10 requests per minute

  /** Memoized CSS class name based on special events */
  const mainClassName = useMemo(() => {
    return isHappyNewYear ? "happy-new-year" : "";
  }, [isHappyNewYear]);

  /** Memoized particle component selection based on events */
  const ParticleComponent = useMemo(() => {
    return isHappyNewYear ? FireworksParticles : SnowParticles;
  }, [isHappyNewYear]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchStatus = async () => {
      try {
        // Validate API URL
        if (!API || !isValidApiUrl(API)) {
          logger.warn("Invalid or missing API base URL");
          return;
        }

        // Check rate limiting
        if (!rateLimiterRef.current.isAllowed('status-home')) {
          logger.warn("Rate limit exceeded for StatusHome API");
          return;
        }

        const endpoint = `${API}/StatusHome`;
        
        // Use cached fetch with SWR strategy
        const data: unknown = await fetchWithCache(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'same-origin',
          // Cache options
          ttl: 5 * 60 * 1000, // 5 minutes cache
          staleTime: 1 * 60 * 1000, // 1 minute stale time
          retryCount: 2,
          retryDelay: 1000
        });
        
        if (isMounted) {
          // Handle pagination response - data is in data.data
          if (data && typeof data === 'object' && 'data' in data) {
            const paginatedResponse = data as { data?: unknown };
            const statusItems = paginatedResponse.data;
            
            if (Array.isArray(statusItems)) {
              const statusCode = StatusChecker.isHappyNewYear(statusItems);
              setIsHappyNewYear(statusCode);
              // Add logic for election mode if needed
              // const electionStatus = StatusChecker.isElectionMode(statusItems);
              // setIsElectionMode(electionStatus);
            } else {
              logger.warn("StatusHome API response.data is not an array");
            }
          } else {
            logger.warn("Invalid API response format from StatusHome");
          }
        }
      } catch (error) {
        logger.error("Failed to fetch status", error);
      }
    };

    fetchStatus();
    
    return () => {
      isMounted = false;
    };
  }, [API]);

  /**
   * Updates background elements when special events are active
   * Uses safe DOM manipulation with type guards
   */
  const updateBackgroundElements = useCallback(() => {
    if (isHappyNewYear && pathname === "/") {
      document.querySelectorAll(".bg-cover").forEach((element) => {
        if (isHTMLElement(element)) {
          element.style.backgroundSize = "cover";
          element.style.background = "transparent";
        }
      });
    }
  }, [isHappyNewYear, pathname]);

  useEffect(() => {
    updateBackgroundElements();
  }, [updateBackgroundElements]);

  return (
    <AnalyticsProvider>
      <main role="main" className={mainClassName} aria-label="หน้าหลักของสหกรณ์ออมทรัพย์กรมทางหลวง">
        <ServiceWorkerRegistration />
        <ResourcePreloader />
        <CookieConsent />
      <Suspense fallback={<LottieSectionLoading tip="Loading homepage..." />}>
        <div aria-hidden="true">
          <ParticleComponent />
        </div>
        
        <section aria-labelledby="news-heading" role="region" style={{ position: 'relative', zIndex: 20 }}>
          <h2 id="news-heading" className="sr-only">ข่าวประชาสัมพันธ์และข้อมูลสำคัญ</h2>
          <ErrorBoundary>
            <Suspense fallback={<LottieSectionLoading />}>
              <DialogBoxes />
            </Suspense>
          </ErrorBoundary>
        </section>
        
        <section aria-labelledby="slides-heading" role="region">
          <h2 id="slides-heading" className="sr-only">ภาพสไลด์แสดงบริการและกิจกรรม</h2>
          <ErrorBoundary>
            <Suspense fallback={<LottieSectionLoading />}>
              <SlidesPage />
            </Suspense>
          </ErrorBoundary>
        </section>
        
        {/* Application/Election overlay - positioned to overlap between Slides and News */}
        <div style={{ position: 'relative', zIndex: 10, marginTop: '-60px', marginBottom: '-80px' }}>
          <ErrorBoundary>
            <Suspense fallback={null}>
              {isElectionMode ? <HomeElection /> : <HomeApplication />}
            </Suspense>
          </ErrorBoundary>
        </div>
        
        <section aria-labelledby="news-detail-heading" role="region" style={{ position: 'relative', zIndex: 1 }}>
          <h2 id="news-detail-heading" className="sr-only">ข่าวสารและประชาสัมพันธ์</h2>
          <ErrorBoundary>
            <Suspense fallback={<LottieSectionLoading />}>
              <NewsPage />
            </Suspense>
          </ErrorBoundary>
        </section>
        
        <section aria-labelledby="activities-heading" role="region" style={{ position: 'relative', zIndex: 1 }}>
          <h2 id="activities-heading" className="sr-only">กิจกรรมและความร่วมมือ</h2>
          <ErrorBoundary>
            <Suspense fallback={<LottieSectionLoading />}>
              <CoopMiddle />
            </Suspense>
          </ErrorBoundary>
        </section>
        
        <section aria-labelledby="app-details-heading" role="region">
          <h2 id="app-details-heading" className="sr-only">รายละเอียดแอปพลิเคชันและบริการ</h2>
          <ErrorBoundary>
            <Suspense fallback={<LottieSectionLoading />}>
              <AppDetails />
            </Suspense>
          </ErrorBoundary>
        </section>
        
        <section aria-labelledby="client-info-heading" role="region" style={{ position: 'relative', zIndex: 1, paddingTop: '3rem' }}>
          <h2 id="client-info-heading" className="sr-only">ข้อมูลสำหรับลูกค้าและสมาชิก</h2>
          <ErrorBoundary>
            <Suspense fallback={<LottieSectionLoading />}>
              <ClientSections />
            </Suspense>
          </ErrorBoundary>
        </section>
      </Suspense>
    </main>
    </AnalyticsProvider>
  );
});

export default HomeClient;