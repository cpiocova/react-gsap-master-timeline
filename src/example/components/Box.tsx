import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTimeline } from "@lib/TimelineProvider";

const anyName = "halfway";

export default function Box() {
  const ref = useRef<HTMLDivElement>(null);
  const { registerSyncedTimeline } = useTimeline();

  useGSAP(
    () => {
      registerSyncedTimeline({
        id: "box",
        createTimeline: () => {
          const tl = gsap.timeline();
          tl.to(ref.current, { x: 200, duration: 3 })
            .addLabel(anyName)

            .to(ref.current, {
              y: 100,
              duration: 1,
            })
            .to(ref.current, { x: 0, duration: 1 });

          return tl;
        },
        labels: {
          label_mid_box: (tl) => tl.labels[anyName] ?? tl.duration(),
        },
      });
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      style={{ width: 100, height: 100, backgroundColor: "blue", margin: 20 }}
    >
      Box
    </div>
  );
}
