"use client";
import React, { memo } from "react";
import { useSRDForms } from "@/hooks/useSRDForms";
import { SRDHeader } from "@/components/SRDHeader";
import { SRDFormList } from "@/components/SRDFormList";
import "../SRD.css";

const Regularity: React.FC = memo(function Regularity() {
  const { loading, error, groupedForms, handlePdfClick } = useSRDForms("ระเบียบ");

  return (
    <section className="py-5">
      <SRDHeader
        image="Regularity.png"
        alt="Regularity"
      />
      <div className="container py-4">
        <SRDFormList
          loading={loading}
          error={error}
          groupedForms={groupedForms}
          iconImage="icon2.png"
          onPdfClick={handlePdfClick}
        />
      </div>
    </section>
  );
});

export default Regularity;
