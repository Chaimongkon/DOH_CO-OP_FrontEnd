// FireworksParticles.tsx
import React, { useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadFireworksPreset } from "tsparticles-preset-fireworks";

const FireworksParticles: React.FC = () => {
  const particlesInit = useCallback(async (engine: any) => {
    await loadFireworksPreset(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        preset: "fireworks",
        fullScreen: { enable: false },
        background: {
          color: "#FFFFFF", // White background
        },
      }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0, // ให้ Fireworks อยู่ด้านหลังเนื้อหา
        pointerEvents: "none",
      }}
    />
  );
};

export default FireworksParticles;
