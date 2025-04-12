import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useMasterTimeline } from "@lib/TimelineProvider";

const anyName = "halfway";

export default function Box() {
  const ref = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { registerSyncedTimeline, isReadyToPlay, masterTimeline } =
    useMasterTimeline();

  const loadColor = (): Promise<string> =>
    new Promise((resolve) => {
      setTimeout(() => {
        const color =
          "#" +
          Math.floor(Math.random() * 0x1000000)
            .toString(16)
            .padStart(6, "0");
        resolve(color);
      }, 1000);
    });

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

  useEffect(() => {
    (async () => {
      try {
        const newColor = await loadColor();
        setColor(newColor);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!masterTimeline || !isReadyToPlay || isLoading) return;
    masterTimeline.play();
  }, [masterTimeline, isReadyToPlay, isLoading]);
  return (
    <div
      ref={ref}
      style={{ width: 100, height: 100, backgroundColor: color, margin: 20 }}
    >
      {isLoading ? "Loading ..." : "Box"}
    </div>
  );
}
