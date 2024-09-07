"use client";
import React, { useCallback, useEffect, useState } from "react";
import { DownloadForm } from "@/types";
import { Button, message } from "antd";
import "../DownloadForm.css";

const Membership = () => {
  const [forms, setForms] = useState<DownloadForm[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

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

  const fetchDownloadForm = useCallback(async () => {
    try {
      const response = await fetch(`${API}/DownloadForm`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      const processedData = data
        .filter((form: any) => form.TypeForm === "แบบฟอร์มขอรับสวัสดิการ")
        .map((form: any) => ({
          id: form.Id,
          title: form.Title,
          typeForm: form.TypeForm,
          typeMember: form.TypeMember,
          file: form.File,
          pdffile: "",
          createDate: form.CreateDate,
        }));

      setForms(processedData);
    } catch (error) {
      console.error("Failed to fetch forms:", error);
    }
  }, [API]);

  useEffect(() => {
    fetchDownloadForm();
  }, [fetchDownloadForm]);

  const handlePdfClick = async (formItem: any, index: number) => {
    if (!formItem.pdffile) {
      setLoading((prev) => ({ ...prev, [index]: true }));

      try {
        const pdfUrl = await uploadFile(formItem.file, `${formItem.title}.pdf`);
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
  };

  return (
    <section className="py-5">
      <div className="container py-4">
        <div className="row gy-4">
          {forms.map((formItem, index) => (
            <div className="col-lg-4" key={index}>
              <h3 className="text-uppercase lined mb-4">
                {formItem.typeMember}
              </h3>
              <ul className="list-unstyled">
                <li className="d-flex mb-32">
                  <div className="icon-filled2 me-2">
                    <i
                      className="fas fa-download icon-shadow icon-3d"
                      onClick={() => handlePdfClick(formItem, index)}
                    ></i>
                  </div>
                  <a
                    onClick={() => handlePdfClick(formItem, index)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer"
                  >
                    <p className="text-sm3 mb-0">{formItem.title}</p>
                  </a>
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Membership;
