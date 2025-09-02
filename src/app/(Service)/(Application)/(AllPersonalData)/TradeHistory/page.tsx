"use client";

import React from "react";
import ApplicationGallery from "@/components/ApplicationGallery";

const Dividend: React.FC = () => {
  return (
    <ApplicationGallery
      filterType="รายการเคลื่อนไหวหุ้น"
      altTextPrefix="ขั้นตอนการดูรายการเคลื่อนไหวหุ้น"
      componentName="คู่มือการดูรายการเคลื่อนไหวหุ้น"
    />
  );
};

export default Dividend;