"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import "./interface-crafts-cards.css";

const defaultSpring = {
  type: "spring",
  visualDuration: 0.6,
  bounce: 0.25,
};

export const defaultCards = [
  {
    title: "Working Knowledge",
    description:
      "You have a basic understanding of the topic and can apply it to simple situations.",
    skeleton: (
      <div className="interface-skeleton bg-skeleton-orange"></div>
    ),
    className: "card-bg-orange",
    config: {
      y: -20,
      x: 0,
      rotate: -15,
      zIndex: 2,
    },
  },
  {
    title: "Practical Demonstration",
    description:
      "You can demonstrate the concept in practice with real-world examples.",
    skeleton: (
      <div className="interface-skeleton bg-skeleton-stone"></div>
    ),
    className: "card-bg-stone",
    config: {
      y: 20,
      x: 180,
      rotate: 8,
      zIndex: 3,
    },
  },
  {
    title: "Collaborate with AI",
    description:
      "You can effectively work alongside AI tools to enhance your workflow.",
    skeleton: (
      <div className="interface-skeleton bg-skeleton-blue"></div>
    ),
    className: "card-bg-blue",
    config: {
      y: -80,
      x: 360,
      rotate: -5,
      zIndex: 4,
    },
  },
  {
    title: "Means & Methods",
    description:
      "You understand the various approaches and techniques available.",
    skeleton: (
      <div className="interface-skeleton bg-skeleton-purple"></div>
    ),
    className: "card-bg-purple",
    config: {
      y: 20,
      x: 540,
      rotate: 12,
      zIndex: 5,
    },
  },
  {
    title: "Interface Kit",
    description:
      "You have the tools and components needed to build interfaces.",
    skeleton: (
      <div className="interface-skeleton bg-skeleton-neutral"></div>
    ),
    className: "card-bg-neutral",
    config: {
      y: 20,
      x: 720,
      rotate: -5,
      zIndex: 6,
    },
  },
];

export const InterfaceCraftsCards = ({
  cards = defaultCards,
  spring = defaultSpring,
  activeScale = 1.15,
  cardSpacing = 180,
  className = "",
}) => {
  const [active, setActive] = useState(null);
  const [spacing, setSpacing] = useState(cardSpacing);

  const ref = useRef(null);
  const cardSpring = spring;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setActive(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () =>
      setSpacing(mq.matches ? cardSpacing : Math.round(cardSpacing * 0.39));
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [cardSpacing]);

  const middle = (cards.length - 1) / 2;

  const isAnyCardActive = () => Boolean(active?.title);
  const isCurrentActive = (card) => active?.title === card.title;

  return (
    <div className={cn("interface-crafts-container", className)}>
      <motion.div
        ref={ref}
        onClick={() => setActive(null)}
        className="interface-crafts-stage"
      >
        {cards.map((card, index) => {
          const offsetX = (index - middle) * spacing;
          const current = isCurrentActive(card);
          const anyActive = isAnyCardActive();

          return (
            <motion.div key={card.title}>
              <motion.button
                initial={{
                  x: 0,
                  scale: 0,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActive(current ? null : card);
                }}
                animate={{
                  y: current
                    ? 0
                    : anyActive
                      ? 400
                      : card.config.y,
                  x: current
                    ? 0
                    : anyActive
                      ? offsetX * 0.4
                      : offsetX,
                  rotate: current
                    ? 0
                    : anyActive
                      ? 0.2 * card.config.rotate
                      : card.config.rotate,
                  scale: current
                    ? activeScale
                    : anyActive
                      ? 0.7
                      : 1,
                }}
                whileHover={{
                  scale: current
                    ? activeScale
                    : anyActive
                      ? 0.7
                      : 1.05,
                }}
                transition={cardSpring}
                style={{
                  width: `var(--width)`,
                  height: `var(--height)`,
                  marginLeft: `calc(var(--width) / -2)`,
                  marginTop: `calc(var(--height) / -2)`,
                  zIndex: current ? 50 : card.config.zIndex,
                }}
                className={cn(
                  "interface-card-btn",
                  card.className,
                )}
              >
                {card.skeleton}
                <div style={{ width: "100%", marginTop: "1rem" }}>
                  <motion.h2
                    layoutId={card.title + "title"}
                    className="interface-card-title"
                  >
                    {card.title}
                  </motion.h2>
                  <AnimatePresence mode="popLayout">
                    {current && (
                      <motion.p
                        layoutId={card.title + "description"}
                        initial={{ opacity: 0, x: 20, y: 20, height: 0 }}
                        animate={{ opacity: 1, x: 0, y: 0, height: "auto" }}
                        exit={{ opacity: 0, x: 30, y: 30 }}
                        transition={cardSpring}
                        className="interface-card-desc"
                      >
                        {card.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default InterfaceCraftsCards;
