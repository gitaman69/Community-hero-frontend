import { useEffect, useRef, useState } from 'react';
import { useGeolocation } from '../lib/useGeolocation.js';
import { fmtCoord } from '../lib/format.js';
import Spinner from './Spinner.jsx';
import NearbyDuplicates from './NearbyDuplicates.jsx';

// Capture/upload a photo + GPS, then hand the payload to `onSubmit`.
export default function ReportForm({ onSubmit, submitting, onConfirmedExisting }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const { coords, status, error: geoError, locate } = useGeolocation({ auto: true });

  // Build & revoke object URL for the preview.
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    setError(null);
    if (f && !f.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    setFile(f || null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError('Add a photo of the issue first.');
      return;
    }
    if (!coords) {
      setError('We need your location to place this report. Tap “Use my location”.');
      return;
    }
    onSubmit({ image: file, lat: coords.lat, lng: coords.lng });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Photo capture / upload */}
      <div>
        <label htmlFor="issue-photo" className="mb-1.5 block text-sm font-medium text-ink">
          Photo of the issue
        </label>
        <input
          id="issue-photo"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFileChange}
          className="sr-only"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="map-shell flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-haze text-ink/60 transition-colors hover:border-civic"
        >
          {preview ? (
            <img src={preview} alt="Selected issue preview" className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1 px-4 text-center">
              <span className="text-3xl" aria-hidden="true">
                ◎
              </span>
              <span className="text-sm font-medium">Tap to take or upload a photo</span>
              <span className="text-xs text-ink/45">Your camera opens on mobile</span>
            </span>
          )}
        </button>
        {preview ? (
          <button
            type="button"
            onClick={() => {
              setFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="mt-1.5 text-xs font-medium text-civic underline-offset-2 hover:underline"
          >
            Replace photo
          </button>
        ) : null}
      </div>

      {/* Location */}
      <div className="glass rounded-lg p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink">Location</p>
          <button
            type="button"
            onClick={locate}
            className="text-xs font-medium text-civic underline-offset-2 hover:underline"
          >
            Use my location
          </button>
        </div>
        <p className="code mt-1 text-xs text-ink/60">
          {status === 'locating' ? (
            <Spinner size={12} label="Locating…" />
          ) : coords ? (
            fmtCoord(coords.lat, coords.lng)
          ) : (
            'Location not set'
          )}
        </p>
        {geoError && status === 'fallback' ? (
          <p className="mt-1 text-xs text-signal">
            {geoError} Using a default city center — drag isn’t supported here, so allow location
            for accuracy.
          </p>
        ) : null}
      </div>

      {/* "Already reported?" — offer to confirm a nearby issue instead. */}
      <NearbyDuplicates coords={coords} onConfirmed={onConfirmedExisting} />

      {error ? (
        <p role="alert" className="rounded-md bg-signal/10 px-3 py-2 text-sm text-signal">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={submitting} className="btn-civic disabled:opacity-60">
        {submitting ? <Spinner size={16} label="Submitting…" /> : 'Submit report'}
      </button>
    </form>
  );
}
