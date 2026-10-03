import { TextSplitter } from "../../utils/textSplitter";
import gsap from "gsap";
import { lenis } from "../Navbar";

export function initialFX() {
  document.body.style.overflowY = "auto";
  if (lenis) {
    lenis.start();
  }
  document.getElementsByTagName("main")[0].classList.add("main-active");
  gsap.to("body", {
    backgroundColor: "#0b080c",
    duration: 0.5,
    delay: 1,
  });

  // The char-level split/swap animation is a desktop cinematic effect.
  // On mobile/tablet it clips the titles, so keep the hero text stable there.
  if (window.innerWidth > 1024) {
    const selectors = [".landing-info h3", ".landing-intro h2", ".landing-intro h1"];
    const elements = selectors.flatMap(selector => Array.from(document.querySelectorAll(selector)));
    var landingText = new TextSplitter(elements, {
      type: "chars,lines",
      linesClass: "split-line",
    });
    gsap.fromTo(
      landingText.chars,
      { opacity: 0, y: 80, filter: "blur(5px)" },
      {
        opacity: 1,
        duration: 1.2,
        filter: "blur(0px)",
        ease: "power3.inOut",
        y: 0,
        stagger: 0.025,
        delay: 0.3,
      }
    );

    let TextProps = { type: "chars,lines", linesClass: "split-h2" };

    var landingText2 = new TextSplitter(".landing-h2-info", TextProps);
    gsap.fromTo(
      landingText2.chars,
      { opacity: 0, y: 80, filter: "blur(5px)" },
      {
        opacity: 1,
        duration: 1.2,
        filter: "blur(0px)",
        ease: "power3.inOut",
        y: 0,
        stagger: 0.025,
        delay: 0.3,
      }
    );

    gsap.fromTo(
      ".landing-info-h2",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        duration: 1.2,
        ease: "power1.inOut",
        y: 0,
        delay: 0.8,
      }
    );

    var landingText3 = new TextSplitter(".landing-h2-info-1", TextProps);
    var landingText4 = new TextSplitter(".landing-h2-1", TextProps);
    var landingText5 = new TextSplitter(".landing-h2-2", TextProps);

    LoopText(landingText2, landingText3);
    LoopText(landingText4, landingText5);
  } else {
    // Mobile/tablet: simple, stable fade-in for the hero text
    gsap.fromTo(
      [".landing-intro", ".landing-info"],
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power1.out",
        delay: 0.2,
        stagger: 0.15,
      }
    );
  }

  gsap.fromTo(
    [".header", ".icons-section", ".nav-fade"],
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power1.inOut",
      delay: 0.1,
    }
  );
}

function LoopText(Text1: TextSplitter, Text2: TextSplitter) {
  var tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
  const delay = 4;
  const delay2 = delay * 2 + 1;

  tl.fromTo(
    Text2.chars,
    { opacity: 0, y: 80 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power3.inOut",
      y: 0,
      stagger: 0.1,
      delay: delay,
    },
    0
  )
    .fromTo(
      Text1.chars,
      { y: 80 },
      {
        duration: 1.2,
        ease: "power3.inOut",
        y: 0,
        stagger: 0.1,
        delay: delay2,
      },
      1
    )
    .fromTo(
      Text1.chars,
      { y: 0 },
      {
        y: -80,
        duration: 1.2,
        ease: "power3.inOut",
        stagger: 0.1,
        delay: delay,
      },
      0
    )
    .to(
      Text2.chars,
      {
        y: -80,
        duration: 1.2,
        ease: "power3.inOut",
        stagger: 0.1,
        delay: delay2,
      },
      1
    );
}
