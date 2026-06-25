import { useEffect, useMemo, useState } from "react";
import { useImageAccent } from "../lib/ui/colorExtract";
import { useContextPlay } from "../hooks/useContextPlay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faMicrophone } from "@fortawesome/free-solid-svg-icons";
import EmptyState from "../components/ui/EmptyState";
import EntityHeader from "../components/ui/EntityHeader";
import TrackList from "../components/ui/TrackList";
import AlbumTile from "../components/ui/AlbumTile";
import { TEXT } from "../constants/theme";
import { getArtist, deriveAlbums, formatPlays } from "../data/derived";
import EntityHeaderSkeleton from "../components/ui/skeleton/EntityHeaderSkeleton";
import TrackRowSkeleton from "../components/ui/skeleton/TrackRowSkeleton";
import { loadArtistProfileByName } from "../lib/artist/artistProfile";
import { getMediaBlobUrl, revokeMediaBlobUrl } from "../lib/music/mediaStore";
import PostCard from "../components/community/PostCard";
import PostViewModal from "../components/community/PostViewModal";
import { getPublishedPosts } from "../lib/artist/artistPosts";

export default function PageArtist({
  artistName,
  list,
  cur,
  playing = false,
  onPlay,
  likedIds,
  onLike,
  onAddToQueue,
  onOpenAlbum,
  isFollowed,
  onToggleFollow,
  catalogLoading,
  skeletonVisible,
}) {
  const artist = useMemo(() => getArtist(list, artistName), [list, artistName]);
  const [showAllSongs, setShowAllSongs] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [artistProfile, setArtistProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [viewPost, setViewPost] = useState(null);

  // Load ảnh từ artist_profiles (IndexedDB blob) — artist.image chỉ là static fallback
  useEffect(() => {
    if (!artistName) return;
    let alive = true;
    let blobUrl = null;
    setProfileImage(null);
    setArtistProfile(null);
    loadArtistProfileByName(artistName).then(async (profile) => {
      if (!alive) return;
      setArtistProfile(profile);
      if (!profile?.avatarBlobId) return;
      const u = await getMediaBlobUrl(profile.avatarBlobId);
      if (alive && u) { blobUrl = u; setProfileImage(u); }
    });
    return () => {
      alive = false;
      if (blobUrl) revokeMediaBlobUrl(blobUrl);
    };
  }, [artistName]);

  useEffect(() => {
    setPosts([]);
    setViewPost(null);
    if (!artistProfile?.email) return;
    getPublishedPosts(artistProfile.email).then(setPosts).catch(() => {});
  }, [artistProfile]);

  // Filter out community songs uploaded by OTHER users — prevents album cross-contamination
  // when multiple accounts share the same artist display name.
  const artistSongs = useMemo(() => {
    if (!artist) return [];
    const email = artistProfile?.email;
    if (!email) return artist.songs;
    return artist.songs.filter(
      s => !s.community || !s.artistEmail || s.artistEmail === email
    );
  }, [artist, artistProfile]);

  const totalPlays = useMemo(
    () => artistSongs.reduce((acc, s) => acc + (s.plays || 0), 0),
    [artistSongs]
  );

  const displayImage = profileImage ?? artist?.image;
  const imageAccent = useImageAccent(displayImage, "#f97316");

  // Context-aware play/pause for the big button (toggle if a track by this
  // artist is current, else start from their top track).
  const { ctxSong, ctxPlaying } = useContextPlay(artistSongs, cur, playing);

  const artistAlbums = useMemo(() => {
    return deriveAlbums(artistSongs).sort((a, b) => b.totalPlays - a.totalPlays);
  }, [artistSongs]);

  if (!artist) {
    if (catalogLoading) {
      return (
        <div aria-hidden="true" style={{ paddingBottom: 80, visibility: skeletonVisible ? "visible" : "hidden" }}>
          <EntityHeaderSkeleton type="artist" />
          <div style={{ padding: "0 28px" }}>
            {Array.from({ length: 6 }, (_, i) => <TrackRowSkeleton key={i} />)}
          </div>
        </div>
      );
    }
    return (
      <EmptyState
        icon={faMicrophone}
        title="Không tìm thấy nghệ sĩ"
        desc="Nghệ sĩ này không có trong thư viện nhạc"
        style={{ padding: "80px 0" }}
      />
    );
  }

  const popular = artistSongs.slice(0, 5);
  const allSongs = showAllSongs ? artistSongs : artistSongs.slice(0, 10);
  const accent = imageAccent;

  return (
    <div style={{ animation: "slideUp 0.3s ease", paddingBottom: 80 }}>
      <EntityHeader
        type="Nghệ sĩ"
        title={artist.name}
        round
        image={displayImage}
        fallback={artist.name[0]}
        accent={accent}
        meta={
          <>
            <span>{formatPlays(totalPlays)} lượt phát</span>
            <span aria-hidden="true">·</span>
            <span>{artistSongs.length} bài hát</span>
          </>
        }
      />

      {/* Action row */}
      <div style={{ padding: "16px 32px 8px", display: "flex", alignItems: "center", gap: 18 }}>
        <button
          type="button"
          aria-label={ctxPlaying ? `Tạm dừng nhạc của ${artist.name}` : `Phát nhạc của ${artist.name}`}
          onClick={() => onPlay(ctxSong ?? artist.topSong)}
          style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "#1ed760", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#000", cursor: "pointer",
            boxShadow: "0 6px 20px rgba(30,215,96,0.35)",
            transition: "transform 0.15s, filter 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.06)"; e.currentTarget.style.filter = "brightness(1.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.filter = "none"; }}
        >
          <FontAwesomeIcon icon={ctxPlaying ? faPause : faPlay} style={{ fontSize: 18, marginLeft: ctxPlaying ? 0 : 2 }} />
        </button>
        <button
          type="button"
          aria-label={isFollowed ? `Bỏ theo dõi ${artist.name}` : `Theo dõi ${artist.name}`}
          aria-pressed={isFollowed}
          onClick={onToggleFollow}
          style={{
            background: "transparent",
            border: `1.5px solid ${isFollowed ? "#1ed760" : "var(--text-tertiary)"}`,
            borderRadius: 9999,
            padding: "7px 18px",
            fontSize: 12.5,
            fontWeight: 600,
            color: isFollowed ? "#1ed760" : TEXT.primary,
            cursor: "pointer",
            letterSpacing: 0.3,
            transition: "border-color 0.15s, color 0.15s, transform 0.1s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = isFollowed ? "#1ed760" : "var(--text-primary)"; e.currentTarget.style.transform = "scale(1.03)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = isFollowed ? "#1ed760" : "var(--text-tertiary)"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          {isFollowed ? "Đang theo dõi" : "Theo dõi"}
        </button>
      </div>

      {/* Popular */}
      <section style={{ padding: "20px 24px 0" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3, marginBottom: 10, padding: "0 8px" }}>
          Phổ biến
        </h2>
        <TrackList
          songs={popular}
          cur={cur}
          playing={playing}
          likedIds={likedIds}
          onPlay={onPlay}
          onLike={onLike}
          onAddToQueue={onAddToQueue}
          showPlays
          showHeader={false}
        />
      </section>

      {/* Albums & singles */}
      {artistAlbums.length > 0 && (
        <section style={{ padding: "36px 32px 0" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3, marginBottom: 14 }}>
            Album và đĩa đơn
          </h2>
          <div
            className="hscroll"
            style={{
              display: "flex", gap: 16, overflowX: "auto",
              padding: "4px 0 8px",
              scrollbarWidth: "none",
              scrollSnapType: "x proximity",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {artistAlbums.map(al => (
              <AlbumTile key={al.name} album={al} onOpenAlbum={onOpenAlbum} />
            ))}
          </div>
        </section>
      )}

      {/* All songs */}
      {artistSongs.length > 5 && (
        <section style={{ padding: "36px 24px 0" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3, marginBottom: 10, padding: "0 8px" }}>
            Tất cả bài hát
          </h2>
          <TrackList
            songs={allSongs}
            cur={cur}
            playing={playing}
            likedIds={likedIds}
            onPlay={onPlay}
            onLike={onLike}
            onAddToQueue={onAddToQueue}
            onOpenAlbum={onOpenAlbum}
            showAlbum
          />
          {artistSongs.length > 10 && (
            <button
              type="button"
              onClick={() => setShowAllSongs(s => !s)}
              style={{
                marginTop: 12,
                marginLeft: 8,
                background: "transparent",
                border: "none",
                color: TEXT.secondary,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.4,
                textTransform: "uppercase",
                cursor: "pointer",
                padding: "6px 0",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              {showAllSongs ? "Thu gọn" : `Xem thêm (${artistSongs.length - 10})`}
            </button>
          )}
        </section>
      )}

      {posts.length > 0 && (
        <section style={{ padding: "36px 32px 0" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3, marginBottom: 14 }}>
            Stories
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => setViewPost(post)}
              />
            ))}
          </div>
        </section>
      )}

      <PostViewModal
        post={viewPost}
        artistName={artist.name}
        artistColor={imageAccent}
        onClose={() => setViewPost(null)}
      />
    </div>
  );
}
