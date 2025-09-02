"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import FireworksParticles from "@/components/ParticlesSlide";

export default function FireworksManager() {
  const pathname = usePathname();
  const [isFireworks, setIsFireworks] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  // Load/Unload CSS and force text color when fireworks state changes
  useEffect(() => {
    if (isFireworks) {
      // Load globalsHNY.css
      const link = document.createElement('link');
      link.id = 'fireworks-css';
      link.rel = 'stylesheet';
      link.href = '/globalsHNY.css';
      document.head.appendChild(link);
      
      // Force override text colors with JavaScript (smart detection)
      const forceWhiteText = () => {
        const elements = document.querySelectorAll('*[class*="CoopHistory"], *[class*="CoopHistory_"]');
        elements.forEach((el) => {
          if (el instanceof HTMLElement) {
            // Check if element uses --bs-gray-500
            const computedStyle = getComputedStyle(el);
            const currentColor = computedStyle.color;
            if (currentColor === 'rgb(108, 117, 125)' || el.style.color?.includes('--bs-gray-500')) {
              // Keep gray-500 elements as they are
              return;
            }
            el.style.setProperty('color', 'white', 'important');
            el.style.setProperty('text-shadow', '2px 2px 4px rgba(0,0,0,0.8)', 'important');
          }
          // Also check child elements
          const children = el.querySelectorAll('*');
          children.forEach((child) => {
            if (child instanceof HTMLElement) {
              const computedStyle = getComputedStyle(child);
              const currentColor = computedStyle.color;
              if (currentColor === 'rgb(108, 117, 125)' || child.style.color?.includes('--bs-gray-500')) {
                // Keep gray-500 elements as they are
                return;
              }
              child.style.setProperty('color', 'white', 'important');
              child.style.setProperty('text-shadow', '1px 1px 2px rgba(0,0,0,0.7)', 'important');
            }
          });
        });
      };
      
      // Run immediately and on DOM changes
      forceWhiteText();
      const observer = new MutationObserver(forceWhiteText);
      observer.observe(document.body, { childList: true, subtree: true });
      
      // Store observer for cleanup
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).fireworksObserver = observer;
    } else {
      // Remove globalsHNY.css
      const existingLink = document.getElementById('fireworks-css');
      if (existingLink) {
        existingLink.remove();
      }
      
      // Reset all forced colors back to original
      const resetColors = () => {
        const elements = document.querySelectorAll('*[class*="CoopHistory"], *[class*="CoopHistory_"]');
        elements.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.removeProperty('color');
            el.style.removeProperty('text-shadow');
          }
          // Also reset child elements
          const children = el.querySelectorAll('*');
          children.forEach((child) => {
            if (child instanceof HTMLElement) {
              child.style.removeProperty('color');
              child.style.removeProperty('text-shadow');
            }
          });
        });
      };
      
      resetColors();
      
      // Stop observer
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).fireworksObserver) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).fireworksObserver.disconnect();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).fireworksObserver;
      }
    }
    
    return () => {
      // Cleanup on unmount
      const existingLink = document.getElementById('fireworks-css');
      if (existingLink) {
        existingLink.remove();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).fireworksObserver) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).fireworksObserver.disconnect();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).fireworksObserver;
      }
    };
  }, [isFireworks]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${API}/StatusHome`);
        if (!response.ok) {
          return;
        }
        
        const result = await response.json();
        
        if (!result.success || !result.data || !result.data.data) {
          return;
        }
        
        const statusData = result.data.data;
        const fireworksItem = statusData.find(
          (item: { Id: number; Status: number }) => item.Id === 2
        );
        
        if (fireworksItem) {
          const shouldShowFireworks = fireworksItem.Status === 1;
          setIsFireworks(shouldShowFireworks);
        }
      } catch  {
        setIsFireworks(false);
      }
    };

    if (API) {
      fetchStatus();
    }
  }, [API]);

  useEffect(() => {
    if (isFireworks && pathname === "/") {
      document.querySelectorAll(".bg-cover").forEach((element) => {
        (element as HTMLElement).style.backgroundSize = "cover";
        (element as HTMLElement).style.background = "transparent";
      });
    }
  }, [isFireworks, pathname]);

  return (
    <>
      {isFireworks && <FireworksParticles />}
    </>
  );
}