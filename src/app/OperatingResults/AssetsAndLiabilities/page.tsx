"use client";

import { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { Button, ConfigProvider, Space } from "antd";
import { AntDesignOutlined } from "@ant-design/icons";
import { css } from "@emotion/css";
interface Asset {
  Id: number;
  PdfFile: string;
  TitleMonth: string;
  Year: string; // Assuming Year is part of the asset data
}

interface YearData {
  Year: string;
}

const AssetsAndLiabilities = () => {
  const [year, setYear] = useState<string>("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [allyear, setAllYear] = useState<YearData[]>([]);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL as string;
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const rootPrefixCls = getPrefixCls();
  const linearGradientButton = css`
    &.${rootPrefixCls}-btn-primary:not([disabled]):not(
        .${rootPrefixCls}-btn-dangerous
      ) {
      border-width: 0;
      background: linear-gradient(135deg, #e65c00, #f9d423);
      transition: background 0.3s;
      position: relative;
      overflow: hidden;

      > span {
        position: relative;
      }

      &:hover {
        background: linear-gradient(
          135deg,
          #f12711,
          #f5af19
        ); /* Change to your desired hover gradient */
      }
    }
  `;

  const fetchAllYears = useCallback(async () => {
    try {
      const res = await fetch(`${API}AssetsLiabilities`);
      const data = await res.json();
      setAllYear(data.data);
      if (data.data.length > 0) {
        setYear(data.data[0].Year);
      }
    } catch (error) {
      console.error("Failed to fetch years:", error);
    }
  }, [API]);

  const fetchAssetsForYear = useCallback(
    async (selectedYear: string) => {
      try {
        const res = await fetch(`${API}AssetsLiabilities?year=${selectedYear}`);
        const data = await res.json();
        setAssets(data.data);
      } catch (error) {
        console.error("Failed to fetch assets:", error);
      }
    },
    [API]
  );

  useEffect(() => {
    fetchAllYears();
  }, [fetchAllYears]);

  useEffect(() => {
    if (year) {
      fetchAssetsForYear(year);
    }
  }, [year, fetchAssetsForYear]);

  const handleYearClick = (selectedYear: string) => {
    setYear(selectedYear);
  };

  const uniqueYears = useMemo(
    () => Array.from(new Set(allyear.map((row) => row.Year))),
    [allyear]
  );

  const filteredAssets = useMemo(
    () => assets.filter((asset) => asset.Year === year),
    [assets, year]
  );

  return (
    <>
      <section className="py-5">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-3">
              <h3 className="h3 text-uppercase lined mb-4">รายงานทางการเงิน</h3>
              <br />
              {uniqueYears.map((yearItem) => (
                <nav
                  className="nav flex-column nav-pills text-sm"
                  key={yearItem}
                >
                  <ConfigProvider
                    button={{
                      className: linearGradientButton,
                    }}
                  >
                    <Button
                      style={{ fontFamily: "DOHCOOP" }}
                      type="primary"
                      size="large"
                      icon={<AntDesignOutlined />}
                      onClick={() => handleYearClick(yearItem)}
                    >
                      ประจำปี {yearItem}
                    </Button>
                  </ConfigProvider>
                  <br />
                </nav>
              ))}
            </div>
            <div className="col-lg-9">
              <h2 className="h3 lined text-uppercase mb-4">ปี {year}</h2>
              <br />
              <div className="row gy-4">
                {filteredAssets.map((asset) => (
                  <div className="col-md-3 col-sm-6 text-center" key={asset.Id}>
                    <a
                      href={`${API}${asset.PdfFile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="icon icon-outlined icon-thin block-icon-hover mx-auto mb-3">
                        <img
                          className="icon icon-outlined icon-thin mx-auto mb-3 avatar p-1"
                          src="/image/logo/pdf.png"
                          alt="PDF Icon"
                        />
                      </div>
                    </a>
                    <h4 className="text-uppercase mb-3">
                      <a
                        className="text-reset"
                        href={`${API}${asset.PdfFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {asset.TitleMonth}
                      </a>
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AssetsAndLiabilities;
