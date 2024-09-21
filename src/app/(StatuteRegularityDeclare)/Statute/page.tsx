"use client";
import React, { useCallback, useEffect, useState, memo, useMemo } from "react";
import { DownloadForm } from "@/types";
import { Button, message } from "antd";

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

const Statute: React.FC = memo(() => {
  const [forms, setForms] = useState<DownloadForm[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Use a cache to prevent duplicate file uploads
  const [uploadCache, setUploadCache] = useState<{ [key: string]: string }>({});

  const uploadFile = useCallback(
    async (base64Data: string, fileName: string) => {
      // Check if the file is already uploaded and cached
      if (uploadCache[fileName]) return uploadCache[fileName];

      try {
        const result = await apiRequest(`${API}/Upload`, "POST", {
          fileName,
          fileData: base64Data,
        });

        // Cache the result to avoid re-uploading the same file
        setUploadCache((prevCache) => ({
          ...prevCache,
          [fileName]: result.fileUrl,
        }));
        return result.fileUrl;
      } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
      }
    },
    [API, uploadCache]
  );

  const fetchDownloadForm = useCallback(async () => {
    try {
      const data = await apiRequest(`${API}/SRD`);

      // Process and filter forms in one step to avoid multiple iterations
      const processedData = data
        .filter((form: any) => form.TypeForm === "ข้อบังคับ")
        .map((form: any) => ({
          id: form.Id,
          title: form.Title,
          typeForm: form.TypeForm,
          typeMember: form.TypeMember,
          File: form.File,
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
          const pdfUrl = await uploadFile(
            formItem.File,
            `${formItem.title}.pdf`
          );

          // Update forms state using immutability
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
      <center>
        <img
          className="img-fluid"
          src="image/ImageMenu/Rules.png"
          alt="Example blog post alt"
        />
      </center>
      <div className="container py-4">
        <div className="row gy-4">
          {columns.map(([typeMember, memberForms], columnIndex) => (
            <div className="col-lg-12" key={columnIndex}>
              <h3 className="text-uppercase lined mb-4">{typeMember}</h3>
              {memberForms.map((formItem: DownloadForm, index: number) => (
                <ul className="list-unstyled" key={formItem.id}>
                  <li className="d-flex mb-32">
                    <div
                      className="icon-filled3 me-2"
                      style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)" }}
                    >
                      <img
                        className="img-fluid cursor-pointer"
                        src="image/ImageMenu/icon.png"
                        alt="Example blog post alt"
                        onClick={() => handlePdfClick(formItem, index)}
                      />
                    </div>
                    <a
                      onClick={() => handlePdfClick(formItem, index)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer"
                    >
                      <p className="text-sm32 mb-0">{formItem.title}</p>
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

export default Statute;
