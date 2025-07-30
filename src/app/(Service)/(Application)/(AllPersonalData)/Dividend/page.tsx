"use client";
import * as React from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import PhotoAlbum from "react-photo-album";
import { useState, useEffect, useCallback, useMemo } from "react";
import { message } from "antd";
import { Application } from "../../../../../types";
import Lottie from "react-lottie";
import animationData from "../../../../loading4.json";

function Install() {
  const [app, setApp] = useState<Application[]>([]);
  const [index, setIndex] = useState<number>(-1); // For Lightbox index control
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const URLFile = process.env.NEXT_PUBLIC_PICHER_BASE_URL;
  const [imagesWithDimensions, setImagesWithDimensions] = useState<
    { src: string; width: number; height: number }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true); // Manage loading state

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

  // Fetch images from the API
  const fetchImages = useCallback(async () => {
    try {
      const response = await fetch(`${API}/Application`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      // Process the fetched data
      const processedData: Application[] = data
        .map((app: any) => ({
          id: app.Id,
          title: app.Title,
          detail: app.Detail,
          imageNumber: app.ImageNumber,
          imagePath: app.ImagePath ? `${URLFile}${app.ImagePath}` : "",
          applicationMainType: app.ApplicationMainType,
          applicationType: app.ApplicationType,
        }))
        .filter((app: Application) => app.applicationType === "เงินปันผล - เฉลี่ยคืน");

      setApp(processedData);
    } catch (error) {
      console.error("Failed to fetch images:", error);
      message.error("Failed to fetch images.");
    } finally {
      setLoading(false); // Update loading state
    }
  }, [API, URLFile]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Get dimensions for each image
  useEffect(() => {
    const getImageDimensions = (src: string) =>
      new Promise<{ width: number; height: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.src = src;
      });

    const loadImagesWithDimensions = async () => {
      const imagesWithDims = await Promise.all(
        app.map(async (appItem) => {
          const { width, height } = await getImageDimensions(appItem.imagePath);
          return { src: appItem.imagePath, width, height };
        })
      );
      setImagesWithDimensions(imagesWithDims);
    };

    if (app.length > 0) {
      loadImagesWithDimensions();
    }
  }, [app]);

  // Lightbox images array
  const ImagesLightbox = imagesWithDimensions.map((photo) => ({
    src: photo.src,
  }));

  return (
    <div>
      <section className="py-5">
        <div className="container py-4">
          {loading ? (
            <div className="loading-container">
              <Lottie options={defaultOptions} height={150} width={150} />
            </div>
          ) : (
            <>
              {app.length > 0 && (
                <header className="mb-5">
                  <h2 className="text-uppercase lined mb-4">{app[0].title}</h2>
                  <p className="lead">{app[0].detail}</p>
                </header>
              )}
              <div className="row gy-4">
                <div className="col-lg-12">
                  {imagesWithDimensions.length > 0 && (
                    <div className="photo-grid">
                      {imagesWithDimensions.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo.src}
                          alt={`Image ${idx + 1}`}
                          style={{
                            width: "100%",
                            height: "auto",
                            objectFit: "cover",
                            boxShadow: "0 10px 12px rgba(0, 0, 0, 0.6)",
                            borderRadius: "10px",
                          }}
                          onClick={() => setIndex(idx)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {ImagesLightbox.length > 0 && (
                <Lightbox
                  index={index}
                  slides={ImagesLightbox}
                  open={index >= 0}
                  close={() => setIndex(-1)}
                />
              )}
            </>
          )}
        </div>
      </section>

      {/* Responsive CSS for the grid */}
      <style>{`
        .photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 50px;
        }
        .photo-grid img {
          cursor: pointer;
          width: 100%;
          height: auto;
          object-fit: cover;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
}

export default Install;
