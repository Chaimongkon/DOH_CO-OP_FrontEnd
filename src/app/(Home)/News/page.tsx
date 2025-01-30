"use client";
import React, { useCallback, useEffect, useState } from "react";
import { News } from "@/types";
import { RightOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import styles from "./HomeNews.module.css";
import { useRouter } from "next/navigation";
import Lottie from "react-lottie";
import animationData from "../../loading2.json";

const NewsPage = () => {
  const router = useRouter();
  const [news, setNews] = useState<News[]>([]);
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
      const response = await fetch(`${API}/News`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const processedData = data.map((newsItem: any) => ({
        id: newsItem.Id,
        title: newsItem.Title,
        details: newsItem.Details,
        imagePath: newsItem.ImagePath ? `${URLFile}${newsItem.ImagePath}` : "",
        pdfPath: newsItem.PdfPath ? `${URLFile}${newsItem.PdfPath}` : "",
        createDate: newsItem.CreateDate,
      }));
      setNews(processedData);
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
    if (newsItem.pdfPath) {
      setButtonLoading((prev) => ({ ...prev, [index]: true }));
      try {
        window.open(newsItem.pdfPath, "_blank");
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

  const handleViewAllClick = () => {
    localStorage.setItem("menuName", "ข่าวประชาสัมพันธ์");
    router.push("/NewsAll");
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
            <header className="mb-5">
              <h2
                className="lined lined-center text-uppercase mb-4"
                style={{ marginTop: "100px" }}
              >
                ข่าวประชาสัมพันธ์
              </h2>
              <div style={{ textAlign: "right", width: "100%" }}>
                <Button
                  type="link"
                  icon={<RightOutlined />}
                  className={styles.customButton}
                  onClick={handleViewAllClick}
                >
                  ดูทั้งหมด
                </Button>
              </div>
            </header>

            <div className="row gy-5">
              {news.map((newsItem, index) => (
                <div className="col-lg-22 col-md-6 col-122" key={newsItem.id}>
                  <div className="product h-100">
                    <div className="box-image">
                      <div className="mb-4 primary-overlay">
                        <button
                          className="btn btn-outline-light"
                          onClick={() => handlePdfClick(newsItem, index)}
                          disabled={buttonLoading[index]}
                        >
                          {newsItem.imagePath && (
                            <img
                              className="img-fluid"
                              src={newsItem.imagePath}
                              alt="..."
                              width={400}
                              height={600}
                            />
                          )}
                          <div className="overlay-content d-flex flex-column justify-content-center p-4">
                            <ul className="list-inline mb-0 box-image-content text-center">
                              <li className="list-inline-item"></li>
                            </ul>
                          </div>
                        </button>
                      </div>
                      <div
                        className="text-center"
                        style={{
                          paddingBottom: "10px",
                        }}
                      >
                        <h3
                          className="h4 text-uppercase text-primary"
                          style={{ fontSize: "0.92rem" }}
                        >
                          <span className="text-reset">{newsItem.title}</span>
                        </h3>
                        <p
                          className="bigsmall text-black text-muted-new"
                          style={{ fontSize: "0.9rem" }}
                        >
                          {newsItem.details ? newsItem.details : <br />}
                        </p>
                        <p className="small text-uppercase text-muted-new">
                          {newsItem.createDate
                            ? `โพสต์เมื่อวันที่ ${formatDate(
                                newsItem.createDate
                              )}`
                            : "No date available"}
                        </p>
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handlePdfClick(newsItem, index)}
                          disabled={buttonLoading[index]}
                        >
                          {buttonLoading[index]
                            ? "กำลังโหลด..."
                            : "คลิกเพื่อ อ่านต่อ"}
                        </button>
                      </div>
                    </div>
                    {index < 3 && (
                      <ul className="list-unstyled p-0 ribbon-holder mb-0">
                        <li className="mb-1">
                          <div className="ribbon sale ribbon-primary flash">
                            NEW
                          </div>
                        </li>
                      </ul>
                    )}
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

export default NewsPage;
