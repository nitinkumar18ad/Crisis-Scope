import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

type BackgroundVideoProps = {
  overlayClassName?: string;
  poster?: string;
  src?: string;
};

const defaultStreamUrl =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_055001_8e16d972-3b2b-441c-86ad-2901a54682f9.mp4";

const defaultPoster = "";

export function BackgroundVideo({
  overlayClassName,
  poster = defaultPoster,
  src = defaultStreamUrl,
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(() => 
    typeof window !== "undefined" ? window.matchMedia('(min-width: 768px)').matches : true
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    
    const handleResize = (e: MediaQueryListEvent) => setShouldLoadVideo(e.matches);
    setShouldLoadVideo(mediaQuery.matches);
    
    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  useEffect(() => {
    if (!shouldLoadVideo) return;

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
  }, [src, shouldLoadVideo]);

  return (
    <>
      {shouldLoadVideo ? (
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
      ) : (
        <div
          className="bg-video bg-gradient-to-br from-[#0a0f1e] via-slate-900/50 to-[#0a0f1e]"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
        />
      )}
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
