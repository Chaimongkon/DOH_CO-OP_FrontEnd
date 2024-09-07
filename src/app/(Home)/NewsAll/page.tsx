"use client"
import { useState, useEffect, useCallback } from "react";
import Pagination from '@mui/material/Pagination';
import { useMediaQuery } from "@mui/material";

interface Data {
  Id: number;
  Title: string;
  Details: string;
  Image: string;
  File: string;
  CreateDate: string;
}

function NewsAll() {
  const [data, setData] = useState<Data[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [search, setSearch] = useState("");
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Responsive check for mobile devices
  const isMobile = useMediaQuery("(max-width:991px)");

  // Fetch data with pagination and search
  const getPaginatedData = useCallback(() => {
    let url = `${API}/NewsAll?page=${page}&per_page=${rowsPerPage}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setData(data.data);
        setTotalRows(data.total);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [API, page, rowsPerPage, search]);

  // Trigger data fetch when page, rowsPerPage, or search changes
  useEffect(() => {
    getPaginatedData();
  }, [getPaginatedData]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Handle pagination change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <section className="py-5">
      <div className="container py-4">
        <div className="row gy-5">
          {/* Conditionally render the search box on top for mobile devices */}
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
                  onClick={() => setPage(1)} // Reset to first page on search
                >
                  <i className="fas fa-search" />
                </button>
              </div>
            </div>
          )}

          <div className={`col-lg-9 ${!isMobile ? "order-lg-1" : ""}`}>
            {/* BLOG LISTING ITEMS */}
            {data.map((release) => (
              <div className="row gy-4 mb-5" key={release.Id}>
                <div className="col-lg-4">
                  <a
                    className="d-block"
                    href={release.File}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      className="img-fluid"
                      src={`data:image/jpeg;base64,${release.Image}`}
                      alt=""
                    />
                  </a>
                </div>
                <div className="col-lg-8">
                  <h2 className="h3 text-uppercase mb-3">
                    <a
                      className="text-dark"
                      href={release.File}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {release.Title}
                    </a>
                  </h2>
                  <p className="text-sm text-gray-700 mb-3">
                    {release.Details}
                  </p>
                  <p className="text-end">
                    <a
                      className="btn btn-outline-primary"
                      href={release.File}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      คลิกเพื่อ อ่านต่อ
                    </a>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Render the search box on the side for larger screens */}
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
                    onClick={() => setPage(1)} // Reset to first page on search
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
