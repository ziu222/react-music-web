import { useState } from "react";
import EqBars from "../player/EqBars";
import { C } from "../../constants/theme";
import { getSongImage } from "../../data/media";
import PlayButton from "../primitives/PlayButton";
import styles from "./SongCard.module.css";

export default function SongCard({ song, cur, playing = false, onPlay, width }) {
  const [hov, setHov] = useState(false);
  const isCurrent = cur?.id === song.id;
  const isPlaying = isCurrent && playing;
  const cover = getSongImage(song);

  return (
    <div
      role="button"
      tabIndex={0}
      className={`discovery-card ${styles.card}`}
      aria-label={isPlaying ? `Tạm dừng ${song.title}` : `Phát ${song.title} – ${song.artist}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onPlay(song)}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPlay(song);
        }
      }}
      style={{ width: width || "100%" }}
    >
      <div className={`${styles.art} ${isCurrent ? styles.artPlaying : ""}`} style={{ background: song.bg }}>
        {cover && <img src={cover} alt="" className={styles.cover} />}
        <div className={styles.playWrap}>
          <PlayButton playing={isPlaying} visible={hov || isCurrent} />
        </div>
        {!hov && isPlaying && (
          <div className={styles.eqBadge}>
            <EqBars size={16} />
          </div>
        )}
        {!cover && !hov && !isCurrent && (
          <span className={styles.fallback}>♪</span>
        )}
      </div>

      <div
        className={styles.title}
        style={isCurrent ? { color: C[400] } : undefined}
      >
        {song.title}
      </div>
      <div className={styles.artist}>
        {song.artist}
      </div>
    </div>
  );
}
