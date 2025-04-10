import React, { createContext, useContext, useRef } from "react";
import gsap from "gsap";

interface TimelineEntry {
  id: string;
  dependsOn?: string[];
  labels?: Record<string, number | ((tl: gsap.core.Timeline) => number)>;
  createTimeline: () => gsap.core.Timeline;
}

interface TimelineContextType {
  registerSyncedTimeline: (entry: TimelineEntry) => void;
  masterTimeline: gsap.core.Timeline;
}

const TimelineContext = createContext<TimelineContextType | null>(null);

export const TimelineProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const masterTimelineRef = useRef(gsap.timeline({ paused: true }));
  const timelinesRef = useRef<
    Map<string, { tl: gsap.core.Timeline; start: number }>
  >(new Map());
  const labelMap = useRef<Map<string, number>>(new Map());
  const pendingCount = useRef(0);
  const readyCount = useRef(0);

  const registerSyncedTimeline = async ({
    id,
    dependsOn = [],
    labels = {},
    createTimeline,
  }: TimelineEntry) => {
    pendingCount.current++;

    const resolveLabel = (labelKey: string): Promise<number> => {
      return new Promise((resolve, reject) => {
        let attempts = 0;
        const check = () => {
          if (labelMap.current.has(labelKey)) {
            resolve(labelMap.current.get(labelKey)!);
          } else if (attempts++ < 100) {
            setTimeout(check, 50);
          } else {
            reject(new Error(`Label '${labelKey}' not found`));
          }
        };
        check();
      });
    };

    const offsets = await Promise.all(dependsOn.map(resolveLabel));
    const startAt = offsets.length > 0 ? Math.max(...offsets) : 0;

    const tl = createTimeline();
    masterTimelineRef.current.add(tl, startAt);

    timelinesRef.current.set(id, { tl, start: startAt });

    Object.entries(labels).forEach(([label, getTime]) => {
      const localTime = typeof getTime === "function" ? getTime(tl) : getTime;
      const globalTime = startAt + localTime;
      const labelKey = `${id}.${label}`;
      labelMap.current.set(labelKey, globalTime);
      masterTimelineRef.current.addLabel(labelKey, globalTime);
    });

    readyCount.current++;

    if (readyCount.current === pendingCount.current) {
      masterTimelineRef.current.play();
    }
  };

  return (
    <TimelineContext.Provider
      value={{
        registerSyncedTimeline,
        masterTimeline: masterTimelineRef.current,
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimeline = (): TimelineContextType => {
  const ctx = useContext(TimelineContext);
  if (!ctx) throw new Error("useTimeline must be used inside TimelineProvider");
  return ctx;
};
