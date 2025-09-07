import { useEffect } from "react";

export const useScrollToIndex = ({ virtuoso, currentIndex, playing, init }) => {
  // Hàm scroll
  const scroll = () => {
    if (virtuoso.current) {
      virtuoso.current.scrollToIndex({
        index: currentIndex,
        align: "center",
        behavior: "smooth",
      });
    }
  };

  // Scroll khi currentIndex thay đổi
  useEffect(() => {
    scroll();
  }, [currentIndex, playing]);

  // Scroll lần đầu khi init
  useEffect(() => {
    const timeout = setTimeout(scroll, 500);
    return () => clearTimeout(timeout);
  }, [init]);
};
