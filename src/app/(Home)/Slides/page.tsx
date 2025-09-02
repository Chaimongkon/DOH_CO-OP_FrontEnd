"use client";
import React, { useCallback, useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import logger from "@/lib/logger";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/effect-cube";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation, EffectCube } from "swiper/modules";
import "./styles.css";
import { Slide } from "@/types";
import { SuccessApiResponse } from "@/types/api-responses";
import { LottieSectionLoading } from "@/components/LottieLoading";
import { useStatusHome } from "@/lib/context/StatusHomeContext";
import { useApiConfig } from "@/hooks/useApiConfig";
import dynamic from "next/dynamic";

// Simple in-memory cache for slides data
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let slidesCache: {
  data: Slide[] | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0,
};

// Dynamic imports for better performance  
const HomeApplication = dynamic(() => import("@/layout/application/HomeApplication"), {
  loading: () => <LottieSectionLoading tip="Loading application..." />,
  ssr: false
});

const HomeElection = dynamic(() => import("@/layout/election/HomeElection"), {
  loading: () => <LottieSectionLoading tip="Loading election..." />,  
  ssr: false
});

interface SlideApiResponse {
  Id: number;
  No: number;
  ImagePath: string | null;
  URLLink: string;
}


const PageSlide: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheUsed, setCacheUsed] = useState(false);
  const lastRequestTime = useRef(0);
  
  // Use StatusHome context for election/application mode
  const { isElectionMode } = useStatusHome();
  
  // Use API configuration hook
  const { API, URLFile } = useApiConfig();
  

  const fetchSlides = useCallback(async (): Promise<void> => {
    if (!API || !URLFile) {
      setError("Environment variables not configured");
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Check cache first
      const now = Date.now();
      if (slidesCache.data && (now - slidesCache.timestamp) < CACHE_DURATION) {
        logger.info('Using cached slides data');
        setSlides(slidesCache.data);
        setCacheUsed(true);
        return;
      }

      // Implement request throttling (minimum 3 seconds for 429 prevention)
      const minDelay = error?.includes('กำลังโหลดข้อมูลสไลด์หนักเกินไป') ? 5000 : 3000;
      const timeSinceLastRequest = now - lastRequestTime.current;
      if (timeSinceLastRequest < minDelay) {
        const delay = minDelay - timeSinceLastRequest;
        logger.info(`Throttling slides request, waiting ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      lastRequestTime.current = Date.now();
      setCacheUsed(false);
      
      const response = await fetch(`${API}/Slides`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("กำลังโหลดข้อมูลสไลด์หนักเกินไป กรุณารอสักครู่และลองใหม่อีกครั้ง");
        }
        throw new Error(`Failed to fetch slides: ${response.status} ${response.statusText}`);
      }
      
      const apiResponse: SuccessApiResponse<SlideApiResponse[]> = await response.json();

      if (!apiResponse.success || !Array.isArray(apiResponse.data)) {
        throw new Error('Invalid API response format');
      }

      // Filter out slides without images and validate data
      const validSlides: Slide[] = apiResponse.data
        .filter((slide): slide is SlideApiResponse => 
          slide && 
          typeof slide.Id === 'number' && 
          slide.ImagePath !== null && 
          slide.ImagePath !== ''
        )
        .map((slide) => {
          // Use simple manual processing for now to ensure images work
          let finalImagePath: string;
          
          if (slide.ImagePath?.startsWith('http')) {
            // External URL - use as is
            finalImagePath = slide.ImagePath;
          } else if (slide.ImagePath?.startsWith('/')) {
            // Absolute path - prepend base URL
            finalImagePath = `${URLFile}${slide.ImagePath}`;
          } else {
            // Relative path - construct full URL
            finalImagePath = `${URLFile}/Slides/File/${slide.ImagePath}`;
          }
          
          
          return {
            id: slide.Id,
            no: slide.No,
            image: '', // Not used in current implementation but required by Slide interface
            imagePath: finalImagePath,
            url: slide.URLLink || '#',
          };
        })
        .filter((slide): slide is Slide => slide !== null); // Remove null entries

      // Cache the result
      slidesCache = {
        data: validSlides,
        timestamp: Date.now()
      };
      
      setSlides(validSlides);
      
      logger.info('Slides loaded successfully', {
        totalSlides: apiResponse.data.length,
        validSlides: validSlides.length,
        sampleImagePaths: validSlides.slice(0, 3).map(s => ({
          id: s.id,
          imagePath: s.imagePath
        }))
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error("Failed to fetch slides:", error);
      setError(errorMessage);
      
      // If we have cached data and it's a network error, use the cache
      if (slidesCache.data && slidesCache.data.length > 0) {
        logger.info('Network error detected, falling back to cached slides data');
        setSlides(slidesCache.data);
        setCacheUsed(true);
        setError(null); // Clear error since we have fallback data
      } else {
        setSlides([]);
      }
    }
  }, [API, URLFile, error]);
  

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchSlides();
      setIsLoading(false);
    };

    loadData();
  }, [fetchSlides]);

  // Memoize swiper configuration
  const swiperConfig = useMemo(() => ({
    spaceBetween: 30,
    effect: "cube" as const,
    grabCursor: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    cubeEffect: {
      shadow: true,
      slideShadows: true,
      shadowOffset: 20,
      shadowScale: 0.94,
    },
    pagination: {
      clickable: true,
    },
    modules: [Autoplay, EffectCube, Pagination, Navigation],
    className: "mySwiper"
  }), []);

  // Early returns for loading and error states
  if (isLoading) {
    return (
      <section className="text-white bg-cover bg-center primary-overlay overlay-dense">
        <div className="overlay-content py-5">
          <div className="container py-4">
            <LottieSectionLoading 
              tip={cacheUsed ? "กำลังโหลดข้อมูลจากแคช..." : "กำลังโหลดสไลด์..."} 
              className="text-white"
            />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="text-white bg-cover bg-center primary-overlay overlay-dense">
        <div className="overlay-content py-5">
          <div className="container py-4">
            <div 
              className="text-center p-4"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                color: "white"
              }}
            >
              <h4>{error?.includes('กำลังโหลดข้อมูลสไลด์หนักเกินไป') ? 'กำลังโหลดข้อมูลหนักเกินไป' : 'เกิดข้อผิดพลาดในการโหลดข้อมูล'}</h4>
              <p>{error?.includes('กำลังโหลดข้อมูลสไลด์หนักเกินไป') ? error : 'กรุณาลองใหม่อีกครั้ง หรือติดต่อเจ้าหน้าที่'}</p>
              <button 
                className="btn btn-outline-light mt-2"
                onClick={() => {
                  setError(null);
                  const retryDelay = error?.includes('กำลังโหลดข้อมูลสไลด์หนักเกินไป') ? 5000 : 1000;
                  setTimeout(() => {
                    fetchSlides();
                  }, retryDelay);
                }}
              >
                {error?.includes('กำลังโหลดข้อมูลสไลด์หนักเกินไป') ? 'รอ 3 วินาที แล้วลองใหม่' : 'ลองใหม่อีกครั้ง'}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="text-white bg-cover bg-center primary-overlay overlay-dense">
        <div className="overlay-content py-5">
          <div className="container py-4">
            <div 
              className="text-center p-4"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                color: "white"
              }}
            >
              <h4>No slides available</h4>
              <p>Please check back later</p>
              <small>Debug: {slides.length} slides loaded</small>
            </div>
          </div>
          {isElectionMode ? <HomeElection /> : <HomeApplication />}
        </div>
      </section>
    );
  }


  return (
    <section
      className="text-white bg-cover bg-center primary-overlay overlay-dense"
      aria-label="Image slides showcase"
      style={{ minHeight: 'fit-content', overflow: 'hidden' }}
    >
      <div className="overlay-content py-5" style={{ paddingTop: '4rem' }}>
        <div className="container py-4" style={{ maxHeight: '600px', overflow: 'hidden' }}>
          <Swiper {...swiperConfig}>
            {slides.map((slide, index) => (
              <SwiperSlide key={`slide-${slide.id}`}>
                <Image
                  className="img-fluid"
                  src={slide.imagePath}
                  alt={`Slide ${slide.no || index + 1}`}
                  width={800}
                  height={600}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '12px'
                  }}
                  priority={index === 0}
                  quality={85}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAQCAwMDAgQDAwMEBAQEBQkGBQUFBQsICAYJDQsNDQ0LDAwOEBQRDg8TDwwMEhgSExUWFxcXDhEZGxkWGhQWFxb/wAALCAABAAEBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  onError={(e) => {
                    const error = (e.target as HTMLImageElement)?.src || slide.imagePath;
                    logger.error(`Failed to load slide image: ${slide.imagePath}`, {
                      slideId: slide.id,
                      slideNo: slide.no,
                      originalPath: slide.imagePath,
                      actualSrc: error,
                      errorDetails: e.type
                    });
                    
                    // Hide broken image
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    
                    // Mark slide as invalid to remove from carousel
                    target.setAttribute('data-slide-error', 'true');
                  }}
                  onLoad={(e) => {
                    const actualSrc = (e.target as HTMLImageElement)?.src || slide.imagePath;
                    logger.info(`Slide image loaded successfully: ${slide.imagePath}`, {
                      slideId: slide.id,
                      slideNo: slide.no,
                      actualSrc: actualSrc,
                      naturalWidth: (e.target as HTMLImageElement)?.naturalWidth,
                      naturalHeight: (e.target as HTMLImageElement)?.naturalHeight
                    });
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

// Add display name for debugging
PageSlide.displayName = 'PageSlide';

export default React.memo(PageSlide);
