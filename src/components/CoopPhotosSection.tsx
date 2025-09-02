"use client";
import React, { useEffect, useState, memo } from "react";
import Image from "next/image";
import LinkMui from "@mui/joy/Link";
import logger from "@/lib/logger";
import { SectionLoading } from "@/components/loading";
import useNavigation from "@/hooks/useNavigation";

interface Photo {
  Id: string;
  Title: string;
  Cover: string;
}

interface PaginatedApiResponse<T> {
  data: T[];
  page?: number;
  total?: number;
  pageCount?: number;
}

const CoopPhotosSection: React.FC = memo(function CoopPhotosSection() {
  const [cover, setCover] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const { navigateWithMenu } = useNavigation();

  useEffect(() => {
    let isMounted = true;
    
    const fetchPhotosData = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_BASE_URL;
        if (!API) {
          logger.error("API URL is not defined");
          return;
        }

        const photoResponse = await fetch(`${API}/PhotosCover`);

        if (!photoResponse.ok) {
          throw new Error('Failed to fetch photos data');
        }

        const photoData = await photoResponse.json();
        
        if (isMounted) {
          // Handle direct array or pagination response for photos
          const photosArray = Array.isArray(photoData) ? photoData : (photoData as PaginatedApiResponse<Photo>).data || [];
          setCover(photosArray);
          setLoading(false);
        }
      } catch (error) {
        logger.error("Error fetching photos data:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPhotosData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCardClick = (id: string, title: string) => {
    navigateWithMenu(`/ShowAllPhotos/${id}`, title);
  };

  if (loading) {
    return <SectionLoading tip="กำลังโหลดภาพกิจกรรม..." />;
  }

  return (
    <>
      <header className="mb-5">
        <h2 className="lined lined-center text-uppercase mb-4">
          ภาพกิจกรรมสหกรณ์
        </h2>
        <div style={{ textAlign: "right" }}>
          <a href="/AlbumPhotosOverAll">ดูทั้งหมด</a>
        </div>
      </header>
      
      <div className="row gy-5 align-items-stretch">
        {cover.slice(0, 6).map((covers) => (
          <div className="col-lg-4 col-md-6" key={covers.Id}>
            <div className="product h-100">
              <div
                className="product-image"
                style={{ 
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.6)",
                  borderRadius: "8px"
                }}
              >
                <LinkMui
                  overlay
                  underline="none"
                  onClick={() =>
                    handleCardClick(covers.Id, covers.Title)
                  }
                  sx={{
                    color: "#fff",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    display: "block",
                  }}
                >
                  <Image
                    className="img-fluid"
                    src={covers.Cover}
                    alt={covers.Title}
                    width={400}
                    height={300}
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover",
                      borderRadius: "8px"
                    }}
                  />
                </LinkMui>
              </div>
              <div className="py-4 px-3 text-center">
                <h3 className="h5 text-uppercase mb-3">
                  <a className="reset-link" href={`/ShowAllPhotos/${covers.Id}`}>
                    {covers.Title}
                  </a>
                </h3>
              </div>
              {cover.indexOf(covers) < 3 && (
                <ul className="list-unstyled p-0 ribbon-holder mb-0">
                  <li className="mb-1">
                    <div className="ribbon new ribbon-info flash">
                      NEW
                    </div>
                  </li>
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
});

export default CoopPhotosSection;