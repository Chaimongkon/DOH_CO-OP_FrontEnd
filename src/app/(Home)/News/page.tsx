"use client";
import React, { useCallback, useEffect, useState } from "react";
import { base64ToBlobUrl } from "@/utils/base64ToBlobUrl";
import { News } from "@/types";
import Link from "next/link";
import { RightOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import styles from "./HomeNews.module.css";
import { useRouter } from "next/navigation";

const NewsPage = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();

  const uploadFile = async (base64Data: string, fileName: string) => {
    try {
      const response = await fetch(`${API}/Upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: fileName,
          fileData: base64Data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const result = await response.json();
      return result.fileUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const fetchNews = useCallback(async () => {
    try {
      const response = await fetch(`${API}/News`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      const processedData = data.map((news: any) => ({
        id: news.Id,
        title: news.Title,
        details: news.Details,
        image: base64ToBlobUrl(news.Image, "image/webp"),
        file: news.File,
        pdffile: "",
        createDate: news.CreateDate,
      }));

      setNews(processedData);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    }
  }, [API]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handlePdfClick = async (newsItem: any, index: number) => {
    if (!newsItem.pdffile) {
      setLoading((prev) => ({ ...prev, [index]: true }));

      try {
        const pdfUrl = await uploadFile(newsItem.file, `${newsItem.title}.pdf`);
        setNews((prevNews) =>
          prevNews.map((item, i) =>
            i === index ? { ...item, pdffile: pdfUrl } : item
          )
        );
        window.open(pdfUrl, "_blank");
      } catch (error) {
        message.error(`Failed to upload PDF for ${newsItem.title}`);
      } finally {
        setLoading((prev) => ({ ...prev, [index]: false }));
      }
    } else {
      window.open(newsItem.pdffile, "_blank");
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
        <header className="mb-5">
          <br />
          <br />
          <br />
          <br />
          <h2 className="lined lined-center text-uppercase mb-4">
            ข่าวประชาสัมพันธ์
          </h2>
          <div style={{ textAlign: "right", width: "100%" }}>
            <Button
              type="link"
              icon={<RightOutlined />}
              iconPosition={"end"}
              className={styles.customButton}
              onClick={handleViewAllClick}
            >
              ดูทั้งหมด
            </Button>
          </div>
        </header>

        <div className="row gy-5">
          {news.slice(0, 10).map((newsItem, index) => (
            <div className="col-lg-22 col-md-6 col-122" key={newsItem.id}>
              <div className="product h-100">
                <div className="box-image">
                  <div className="mb-4 primary-overlay">
                    <button
                      className="btn btn-outline-light"
                      onClick={() => handlePdfClick(newsItem, index)}
                      disabled={loading[index]}
                    >
                      {newsItem.image && (
                        <img
                          className="img-fluid"
                          src={newsItem.image}
                          alt="..."
                          width={400}
                          height={600}
                        />
                      )}
                      <div className="overlay-content d-flex flex-column justify-content-center p-4">
                        <ul className="list-inline mb-0 box-image-content text-center">
                          <li className="list-inline-item"> </li>
                        </ul>
                      </div>
                    </button>
                  </div>
                  <div className="text-center">
                    <h3 className="h4 text-uppercase text-primary">
                      <span className="text-reset">{newsItem.title}</span>
                    </h3>
                    <p className="bigsmall text-black text-muted">
                      {newsItem.details}
                    </p>
                    <p className="small text-uppercase text-muted">
                      {newsItem.createDate
                        ? `โพสต์เมื่อวันที่ ${formatDate(newsItem.createDate)}`
                        : "No date available"}
                    </p>

                    <button
                      className="btn btn-outline-primary"
                      onClick={() => handlePdfClick(newsItem, index)}
                      disabled={loading[index]}
                    >
                      {loading[index] ? "กำลังโหลด..." : "คลิกเพื่อ อ่านต่อ"}
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
      </div>
    </section>
  );
};

export default NewsPage;
