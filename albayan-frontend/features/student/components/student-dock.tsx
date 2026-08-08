"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "motion/react";
import {
  Children,
  cloneElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import "./student-dock.css";

type StudentDockItem = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
};

type StudentDockProps = {
  items: StudentDockItem[];
  className?: string;
  spring?: { mass: number; stiffness: number; damping: number };
  magnification?: number;
  baseItemSize?: number;
};

type DockOrientation = "bottom" | "side";

function DockItem({
  children,
  className = "",
  onClick,
  orientation,
  spring,
  magnification,
  baseItemSize,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  orientation: DockOrientation;
  spring: { mass: number; stiffness: number; damping: number };
  magnification: number;
  baseItemSize: number;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const targetScale = useTransform(
    isHovered,
    [0, 1],
    [1, magnification / baseItemSize]
  );
  const scale = useSpring(targetScale, spring);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <motion.div
      ref={ref}
      style={{
        scale,
        width: baseItemSize,
        height: baseItemSize,
        transformOrigin: "center",
      }}
      className={`dock-item ${className}`}
      onMouseEnter={() => isHovered.set(1)}
      onMouseLeave={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
      aria-label={label}
      onKeyDown={handleKeyDown}
    >
      {Children.map(children, (child) => {
        const childEl = child as React.ReactElement<{
          isHovered?: ReturnType<typeof useMotionValue<number>>;
          orientation?: DockOrientation;
        }>;
        return cloneElement(childEl, { isHovered, orientation });
      })}
    </motion.div>
  );
}

function DockLabel({
  children,
  orientation = "bottom",
  isHovered,
  className = "",
}: {
  children: React.ReactNode;
  orientation?: DockOrientation;
  isHovered?: ReturnType<typeof useMotionValue<number>>;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on("change", (latest) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  const labelClass =
    orientation === "side" ? "dock-label--side" : "dock-label";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0, x: orientation === "side" ? -8 : 8 }}
          animate={{ opacity: 1, y: orientation === "side" ? 0 : -10, x: 0 }}
          exit={{ opacity: 0, y: 0, x: orientation === "side" ? -8 : 8 }}
          transition={{ duration: 0.2 }}
          className={`${labelClass} ${className}`}
          role="tooltip"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children }: { children: React.ReactNode }) {
  return <div className="dock-icon">{children}</div>;
}

export function StudentDock({
  items,
  className = "",
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 56,
  baseItemSize = 40,
}: StudentDockProps) {
  const isMobile = useIsMobile();
  const orientation: DockOrientation = isMobile ? "bottom" : "side";

  return (
    <div
      className={`dock-outer ${orientation === "side" ? "dock-outer--side" : ""}`}
    >
      <div className={`dock-panel ${className}`} role="toolbar" aria-label="شريط تنقّل">
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            orientation={orientation}
            spring={spring}
            magnification={magnification}
            baseItemSize={baseItemSize}
            label={item.label}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </div>
    </div>
  );
}