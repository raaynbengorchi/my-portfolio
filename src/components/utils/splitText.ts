import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextSplitter } from "../../utils/textSplitter";

interface ParaElement extends HTMLElement {
  anim?: gsap.core.Animation;
  split?: TextSplitter;
}

gsap.registerPlugin(ScrollTrigger);

let refreshListenerAdded = false;

export default function setSplitText() {
  ScrollTrigger.config({ ignoreMobileResize: true });
  const paras: NodeListOf<ParaElement> = document.querySelectorAll(".para");
  const titles: NodeListOf<ParaElement> = document.querySelectorAll(".title");

  if (window.innerWidth < 900) {
    // Mobile/tablet: lightweight fade + slide-up reveal for titles and
    // paragraphs. Uses the same GSAP ScrollTrigger architecture as desktop
    // but skips the character/word DOM splitting (heavier, and on narrow
    // screens the per-word wrapping is unnecessary).
    [...paras, ...titles].forEach((el) => {
      el.classList.add("visible");
      if (el.anim) {
        el.anim.progress(1).kill();
        el.split?.revert();
      }
      el.anim = gsap.fromTo(
        el,
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  } else {
    const TriggerStart = window.innerWidth <= 1024 ? "top 60%" : "20% 60%";
    const ToggleAction = "play pause resume reverse";

    paras.forEach((para: ParaElement) => {
      para.classList.add("visible");
      if (para.anim) {
        para.anim.progress(1).kill();
        para.split?.revert();
      }

      para.split = new TextSplitter(para, {
        type: "lines,words",
        linesClass: "split-line",
      });

      para.anim = gsap.fromTo(
        para.split.words,
        { autoAlpha: 0, y: 80 },
        {
          autoAlpha: 1,
          scrollTrigger: {
            trigger: para.parentElement?.parentElement,
            toggleActions: ToggleAction,
            start: TriggerStart,
          },
          duration: 1,
          ease: "power3.out",
          y: 0,
          stagger: 0.02,
        }
      );
    });
    titles.forEach((title: ParaElement) => {
      if (title.anim) {
        title.anim.progress(1).kill();
        title.split?.revert();
      }
      title.split = new TextSplitter(title, {
        type: "chars,lines",
        linesClass: "split-line",
      });
      title.anim = gsap.fromTo(
        title.split.chars,
        { autoAlpha: 0, y: 80, rotate: 10 },
        {
          autoAlpha: 1,
          scrollTrigger: {
            trigger: title.parentElement?.parentElement,
            toggleActions: ToggleAction,
            start: TriggerStart,
          },
          duration: 0.8,
          ease: "power2.inOut",
          y: 0,
          rotate: 0,
          stagger: 0.03,
        }
      );
    });
  }

  if (!refreshListenerAdded) {
    ScrollTrigger.addEventListener("refresh", () => setSplitText());
    refreshListenerAdded = true;
  }
}
