import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";
import styles from "./PlayButton.module.css";

export default function PlayButton({
  playing = false,
  visible = false,
  onClick,
  tabIndex = -1,
  className = "",
  style: styleProp,
}) {
  return (
    <button
      type="button"
      aria-label={playing ? "Tạm dừng" : "Phát"}
      tabIndex={tabIndex}
      onClick={onClick}
      className={`${styles.btn} ${visible ? styles.visible : styles.hidden} ${className}`.trim()}
      style={styleProp}
    >
      <FontAwesomeIcon
        icon={playing ? faPause : faPlay}
        style={{ fontSize: 14, marginLeft: playing ? 0 : 2 }}
      />
    </button>
  );
}
