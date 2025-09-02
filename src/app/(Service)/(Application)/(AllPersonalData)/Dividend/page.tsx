"use client";

import React from "react";
import ApplicationGallery from "@/components/ApplicationGallery";

const Dividend: React.FC = () => {
  return (
    <ApplicationGallery
      filterType="เงินปันผล - เฉลี่ยคืน"
      altTextPrefix="ขั้นตอนการดูเงินปันผล"
      componentName="คู่มือการดูเงินปันผล - เฉลี่ยคืน"
    />
  );
};

export default Dividend;