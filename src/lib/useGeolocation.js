import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_CENTER } from './constants.js';

// Returns the user's coordinates, falling back to a default city center.
// `auto` triggers a lookup on mount; otherwise call `locate()` manually.
export function useGeolocation({ auto = true } = {}) {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | locating | ready | error | fallback
  const [error, setError] = useState(null);

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('fallback');
      setCoords(DEFAULT_CENTER);
      setError('Geolocation not supported by this browser.');
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('ready');
        setError(null);
      },
      (err) => {
        setCoords(DEFAULT_CENTER);
        setStatus('fallback');
        setError(err?.message || 'Unable to get your location.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    if (auto) locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto]);

  return { coords, status, error, locate, usedFallback: status === 'fallback' };
}
