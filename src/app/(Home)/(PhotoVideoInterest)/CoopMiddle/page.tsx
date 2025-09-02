"use client";
import React, { memo } from "react";
import CoopVideosSection from "@/components/CoopVideosSection";
import CoopPhotosSection from "@/components/CoopPhotosSection";
import CoopInterestSection from "@/components/CoopInterestSection";

const CoopMiddle: React.FC = memo(function CoopMiddle() {
  return (
    <section className="py-5 bg-gray-200">
      <div className="container py-4">
        <div className="row g-5" style={{ position: "relative" }}>
          <div className="col-lg-8">
            {/* วิดีโอสหกรณ์ CO-OP Section */}
            <CoopVideosSection />
            
            <br />
            
            {/* ภาพกิจกรรมสหกรณ์ Section */}
            <CoopPhotosSection />
          </div>
          
          {/* ดอกเบี้ย Section */}
          <CoopInterestSection />
        </div>
      </div>
    </section>
  );
});

export default CoopMiddle;