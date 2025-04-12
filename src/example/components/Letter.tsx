import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useMasterTimeline } from "@lib/TimelineProvider";

function Letter() {
  const ref = useRef<HTMLDivElement>(null);
  const { registerSyncedTimeline } = useMasterTimeline();

  useGSAP(
    () => {
      registerSyncedTimeline({
        id: "letter",
        dependsOn: ["circle.finally_circle"],
        createTimeline: () => {
          const tl = gsap.timeline();
          tl.to(ref.current, {
            x: 20,
            fontSize: "2em",
            duration: 1,
          });

          return tl;
        },
        onDependencyFail: () => {
          gsap.to(ref.current, { y: -10, fontSize: "8em", duration: 5 });
        },
      });
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      style={{
        display: "inline",
        backgroundColor: "green",
        fontSize: "4em",
        color: "yellow",
      }}
    >
      PIO
    </div>
  );
}

export default Letter;
