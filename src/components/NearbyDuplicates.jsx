import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { confirmIssue, fetchNearbyIssues } from '../lib/api.js';
import { categoryMeta, statusLabel } from '../lib/constants.js';
import { fmtRelative } from '../lib/format.js';

// Shown above the report form: if open issues already exist near the citizen's
// location, offer to confirm one instead of filing a duplicate.
export default function NearbyDuplicates({ coords, onConfirmed }) {
  const enabled = Boolean(coords?.lat && coords?.lng);
  const queryClient = useQueryClient();

  const { data: nearby = [], isLoading } = useQuery({
    queryKey: ['nearby', coords?.lat, coords?.lng],
    queryFn: () => fetchNearbyIssues({ lat: coords.lat, lng: coords.lng }),
    enabled,
    staleTime: 15000,
  });

  const confirmMutation = useMutation({
    mutationFn: (id) => confirmIssue(id),
    onSuccess: (_res, id) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      onConfirmed?.(id);
    },
  });

  if (!enabled || isLoading || nearby.length === 0) return null;

  return (
    <div className="animate-scale-in rounded-2xl border border-signal/40 bg-signal/5 p-4">
      <div className="flex items-center gap-2">
        <span className="text-lg text-signal" aria-hidden="true">
          ⚑
        </span>
        <div>
          <p className="font-display text-sm font-semibold text-ink">
            {nearby.length === 1
              ? '1 issue already reported near you'
              : `${nearby.length} issues already reported near you`}
          </p>
          <p className="text-xs text-ink/60">
            If your problem is one of these, confirm it instead of filing a duplicate — it
            strengthens the existing report.
          </p>
        </div>
      </div>

      <ul className="mt-3 space-y-2">
        {nearby.map((issue) => {
          const cat = categoryMeta(issue.category);
          return (
            <li
              key={issue._id}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-paper/60 px-3 py-2"
            >
              <span className="text-base text-civic" aria-hidden="true">
                {cat.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {issue.title || cat.label}
                </p>
                <p className="code text-[10px] uppercase tracking-wide text-ink/45">
                  {statusLabel(issue.status)} · {issue.confirmations ?? 0} confirms ·{' '}
                  {fmtRelative(issue.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => confirmMutation.mutate(issue._id)}
                disabled={confirmMutation.isPending}
                className="btn-ghost shrink-0 px-2.5 py-1 text-xs disabled:opacity-60"
              >
                This is it
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-center text-xs text-ink/50">
        None of these? Continue with your report below.
      </p>
    </div>
  );
}
