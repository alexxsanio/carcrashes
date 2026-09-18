"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import type { CrashObservation } from "@/app/page";

type Props = {
  observations: CrashObservation[];
  selectedObservation: CrashObservation | null;
};

const crashIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width: 18px;
      height: 18px;
      background: #dc2626;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,.4);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function MapController({
  observation,
}: {
  observation: CrashObservation | null;
}) {
  const map = useMap();

  if (
    observation?.latitude !== null &&
    observation?.longitude !== null &&
    observation?.latitude !== undefined &&
    observation?.longitude !== undefined
  ) {
    map.flyTo(
      [
        observation.latitude,
        observation.longitude,
      ],
      14,
      {
        duration: 1,
      }
    );
  }

  return null;
}

function ObservationMedia({
  observationId,
  }: {
    observationId: string;
  }) {
    const [media, setMedia] = useState<
  {
    url: string;
    type: "image" | "video";
    filename: string;
  }[]

  > ([]);

    const [loading, setLoading] =
    useState(false);

    const [loaded, setLoaded] =
    useState(false);

    async function loadMedia() {
      if (loaded) {
      return;
    }


  setLoading(true);

  try {
    const response = await apiFetch(
      `/api/observations/${observationId}`
    );

    if (!response.ok) {
      throw new Error(
        "Failed to load observation media."
      );
    }
    
    const data = await response.json();

    setMedia(
      data.media || []
    );

    setLoaded(true);
  } catch (error) {
    console.error(
      "Failed to load media:",
      error
    );
  } finally {
    setLoading(false);
  }

}

if (!loaded) {
  return ( <button
      onClick={loadMedia}
      className="mt-3 rounded bg-slate-900 px-3 py-2 text-xs text-white"
    >
      {loading
      ? "Loading..."
      : "View Photos / Video"} </button>
  );
}

if (media.length === 0) {
  return ( <p className="mt-3 text-xs text-slate-500">
    No photos or video attached. </p>
  );
}


  return (
    <div className="mt-3">
      {media.length === 0 ? (
        <button
          onClick={loadMedia}
          className="rounded bg-slate-900 px-3 py-2 text-xs text-white"
        >
          {loading
            ? "Loading..."
            : "View Photos / Video"}
        </button>
      ) : (
        <div className="space-y-2">
          {media.map((file) => (
            <div key={file.url}>
              {file.type === "image" ? (
                <img
                  src={file.url}
                  alt="Crash observation"
                  className="max-w-full rounded"
                />
              ) : (
                <video
                  src={file.url}
                  controls
                  className="max-w-full rounded"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ColoradoMap({
  observations,
  selectedObservation,
}: Props) {
  return (
    <MapContainer
      center={[39.0, -105.5]}
      zoom={7}
      scrollWheelZoom={true}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController
        observation={selectedObservation}
      />

      {observations
        .filter(
          (observation) =>
            observation.latitude !== null &&
            observation.longitude !== null
        )
        .map((observation) => (
          <Marker
            key={observation.id}
            position={[
              observation.latitude!,
              observation.longitude!,
            ]}
            icon={crashIcon}
          >
            <Popup>
              <div className="min-w-[220px]">
                <h3 className="mb-2 font-bold text-slate-900">
                  Crash Observation
                </h3>

                <p className="text-sm">
                  <strong>Location:</strong>{" "}
                  {observation.nearbyPlace}
                </p>

                <p className="text-sm">
                  <strong>Date:</strong>{" "}
                  {observation.date}
                </p>

                <p className="text-sm">
                  <strong>Time:</strong>{" "}
                  {observation.time}
                </p>

                <p className="text-sm">
                  <strong>Severity:</strong>{" "}
                  {observation.severity}
                </p>

                <p className="text-sm">
                  <strong>Vehicles:</strong>{" "}
                  {observation.vehicles}
                </p>

                {observation.description && (
                  <p className="mt-2 text-sm text-slate-600">
                    {observation.description}
                  </p>
                )}

                <ObservationMedia
                  observationId={observation.id}
                />
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
