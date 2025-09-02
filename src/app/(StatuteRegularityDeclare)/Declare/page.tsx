"use client";
import React, { memo } from "react";
import { useSRDForms } from "@/hooks/useSRDForms";
import { SRDHeader } from "@/components/SRDHeader";
import { SRDFormList } from "@/components/SRDFormList";
import "../SRD.css";

const Declare: React.FC = memo(function Declare() {
  const { loading, error, groupedForms, handlePdfClick } = useSRDForms("ประกาศ");

  return (
    <section className="py-5">
      <SRDHeader
        image="Announce.png"
        alt="Announce"
      />
      <div className="container py-4">
        <SRDFormList
          loading={loading}
          error={error}
          groupedForms={groupedForms}
          iconImage="icon3.png"
          onPdfClick={handlePdfClick}
        />
      </div>
    </section>
  );
});

export default Declare;
