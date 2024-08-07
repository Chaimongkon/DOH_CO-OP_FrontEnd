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
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    // Set the initial menuName once the component has mounted
    if (!isMounted) {
      const storedMenuName = localStorage.getItem('menuName');
      if (storedMenuName) {
        setMenuName(storedMenuName);
      } else {
        setMenuName("Home"); // Default menu name
      }
      setIsMounted(true);
    }
  }, [isMounted]);

  useEffect(() => {
    // Persist menuName to localStorage whenever it changes
    if (isMounted && menuName) {
      localStorage.setItem('menuName', menuName);
    }
  }, [menuName, isMounted]);

  // Define the routes where SubHeader should not be shown
  const hideSubHeaderRoutes = ["/"];

  return (
    <>
      <Header setMenuName={setMenuName} />
      {isMounted && !hideSubHeaderRoutes.includes(pathname) && (
        <SubHeader menuName={menuName} />
      )}
      {children}
    </>
  );
};

export default ClientWrapper;
