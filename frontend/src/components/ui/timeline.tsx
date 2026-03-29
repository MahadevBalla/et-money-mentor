"use client";
import { useMotionValueEvent, useScroll, useTransform, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.getBoundingClientRect().height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className="w-full font-sans" ref={containerRef}>
      <div ref={ref} className="relative max-w-2xl pb-8">
        {data.map((item, index) => (
          <div key={index} className="flex justify-start pt-8 md:pt-12 md:gap-8">
            {/* Left sticky: dot + title */}
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-32 self-start max-w-xs md:w-full">
              {/* Dot */}
              <div
                className="h-9 w-9 absolute left-0 rounded-full flex items-center justify-center"
                style={{ background: "var(--surface-1)", border: "2px solid var(--border)" }}
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ background: "var(--primary)" }}
                />
              </div>
              {/* Title — desktop only */}
              <h3
                className="hidden md:block text-base font-semibold md:pl-14"
                style={{ color: "var(--muted-foreground)" }}
              >
                {item.title}
              </h3>
            </div>

            {/* Right content */}
            <div className="relative pl-14 md:pl-0 w-full">
              {/* Title — mobile only */}
              <h3
                className="md:hidden block text-base font-semibold mb-3"
                style={{ color: "var(--muted-foreground)" }}
              >
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}

        {/* Scroll-driven fill line */}
        <div
          className="absolute left-4 top-0 w-0.5 overflow-hidden"
          style={{
            height: `${height}px`,
            background:
              "linear-gradient(to bottom, transparent 0%, var(--border) 10%, var(--border) 90%, transparent 100%)",
          }}
        >
          <motion.div
            className="absolute inset-x-0 top-0 w-0.5 rounded-full"
            style={{
              height: heightTransform,
              opacity: opacityTransform,
              background:
                "linear-gradient(to bottom, transparent 0%, var(--primary) 40%, oklch(0.62 0.18 198) 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
};
