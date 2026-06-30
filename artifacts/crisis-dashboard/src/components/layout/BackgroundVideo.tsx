import { useEffect, useRef } from "react";
import Hls from "hls.js";

type BackgroundVideoProps = {
  overlayClassName?: string;
  poster?: string;
  src?: string;
};

const defaultStreamUrl = "https://stream.mux.com/BuGGTsiXq1T00WUb8qfURrHkTCbhrkfFLSv4uAOZzdhw.m3u8";
const defaultPoster = "/opengraph.jpg";

export function BackgroundVideo({
  overlayClassName,
  poster = defaultPoster,
  src = defaultStreamUrl,
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return undefined;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      void video.play().catch(() => undefined);
      return undefined;
    }

    if (!Hls.isSupported()) {
      return undefined;
    }

    const hls = new Hls({
      autoStartLoad: true,
      enableWorker: true,
    });

    hls.loadSource(src);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      void video.play().catch(() => undefined);
    });

    return () => {
      hls.destroy();
    };
  }, [src]);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        poster={poster}
        className="bg-video"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        className={overlayClassName ? `video-overlay ${overlayClassName}` : "video-overlay"}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}
