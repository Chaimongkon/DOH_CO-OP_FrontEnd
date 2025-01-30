"use client";
import React, { useCallback, useEffect, useState } from "react";
import { ReportBusiness } from "@/types";
import { message } from "antd";
import { useRouter } from "next/navigation";
import Lottie from "react-lottie";
import animationData from "../../loading2.json";
import "./BookCover.css";

const BusinessReport = () => {
  const router = useRouter();
  const [business, setBusiness] = useState<ReportBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const URLFile = process.env.NEXT_PUBLIC_PICHER_BASE_URL;

  // Lottie options
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const fetchNews = useCallback(async () => {
    try {
      const response = await fetch(`${API}/BusinessReport`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const processedData = data.map((newsItem: any) => ({
        id: newsItem.Id,
        title: newsItem.Title,
        imagePath: newsItem.ImagePath ? `${URLFile}${newsItem.ImagePath}` : "",
        filePath: newsItem.FilePath ? `${URLFile}${newsItem.FilePath}` : "",
        createDate: newsItem.CreateDate,
      }));
      setBusiness(processedData);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  }, [API, URLFile]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handlePdfClick = async (newsItem: any, index: number) => {
    if (newsItem.filePath) {
      setButtonLoading((prev) => ({ ...prev, [index]: true }));
      try {
        window.open(newsItem.filePath, "_blank");
      } catch (error) {
        message.error("Failed to open PDF");
      } finally {
        setButtonLoading((prev) => ({ ...prev, [index]: false }));
      }
    } else {
      message.error("PDF not available");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear() + 543;

    return `${day}/${month}/${year}`;
  };

  return (
    <section className="py-5">
      <div className="container py-4">
        {loading ? (
          <div className="loading-container">
            <Lottie options={defaultOptions} height={150} width={150} />
          </div>
        ) : (
          <>
            <div className="row gy-5">
              {business.map((newsItem, index) => (
                <div
                  className="col-lg-4 d-flex justify-content-center"
                  key={index}
                >
                  {/* Book item */}
                  <div
                    className="box-image-text text-center primary-overlay"
                    style={{
                      position: "relative",
                      width: "320px",
                      height: "450px",
                      borderRadius: "10px",
                      background: "#f8f9fa",
                      boxShadow: "0px 20px 20px 5px rgba(0, 0, 0, 0.5)",
                      transform: "perspective(500px) rotateY(0deg)",
                      transition: "transform 0.3s ease-in-out",
                    }}
                  >
                    <img
                      className="img-fluid"
                      src={newsItem.imagePath}
                      alt="..."
                      style={{
                        height: "100%",
                        width: "100%",
                      }}
                    />
                    <div className="overlay-content d-flex flex-column justify-content-center p-4">
                      <h3
                        className="text-uppercase box-image-text-heading"
                        style={{ fontSize: "1.2rem", color: "black" }}
                      >
                        {newsItem.title}
                      </h3>
                      <ul className="list-inline mb-0 box-image-text-content">
                        <li className="list-inline-item">
                          <button
                            className="btn btn-outline-dark btn-sm"
                            onClick={() => handlePdfClick(newsItem, index)}
                            disabled={buttonLoading[index]}
                          >
                            {buttonLoading[index]
                              ? "กำลังโหลด..."
                              : "ดาวน์โหลดเอกสาร"}
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default BusinessReport;
