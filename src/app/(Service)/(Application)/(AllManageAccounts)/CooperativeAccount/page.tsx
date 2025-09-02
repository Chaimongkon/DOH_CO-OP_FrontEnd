"use client";

import React from "react";
import ApplicationGallery from "@/components/ApplicationGallery";

const CooperativeAccount: React.FC = () => {
  return (
    <ApplicationGallery
      filterType="เพิ่มบัญชีสหกรณ์"
      altTextPrefix="ขั้นตอนการเพิ่มบัญชีสหกรณ์"
      componentName="คู่มือการเพิ่มบัญชีสหกรณ์"
    />
  );
};

export default CooperativeAccount;