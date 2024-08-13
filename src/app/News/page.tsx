"use client";
import React, { useCallback, useEffect, useState } from "react";
import { base64ToBlobUrl } from "@/utils/base64ToBlobUrl";
import { News } from "@/types";
import Link from "next/link";
import { RightOutlined } from "@ant-design/icons";
import { Button } from "antd";
import styles from "./HomeNews.module.css";

const NewsPage = () => {
  const [news, setNews] = useState<News[]>([]);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

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
        pdffile: base64ToBlobUrl(news.File, "application/pdf"),
        createDate: news.CreateDate, // Check this field
      }));

      setNews(processedData);
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
  }, [API]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-based in JavaScript
    const year = date.getFullYear() + 543; // Convert to Buddhist calendar year

    return `${day}/${month}/${year}`;
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
            <Link href="/NewAll">
              <Button
                type="link"
                icon={<RightOutlined />}
                iconPosition={"end"}
                className={styles.customButton}
              >
                ดูทั้งหมด
              </Button>
            </Link>
          </div>
        </header>

        <div className="row gy-5">
          {news.slice(0, 10).map((newsItem, index) => (
            <div className="col-lg-22 col-md-6 col-12" key={newsItem.id}>
              <div className="product h-100">
                <div className="box-image">
                  <div className="mb-4 primary-overlay">
                    <a
                      className="btn btn-outline-light"
                      href={newsItem.pdffile}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {newsItem.image[index] && (
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
                    </a>
                  </div>
                  <div className="text-center">
                    <h3 className="h4 text-uppercase text-primary">
                      <a
                        className="text-reset"
                        href={newsItem.pdffile}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {newsItem.title}
                      </a>
                    </h3>
                    <p className="bigsmall text-black text-muted">
                      {newsItem.details}
                    </p>
                    <p className="small text-uppercase text-muted">
                      {newsItem.createDate
                        ? `โพสต์เมื่อวันที่ ${formatDate(newsItem.createDate)}`
                        : "No date available"}
                    </p>

                    <a
                      className="btn btn-outline-primary"
                      href={newsItem.pdffile}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      คลิกเพื่อ อ่านต่อ
                    </a>
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
