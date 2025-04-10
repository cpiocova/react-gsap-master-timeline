import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTimeline } from "@lib/TimelineProvider";

function Letter() {
  const ref = useRef<HTMLDivElement>(null);
  const { registerSyncedTimeline } = useTimeline();

  useGSAP(
    () => {
      registerSyncedTimeline({
        id: "letter",
        dependsOn: ["circle.finally_circle"],
        createTimeline: () => {
          const tl = gsap.timeline();
          tl.to(ref.current, {
            x: -50,
            fontSize: "2em",
            duration: 1,
          });

          return tl;
        },
      });
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        fontSize: "8em",
        color: "yellow",
      }}
    >
      PIO
    </div>
  );
}

export default Letter;
