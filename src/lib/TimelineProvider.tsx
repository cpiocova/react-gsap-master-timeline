import React, { createContext, useContext, useRef, useState } from "react";
import gsap from "gsap";

interface TimelineEntry {
  id: string;
  dependsOn?: string[];
  labels?: Record<string, number | ((tl: gsap.core.Timeline) => number)>;
  createTimeline: () => gsap.core.Timeline;
  onDependencyFail?: (
    id: string,
    missingLabels: string[]
  ) =>
    | void
    | gsap.core.Timeline
    | {
        timeline: gsap.core.Timeline;
        labels?: Record<string, number | ((tl: gsap.core.Timeline) => number)>;
        startAt?: number;
      };
}

interface TimelineContextType {
  registerSyncedTimeline: (entry: TimelineEntry) => void;
  masterTimeline: gsap.core.Timeline;
  isReadyToPlay: boolean;
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

  const [isReadyToPlay, setIsReadyToPlay] = useState(false);

  const registerLabels = (
    tl: gsap.core.Timeline,
    id: string,
    labels: Record<string, number | ((tl: gsap.core.Timeline) => number)> = {},
    offset = 0
  ) => {
    Object.entries(labels).forEach(([label, getTime]) => {
      const localTime = typeof getTime === "function" ? getTime(tl) : getTime;
      const globalTime = offset + localTime;
      const labelKey = `${id}.${label}`;
      labelMap.current.set(labelKey, globalTime);
      masterTimelineRef.current.addLabel(labelKey, globalTime);
    });
  };

  const registerSyncedTimeline = async ({
    id,
    dependsOn = [],
    labels = {},
    createTimeline,
    onDependencyFail,
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

    let startAt = 0;

    try {
      const offsets = await Promise.all(dependsOn.map(resolveLabel));
      startAt = offsets.length > 0 ? Math.max(...offsets) : 0;

      const tl = createTimeline();
      masterTimelineRef.current.add(tl, startAt);
      timelinesRef.current.set(id, { tl, start: startAt });

      registerLabels(tl, id, labels, startAt);
    } catch (e) {
      const error = e as Error;
      console.warn(
        `[TimelineProvider] Skipping timeline "${id}" because:`,
        error.message
      );

      if (typeof onDependencyFail === "function") {
        const fallback = onDependencyFail(id, dependsOn);

        let fallbackTimeline: gsap.core.Timeline | undefined;
        let fallbackLabels:
          | Record<string, number | ((tl: gsap.core.Timeline) => number)>
          | undefined;

        let fallbackStartAt = 0;

        if (fallback && "timeline" in fallback) {
          fallbackTimeline = fallback.timeline;
          fallbackLabels = fallback.labels;
          fallbackStartAt = fallback.startAt ?? 0;
        } else if (fallback && typeof fallback.totalDuration === "function") {
          fallbackTimeline = fallback;
        }

        if (fallbackTimeline) {
          masterTimelineRef.current.add(fallbackTimeline, fallbackStartAt);

          if (fallbackLabels) {
            registerLabels(
              fallbackTimeline,
              id,
              fallbackLabels,
              fallbackStartAt
            );
          }
        }
      }
    } finally {
      readyCount.current++;
      if (readyCount.current === pendingCount.current) {
        setIsReadyToPlay(true);
      }
    }
  };

  return (
    <TimelineContext.Provider
      value={{
        registerSyncedTimeline,
        masterTimeline: masterTimelineRef.current,
        isReadyToPlay,
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
};

export const useMasterTimeline = (): TimelineContextType => {
  const ctx = useContext(TimelineContext);
  if (!ctx)
    throw new Error("useMasterTimeline must be used inside TimelineProvider");
  return ctx;
};
