"use client";
import React from 'react';

const FireworksParticles: React.FC = () => {
  return (
    <div 
      className="fireworks-background"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -10,
        pointerEvents: "none",
        background: "rgba(0, 0, 0, 0.7)",
        overflow: "hidden"
      }}
    >
      {/* Fireworks effects */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`firework-particle firework-${i}`}
          style={{
            position: "absolute",
            width: "3px",
            height: "3px",
            borderRadius: "50%",
            left: `${20 + (i * 12)}%`,
            bottom: "0",
            animation: `fireworkAnimation ${2 + i * 0.3}s ease-out infinite`,
            animationDelay: `${i * 0.4}s`,
            background: `hsl(${i * 60}, 70%, 60%)`
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes fireworkAnimation {
          0% {
            bottom: 0;
            opacity: 1;
            transform: scale(1);
          }
          20% {
            bottom: 60%;
            opacity: 1;
          }
          21% {
            opacity: 0;
            transform: scale(1);
          }
          22% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            bottom: 60%;
            opacity: 0;
            transform: scale(4);
            box-shadow: 
              0 -40px 0 0 transparent,
              28px -28px 0 0 transparent,
              40px 0 0 0 transparent,
              28px 28px 0 0 transparent,
              0 40px 0 0 transparent,
              -28px 28px 0 0 transparent,
              -40px 0 0 0 transparent,
              -28px -28px 0 0 transparent;
          }
        }
      `}</style>
    </div>
  );
};

export default FireworksParticles;
