"use client";
import React, { useCallback, useEffect, useState, memo, useMemo } from "react";
import { DownloadForm } from "@/types";
import { Button, message } from "antd";
import "../DownloadForm.css";

// Utility function for making API requests
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

const Appeal: React.FC = memo(() => {
  const [forms, setForms] = useState<DownloadForm[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

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
        .filter(
          (form: any) =>
            form.TypeForm === "แบบฟอร์มหนังสือร้องทุกข์ / ร้องเรียน"
        )
        .map((form: any) => ({
          id: form.Id,
          title: form.Title,
          typeForm: form.TypeForm,
          typeMember: form.TypeMember,
          File: form.File, // Ensure you're using the correct property name
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

  const handlePdfClick = useCallback(
    async (formItem: DownloadForm, index: number) => {
      if (!formItem.pdffile) {
        setLoading((prev) => ({ ...prev, [index]: true }));

        try {
          const pdfUrl = await uploadFile(formItem.File, `${formItem.title}.pdf`); // Ensure you're using the correct property name
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

  const groupedForms = useMemo(() => {
    return forms.reduce((groups, form) => {
      const { typeMember } = form;
      if (!groups[typeMember]) {
        groups[typeMember] = [];
      }
      groups[typeMember].push(form);
      return groups;
    }, {} as { [key: string]: DownloadForm[] });
  }, [forms]);

  const columns = Object.entries(groupedForms);

  return (
    <section className="py-5">
      <div className="container py-4">
        <div className="row gy-4">
          {columns.map(([typeMember, memberForms], columnIndex) => (
            <div className="col-lg-4" key={columnIndex}>
              <h3 className="text-uppercase lined mb-4">{typeMember}</h3>
              {memberForms.map((formItem: DownloadForm, index: number) => (
                <ul className="list-unstyled" key={formItem.id}>
                  <li className="d-flex mb-32">
                    <div
                      className="icon-filled2 me-2"
                      style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)" }}
                    >
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
                      <p className="text-sm312 mb-0">{formItem.title}</p>
                    </a>
                  </li>
                </ul>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default Appeal;
