"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import LinkMui from "@mui/joy/Link";
import { Modal, ModalClose, Sheet } from "@mui/joy";
import InterestPage from "../Interest/page";
import { useRouter } from "next/navigation";
import Lottie from "react-lottie";
import animationData from "../../../loading3.json";
import ShowAllPhotos from "../ShowAllPhotos/[id]/page";

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
  const [electionVideos, setElectionVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [open, setOpen] = useState(false);
  const [statusHome, setStatusHome] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const PICHER = process.env.NEXT_PUBLIC_PICHER_BASE_URL;

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
      const [photoResponse, videoResponse, electionVideoResponse] =
        await Promise.all([
          axios.get(`${API}/PhotosCover`),
          axios.get(`${API}/Videos`),
          axios.get(`${API}/ElectionVideos`),
        ]);

      setCover(photoResponse.data);

      const mapVideos = (data: any[]) =>
        data.map((video) => ({
          id: video.Id,
          title: video.Title,
          youTubeUrl: video.YouTubeUrl,
          details: video.Details,
        }));

      setVideos(mapVideos(videoResponse.data));
      setElectionVideos(mapVideos(electionVideoResponse.data));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [API]);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/StatusHome`);
      const status = response.data.find(
        (item: { Id: number }) => item.Id === 4
      )?.Status;
      setStatusHome(status === 1);
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  }, [API]);

  useEffect(() => {
    fetchAllData();
    fetchStatus();
  }, [fetchAllData, fetchStatus]);

  const showModal = (video: Video) => {
    setSelectedVideo(video);
    setOpen(true);
  };

  const handleCardClick = (id: string, title: string) => {
    localStorage.setItem("menuName", title);
    router.push(`/ShowAllPhotos/${id}`);
  };

  const handleClickElection = () => {
    localStorage.setItem(
      "menuName",
      "วิดีโอผู้สมัครคณะกรรมการดำเนินการ สอ.ทล."
    );
    router.push("/ElectionVideos");
  };

  return (
    <>
      <section className="py-5 bg-gray-200">
        <div className="container py-4">
          {loading ? (
            <div className="loading-container" style={{ position: "relative" }}>
              <Lottie options={defaultOptions} height={150} width={150} />
            </div>
          ) : (
            <div className="row g-5" style={{ position: "relative" }}>
              <div className="col-lg-88">
                <header className="mb-5">
                  <h2 className="lined lined-center text-uppercase mb-4">
                    วิดีโอสหกรณ์ CO-OP
                  </h2>
                  {!statusHome && (
                    <div style={{ textAlign: "right" }}>
                      <a href="/AlbumPhotosOverAll">ดูทั้งหมด</a>
                    </div>
                  )}
                </header>
                {statusHome ? (
                  <div className="row align-items-stretch justify-content-center">
                    {electionVideos
                      .filter(
                        (video) =>
                          video.title === "แนะนำขั้นตอนการเลือกตั้งสหกรณ์"
                      ) // กรองรายการตาม title
                      .map((videoss, index) => (
                        <div
                          className="col-lg-4 col-md-6 col-sm-12"
                          key={videoss.id}
                        >
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
                                  videoss.youTubeUrl
                                )}/hqdefault.jpg`}
                                loading="lazy"
                                alt=""
                                style={{
                                  width: "100%",
                                  height: "auto", // Maintain aspect ratio
                                  cursor: "pointer",
                                  maxWidth: "358px",
                                }}
                                onClick={() => showModal(videoss)}
                              />
                            </div>
                            <div className="py-4 px-3 text-center">
                              <h3 className="h5 text-uppercase mb-3">
                                <a
                                  className="reset-link"
                                  href={`https://www.youtube.com/watch?v=${getYouTubeVideoId(
                                    videoss.youTubeUrl
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <h4 style={{ fontSize: "1.09rem" }}>
                                    {videoss.title}
                                  </h4>
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
                    <div className="col-lg-4 col-md-6 col-sm-12">
                      <div className="product h-100">
                        <div
                          className="product-image"
                          style={{
                            justifyContent: "center",
                            display: "flex",
                            alignItems: "center",
                            position: "relative",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.6)",
                            background: "#000", // สีดำสำหรับกรอบ
                            height: "211px", // ความสูงของกรอบ
                          }}
                        >
                          <a
                            className="reset-link"
                            onClick={handleClickElection}
                          >
                            <img
                              className="img-fluid"
                              src="image/ImageMenu/board.png"
                              alt="White Blouse Armani"
                              style={{
                                width: "100%",
                                height: "auto", // Maintain aspect ratio
                                cursor: "pointer",
                                maxWidth: "358px",
                              }}
                            />
                          </a>
                        </div>
                        <div className="py-4 px-3 text-center">
                          <h3 className="h5 text-uppercase mb-3">
                            <a
                              className="reset-link"
                              onClick={handleClickElection}
                            >
                              <h4 style={{ fontSize: "1rem" }}>
                                วิดีโอผู้สมัครคณะกรรมการดำเนินการ สอ.ทล.
                              </h4>
                            </a>
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="row align-items-stretch">
                    {videos.map((video, index) => (
                      <div
                        className="col-lg-4 col-md-6 col-sm-12"
                        key={video.id}
                      >
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
                                <h4 style={{ fontSize: "1.09rem" }}>
                                  {video.title}
                                </h4>
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
                )}
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
                  {cover.slice(0, 6).map((covers) => (
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
          )}
        </div>
      </section>
    </>
  );
}

export default CoopMiddle;
