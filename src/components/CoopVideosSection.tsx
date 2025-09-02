"use client";
import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { Modal, ModalClose, Sheet } from "@mui/joy";
import Image from "next/image";
import logger from "@/lib/logger";
import { SectionLoading } from "@/components/loading";
import useNavigation from "@/hooks/useNavigation";

interface Video {
  id: number;
  title: string;
  youTubeUrl: string;
  details: string;
}

interface ApiVideoResponse {
  Id: number;
  Title: string;
  YouTubeUrl: string;
  Details: string;
}

interface PaginatedApiResponse<T> {
  data: T[];
  page?: number;
  total?: number;
  pageCount?: number;
}

interface StatusItem {
  Id: number;
  Status: number;
}

const CoopVideosSection: React.FC = memo(function CoopVideosSection() {
  const { navigateWithMenu } = useNavigation();
  const [videos, setVideos] = useState<Video[]>([]);
  const [electionVideos, setElectionVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [open, setOpen] = useState(false);
  const [statusHome, setStatusHome] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const getYouTubeVideoId = useMemo(
    () => (url: string) => {
      const regex =
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|watch)\?.*v=|embed\/)|youtu\.be\/)([^\s&]+)/;
      const match = url.match(regex);
      return match && match[1] ? match[1] : null;
    },
    []
  );

  const mapVideos = useCallback((data: ApiVideoResponse[]): Video[] => {
    return data.map((video) => ({
      id: video.Id,
      title: video.Title,
      youTubeUrl: video.YouTubeUrl,
      details: video.Details,
    }));
  }, []);

  const fetchVideosData = useCallback(async () => {
    try {
      setLoading(true);
      const [videoResponse, electionVideoResponse] = await Promise.all([
        fetch(`${API}/Videos`),
        fetch(`${API}/ElectionVideos`),
      ]);

      if (!videoResponse.ok || !electionVideoResponse.ok) {
        throw new Error('Failed to fetch video data from one or more endpoints');
      }

      const [videoData, electionVideoData] = await Promise.all([
        videoResponse.json(),
        electionVideoResponse.json(),
      ]);

      // Handle direct array or pagination response for videos
      const videosArray = Array.isArray(videoData) ? videoData : (videoData as PaginatedApiResponse<ApiVideoResponse>).data || [];
      const electionVideosArray = Array.isArray(electionVideoData) ? electionVideoData : (electionVideoData as PaginatedApiResponse<ApiVideoResponse>).data || [];

      setVideos(mapVideos(videosArray));
      setElectionVideos(mapVideos(electionVideosArray));
    } catch (error) {
      logger.error("Error fetching video data:", error);
    } finally {
      setLoading(false);
    }
  }, [API, mapVideos]);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API}/StatusHome`);
      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.status}`);
      }
      
      const responseData: unknown = await response.json();
      
      // Handle pagination response - data is in responseData.data
      let statusData: StatusItem[] = [];
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        const paginatedResponse = responseData as PaginatedApiResponse<StatusItem>;
        statusData = paginatedResponse.data || [];
      } else if (Array.isArray(responseData)) {
        statusData = responseData;
      }
      
      const statusItem = statusData.find((item: StatusItem) => item.Id === 4);
      setStatusHome(statusItem?.Status === 1);
    } catch (error) {
      logger.error("Failed to fetch status:", error);
    }
  }, [API]);

  useEffect(() => {
    fetchVideosData();
    fetchStatus();
  }, [fetchStatus, fetchVideosData]);

  const showModal = (video: Video) => {
    setSelectedVideo(video);
    setVideoError(null);
    setOpen(true);
  };

  const handleClickElection = () => {
    navigateWithMenu("/ElectionVideos", "วิดีโอผู้สมัครคณะกรรมการดำเนินการ สอ.ทล.");
  };

  if (loading) {
    return <SectionLoading tip="กำลังโหลดวิดีโอ..." />;
  }

  return (
    <>
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
            )
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
                      borderRadius: "8px"
                    }}
                  >
                    <Image
                      src={`https://img.youtube.com/vi/${getYouTubeVideoId(
                        videoss.youTubeUrl
                      )}/hqdefault.jpg`}
                      alt={`Video thumbnail for ${videoss.title}`}
                      width={358}
                      height={201}
                      style={{
                        width: "auto",
                        height: "auto",
                        maxWidth: "100%",
                        cursor: "pointer",
                        borderRadius: "8px"
                      }}
                      onClick={() => showModal(videoss)}
                      priority={false}
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
                  background: "#000",
                  height: "211px",
                  borderRadius: "8px"
                }}
              >
                <a
                  className="reset-link"
                  onClick={handleClickElection}
                >
                  <Image
                    className="img-fluid"
                    src="/image/ImageMenu/board.png"
                    alt="Election board candidates video"
                    width={358}
                    height={201}
                    style={{
                      width: "100%",
                      height: "auto",
                      cursor: "pointer",
                      maxWidth: "358px",
                      borderRadius: "8px"
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
                    borderRadius: "8px"
                  }}
                >
                  <Image
                    src={`https://img.youtube.com/vi/${getYouTubeVideoId(
                      video.youTubeUrl
                    )}/hqdefault.jpg`}
                    alt={`Video thumbnail for ${video.title}`}
                    width={358}
                    height={201}
                    style={{
                      width: "auto",
                      height: "auto",
                      maxWidth: "100%",
                      cursor: "pointer",
                      borderRadius: "8px"
                    }}
                    onClick={() => showModal(video)}
                    priority={false}
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
            <div>
              <h3 style={{ marginBottom: "16px", textAlign: "center" }}>
                {selectedVideo.title}
              </h3>
              {videoError ? (
                <div 
                  style={{ 
                    textAlign: "center", 
                    padding: "20px",
                    background: "#f5f5f5",
                    borderRadius: "8px"
                  }}
                >
                  <p>ไม่สามารถโหลดวิดีโอได้ในขณะนี้</p>
                  <a 
                    href={`https://www.youtube.com/watch?v=${getYouTubeVideoId(selectedVideo.youTubeUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      display: "inline-block",
                      padding: "10px 20px",
                      background: "#ff0000",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "5px",
                      marginTop: "10px"
                    }}
                  >
                    ดูใน YouTube
                  </a>
                </div>
              ) : (
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
                    )}?enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}&rel=0&modestbranding=1`}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    onError={() => setVideoError("Failed to load video")}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: "none",
                    }}
                  ></iframe>
                </div>
              )}
            </div>
          )}
        </Sheet>
      </Modal>
    </>
  );
});

export default CoopVideosSection;