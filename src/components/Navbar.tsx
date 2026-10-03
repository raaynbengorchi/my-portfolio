import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import Lenis from "lenis";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollTrigger);
export let lenis: Lenis | null = null;

const Navbar = () => {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const THRESHOLD = 60;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY.current;
      if (y > THRESHOLD && dy > 2) {
        setHidden(true);
      } else if (dy < -2 || y <= THRESHOLD) {
        setHidden(false);
      }
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Only initialize Lenis on desktop (>1024px)
    const isDesktop = window.innerWidth > 1024;
    
    if (isDesktop) {
      // Initialize Lenis smooth scroll
      lenis = new Lenis({
        duration: 1.7,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.7,
        touchMultiplier: 2,
        infinite: false,
      });

      // Connect Lenis with ScrollTrigger using scrollerProxy
      ScrollTrigger.scrollerProxy("#smooth-wrapper", {
        scrollTop(value?: number) {
          if (arguments.length && value !== undefined) {
            lenis?.scrollTo(value, { immediate: true });
          }
          return lenis?.scroll ?? 0;
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
      });

      // Sync ScrollTrigger with Lenis
      lenis.on("scroll", ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis?.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);

      // Start paused
      lenis.stop();
    }

    // Handle navigation links
    let links = document.querySelectorAll(".header ul a");
    links.forEach((elem) => {
      let element = elem as HTMLAnchorElement;
      element.addEventListener("click", (e) => {
        if (window.innerWidth > 1024 && lenis) {
          e.preventDefault();
          let elem = e.currentTarget as HTMLAnchorElement;
          let section = elem.getAttribute("data-href");
          if (section) {
            const target = document.querySelector(section) as HTMLElement;
            if (target) {
              lenis.scrollTo(target, {
                offset: 0,
                duration: 1.5,
              });
            }
          }
        }
      });
    });

    // Handle resize
    const handleResize = () => {
      lenis?.resize();
      // Reinitialize Lenis if crossing desktop/mobile boundary
      const newIsDesktop = window.innerWidth > 1024;
      if (newIsDesktop !== isDesktop) {
        window.location.reload(); // Simple approach: reload on breakpoint change
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      lenis?.destroy();
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <>
      <div className={`header${hidden ? " header-hidden" : ""}`}>
        <a href="/#" className="navbar-title" data-cursor="disable">
          RH
        </a>
        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=rayanbengourchii@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="navbar-connect"
          data-cursor="disable"
        >
          rayanbengourchii@gmail.com
        </a>
        <ul>
          <li>
            <a data-href="#about" href="#about">
              <HoverLinks text="ABOUT" />
            </a>
          </li>
          <li>
            <a data-href="#work" href="#work">
              <HoverLinks text="WORK" />
            </a>
          </li>
          <li>
            <a data-href="#contact" href="#contact">
              <HoverLinks text="CONTACT" />
            </a>
          </li>
        </ul>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
