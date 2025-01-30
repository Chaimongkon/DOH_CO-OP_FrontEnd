// FireworksParticles.tsx
import React, { useCallback } from "react";
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
        fullScreen: { enable: true },
        detectRetina: true,
        background: {
          color: "transparent", // ตั้งค่าพื้นหลังโปร่งใส
        },
        backgroundMask: {
          enable: false, // ปิดการใช้งาน mask
        },
        fpsLimit: 60,
        emitters: {
          direction: "top",
          life: {
            count: 0,
            duration: 0.1,
            delay: 0.1
          },
          rate: {
            delay: 0.15,
            quantity: 1
          },
          size: {
            width: 100,
            height: 0
          },
          position: {
            y: 100,
            x: 50
          }
        },
        particles: {
          number: {
            value: 0
          },
          destroy: {
            mode: "split",
            split: {
              count: 1,
              factor: { value: 1 / 3 },
              rate: {
                value: 100
              },
              particles: {
                stroke: {
                  color: {
                    value: [
                      "#029bf5",
                      "#03fcf0",
                      "#d8fc03",
                      "#ffb803",
                      "#fa8402",
                      "#f73e02",
                      "#fa0006",
                      "#fa0228",
                      "#8e02f7"
                    ]
                  },
                  width: 1
                },
                number: {
                  value: 0
                },
                collisions: {
                  enable: false
                },
                opacity: {
                  value: 1,
                  animation: {
                    enable: true,
                    speed: 0.7,
                    minimumValue: 0.1,
                    sync: false,
                    startValue: "max",
                    destroy: "min"
                  }
                },
                shape: {
                  type: "circle"
                },
                size: {
                  value: 1,
                  animation: {
                    enable: false
                  }
                },
                life: {
                  count: 1,
                  duration: {
                    value: {
                      min: 1,
                      max: 2
                    }
                  }
                },
                move: {
                  enable: true,
                  gravity: {
                    enable: false
                  },
                  speed: 2,
                  direction: "none",
                  random: true,
                  straight: false,
                  outMode: "destroy"
                }
              }
            }
          },
          life: {
            count: 1
          },
          shape: {
            type: "line"
          },
          stroke: {
            color: {
              value: [
                "#029bf5",
                "#03fcf0",
                "#d8fc03",
                "#ffb803",
                "#fa8402",
                "#f73e02",
                "#fa0006",
                "#fa0228",
                "#8e02f7"
              ]
            },
            width: 1
          },
          rotate: {
            path: true
          },
          move: {
            enable: true,
            gravity: {
              acceleration: 15,
              enable: true,
              inverse: true,
              maxSpeed: 100
            },
            speed: { min: 10, max: 20 },
            outModes: {
              default: "destroy",
              top: "none"
            },
            trail: {
              //fillColor: "rgba(255, 255, 255, 0.3)", // ใช้ค่า RGBA โปร่งใส
              fillColor: "#000000", // ใช้ค่า RGBA โปร่งใส
              enable: true,
              length: 10
            }
          }
        }
      }}

    />
  );
};

export default FireworksParticles;
