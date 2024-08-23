import { useEffect, useState } from "react";

let envSupportsXR = false;

export function useWithXR() {
  const [withXR, setWithXR] = useState(envSupportsXR);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!envSupportsXR && navigator.xr !== undefined) {
      navigator.xr.isSessionSupported("immersive-vr").then((supported) => {
        setWithXR(() => (envSupportsXR = supported));
      });
    }

    setUrl(`https://www.oculus.com/open_url/?url=${encodeURIComponent(`${window.location.href}`)}`);
  }, []);

  return [withXR, url] as const;
}
