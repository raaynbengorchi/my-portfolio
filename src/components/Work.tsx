import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { config } from "../config";

gsap.registerPlugin(ScrollTrigger);

const Work = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (!isMobile) {
        setIsExpanded(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  useEffect(() => {
    // Disable pinning on mobile to allow scrolling
    if (isMobile) {
      // Mobile: lightweight staggered reveal so the stacked cards still animate
      const mobileTween = gsap.fromTo(
        ".work-box",
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".work-flex",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
      return () => {
        mobileTween.scrollTrigger?.kill();
        mobileTween.kill();
      };
    }

    let translateX: number = 0;

    function setTranslateX() {
      const box = document.getElementsByClassName("work-box");
      if (box.length === 0) return;
      const rectLeft = document
        .querySelector(".work-container")!
        .getBoundingClientRect().left;
      const rect = box[0].getBoundingClientRect();
      const parentWidth = box[0].parentElement!.getBoundingClientRect().width;
      let padding: number =
        parseInt(window.getComputedStyle(box[0]).padding) / 2;
      translateX = rect.width * box.length - (rectLeft + parentWidth) + padding;
    }

    setTranslateX();

    let timeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".work-section",
        start: "top top",
        end: `+=${translateX}`,
        scrub: 1,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        id: "work",
        invalidateOnRefresh: true,
      },
    });

    timeline.to(".work-flex", {
      x: -translateX,
      ease: "none",
    });

    // Refresh ScrollTrigger after layout settles
    ScrollTrigger.refresh();

    // Clean up
    return () => {
      timeline.kill();
      ScrollTrigger.getById("work")?.kill();
    };
  }, [isMobile]);

  const projectsToShow = isMobile && !isExpanded 
    ? config.projects.slice(0, 1) 
    : config.projects.slice(0, 5);

  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>
        <div className="work-flex">
          {projectsToShow.map((project, index) => (
            <div className="work-box" key={project.id}>
              <div className="work-info">
                <div className="work-title">
                  <h3>0{index + 1}</h3>

                  <div>
                    <h4>{project.title}</h4>
                    <p>{project.category}</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>{project.technologies}</p>
              </div>
              <WorkImage image={project.image} alt={project.title} />
            </div>
          ))}
          {isMobile && !isExpanded && config.projects.slice(0, 5).length > 1 && (
            <div className="work-box work-box-expand">
              <div className="see-all-works">
                <button
                  className="see-all-btn expand-btn"
                  onClick={() => setIsExpanded(true)}
                  data-cursor="disable"
                >
                  See More →
                </button>
              </div>
            </div>
          )}
          {isMobile && isExpanded && (
            <div className="work-box work-box-collapse">
              <div className="see-all-works">
                <h3>Show Less</h3>
                <button
                  className="see-all-btn collapse-btn"
                  onClick={() => setIsExpanded(false)}
                  data-cursor="disable"
                >
                  Collapse ↑
                </button>
              </div>
            </div>
          )}
          {/* See All Works Button - only on desktop or expanded mobile */}
          {!isMobile && (
            <div className="work-box work-box-cta">
              <div className="see-all-works">
                <h3>Want to see more?</h3>
                <p>Explore all of my projects and creations</p>
                <Link
                  to="/myworks"
                  className="see-all-btn"
                  data-cursor="disable"
                >
                  See All Works →
                </Link>
              </div>
            </div>
          )}
          {isMobile && isExpanded && (
            <div className="work-box work-box-cta">
              <div className="see-all-works">
                <h3>Want to see more?</h3>
                <p>Explore all of my projects and creations</p>
                <Link
                  to="/myworks"
                  className="see-all-btn"
                  data-cursor="disable"
                >
                  See All Works →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Work;
