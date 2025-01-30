import { useEffect, useMemo, useState } from "react";
import Particles from "@tsparticles/react";
import { type Container, type ISourceOptions, MoveDirection, OutMode } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { initParticlesEngine } from "@tsparticles/react";

const ParticlesImg = () => {
  const [init, setInit] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [images, setImages] = useState<{ src: string; width: number; height: number }[]>([]);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const URLImg = process.env.NEXT_PUBLIC_PICHER_BASE_URL;

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`${API}/Particles`);
        const data = await response.json();

        if (data.isActive === 1) {
          setImages(
            data.images.map((imgUrl: string) => ({
              src: `${URLImg}/${imgUrl}`,
              width: 20,
              height: 20,
            }))
          );
          setShowParticles(true);
        } else {
          setShowParticles(false);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        setShowParticles(false);
      }
    };

    fetchImages();
  }, [API, URLImg]);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {};

  const options: ISourceOptions | undefined = useMemo(() => {
    if (images.length === 0) return undefined;

    return {
      fpsLimit: 120,
      interactivity: {
        detectsOn: "window",
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "bubble",
          },
        },
        modes: {
          bubble: {
            distance: 400,
            duration: 2,
            opacity: 0.8,
            size: 70,
          },
          push: {
            quantity: 1,
          },
        },
      },
      particles: {
        move: {
          direction: MoveDirection.bottom,
          enable: true,
          speed: 2,
          outModes: {
            default: OutMode.out,
          },
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: 20,
        },
        opacity: {
          value: { min: 0.3, max: 0.9 },
          animation: {
            enable: true,
            speed: 0.9,
            minimumValue: 0,
            sync: false,
          },
        },
        shape: {
          type: "image",
          options: {
            image: images,
          },
        },
        size: {
          value: { min: 10, max: 50 },
        },
        life: {
          count: 6,
          delay: {
            value: 1,
            sync: true,
          },
          duration: {
            value: 9,
            sync: false,
          },
        },
      },
      detectRetina: true,
    };
  }, [images]);

  if (init && showParticles && options) {
    return (
      <Particles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={options}
      />
    );
  }

  return null;
};

export default ParticlesImg;
