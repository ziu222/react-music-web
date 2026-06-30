import { useMemo } from "react";


export function useContextPlay(songs, cur, playing) {
  return useMemo(() => {
    const ctxSong = songs?.find(s => s.id === cur?.id) ?? null;
    return { ctxSong, ctxPlaying: playing && !!ctxSong };
  }, [songs, cur?.id, playing]);
}
