"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Pagination from "@mui/material/Pagination";
import { useMediaQuery } from "@mui/material";
import { message } from "antd";
import Lottie from "react-lottie";
import debounce from "lodash.debounce"; // Use lodash for debouncing input
import animationData from "../../loading2.json";

function NewsAll() {
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10); // Rows per page, keep it constant
  const [totalRows, setTotalRows] = useState(0); // Total number of items
  const [search, setSearch] = useState("");
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState<{
    [key: string]: boolean;
  }>({});

  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const URLFile = process.env.NEXT_PUBLIC_PICHER_BASE_URL;

  // Responsive check for mobile devices
  const isMobile = useMediaQuery("(max-width:991px)");

  const defaultOptions = useMemo(
    () => ({
      loop: true,
      autoplay: true,
      animationData: animationData,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    }),
    []
  );

  // Optimized fetch function using memoization
  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API}/NewsAll?page=${page}&per_page=${rowsPerPage}&search=${search}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const processedData = data.data.map((newsItem: any) => ({
        id: newsItem.Id,
        title: newsItem.Title,
        details: newsItem.Details,
        imagePath: newsItem.ImagePath ? `${URLFile}${newsItem.ImagePath}` : "",
        pdfPath: newsItem.PdfPath ? `${URLFile}${newsItem.PdfPath}` : "",
        createDate: newsItem.CreateDate,
      }));
      setNews(processedData);
      setTotalRows(data.total); // Set the total rows for pagination
    } catch (error) {
      console.error("Failed to fetch news:", error);
      message.error("Failed to fetch news");
    } finally {
      setLoading(false);
    }
  }, [API, page, rowsPerPage, search, URLFile]);

  // Handle search with debounce to prevent unnecessary fetches
  const debouncedSearchChange = useMemo(
    () =>
      debounce((value: string) => {
        setSearch(value);
        setPage(1); // Reset to first page when search changes
      }, 300),
    []
  );

  // Fetch news data when page, rowsPerPage, or search changes
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearchChange.cancel();
    };
  }, [debouncedSearchChange]);

  // Handle PDF click event
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

  // Handle pagination change
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value); // Update page and refetch
  };

  return (
    <section className="py-5">
      <div className="container py-4">
          <>
            <header className="mb-5">
              <h2 className="lined lined-center text-uppercase">
                ข่าวประชาสัมพันธ์
              </h2>
            </header>
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
                      onChange={(e) => debouncedSearchChange(e.target.value)}
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
                <div className="row gy-4 mb-5">
                  {news.map((release, index) => (
                    <div
                      className={`${isMobile ? "col-6" : "col-12"} mb-4`}
                      key={release.id}
                    >
                      <div className={`row ${!isMobile ? "" : "text-center"}`}>
                        <div className={`${isMobile ? "col-12" : "col-lg-4"}`}>
                          <a
                            className="d-block"
                            href={release.pdfPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handlePdfClick(release, index)}
                          >
                            <img
                              className="img-fluid"
                              src={release.imagePath}
                              alt=""
                            />
                          </a>
                        </div>
                        <div
                          className={`${isMobile ? "col-12" : "col-lg-8"}`}
                          style={{ paddingTop: !isMobile ? "30px" : "20px" }}
                        >
                          <h2
                            className="text-uppercase mb-2"
                            style={{
                              fontSize: !isMobile ? "1.5em" : "inherit", // Larger font on desktop
                            }}
                          >
                            <a
                              className="text-dark"
                              href={release.pdfPath}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handlePdfClick(release, index)}
                            >
                              {release.title}
                            </a>
                          </h2>
                          <p
                            className="text-sm text-gray-700 mb-3"
                            style={{
                              fontSize: !isMobile ? "1.1em" : "inherit", // Larger font on desktop
                            }}
                          >
                            {release.details}
                          </p>
                          <p
                            className={`${
                              !isMobile ? "text-end" : "text-center"
                            }`}
                          >
                            <button
                              className="btn btn-outline-primary"
                              style={{
                                borderRadius: "20px",
                                padding: !isMobile ? "12px 24px" : "10px 20px",
                                fontSize: !isMobile ? "0.9em" : "0.8em", // Larger font on desktop
                              }}
                              onClick={() => handlePdfClick(release, index)}
                              disabled={buttonLoading[index]}
                            >
                              {buttonLoading[index]
                                ? "กำลังโหลด..."
                                : "คลิกเพื่อ อ่านต่อ"}
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                        onChange={(e) => debouncedSearchChange(e.target.value)}
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
          </>
      </div>
    </section>
  );
}

export default NewsAll;
