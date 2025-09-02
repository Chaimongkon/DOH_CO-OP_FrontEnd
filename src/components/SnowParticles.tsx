import { useEffect, useState } from "react";
import logger from "@/lib/logger";

const ParticlesImg = () => {
  const [showParticles, setShowParticles] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`${API}/Particles`);
        const data = await response.json();
        
        logger.info(`Particles data: ${JSON.stringify(data)}`);
        logger.info(`isActive value: ${data.isActive}, type: ${typeof data.isActive}`);

        // Check if particles should be enabled (isActive = 1 for particles)
        if (data.isActive === 1 || data.isActive === "1") {
          setImages(
            data.images.map((imgUrl: string) => `${API}${imgUrl}`)
          );
          setShowParticles(true);
          logger.info(`Particles enabled with ${data.images.length} images`);
        } else {
          setShowParticles(false);
          logger.info(`Particles disabled, isActive: ${data.isActive}`);
        }
      } catch (error) {
        logger.error("Error fetching images", error);
        setShowParticles(false);
      }
    };

    fetchImages();
  }, [API]);

  if (!showParticles || images.length === 0) {
    return null;
  }

  return (
    <div className="particles-container">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="falling-particle"
          style={{
            position: "fixed",
            left: `${Math.random() * 100}%`,
            top: "-50px",
            width: `${10 + Math.random() * 40}px`,
            height: `${10 + Math.random() * 40}px`,
            backgroundImage: `url(${images[Math.floor(Math.random() * images.length)]})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            opacity: 0.3 + Math.random() * 0.6,
            animation: `fall ${5 + Math.random() * 5}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
            pointerEvents: "none",
            zIndex: 1
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        
        .falling-particle:hover {
          transform: scale(1.2);
          transition: transform 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default ParticlesImg;
