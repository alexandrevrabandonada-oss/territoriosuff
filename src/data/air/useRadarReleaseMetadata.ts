import { useEffect, useState } from "react";

import { getAirPublicDataPath } from "./public-downloads";
import { RADAR_RELEASE_METADATA, RADAR_RELEASE_METADATA_FILE, type RadarReleaseMetadata } from "./radar-release-metadata";

export function useRadarReleaseMetadata() {
  const [releaseMetadata, setReleaseMetadata] = useState<RadarReleaseMetadata>(RADAR_RELEASE_METADATA);

  useEffect(() => {
    let cancelled = false;

    fetch(getAirPublicDataPath(RADAR_RELEASE_METADATA_FILE))
      .then((response) => {
        if (!response.ok) {
          throw new Error("release metadata unavailable");
        }
        return response.json();
      })
      .then((payload: RadarReleaseMetadata) => {
        if (!cancelled) {
          setReleaseMetadata(payload);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setReleaseMetadata(RADAR_RELEASE_METADATA);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return releaseMetadata;
}
