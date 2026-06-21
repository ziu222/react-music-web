import { useState } from "react";
import EqBars from "../player/EqBars";
import { C } from "../../constants/theme";
import { getSongImage } from "../../data/media";
import PlayButton from "../primitives/PlayButton";
import styles from "./SongCard.module.css";

export default function SongCard({ song, cur, onPlay, width }) {
  const [hov, setHov] = useState(false);
  const playing = cur?.id === song.id;
  const cover = getSongImage(song);

  return (
    <div
      role="button"
      tabIndex={0}
      className={`discovery-card ${styles.card}`}
      aria-label={`Phát ${song.title} – ${song.artist}`}
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
      <div className={`${styles.art} ${playing ? styles.artPlaying : ""}`} style={{ background: song.bg }}>
        {cover && <img src={cover} alt="" className={styles.cover} />}
        <div className={styles.playWrap}>
          <PlayButton playing={playing} visible={hov || playing} />
        </div>
        {!hov && playing && (
          <div className={styles.eqBadge}>
            <EqBars size={16} />
          </div>
        )}
        {!cover && !hov && !playing && (
          <span className={styles.fallback}>♪</span>
        )}
      </div>

      <div
        className={styles.title}
        style={playing ? { color: C[400] } : undefined}
      >
        {song.title}
      </div>
      <div className={styles.artist}>
        {song.artist}
      </div>
    </div>
  );
}
