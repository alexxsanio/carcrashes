"use client";

import type { CrashObservation } from "@/app/page";

type Props = {
  observations: CrashObservation[];
  selectedObservation: CrashObservation | null;
  onSelect: (observation: CrashObservation) => void;
};

export default function ObservationList({
  observations,
  selectedObservation,
  onSelect,
}: Props) {
  if (observations.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center">
        <div>
          <div className="mb-3 text-3xl">
            🛣️
          </div>

          <p className="font-medium text-slate-700">
            No observations yet
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Add the first crash observation using
            the button above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {observations.map((observation) => {
        const selected =
          selectedObservation?.id === observation.id;

        return (
          <button
            key={observation.id}
            onClick={() => onSelect(observation)}
            className={`w-full border-b border-slate-100 p-4 text-left transition ${
              selected
                ? "bg-slate-100"
                : "hover:bg-slate-50"
            }`}
          >
            <div className="flex gap-3">
              <div className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-red-600" />

              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {observation.nearbyPlace}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {observation.date} ·{" "}
                  {observation.time}
                </p>

                <div className="mt-2 flex gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                    {observation.severity}
                  </span>

                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                    {observation.vehicles} vehicles
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}