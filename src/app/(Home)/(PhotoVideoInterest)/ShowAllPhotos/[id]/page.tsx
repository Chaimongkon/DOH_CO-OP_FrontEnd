"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Lottie from 'lottie-react';
import Image from "next/image";
import animationData from "../../../../loading4.json";
import logger from "@/lib/logger";
import { useApiConfig } from "@/hooks/useApiConfig";
import { useMenuName } from "@/hooks/useLocalStorage";

const ShowAllPhotos = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [imagesWithDimensions, setImagesWithDimensions] = useState<
    { src: string; width: number; height: number }[]
  >([]);
  const [title, setTitle] = useState<string>("");
  const [index, setIndex] = useState<number>(-1);
  const { API, URLFile: URLImg } = useApiConfig();
  const [, setMenuName] = useMenuName();

  useEffect(() => {
    let isMounted = true;
    
    const fetchImages = async () => {
      try {
        if (!API || !id) {
          return;
        }

        const response = await axios.get(`${API}/Photos/${id}`);
        
        if (!isMounted) return;
        
        // Handle API response structure: { images: [...], title: "..." }
        if (response.data && response.data.images) {
          setImages(response.data.images);
          const albumTitle = response.data.title || "ภาพกิจกรรมสหกรณ์";
          setTitle(albumTitle);
          setMenuName(albumTitle);
          // Dispatch custom event for ClientWrapper
          window.dispatchEvent(new Event('menuNameChanged'));
        } else {
          setImages([]);
          const albumTitle = response.data?.title || "ไม่พบรูปภาพ";
          setTitle(albumTitle);
          setMenuName(albumTitle);
          // Dispatch custom event for ClientWrapper
          window.dispatchEvent(new Event('menuNameChanged'));
        }
        
      } catch (error) {
        logger.error("Error fetching images:", error);
        if (isMounted) {
          // Set empty state on error
          setImages([]);
          const errorTitle = "เกิดข้อผิดพลาดในการโหลดรูปภาพ";
          setTitle(errorTitle);
          setMenuName(errorTitle);
          // Dispatch custom event for ClientWrapper
          window.dispatchEvent(new Event('menuNameChanged'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchImages();
    
    return () => {
      isMounted = false;
    };
  }, [id, API, setMenuName]);

  useEffect(() => {
    let isMounted = true;
    
    const getImageDimensions = (src: string) =>
      new Promise<{ width: number; height: number }>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => {
          // Return default dimensions on error
          resolve({ width: 400, height: 300 });
        };
        img.src = src;
      });

    const loadImagesWithDimensions = async () => {
      if (!URLImg || images.length === 0) {
        if (isMounted) {
          setImagesWithDimensions([]);
        }
        return;
      }

      const imagesWithDims = await Promise.all(
        images.map(async (photo) => {
          const fullImageUrl = `${URLImg}${photo}`;
          
          try {
            const { width, height } = await getImageDimensions(fullImageUrl);
            return { src: fullImageUrl, width, height };
          } catch {
            return { src: fullImageUrl, width: 400, height: 300 };
          }
        })
      );
      
      if (isMounted) {
        setImagesWithDimensions(imagesWithDims);
      }
    };

    loadImagesWithDimensions();
    
    return () => {
      isMounted = false;
    };
  }, [images, URLImg]);

  const ImagesLightbox = images.map((photo) => {
    return { src: `${URLImg}${photo}` };
  });

  return (
    <div>
      <section className="py-5">
        <div className="container py-4">
        {loading ? (
            <div className="loading-container">
              <Lottie animationData={animationData} loop={true} autoplay={true} style={{ height: 150, width: 150 }} />
            </div>
          ) : (
            <>
              <header className="mb-5">
                <h2 className="text-uppercase lined mb-4">{title}</h2>
              </header>
              <div className="row gy-4">
                <div className="col-lg-12">
                  {imagesWithDimensions.length > 0 ? (
                    <div className="photo-grid">
                      {imagesWithDimensions.map((photo, index) => (
                        <Image
                          key={index}
                          src={photo.src}
                          alt={`Photo ${index + 1} from album: ${title}`}
                          width={photo.width}
                          height={photo.height}
                          style={{
                            width: "100%",
                            height: "auto",
                            objectFit: "cover",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
                            cursor: "pointer",
                          }}
                          onClick={() => setIndex(index)}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <div 
                        style={{
                          background: "#f8f9fa",
                          padding: "40px",
                          borderRadius: "12px",
                          border: "2px dashed #dee2e6"
                        }}
                      >
                        <h4 className="text-muted">ไม่พบรูปภาพในอัลบั้มนี้</h4>
                        <p className="text-muted mb-4">
                          อัลบั้มยังไม่มีรูปภาพหรือเกิดข้อผิดพลาดในการโหลด
                        </p>
                        <button 
                          className="btn btn-primary"
                          onClick={() => window.location.reload()}
                        >
                          ลองใหม่อีกครั้ง
                        </button>
                        <br />
                        <small className="text-muted mt-3 d-block">
                          หรือ <a href="/">กลับไปหน้าหลัก</a>
                        </small>
                      </div>
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
      <style jsx>{`
        .photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 15px;
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
};

export default ShowAllPhotos;
