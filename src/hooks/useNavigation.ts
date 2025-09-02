"use client";

import { useRouter } from "next/navigation";
import { useRef, useMemo } from "react";
import { useMenuName } from "./useLocalStorage";

/**
 * Custom hook for navigation with automatic menu name management
 * Eliminates repetitive localStorage.setItem("menuName", ...) calls
 * 
 * @returns Object containing navigation functions
 * 
 * @example
 * const { navigateWithMenu } = useNavigation();
 * navigateWithMenu('/Questions', 'กระดานถาม-ตอบ (Q&A)');
 */
export function useNavigation() {
  const router = useRouter();
  const [, setMenuName] = useMenuName();

  // Create stable references
  const routerRef = useRef(router);
  const setMenuNameRef = useRef(setMenuName);
  
  // Keep refs current
  routerRef.current = router;
  setMenuNameRef.current = setMenuName;

  // Return memoized stable object
  return useMemo(() => ({
    /**
     * Navigate to a route and automatically set the menu name
     */
    navigateWithMenu: (route: string, menuName: string) => {
      setMenuNameRef.current(menuName);
      routerRef.current.push(route);
    },

    /**
     * Navigate with menu name and optional query parameters
     */
    navigateWithMenuAndQuery: (
      route: string, 
      menuName: string, 
      queryParams?: Record<string, string>
    ) => {
      setMenuNameRef.current(menuName);
      
      if (queryParams) {
        const searchParams = new URLSearchParams(queryParams);
        routerRef.current.push(`${route}?${searchParams.toString()}`);
      } else {
        routerRef.current.push(route);
      }
    },

    setMenuName: setMenuNameRef.current,
  }), []); // Empty dependency array for stable reference
}

export default useNavigation;