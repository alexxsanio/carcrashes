"use client";

import { FormEvent, useState } from "react";
import type { CrashObservation } from "@/app/page";

const MAX_FILE_SIZE =
  50 * 1024 * 1024;

const MAX_FILES = 10;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

type Props = {
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
};

export default function CrashObservationModal({
  onClose,
  onSubmit,
}: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [severity, setSeverity] = useState("Property damage");
  const [vehicles, setVehicles] = useState(2);
  const [nearbyPlace, setNearbyPlace] = useState("");
  const [description, setDescription] = useState("");

  const [files, setFiles] = useState<File[]>([]);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (selectedFiles.length > MAX_FILES) {
      alert(
        `You can upload a maximum of ${MAX_FILES} files.`
      );
      return;
    }

    for (const file of selectedFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(
          `${file.name} is not a supported file type.`
        );
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        alert(
          `${file.name} is larger than the 50 MB limit.`
        );
        return;
      }
    }

    setFiles(selectedFiles);
  }

  async function handleSubmit(
        event: FormEvent
        ) {
        event.preventDefault();

        const formData = new FormData();

        formData.append("date", date);
        formData.append("time", time);
        formData.append(
            "nearbyPlace",
            nearbyPlace
        );
        formData.append("severity", severity);
        formData.append(
            "vehicles",
            String(vehicles)
        );
        formData.append(
            "description",
            description
        );

        files.forEach((file) => {
            formData.append("media", file);
        });

        onSubmit(formData);
    }

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Add Crash Observation
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Record details about an observed crash.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-2xl text-slate-400 hover:text-slate-900"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Date */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-600"
            />
          </div>

          {/* Time */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Approximate time
            </label>

            <div className="flex gap-3">
              {/* Hour */}
              <select
                value={hour}
                onChange={(e) => {
                  const newHour = e.target.value;
                  setHour(newHour);

                  if (newHour && minute) {
                    const newTime = `${newHour}:${minute}`;
                    setTime(newTime);
                    console.log("TIME CHANGED:", newTime);
                  }
                }}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-600"
              >
              <option value="">Hour</option>

            {Array.from({ length: 24 }, (_, i) => {
              const value = String(i).padStart(2, "0");

              return (
                <option key={value} value={value}>
                  {value}
                </option>
              );
            })}
          </select>

          {/* Minute */}
          <select
            value={minute}
            onChange={(e) => {
              const newMinute = e.target.value;
              setMinute(newMinute);

              if (hour && newMinute) {
                const newTime = `${hour}:${newMinute}`;
                setTime(newTime);
                console.log("TIME CHANGED:", newTime);
              }
                }}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-600"
              >
                <option value="">Minute</option>

                {Array.from({ length: 60 }, (_, i) => {
                  const value = String(i).padStart(2, "0");

                  return (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Nearby place */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Nearby place or location
            </label>

            <p className="mb-2 text-xs text-slate-500">
              Enter a nearby intersection, highway exit, landmark,
              business, or other recognizable location.
            </p>

            <input
              type="text"
              placeholder="Example: I-25 & E 6th Ave"
              value={nearbyPlace}
              onChange={(e) =>
                setNearbyPlace(e.target.value)
              }
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-600"
            />
          </div>

          {/* Severity */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Crash severity
            </label>

            <select
              value={severity}
              onChange={(e) =>
                setSeverity(e.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-600"
            >
              <option>Property damage</option>
              <option>Possible injury</option>
              <option>Injury</option>
              <option>Serious injury</option>
              <option>Fatal</option>
              <option>Unknown</option>
            </select>
          </div>

          {/* Vehicles */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Number of vehicles
            </label>

            <input
              type="number"
              min="1"
              value={vehicles}
              onChange={(e) =>
                setVehicles(Number(e.target.value))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              What did you observe?
            </label>

            <textarea
              rows={4}
              placeholder="Describe the crash, road conditions, traffic, vehicles involved, or anything else you observed..."
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-600"
            />
          </div>

          {/* Media upload */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Photos or video footage
            </label>

            <p className="mb-2 text-xs text-slate-500">
              If available, upload pictures or video footage of
              the crash.
            </p>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-4 py-6 transition hover:border-slate-500 hover:bg-slate-50">
              <div className="mb-2 text-2xl">
                📷
              </div>

              <span className="text-sm font-medium text-slate-700">
                Choose photos or video
              </span>

              <span className="mt-1 text-xs text-slate-500">
                JPG, PNG, MP4, MOV, etc.
              </span>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                multiple
                onChange={handleFileChange}
              />
            </label>

            {/* Selected files */}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-slate-600">
                  Selected files
                </p>

                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2"
                  >
                    <span className="truncate text-sm text-slate-700">
                      {file.name}
                    </span>

                    <span className="ml-3 whitespace-nowrap text-xs text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-700"
            >
              Save Observation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}