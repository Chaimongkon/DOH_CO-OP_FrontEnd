// File: ClientWrapper.tsx
"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from '@/layout/header/Header';
import SubHeader from '@/layout/header/SubHeader';

interface ClientWrapperProps {
  children: React.ReactNode;
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
  const [menuName, setMenuName] = useState<string>("");
  const pathname = usePathname();

  useEffect(() => {
    // Set menuName from localStorage on component mount or pathname change
    const storedMenuName = localStorage.getItem("menuName");
    if (storedMenuName) {
      setMenuName(storedMenuName);
    } else {
      setMenuName("Home"); // Default menu name if none is found
    }
  }, [pathname]);

  // Persist menuName to localStorage whenever it changes
  useEffect(() => {
    if (menuName) {
      localStorage.setItem("menuName", menuName);
    }
  }, [menuName]);

  // Define the routes where SubHeader should not be shown
  const hideSubHeaderRoutes = ["/"];

  return (
    <>
      <Header setMenuName={setMenuName} />
      {!hideSubHeaderRoutes.includes(pathname) && (
        <SubHeader menuName={menuName} />
      )}
      {children}
    </>
  );
};

export default ClientWrapper;
