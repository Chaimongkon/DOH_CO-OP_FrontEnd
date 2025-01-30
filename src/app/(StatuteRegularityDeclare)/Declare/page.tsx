"use client";
import React, { useCallback, useEffect, useState, memo, useMemo } from "react";
import { DownloadForm } from "@/types";
import { message } from "antd";
import Lottie from "react-lottie"; // นำเข้า Lottie
import animationData from "../../File.json"; // นำเข้าไฟล์ Lottie ของคุณ
import "../SRD.css";

const apiRequest = async (url: string, method: string = "GET", body?: any) => {
  const headers = {
    "Content-Type": "application/json",
  };
  const options: RequestInit = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }
  return response.json();
};

const Declare: React.FC = memo(() => {
  const [forms, setForms] = useState<DownloadForm[]>([]);
  const [loading, setLoading] = useState(false);
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

  // Fetch download form data
  const fetchDownloadForm = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`${API}/SRD`);
      const processedData = data
        .filter((form: any) => form.TypeForm === "ประกาศ")
        .map((form: any) => ({
          id: form.Id,
          title: form.Title,
          typeForm: form.TypeForm,
          typeMember: form.TypeMember,
          filePath: form.FilePath ? `${URLFile}${form.FilePath}` : "",
          pdffile: form.FilePath || "",
          createDate: form.CreateDate,
        }));
      setForms(processedData);
    } catch (error) {
      console.error("Failed to fetch forms:", error);
      message.error("Failed to fetch download forms");
    } finally {
      setLoading(false);
    }
  }, [API, URLFile]);

  useEffect(() => {
    fetchDownloadForm();
  }, [fetchDownloadForm]);

  // Handle the PDF click
  const handlePdfClick = useCallback((formItem: DownloadForm) => {
    if (formItem.pdffile) {
      window.open(formItem.pdffile, "_blank");
    } else {
      message.error(`ไม่มีไฟล์ ${formItem.title}`);
    }
  }, []);

  // Group forms by member type
  const groupedForms = useMemo(() => {
    const validMembers = [
      "สมาชิกสามัญประเภท ก",
      "สมาชิกสามัญประเภท ข",
      "สมาชิกสมทบ",
      "สมาชิกประเภท ก ข สมทบ",
      "สหกรณ์ฯ",
    ];
    const grouped = forms.reduce((groups, form) => {
      const { typeMember } = form;
      if (validMembers.includes(typeMember)) {
        if (!groups[typeMember]) {
          groups[typeMember] = [];
        }
        groups[typeMember].push(form);
      }
      return groups;
    }, {} as { [key: string]: DownloadForm[] });

    return Object.keys(grouped)
      .sort((a, b) => validMembers.indexOf(a) - validMembers.indexOf(b))
      .reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {} as { [key: string]: DownloadForm[] });
  }, [forms]);

  return (
    <section className="py-5">
      <center>
        <img
          className="img-fluid"
          src="image/ImageMenu/Announce.png"
          alt="Announce"
          style={{ marginBottom: "50px" }}
        />
      </center>
      <div className="container py-4">
        {loading ? (
          <div className="loading-container">
            <Lottie options={defaultOptions} height={150} width={150} />{" "}
            {/* ใช้ Lottie แสดงสถานะการโหลด */}
          </div>
        ) : (
          <div className="row gy-4">
            {Object.entries(groupedForms).map(
              ([typeMember, memberForms], columnIndex) => (
                <div className="col-lg-12" key={columnIndex}>
                  <h3 className="text-uppercase lined mb-4">{typeMember}</h3>
                  <ul className="list-unstyled">
                    {memberForms.map((formItem: DownloadForm) => (
                      <li className="d-flex mb-32" key={formItem.id}>
                        <div
                          className="icon-filled3 me-2"
                          style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)" }}
                        >
                          <img
                            className="img-fluid cursor-pointer icon-shadow icon-3d"
                            src="image/ImageMenu/icon3.png"
                            alt="Open PDF"
                            onClick={() => handlePdfClick(formItem)}
                          />
                        </div>
                        <a
                          onClick={() => handlePdfClick(formItem)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cursor-pointer"
                        >
                          <p className="text-sm32 mb-0">{formItem.title}</p>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
});

export default Declare;
