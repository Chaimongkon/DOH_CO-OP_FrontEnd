"use client";

import React from "react";
import ApplicationGallery from "@/components/ApplicationGallery";

const Install: React.FC = () => {
  return (
    <ApplicationGallery
      filterType="การดาวน์โหลด"
      altTextPrefix="ขั้นตอนการติดตั้ง"
      componentName="คู่มือการติดตั้งแอปพลิเคชั่น"
    />
  );
};

export default Install;