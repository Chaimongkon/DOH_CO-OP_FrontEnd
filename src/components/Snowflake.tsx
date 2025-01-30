// components/SnowEffect.tsx
import { useEffect, useRef, useState } from "react";

const SnowEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Set the dimensions once the component is mounted on the client side
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const snowflakes: {
      x: number;
      y: number;
      size: number;
      opacity: number;
      speed: number;
      drift: number;
    }[] = [];

    const createSnowflake = () => {
      snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 1 + 0.5,
        drift: Math.random() * 1 - 0.5,
      });
    };

    const drawSnowflakes = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      snowflakes.forEach((flake) => {
        ctx.globalAlpha = flake.opacity;
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();

        flake.y += flake.speed;
        flake.x += flake.drift;

        if (flake.y > canvas.height) {
          flake.y = -flake.size;
          flake.x = Math.random() * canvas.width;
        }
      });

      requestAnimationFrame(drawSnowflakes);
    };

    const startSnowfall = () => {
      for (let i = 0; i < 100; i++) {
        createSnowflake();
      }
      drawSnowflakes();
    };

    startSnowfall();

    return () => {
      snowflakes.length = 0;
    };
  }, [dimensions]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 1000,
      }}
    />
  );
};

export default SnowEffect;
