import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTimeline } from "@lib/TimelineProvider";

export default function Circle() {
  const ref = useRef<HTMLDivElement>(null);
  const { registerSyncedTimeline } = useTimeline();

  useGSAP(
    () => {
      registerSyncedTimeline({
        id: "circle",
        dependsOn: ["nav.label_mid_nav"],
        createTimeline: () => {
          const tl = gsap.timeline();
          tl.to(ref.current, {
            y: -50,
            backgroundColor: "purple",
            duration: 3,
          })
            .addLabel("after-color")
            .to(ref.current, {
              scale: 1.5,
              duration: 1,
            });
          return tl;
        },
        labels: {
          finally_circle: (tl) => tl.labels["after-color"] ?? tl.duration(),
        },
      });
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      style={{
        width: 100,
        height: 100,
        margin: 50,
        borderRadius: "50%",
        backgroundColor: "green",
      }}
    >
      Circle
    </div>
  );
}
