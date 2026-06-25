import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import MapView from '../components/MapView.jsx';
import IssueCard from '../components/IssueCard.jsx';
import FilterChips from '../components/FilterChips.jsx';
import ImpactStrip from '../components/ImpactStrip.jsx';
import Spinner, { EmptyState } from '../components/Spinner.jsx';
import { fetchIssues, fetchStats } from '../lib/api.js';
import { useGeolocation } from '../lib/useGeolocation.js';
import { coordsFromIssue, areaCode } from '../lib/format.js';

const FEED_RADIUS_KM = 8;

export default function Home() {
  const { coords } = useGeolocation({ auto: true });
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [bounds, setBounds] = useState(null);

  // Track which issue ids are "new" since last fetch → drives the pin-drop animation.
  const [newIds, setNewIds] = useState(() => new Set());
  const seenRef = useRef(new Set());

  const issuesQuery = useQuery({
    queryKey: ['issues', { lat: coords?.lat, lng: coords?.lng, category, status }],
    queryFn: () =>
      fetchIssues({
        lat: coords?.lat,
        lng: coords?.lng,
        radius: coords ? FEED_RADIUS_KM * 1000 : undefined, // backend expects meters
        category,
        status,
      }),
    enabled: true,
    refetchInterval: 12000,
    refetchOnWindowFocus: true,
  });

  const statsQuery = useQuery({ queryKey: ['stats'], queryFn: fetchStats });

  const issues = useMemo(() => issuesQuery.data ?? [], [issuesQuery.data]);

  // Diff incoming issues against what we've seen to flag fresh pins.
  useEffect(() => {
    if (!issues.length) return;
    const fresh = new Set();
    const isFirstLoad = seenRef.current.size === 0;
    for (const it of issues) {
      if (!seenRef.current.has(it._id)) {
        seenRef.current.add(it._id);
        if (!isFirstLoad) fresh.add(it._id);
      }
    }
    if (fresh.size) {
      setNewIds(fresh);
      const t = setTimeout(() => setNewIds(new Set()), 1200);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [issues]);

  // Feed shows only issues within the current map viewport (synced with what's visible).
  const visibleIssues = useMemo(() => {
    if (!bounds || typeof bounds.contains !== 'function') return issues;
    return issues.filter((it) => {
      const c = coordsFromIssue(it);
      if (!c) return false;
      try {
        return bounds.contains({ lat: c.lat, lng: c.lng });
      } catch {
        return true;
      }
    });
  }, [issues, bounds]);

  const ward = coords ? areaCode(coords.lat, coords.lng) : 'CH·00·00';

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Map dominant left/center */}
        <div className="relative min-h-[42vh] flex-1 lg:min-h-0">
          {/* Floating filter panel */}
          <div className="pointer-events-none absolute left-3 top-3 z-10 max-w-[calc(100%-1.5rem)]">
            <div className="pointer-events-auto max-w-xs rounded-xl border border-white/10 bg-paper/80 p-3 shadow-xl backdrop-blur-xl">
              <FilterChips
                category={category}
                status={status}
                onCategory={setCategory}
                onStatus={setStatus}
              />
            </div>
          </div>

          <MapView
            className="h-full w-full"
            issues={issues}
            center={coords}
            newIssueIds={newIds}
            activeId={activeId}
            onSelect={setActiveId}
            onBoundsChange={setBounds}
          />
        </div>

        {/* Scannable feed right */}
        <aside className="flex w-full flex-col border-t border-white/10 bg-paper/60 backdrop-blur lg:w-[380px] lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <h2 className="font-display text-sm font-semibold text-white">Issue feed</h2>
              <p className="code text-[10px] uppercase tracking-widest text-ink/45">
                {ward} · {visibleIssues.length} in view
              </p>
            </div>
            <Link to="/report" className="btn-signal px-3 py-1.5 text-xs">
              ＋ Report
            </Link>
          </div>

          <div className="feed-scroll min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {issuesQuery.isLoading ? (
              <div className="flex justify-center py-10">
                <Spinner label="Loading issues nearby…" />
              </div>
            ) : issuesQuery.isError ? (
              <EmptyState icon="⚠" title="Couldn’t load issues">
                Check that the API at <code className="code">{import.meta.env.VITE_API_URL || 'http://localhost:5000'}</code> is running.
              </EmptyState>
            ) : visibleIssues.length === 0 ? (
              <EmptyState icon="◇" title="No issues reported here yet">
                Be the first — spot a pothole, broken light, or overflowing bin? Report it.
              </EmptyState>
            ) : (
              visibleIssues.map((issue) => (
                <IssueCard
                  key={issue._id}
                  issue={issue}
                  active={activeId === issue._id}
                  onHover={setActiveId}
                />
              ))
            )}
          </div>
        </aside>
      </div>

      {/* Impact strip bottom */}
      <ImpactStrip stats={statsQuery.data} loading={statsQuery.isLoading} />
    </div>
  );
}
