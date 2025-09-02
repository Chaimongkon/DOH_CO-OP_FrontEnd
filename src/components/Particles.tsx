// FireworksParticles.tsx - Simple CSS Animation Alternative
import React from "react";

const FireworksParticles: React.FC = () => {
  return (
    <div className="fireworks-container">
      <div className="firework"></div>
      <div className="firework"></div>
      <div className="firework"></div>
      <style jsx>{`
        .fireworks-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1000;
          overflow: hidden;
        }
        
        .firework {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          animation: firework 2s ease-out infinite;
        }
        
        .firework:nth-child(1) {
          left: 20%;
          animation-delay: 0s;
          background: #ff6b6b;
        }
        
        .firework:nth-child(2) {
          left: 50%;
          animation-delay: 0.5s;
          background: #4ecdc4;
        }
        
        .firework:nth-child(3) {
          left: 80%;
          animation-delay: 1s;
          background: #45b7d1;
        }
        
        @keyframes firework {
          0% {
            bottom: 0;
            opacity: 1;
            transform: scale(1);
          }
          15% {
            bottom: 50%;
            opacity: 1;
          }
          16% {
            bottom: 50%;
            opacity: 0;
            transform: scale(1);
          }
          17% {
            bottom: 50%;
            opacity: 1;
            transform: scale(1);
            box-shadow: 
              0 0 0 0 currentColor,
              0 0 0 0 currentColor,
              0 0 0 0 currentColor,
              0 0 0 0 currentColor,
              0 0 0 0 currentColor;
          }
          100% {
            bottom: 50%;
            opacity: 0;
            transform: scale(3);
            box-shadow: 
              0 -30px 0 0 transparent,
              21px -21px 0 0 transparent,
              30px 0 0 0 transparent,
              21px 21px 0 0 transparent,
              0 30px 0 0 transparent;
          }
        }
      `}</style>
    </div>
  );
};

export default FireworksParticles;
