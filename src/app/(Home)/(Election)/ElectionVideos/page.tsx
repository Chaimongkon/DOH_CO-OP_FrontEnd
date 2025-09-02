"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Modal, ModalClose, Sheet } from "@mui/joy";
import Image from "next/image";
import logger from "@/lib/logger";
import { useApiConfig } from "@/hooks/useApiConfig";

interface Video {
  id: number;
  title: string;
  youTubeUrl: string;
  details: string;
}

const ElectionVideos = () => {
  const [electionVideos, setElectionVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [open, setOpen] = useState(false);
  const { API } = useApiConfig();

  const getYouTubeVideoId = useMemo(
    () => (url: string) => {
      const shortsRegex = /youtube\.com\/shorts\/([^\s/?&]+)/;
      const shortsMatch = url.match(shortsRegex);
      if (shortsMatch && shortsMatch[1]) {
        return shortsMatch[1];
      }
      const regex =
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|watch)\?.*v=|embed\/)|youtu\.be\/)([^\s&]+)/;
      const match = url.match(regex);
      return match && match[1] ? match[1] : null;
    },
    []
  );

  const fetchVideos = useCallback(async () => {
    try {
      const response = await fetch(`${API}/ElectionVideos`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      const processedData: Video[] = data.map((video: {Id: number; Title: string; YouTubeUrl: string; Details: string}) => ({
        id: video.Id as number,
        title: video.Title as string,
        youTubeUrl: video.YouTubeUrl as string,
        details: video.Details as string,
      }));

      setElectionVideos(processedData);
    } catch (error) {
      logger.error("Failed to fetch videos:", error);
    }
  }, [API]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const showModal = (video: Video) => {
    setSelectedVideo(video);
    setOpen(true);
  };

  return (
    <section className="py-5">
      <div className="container py-4">
        <header className="mb-5">
          <h2 className="text-uppercase lined mb-4">
            วิดีโอแนะนำผู้สมัครคณะกรรมการดำเนินการ สอ.ทล.
          </h2>
        </header>
        <div className="row gy-5 align-items-stretch">
          {electionVideos
            .filter((video) => video.title !== "แนะนำขั้นตอนการเลือกตั้งสหกรณ์") // กรอง title ที่ไม่ต้องการ
            .map((video, index) => (
              <div className="col-lg-4 col-md-6" key={video.id}>
                {/* Product */}
                <div className="product h-100">
                  <div className="product-image">
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
                      }}
                      onClick={() => showModal(video)}
                      priority={index < 3}
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
                        <h4 style={{ fontSize: "1.5rem" }}>
                          {`No.${index + 1} ${video.title}`}
                        </h4>
                      </a>
                    </h3>
                  </div>
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
      </div>
    </section>
  );
};

export default ElectionVideos;
