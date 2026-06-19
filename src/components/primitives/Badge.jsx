import styles from "./Badge.module.css";

export default function Badge({ variant = "free", icon, children, className = "" }) {
  return (
    <span className={`${styles.badge} ${styles[variant] ?? ""} ${className}`.trim()}>
      {icon}
      {children}
    </span>
  );
}
