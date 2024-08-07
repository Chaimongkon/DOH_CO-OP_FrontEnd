"use client";
import { Suspense, useEffect, useRef } from "react";
import SlidesPage from "./Slides/page";
import { Skeleton } from "antd";
import DialogBoxes from "./DialogBoxes/page";
import NewsPage from "./News/page";

export default function Home() {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const visitRecorded = useRef(false);

  useEffect(() => {
    if (visitRecorded.current) return;

    const visitCountSent = localStorage.getItem("visitCountSent");
    if (!visitCountSent) {
      visitRecorded.current = true;
      fetch(`${API}Visits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to record visit");
          }
          return response.json();
        })
        .then((data) => {
          if (data.success) {
            localStorage.setItem("visitCountSent", "true");
          } else {
            console.error("Error in response data:", data);
            visitRecorded.current = false; // Reset in case of error
          }
        })
        .catch((error) => {
          console.error("Error recording visit:", error);
          visitRecorded.current = false; // Reset in case of error
        });
    }
  }, [API]);

  return (
    <div>
      <Suspense fallback={<Skeleton />}>
        <DialogBoxes />
        <SlidesPage />
        {/* <NewsPage /> */}
      </Suspense>
    </div>
  );
}
