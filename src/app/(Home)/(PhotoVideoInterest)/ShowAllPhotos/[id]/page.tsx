"use client";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Lottie from "react-lottie";
import animationData from "../../../../loading4.json";

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
    return { src: `${URLImg}${photo}` };
  });

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
                            width: "100%",
                            height: "auto",
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
