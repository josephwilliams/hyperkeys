import { useEffect, useRef, useState, type RefObject } from "react";

export function useContainerSize(containerRef: RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const { width, height } = el.getBoundingClientRect();
        setSize((prev) =>
          prev.width === width && prev.height === height ? prev : { width, height }
        );
      });
    };

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    update();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [containerRef]);

  return size;
}
