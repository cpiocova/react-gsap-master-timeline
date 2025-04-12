import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useMasterTimeline } from "@lib/TimelineProvider";

export default function Nav() {
  const ref = useRef<HTMLDivElement>(null);
  const { registerSyncedTimeline } = useMasterTimeline();

  useGSAP(
    () => {
      if (false)
        registerSyncedTimeline({
          id: "nav",
          dependsOn: ["box.label_mid_box"],
          createTimeline: () => {
            const tl = gsap.timeline();
            tl.to(ref.current, { x: 200, duration: 1 })

              .to(ref.current, {
                y: -100,
                duration: 1,
              })
              .addLabel("yay")

              .to(ref.current, {
                y: 0,
                duration: 1,
              });
            return tl;
          },
          labels: {
            label_mid_nav: (tl) => tl.labels["yay"] ?? tl.duration(),
          },
        });
    },
    { scope: ref }
  );

  return (
    <span
      ref={ref}
      style={{
        display: "inline-block",
        padding: "5px 30px",
        borderRadius: 10,
        backgroundColor: "red",
        margin: 10,
      }}
    >
      Nav
    </span>
  );
}
