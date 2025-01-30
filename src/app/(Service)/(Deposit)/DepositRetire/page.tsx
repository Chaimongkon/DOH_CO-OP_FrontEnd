"use client";

import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { Services } from "@/types";

const DepositRetire = () => {
  const [service, setService] = useState<Services[]>([]);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const URLFile = process.env.NEXT_PUBLIC_PICHER_BASE_URL;

  const fetchImages = useCallback(async () => {
    try {
      const response = await fetch(`${API}/Serve`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      const processedData: Services[] = data
        .map((service: any) => ({
          id: service.Id,
          imagePath: service.ImagePath ? `${URLFile}${service.ImagePath}` : "",
          subcategories: service.Subcategories,
          urlLink: service.URLLink,
          status: service.IsActive,
        }))
        .filter(
          (service: Services) =>
            service.subcategories === "เงินฝากออมทรัพย์พิเศษเกษียณสุข"
        );

      setService(processedData);
    } catch (error) {
      console.error("Failed to fetch images:", error);
      message.error("Failed to fetch images.");
    }
  }, [API, URLFile]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return (
    <section className="py-5">
      {service.map((s) => (
        <div className="container py-4" key={s.id}>
          <center>
            <img
              className="img-fluid-7"
              src={s.imagePath}
              alt="Service Image"
            />
          </center>
          {s.urlLink && (
            <div className="container py-4">
              <div className="row gy-4">
                <h3 className="text-uppercase lined mb-4">
                  ดาวน์โหลดเอกสาร
                </h3>
              </div>
              <ul className="list-unstyled">
                <li className="d-flex mb-3">
                  <div className="icon-filled2 me-2">
                    <i className="fas fa-download"></i>
                  </div>
                  <a
                    href={s.urlLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer"
                  >
                    <p className="text-sm312 mb-0">แบบฟอร์ม{s.subcategories}</p>
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      ))}
    </section>
  );
};

export default DepositRetire;
