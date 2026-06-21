import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import styles from "./LikeButton.module.css";

export default function LikeButton({ liked, onLike, visible = true, tabIndex }) {
  const [pop, setPop] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!liked) setPop(true);
    onLike();
  };

  return (
    <button
      type="button"
      aria-label={liked ? "Bỏ thích" : "Thích"}
      title={liked ? "Bỏ thích" : "Thích"}
      tabIndex={liked || visible ? (tabIndex ?? 0) : -1}
      className={[
        styles.btn,
        liked ? styles.liked : "",
        pop ? styles.popping : "",
        !liked && !visible ? styles.hidden : "",
      ].join(" ").trim()}
      onClick={handleClick}
      onAnimationEnd={() => setPop(false)}
    >
      <FontAwesomeIcon icon={faHeart} />
    </button>
  );
}
