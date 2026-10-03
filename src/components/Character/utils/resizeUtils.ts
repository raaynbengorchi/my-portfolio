import * as THREE from "three";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";

// Adapts the 3D camera framing for the viewport so the character
// stays well-composed on portrait (mobile) as well as landscape (desktop).
export function applyResponsiveFraming(camera: THREE.PerspectiveCamera) {
  const width = window.innerWidth;
  if (width <= 768) {
    camera.zoom = 0.9;
  } else if (width <= 1024) {
    camera.zoom = 1.0;
  } else {
    camera.zoom = 1.1;
  }
  camera.updateProjectionMatrix();
}

export default function handleResize(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  canvasDiv: React.RefObject<HTMLDivElement>,
  character: THREE.Object3D
) {
  if (!canvasDiv.current) return;
  let canvas3d = canvasDiv.current.getBoundingClientRect();
  const width = canvas3d.width;
  const height = canvas3d.height;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  applyResponsiveFraming(camera);
  const workTrigger = ScrollTrigger.getById("work");
  ScrollTrigger.getAll().forEach((trigger) => {
    if (trigger != workTrigger) {
      trigger.kill();
    }
  });
  setCharTimeline(character, camera);
  setAllTimeline();
}
