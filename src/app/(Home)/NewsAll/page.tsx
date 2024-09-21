"use client";
import { useState, useEffect, useCallback } from "react";
import Pagination from "@mui/material/Pagination";
import { useMediaQuery } from "@mui/material";
import { News } from "@/types";
import { base64ToBlobUrl } from "@/utils/base64ToBlobUrl";
import { message } from "antd";
interface Data {
  Id: number;
  Title: string;
  Details: string;
  Image: string;
  File: string;
  CreateDate: string;
}

function NewsAll() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [search, setSearch] = useState("");
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Responsive check for mobile devices
  const isMobile = useMediaQuery("(max-width:991px)");

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

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Handle pagination change
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  return (
    <section className="py-5">
      <div className="container py-4">
        <div className="row gy-5">
          {isMobile && (
            <div className="col-lg-3 mb-4">
              <h3 className="h4 lined text-uppercase mb-4">ค้นหา</h3>
              <div className="input-group mb-3">
                <input
                  className="form-control"
                  type="text"
                  placeholder="ค้นหา ข่าวประชาสัมพันธ์"
                  aria-label="search"
                  value={search}
                  onChange={handleSearchChange}
                />
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => setPage(1)}
                >
                  <i className="fas fa-search" />
                </button>
              </div>
            </div>
          )}

          <div className={`col-lg-9 ${!isMobile ? "order-lg-1" : ""}`}>
            {news.map((release, index) => (
              <div className="row gy-4 mb-5" key={release.id}>
                <div className="col-lg-4">
                  <a
                    className="d-block"
                    href={release.File}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ cursor: "pointer" }}
                    onClick={() => handlePdfClick(release, index)}
                  >
                    <img className="img-fluid" src={release.image} alt="" />
                  </a>
                </div>
                <div className="col-lg-8">
                  <h2 className="h3 text-uppercase mb-3">
                    <a
                      className="text-dark"
                      href={release.File}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ cursor: "pointer" }}
                      onClick={() => handlePdfClick(release, index)}
                    >
                      {release.title}
                    </a>
                  </h2>
                  <p className="text-sm text-gray-700 mb-3">
                    {release.details}
                  </p>
                  <p className="text-end">
                    <button
                      className="btn btn-outline-primary"
                      style={{ borderRadius: "50px", padding: "10px 20px" }}
                      onClick={() => handlePdfClick(release, index)}
                      disabled={loading[index]}
                    >
                      {loading[index] ? "กำลังโหลด..." : "คลิกเพื่อ อ่านต่อ"}
                    </button>
                  </p>
                </div>
              </div>
            ))}
          </div>
          {!isMobile && (
            <div className="col-lg-3 order-lg-2">
              <div className="mb-4">
                <h3 className="h4 lined text-uppercase mb-4">ค้นหา</h3>
                <div className="input-group mb-3">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="ค้นหา ข่าวประชาสัมพันธ์"
                    aria-label="search"
                    value={search}
                    onChange={handleSearchChange}
                  />
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => setPage(1)}
                  >
                    <i className="fas fa-search" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="py-4 border-top">
          <div className="d-flex justify-content-center">
            <Pagination
              count={Math.ceil(totalRows / rowsPerPage)}
              page={page}
              onChange={handlePageChange}
              color="secondary"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default NewsAll;
