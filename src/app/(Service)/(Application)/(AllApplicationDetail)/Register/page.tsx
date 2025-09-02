"use client";

import React from "react";
import ApplicationGallery from "@/components/ApplicationGallery";

const Register: React.FC = () => {
  return (
    <ApplicationGallery
      filterType="การลงทะเบียน"
      altTextPrefix="ขั้นตอนการลงทะเบียน"
      componentName="คู่มือการลงทะเบียน"
    />
  );
};

export default Register;