import { useMemo } from "react";

/**
 * Shared "is a song from THIS context the current track?" logic for the big
 * play/pause buttons on album / artist / playlist / search surfaces.
 *
 * - `ctxSong`    — the song from `songs` that is currently loaded, or null.
 * - `ctxPlaying` — true when that song is also actively playing.
 *
 * Memoized so the `.find` over the song list only re-runs when the list, the
 * current song id, or the global playing flag changes (not every render).
 *
 * Usage: onClick={() => onPlay(ctxSong ?? songs[0])} — toggles the in-context
 * song (pause/resume) or starts the context from the top.
 */
export function useContextPlay(songs, cur, playing) {
  return useMemo(() => {
    const ctxSong = songs?.find(s => s.id === cur?.id) ?? null;
    return { ctxSong, ctxPlaying: playing && !!ctxSong };
  }, [songs, cur?.id, playing]);
}
