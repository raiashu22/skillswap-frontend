import { useEffect, useRef, useState } from "react";

// Returns a ref + boolean. Attach the ref to any element; `visible`
// flips to true once it scrolls into view, so you can trigger a
// fade/slide-in animation via a CSS class instead of on page load.
export function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}
