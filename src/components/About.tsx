import "./styles/About.css";
import { config } from "../config";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  useEffect(() => {
    // Mobile: use native scroll, Desktop: use Lenis scroll
    const isMobile = window.innerWidth <= 1024;

    if (isMobile) {
      // Mobile: lightweight staggered reveal with native scroll
      const mobileTween = gsap.fromTo(
        ".about-me h3, .about-me p",
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".about-section",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
      return () => {
        mobileTween.scrollTrigger?.kill();
        mobileTween.kill();
      };
    }

    // Desktop: use Lenis scroll
    const aboutTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".about-section",
        start: "top 80%",
        end: "bottom center",
        toggleActions: "play none none none",
        scroller: "#smooth-wrapper",
      },
    });

    // Animate title from bottom
    aboutTimeline.fromTo(
      ".about-me h3",
      {
        opacity: 0,
        y: 40,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
      }
    );

    // Animate paragraph with stagger from bottom
    aboutTimeline.fromTo(
      ".about-me p",
      {
        opacity: 0,
        y: 40,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
      },
      "-=0.3"
    );

    // Clean up
    return () => {
      aboutTimeline.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === document.querySelector(".about-section")) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <div className="about-section" id="about">
      <div className="about-me">
        <h3 className="title">{config.about.title}</h3>
        <p className="para">
          {config.about.description}
        </p>
      </div>
    </div>
  );
};

export default About;
