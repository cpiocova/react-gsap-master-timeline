import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useMasterTimeline } from "@lib/TimelineProvider";

export default function Circle() {
  const ref = useRef<HTMLDivElement>(null);
  const { registerSyncedTimeline, masterTimeline } = useMasterTimeline();

  const getTL = () => {
    const tl = gsap.timeline();
    tl.to(ref.current, {
      y: -10,
      backgroundColor: "purple",
      duration: 3,
    })
      .addLabel("after-color")
      .to(ref.current, {
        scale: 1.5,
        duration: 1,
      });
    return tl;
  };

  useGSAP(
    () => {
      registerSyncedTimeline({
        id: "circle",
        dependsOn: ["nav.label_mid_nav"],
        createTimeline: getTL,
        labels: {
          finally_circle: (tl) => tl.labels["after-color"] ?? tl.duration(),
        },
        onDependencyFail: (_, missingLabels) => {
          if (missingLabels.includes("nav.label_mid_nav")) {
            const tl = getTL();
            return {
              timeline: tl,
              labels: {
                finally_circle: tl.labels["after-color"] ?? tl.duration(),
              },
              startAt: masterTimeline.labels["box.label_mid_box"] ?? 0,
            };
          }
        },
      });
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      style={{
        width: 40,
        height: 40,
        margin: 10,
        borderRadius: "50%",
        backgroundColor: "green",
      }}
    >
      Circle
    </div>
  );
}
