"use client";

import React from "react";
import ApplicationGallery from "@/components/ApplicationGallery";

const BankAccount: React.FC = () => {
  return (
    <ApplicationGallery
      filterType="เพิ่มบัญชีธนาคาร"
      altTextPrefix="ขั้นตอนการเพิ่มบัญชีธนาคาร"
      componentName="คู่มือการเพิ่มบัญชีธนาคาร"
    />
  );
};

export default BankAccount;