"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ColoradoMap from "@/components/ColoradoMap";
import CrashObservationModal from "@/components/CrashObservationModal";
import ObservationList from "@/components/ObservationList";
import { apiFetch, getToken, removeToken } from "@/lib/api";

export type CrashObservation = {
  id: string;

  nearbyPlace: string;

  latitude: number | null;
  longitude: number | null;

  date: string;
  time: string;

  severity: string;

  vehicles: number;

  description: string;

  media: {
    url?: string;
    type: "image" | "video";
    filename: string;
  }[];

  createdAt: string;
};

export default function Home() {
  const router = useRouter();

  const [observations, setObservations] =
  useState<CrashObservation[]>([]);

  const [showModal, setShowModal] =
  useState(false);

  const [selectedObservation, setSelectedObservation] =
  useState<CrashObservation | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!getToken()) {
    router.replace("/login");
    return;
}


async function loadObservations() {
  try {
    const response = await apiFetch(
      "/api/observations"
    );

    if (!response.ok) {
      throw new Error(
        "Failed to load observations."
      );
    }

    const data = await response.json();

    setObservations(
      data.observations || []
    );
  } catch (error) {
    console.error(
      "Failed to load observations:",
      error
    );
  } finally {
    setLoading(false);
  }
}

loadObservations();


}, [router]);

async function addObservation(
  formData: FormData
  ) {
  try {
    const response = await apiFetch(
    "/api/observations",
  {
    method: "POST",
    body: formData,
  }
);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Failed to save observation."
    );
  }

  setObservations((current) => [
    data.observation,
    ...current,
  ]);

  setShowModal(false);
} catch (error) {
  console.error(error);

  alert(
    error instanceof Error
      ? error.message
      : "Unable to save the crash observation."
  );
}

}

function handleLogout() {
  removeToken();
  router.push("/login");
}

if (loading) {
  return ( <main className="flex h-screen items-center justify-center bg-slate-100"> <p className="text-sm text-slate-500">
    Loading crash observations... </p> </main>
  );
}

return ( <main className="relative h-screen w-screen overflow-hidden bg-slate-100"> <header className="absolute left-0 right-0 top-0 z-[1000] flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm"> <div> <h1 className="text-xl font-bold tracking-tight text-slate-900">
    Colorado Crash Map </h1>

        <p className="text-xs text-slate-500">
          Highway crash observations across Colorado
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          + Add Crash Observation
        </button>

        <button
          onClick={handleLogout}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Log out
        </button>
      </div>
    </header>

    <div className="h-full w-full pt-16">
      <ColoradoMap
        observations={observations}
        selectedObservation={
          selectedObservation
        }
      />
    </div>
{/*
    <aside className="absolute bottom-5 left-5 top-24 z-[900] flex w-80 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900">
              Crash Observations
            </h2>

            <p className="text-xs text-slate-500">
              {observations.length} recorded
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
            {observations.length}
          </div>
        </div>
      </div>

      <ObservationList
        observations={observations}
        selectedObservation={
          selectedObservation
        }
        onSelect={setSelectedObservation}
      />
    </aside>*/}

    {showModal && (
      <CrashObservationModal
        onClose={() => setShowModal(false)}
        onSubmit={addObservation}
      />
    )}
  </main>

  );
}
