"use client";

import React from "react";
import ApplicationGallery from "@/components/ApplicationGallery";

const ForgotPassword: React.FC = () => {
  return (
    <ApplicationGallery
      filterType="การลืมรหัสผ่าน"
      altTextPrefix="ขั้นตอนการลืมรหัสผ่าน"
      componentName="คู่มือการลืมรหัสผ่าน"
    />
  );
};

export default ForgotPassword;