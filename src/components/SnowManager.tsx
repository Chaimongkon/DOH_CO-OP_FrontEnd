"use client";
import { useEffect, useState } from "react";
import SnowParticles from "@/components/SnowParticles";
import Snowflake from "@/components/Snowflake";

export default function SnowManager() {
  const [isSnow, setIsSnow] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${API}/StatusHome`);
        if (!response.ok) {
          return;
        }
        
        const result = await response.json();
        
        if (!result.success || !result.data || !result.data.data) {
          return;
        }
        
        const statusData = result.data.data;
        const snowItem = statusData.find(
          (item: { Id: number; Status: number }) => item.Id === 3
        );
        
        if (snowItem) {
          const shouldShowSnow = snowItem.Status === 1;
          setIsSnow(shouldShowSnow);
        }
      } catch {
        setIsSnow(false);
      }
    };

    if (API) {
      fetchStatus();
    }
  }, [API]);

  return (
    <>
      {isSnow && <Snowflake />}
      <SnowParticles />
    </>
  );
}