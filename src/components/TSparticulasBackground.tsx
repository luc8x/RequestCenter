import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function ParticulasDotsBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: 0},
        background: { color: "#0d0d0d" },
        particles: {
          number: {
            value: 80,
            density: { enable: true, area: 800 },
          },
          color: { value: "#3F77BA" },
          shape: { type: "circle" },
          opacity: {
            value: 0.3,
            random: false,
          },
          size: {
            value: 3,
            random: true,
          },
          links: {
            enable: true,
            distance: 100,
            color: "#3F77BA",
            opacity: 0.4,
            width: 1,
          },
          move: {
            enable: true,
            speed: 1,
            direction: "none",
            random: false,
            straight: false,
            outModes: { default: "out" },
          },
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "repulse",
            },
            resize: true,
          },
          modes: {
            repulse: {
              distance: 100,
              duration: 0.4,
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
}
