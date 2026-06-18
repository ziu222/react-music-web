/* Shared framer-motion variants cho Admin/Console — phong cách Corporate/Spotify:
 * tinh tế, không bounce mạnh, dark-surface friendly. Dùng chung thay vì copy rời rạc.
 * Reduced-motion: bọc cây admin trong <MotionConfig reducedMotion="user">. */

export const EASE = [0.2, 0, 0, 1]; // snappy decisive (Material/MD3-ish)
export const DUR = { quick: 0.16, base: 0.26, slow: 0.32 };

/* Tab/page transition — fade + translateY nhẹ */
export const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: EASE } },
};

/* Container điều phối stagger cho con */
export const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
};

/* Card reveal (stat card, chart card, album card) */
export const cardVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE } },
};

/* Row reveal (table/list) — nhẹ hơn card */
export const rowVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE } },
};

/* Toolbar/filter bar trượt xuống nhẹ */
export const toolbarVariants = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE } },
};

/* Overlay/backdrop fade (dùng kèm modal/drawer) */
export const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/* Modal căn giữa — giữ translate(-50%,-50%) qua x/y, thêm scale/opacity */
export const modalVariants = {
  initial: { opacity: 0, scale: 0.94, x: "-50%", y: "-50%" },
  animate: { opacity: 1, scale: 1, x: "-50%", y: "-50%", transition: { duration: DUR.slow, ease: EASE } },
  exit: { opacity: 0, scale: 0.96, x: "-50%", y: "-50%", transition: { duration: 0.18, ease: EASE } },
};

/* Drawer trượt từ phải (có exit) */
export const drawerVariants = {
  initial: { x: "100%" },
  animate: { x: 0, transition: { duration: DUR.slow, ease: EASE } },
  exit: { x: "100%", transition: { duration: 0.24, ease: EASE } },
};
