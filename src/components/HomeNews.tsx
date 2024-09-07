"use client";
import React, { useEffect, useState } from "react";
import { News } from "@/types";
import Link from "next/link";
import { RightOutlined } from "@ant-design/icons";
import { Button } from "antd";
import styles from "./HomeNews.module.css";

export const base64ToBlobUrl = (base64: string, contentType: string): string => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: contentType });
  return URL.createObjectURL(blob);
};

const HomeNews = ({ news }: { news: News[] }) => {
  const [blobUrlsImage, setBlobUrlsImage] = useState<string[]>([]);
  const [blobUrlsPdf, setBlobUrlsPdf] = useState<string[]>([]);

  useEffect(() => {
    const urlsImage = news.map((newsItem) => {
      if (newsItem.image) {
        return base64ToBlobUrl(newsItem.image, "image/webp");
      }
      return "";
    });

    const urlsPdf = news.map((newsItem) => {
      if (newsItem.pdffile) {
        return base64ToBlobUrl(newsItem.pdffile, "application/pdf");
      }
      return "";
    });

    setBlobUrlsImage(urlsImage);
    setBlobUrlsPdf(urlsPdf);

    return () => {
      // Revoke the object URLs to free up memory
      urlsImage.forEach((url) => url && URL.revokeObjectURL(url));
      urlsPdf.forEach((url) => url && URL.revokeObjectURL(url));
    };
  }, [news]);

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
                      href={blobUrlsPdf[index] || newsItem.pdffile}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {blobUrlsImage[index] && (
                        <img
                          className="img-fluid"
                          src={blobUrlsImage[index]}
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
                        href={blobUrlsPdf[index] || newsItem.pdffile}
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
                      href={blobUrlsPdf[index] || newsItem.pdffile}
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

export default HomeNews;
