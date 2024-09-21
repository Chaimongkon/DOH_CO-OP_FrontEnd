"use client";

import { useState, useEffect, useCallback } from "react";
import { base64ToBlobUrl } from "@/utils/base64ToBlobUrl";
import { DownloadForm } from "@/types";
import { message } from "antd";

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

interface Society {
  id: number;
  image: string;
  subcategories: string;
  status: boolean;
}

const MemberTypeG = () => {
  const [society, setSociety] = useState<Society[]>([]);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [forms, setForms] = useState<DownloadForm[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const fetchImages = useCallback(async () => {
    try {
      const response = await fetch(`${API}/Serve`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const processedData: Society[] = data
        .map((society: any) => ({
          id: society.Id,
          image: base64ToBlobUrl(society.Image, "image/webp"),
          subcategories: society.Subcategories,
          status: society.IsActive,
        }))
        .filter(
          (society: Society) => society.subcategories === "สมาชิกสามัญประเภท ก"
        );

      setSociety(processedData);
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
  }, [API]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const uploadFile = useCallback(
    async (base64Data: string, fileName: string) => {
      try {
        const result = await apiRequest(`${API}/Upload`, "POST", {
          fileName,
          fileData: base64Data,
        });
        return result.fileUrl;
      } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
      }
    },
    [API]
  );

  const fetchDownloadForm = useCallback(async () => {
    try {
      const data = await apiRequest(`${API}/DownloadForm`);
      const processedData = data
        .filter((form: any) => form.Title === "แบบฟอร์มสมัครสมาชิกสามัญ ก")
        .map((form: any) => ({
          id: form.Id,
          title: form.Title,
          File: form.File, 
          pdffile: "",
        }));

      setForms(processedData);
    } catch (error) {
      console.error("Failed to fetch forms:", error);
    }
  }, [API]);

  useEffect(() => {
    fetchDownloadForm();
  }, [fetchDownloadForm]);

  const handlePdfClick = useCallback(
    async (formItem: DownloadForm, index: number) => {
      if (!formItem.pdffile) {
        setLoading((prev) => ({ ...prev, [index]: true }));

        try {
          const pdfUrl = await uploadFile(
            formItem.File,
            `${formItem.title}.pdf`
          );
          setForms((prevForms) =>
            prevForms.map((item, i) =>
              i === index ? { ...item, pdffile: pdfUrl } : item
            )
          );

          window.open(pdfUrl, "_blank");
        } catch (error) {
          message.error(`Failed to upload PDF for ${formItem.title}`);
        } finally {
          setLoading((prev) => ({ ...prev, [index]: false }));
        }
      } else {
        window.open(formItem.pdffile, "_blank");
      }
    },
    [uploadFile]
  );

  return (
    <>
      <section className="py-5">
        {society.map((s, i) => (
          <div className="container py-4" key={i}>
            <center>
              <img className="img-fluid-7" src={s.image} alt="" />
            </center>
          </div>
        ))}
        <div className="container py-4">
          <div className="row gy-4">
            <h3 className="text-uppercase lined mb-4">
              ดาวน์โหลดเอกสารใช้ในการสมัครสมาชิก
            </h3>
          </div>
          {forms.map((formItem, index) => (
            <ul className="list-unstyled" key={index}>
              <li className="d-flex mb-32">
                <div className="icon-filled2 me-2">
                  <i className="fas fa-download"></i>
                </div>
                <a
                  onClick={() => handlePdfClick(formItem, index)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                >
                  <p className="text-sm312 mb-0">{formItem.title}</p>
                </a>
              </li>
            </ul>
          ))}
        </div>
      </section>
    </>
  );
};

export default MemberTypeG;
