"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import LinkMui from "@mui/joy/Link";
import { Modal, ModalClose, Sheet } from "@mui/joy";
import InterestPage from "../Interest/page";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";
import "../../../styles/LoadingSpinner.css";

interface Photo {
  Id: string;
  Title: string;
  Cover: string;
}

interface Video {
  id: number;
  title: string;
  youTubeUrl: string;
  details: string;
}

function CoopMiddle() {
  const router = useRouter();
  const [cover, setCover] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [open, setOpen] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const PICHER = process.env.NEXT_PUBLIC_PICHER_BASE_URL;

  const getYouTubeVideoId = useMemo(
    () => (url: string) => {
      const regex =
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|watch)\?.*v=|embed\/)|youtu\.be\/)([^\s&]+)/;
      const match = url.match(regex);
      return match && match[1] ? match[1] : null;
    },
    []
  );

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [photoResponse, videoResponse] = await Promise.all([
        axios.get(`${API}/PhotosCover`),
        axios.get(`${API}/Videos`),
      ]);

      setCover(photoResponse.data.photos);

      const processedVideos = videoResponse.data.map((video: any) => ({
        id: video.Id,
        title: video.Title,
        youTubeUrl: video.YouTubeUrl,
        details: video.Details,
      }));

      setVideos(processedVideos);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const showModal = (video: Video) => {
    setSelectedVideo(video);
    setOpen(true);
  };

  const handleCardClick = (id: string, title: string) => {
    localStorage.setItem("menuName", title);
    router.push(`/ShowAllPhotos/${id}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <ClipLoader color="#007bff" size={80} />
      </div>
    );
  }

  return (
    <>
      <section className="py-5 bg-gray-200">
        <div className="container py-4">
          <div className="row g-5">
            <div className="col-lg-88">
              <header className="mb-5">
                <h2 className="lined lined-center text-uppercase mb-4">
                  วิดีโอสหกรณ์ CO-OP NEWs
                </h2>
                <div style={{ textAlign: "right" }}>
                  <a href="/AlbumPhotosOverAll">ดูทั้งหมด</a>
                </div>
              </header>

              <div className="row align-items-stretch">
                {videos.map((video, index) => (
                  <div className="col-lg-4 col-md-6 col-sm-12" key={video.id}>
                    <div className="product h-100">
                      <div
                        className="product-image"
                        style={{
                          justifyContent: "center",
                          display: "flex",
                          alignItems: "center",
                          position: "relative",
                          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.6)",
                        }}
                      >
                        <img
                          src={`https://img.youtube.com/vi/${getYouTubeVideoId(
                            video.youTubeUrl
                          )}/hqdefault.jpg`}
                          loading="lazy"
                          alt=""
                          style={{
                            width: "100%",
                            height: "auto", // Maintain aspect ratio
                            cursor: "pointer",
                            maxWidth: "358px",
                          }}
                          onClick={() => showModal(video)}
                        />
                      </div>
                      <div className="py-4 px-3 text-center">
                        <h3 className="h5 text-uppercase mb-3">
                          <a
                            className="reset-link"
                            href={`https://www.youtube.com/watch?v=${getYouTubeVideoId(
                              video.youTubeUrl
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <h4>{video.title}</h4>
                          </a>
                        </h3>
                      </div>
                      {index === 0 && (
                        <ul className="list-unstyled p-0 ribbon-holder mb-0">
                          <li className="mb-1">
                            <div className="ribbon new ribbon-primary flash">
                              NEW
                            </div>
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={open}
                onClose={() => setOpen(false)}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Sheet
                  variant="outlined"
                  sx={{
                    maxWidth: "800px",
                    width: "100%",
                    borderRadius: "md",
                    p: 2,
                    boxShadow: "lg",
                  }}
                >
                  <ModalClose variant="plain" sx={{ m: 1 }} />
                  {selectedVideo && (
                    <div
                      style={{
                        position: "relative",
                        paddingBottom: "56.25%",
                        height: 0,
                        overflow: "hidden",
                        maxWidth: "100%",
                      }}
                    >
                      <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                          selectedVideo.youTubeUrl
                        )}`}
                        title={selectedVideo.title}
                        frameBorder="0"
                        allowFullScreen
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                        }}
                      ></iframe>
                    </div>
                  )}
                </Sheet>
              </Modal>

              <br />
              <header className="mb-5">
                <h2 className="lined lined-center text-uppercase mb-4">
                  ภาพกิจกรรมสหกรณ์
                </h2>
                <div style={{ textAlign: "right" }}>
                  <a href="/AlbumPhotosOverAll">ดูทั้งหมด</a>
                </div>
              </header>
              <div className="row gy-5 align-items-stretch">
                {cover.map((covers) => (
                  <div className="col-lg-4 col-md-6" key={covers.Id}>
                    <div className="product h-100">
                      <div
                        className="product-image"
                        style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.6)" }}
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
                          <img
                            className="img-fluid"
                            src={`${PICHER}${covers.Cover}`}
                            alt={covers.Title}
                          />
                        </LinkMui>
                      </div>
                      <div className="py-4 px-3 text-center">
                        <h3 className="h5 text-uppercase mb-3">
                          <a className="reset-link" href="shop-detail.html">
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
            </div>
            <InterestPage />
          </div>
        </div>
      </section>
    </>
  );
}

export default CoopMiddle;
