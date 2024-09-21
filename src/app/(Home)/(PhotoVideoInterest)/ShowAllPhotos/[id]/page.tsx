"use client";
import axios from "axios";
import { useState, useEffect, Suspense } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { ClipLoader } from "react-spinners";
import "../../../../styles/LoadingSpinner.css";

const ShowAllPhotos = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [imagesWithDimensions, setImagesWithDimensions] = useState<
    { src: string; width: number; height: number }[]
  >([]);
  const [title, setTitle] = useState<string>("");
  const [index, setIndex] = useState<number>(-1);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const URLImg = process.env.NEXT_PUBLIC_PICHER_BASE_URL;

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(`${API}/PhotoAll/${id}`);
        setImages(response.data.images);
        setTitle(response.data.title);
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [id, API]);

  useEffect(() => {
    const getImageDimensions = (src: string) =>
      new Promise<{ width: number; height: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.src = src;
      });

    const loadImagesWithDimensions = async () => {
      const imagesWithDims = await Promise.all(
        images.map(async (photo) => {
          const { width, height } = await getImageDimensions(
            `${URLImg}${photo}`
          );
          return { src: `${URLImg}${photo}`, width, height };
        })
      );
      setImagesWithDimensions(imagesWithDims);
    };

    if (images.length > 0) {
      loadImagesWithDimensions();
    }
  }, [images, URLImg]);

  const ImagesLightbox = images.map((photo) => {
    return { src: `${URLImg}${photo}`, width: 1200, height: 840 };
  });

  if (loading) {
    return (
      <div className="loading-container">
        <ClipLoader color="#007bff" size={80} />
      </div>
    );
  }

  return (
    <div>
      <section className="py-5">
        <div className="container py-4">
          <header className="mb-5">
            <h2 className="text-uppercase lined mb-4">{title}</h2>
          </header>
          <div className="row gy-4">
            <div className="col-lg-12">
              {imagesWithDimensions.length > 0 && (
                <div className="photo-grid">
                  {imagesWithDimensions.map((photo, index) => (
                    <img
                      key={index}
                      src={photo.src}
                      alt={`Image ${index + 1}`}
                      style={{
                        width: "415px",
                        height: "276px",
                        objectFit: "cover",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
                      }}
                      onClick={() => setIndex(index)}
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
        </div>
      </section>

      {/* Add CSS for 3-column layout */}
      <style jsx>{`
        .photo-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }
        .photo-grid img {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default ShowAllPhotos;
