"use client";

import React from "react";
import ApplicationGallery from "@/components/ApplicationGallery";

const Dividend: React.FC = () => {
  return (
    <ApplicationGallery
      filterType="บัญชีเงินฝาก"
      altTextPrefix="ขั้นตอนการดูบัญชีเงินฝาก"
      componentName="คู่มือการดูบัญชีเงินฝาก"
    />
  );
};

export default Dividend;