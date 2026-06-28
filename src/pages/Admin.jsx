import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import StatusBadge from '../components/StatusBadge.jsx';
import FilterChips from '../components/FilterChips.jsx';
import Spinner, { EmptyState } from '../components/Spinner.jsx';
import { fetchIssues, fetchSla, updateIssueStatus } from '../lib/api.js';
import { CATEGORIES, STATUSES, categoryMeta, isResolved, isUrgent } from '../lib/constants.js';
import { fmtTimestamp, fmtCoord, coordsFromIssue } from '../lib/format.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
// Default resolution target (days) when no historical SLA exists for a category.
const DEFAULT_SLA_DAYS = 14;

// An open issue is "overdue" once its age exceeds the category's typical
// resolution time (from historical data, or a sane default).
function overdueDays(issue, slaByCategory) {
  if (isResolved(issue.status) || !issue.createdAt) return 0;
  const target = slaByCategory?.[issue.category]?.avgDays ?? DEFAULT_SLA_DAYS;
  const ageDays = (Date.now() - new Date(issue.createdAt).getTime()) / MS_PER_DAY;
  return ageDays > target ? Math.round(ageDays - target) : 0;
}

export default function Admin() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['issues', 'admin', { category, status }],
    queryFn: () => fetchIssues({ category, status }),
    refetchInterval: 20000,
  });

  const slaQuery = useQuery({ queryKey: ['sla'], queryFn: fetchSla, staleTime: 60000 });
  const slaByCategory = slaQuery.data?.byCategory;

  const issues = useMemo(() => data ?? [], [data]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="code mb-1 text-[10px] uppercase tracking-widest text-signal">
        Civic Wayfinding · Operations
      </div>
      <h1 className="font-display text-2xl font-semibold text-ink">Admin console</h1>
      <p className="mt-1 text-sm text-ink/60">
        Triage reports, advance status, and correct AI categorization where needed.
      </p>

      <div className="glass mt-5 rounded-xl p-3">
        <FilterChips
          category={category}
          status={status}
          onCategory={setCategory}
          onStatus={setStatus}
        />
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-white/10 bg-surface/60 backdrop-blur">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner label="Loading reports…" />
          </div>
        ) : isError ? (
          <EmptyState icon="⚠" title="Couldn’t load reports">
            The API may be unreachable.
          </EmptyState>
        ) : issues.length === 0 ? (
          <EmptyState icon="◇" title="No reports match these filters">
            Adjust the chips above to see more.
          </EmptyState>
        ) : (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-haze text-[10px] uppercase tracking-widest text-ink/45">
                <th className="px-3 py-2 font-medium">Report</th>
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Filed</th>
                <th className="px-3 py-2 font-medium">Update</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <AdminRow
                  key={issue._id}
                  issue={issue}
                  queryClient={queryClient}
                  overdue={overdueDays(issue, slaByCategory)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function AdminRow({ issue, queryClient, overdue = 0 }) {
  const cat = categoryMeta(issue.category);
  const coords = coordsFromIssue(issue);

  const [status, setStatus] = useState(issue.status || 'reported');
  const [category, setCategory] = useState(issue.category || 'other');
  const [note, setNote] = useState('');
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState(null);

  const mutation = useMutation({
    mutationFn: (payload) => updateIssueStatus(issue._id, payload),
    onSuccess: () => {
      setMsg('Saved');
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issue', issue._id] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setOpen(false);
      setNote('');
      setTimeout(() => setMsg(null), 2000);
    },
    onError: (err) => {
      setMsg(err?.response?.data?.message || 'Update failed');
    },
  });

  const save = () => {
    const payload = { status, note };
    // Only include category if it changed (handy for Gemini fallbacks).
    if (category && category !== issue.category) payload.category = category;
    mutation.mutate(payload);
  };

  return (
    <tr className="border-b border-haze/60 align-top last:border-0">
      <td className="px-3 py-3">
        <Link
          to={`/issues/${issue._id}`}
          className="font-display text-sm font-medium text-ink hover:text-civic"
        >
          {issue.title || (issue.aiProcessed ? cat.label : 'Analyzing…')}
        </Link>
        <div className="code mt-0.5 text-[10px] text-ink/45">
          {issue._id.slice(-8)} · {coords ? fmtCoord(coords.lat, coords.lng) : '—'}
        </div>
        {!issue.aiProcessed ? (
          <span className="code mt-1 inline-block rounded bg-signal/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-signal">
            AI pending
          </span>
        ) : null}
      </td>
      <td className="px-3 py-3">
        <span className="code text-xs text-ink/70">
          {cat.icon} {cat.label}
        </span>
        {issue.severity != null ? (
          <div className="code text-[10px] text-ink/45">SEV {issue.severity}</div>
        ) : null}
      </td>
      <td className="px-3 py-3">
        <StatusBadge status={issue.status} urgent={isUrgent(issue)} />
        {overdue > 0 ? (
          <div
            className="code mt-1 inline-block rounded bg-urgent/15 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-urgent"
            title="Past its typical resolution time"
          >
            ⚠ Overdue · {overdue}d
          </div>
        ) : null}
      </td>
      <td className="px-3 py-3">
        <span className="code text-[10px] text-ink/45">{fmtTimestamp(issue.createdAt)}</span>
      </td>
      <td className="px-3 py-3">
        {open ? (
          <div className="flex w-56 flex-col gap-2">
            <label className="text-[10px] uppercase tracking-wide text-ink/45">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="field mt-0.5 py-1 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[10px] uppercase tracking-wide text-ink/45">
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="field mt-0.5 py-1 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="field py-1 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={save}
                disabled={mutation.isPending}
                className="btn-civic px-3 py-1 text-xs disabled:opacity-60"
              >
                {mutation.isPending ? <Spinner size={12} /> : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-ghost px-3 py-1 text-xs"
              >
                Cancel
              </button>
            </div>
            {msg ? <span className="code text-[10px] text-ink/50">{msg}</span> : null}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="btn-ghost px-3 py-1 text-xs"
            >
              Edit
            </button>
            {msg ? <span className="code text-[10px] text-verified">{msg}</span> : null}
          </div>
        )}
      </td>
    </tr>
  );
}
