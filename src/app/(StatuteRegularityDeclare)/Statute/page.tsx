"use client";
import React, { memo } from "react";
import { useSRDForms } from "@/hooks/useSRDForms";
import { SRDHeader } from "@/components/SRDHeader";
import { SRDFormList } from "@/components/SRDFormList";
import "../SRD.css";

const Statute: React.FC = memo(function Statute() {
  const { loading, error, groupedForms, handlePdfClick } = useSRDForms("ข้อบังคับ");

  return (
    <section className="py-5">
      <SRDHeader
        image="Rules.png"
        alt="Rules"
      />
      <div className="container py-4">
        <SRDFormList
          loading={loading}
          error={error}
          groupedForms={groupedForms}
          iconImage="icon.png"
          onPdfClick={handlePdfClick}
        />
      </div>
    </section>
  );
});

export default Statute;
