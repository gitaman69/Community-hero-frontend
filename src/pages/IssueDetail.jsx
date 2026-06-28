import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import StatusBadge from '../components/StatusBadge.jsx';
import Spinner, { EmptyState } from '../components/Spinner.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import LetterModal from '../components/LetterModal.jsx';
import { confirmIssue, deleteIssue, fetchIssue, fetchIssueLetter, fetchSla } from '../lib/api.js';
import { normalizeIssueDetail, coordsFromIssue, fmtCoord, fmtTimestamp, issueImage } from '../lib/format.js';
import { categoryMeta, isResolved, isUrgent, statusLabel } from '../lib/constants.js';
import { useAuth } from '../lib/AuthContext.jsx';

export default function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user, isAdmin } = useAuth();
  const [confirmCount, setConfirmCount] = useState(null);
  const [askDelete, setAskDelete] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['issue', id],
    queryFn: () => fetchIssue(id),
    refetchInterval: 15000,
  });

  const slaQuery = useQuery({ queryKey: ['sla'], queryFn: fetchSla, staleTime: 60000 });

  const letterMutation = useMutation({ mutationFn: () => fetchIssueLetter(id) });

  const { issue, statusUpdates } = useMemo(() => normalizeIssueDetail(data), [data]);

  const openLetter = () => {
    setLetterOpen(true);
    if (!letterMutation.data && !letterMutation.isPending) letterMutation.mutate();
  };

  const confirmMutation = useMutation({
    mutationFn: () => confirmIssue(id),
    onSuccess: (res) => {
      if (res?.confirmations != null) setConfirmCount(res.confirmations);
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      navigate('/my-reports');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner label="Loading report…" />
      </div>
    );
  }

  if (isError || !issue) {
    return (
      <div className="py-16">
        <EmptyState icon="⚠" title="Report not found">
          This issue may have been removed, or the API is unreachable.{' '}
          <Link to="/map" className="text-civic underline-offset-2 hover:underline">
            Back to the map
          </Link>
        </EmptyState>
      </div>
    );
  }

  const cat = categoryMeta(issue.category);
  const coords = coordsFromIssue(issue);
  const img = issueImage(issue);
  const urgent = isUrgent(issue);
  const confirmations = confirmCount ?? issue.confirmations ?? 0;
  const resolved = isResolved(issue.status);

  // "Issues like this resolve in ~X days" from historical SLA data.
  const slaForCat = slaQuery.data?.byCategory?.[issue.category];
  const resolveEstimate =
    !resolved && slaForCat?.avgDays != null && slaForCat.count > 0
      ? slaForCat.avgDays
      : null;

  const duplicateOfId =
    typeof issue.duplicateOf === 'string' ? issue.duplicateOf : issue.duplicateOf?._id;

  const reporterId =
    typeof issue.reportedBy === 'string' ? issue.reportedBy : issue.reportedBy?._id;
  const canDelete = isAuthenticated && (isAdmin || reporterId === user?._id);

  // Build a timeline: prefer statusUpdates, else synthesize from created/status.
  const timeline = statusUpdates.length
    ? statusUpdates
    : [
        {
          fromStatus: null,
          toStatus: issue.status,
          note: issue.aiProcessed ? 'AI categorized this report.' : 'Report received.',
          createdAt: issue.createdAt,
        },
      ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between">
        <Link to="/map" className="text-sm text-civic underline-offset-2 hover:underline">
          ← Back to map
        </Link>
        {canDelete ? (
          <button
            type="button"
            onClick={() => setAskDelete(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-haze px-2.5 py-1 text-xs text-ink/60 transition-colors hover:border-signal/40 hover:bg-signal/10 hover:text-signal"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6m4 5v6m6-6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Delete report
          </button>
        ) : null}
      </div>

      {duplicateOfId ? (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-signal/40 bg-signal/5 px-3 py-2 text-sm text-ink/80">
          <span className="text-signal" aria-hidden="true">
            ↪
          </span>
          <span>
            This report was merged into an earlier nearby report.{' '}
            <Link
              to={`/issues/${duplicateOfId}`}
              className="text-civic underline-offset-2 hover:underline"
            >
              View the active report →
            </Link>
          </span>
        </div>
      ) : null}

      <div className="mt-3 grid gap-6 md:grid-cols-[1.2fr_1fr]">
        {/* Photo */}
        <div className="map-shell flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-haze text-5xl text-civic/40">
          {img ? (
            <img src={img} alt={issue.title || cat.label} className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden="true">{cat.icon}</span>
          )}
        </div>

        {/* Summary */}
        <div>
          <div className="flex items-center gap-2">
            <StatusBadge status={issue.status} urgent={urgent} />
            <span className="code text-[10px] uppercase tracking-widest text-ink/45">
              {cat.icon} {cat.label}
              {issue.severity != null ? ` · SEV ${issue.severity}` : ''}
            </span>
          </div>

          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
            {issue.title || (issue.aiProcessed ? cat.label : 'Awaiting categorization')}
          </h1>

          <p className="mt-2 text-sm text-ink/70">
            {issue.description ||
              (issue.aiProcessed ? 'No description provided.' : 'The AI is still analyzing this photo.')}
          </p>

          <dl className="code mt-4 space-y-1.5 text-xs text-ink/60">
            <Row label="ID" value={issue._id} />
            <Row label="COORD" value={coords ? fmtCoord(coords.lat, coords.lng) : '—'} />
            {issue.address ? <Row label="ADDR" value={issue.address} /> : null}
            <Row label="FILED" value={fmtTimestamp(issue.createdAt)} />
            {issue.reportedBy?.name ? <Row label="BY" value={issue.reportedBy.name} /> : null}
            <Row label="CONFIRMS" value={String(confirmations)} />
          </dl>

          {resolveEstimate != null ? (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-verified/30 bg-verified/5 px-3 py-2">
              <span className="text-verified" aria-hidden="true">
                ⏱
              </span>
              <p className="text-xs text-ink/75">
                Issues like this typically resolve in{' '}
                <span className="font-semibold text-ink">~{resolveEstimate} days</span>
                <span className="text-ink/45"> (based on {slaForCat.count} resolved)</span>
              </p>
            </div>
          ) : null}

          {isAuthenticated ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => confirmMutation.mutate()}
                disabled={confirmMutation.isPending}
                className="btn-ghost disabled:opacity-60"
              >
                {confirmMutation.isPending ? (
                  <Spinner size={14} label="Confirming…" />
                ) : (
                  <>👍 I’ve seen this too ({confirmations})</>
                )}
              </button>
              {issue.aiProcessed && !duplicateOfId ? (
                <button type="button" onClick={openLetter} className="btn-signal">
                  ✉ Draft complaint letter
                </button>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-xs text-ink/50">
              <Link to="/login" className="text-civic underline-offset-2 hover:underline">
                Sign in
              </Link>{' '}
              to confirm you’ve seen this issue.
            </p>
          )}
        </div>
      </div>

      {/* Status timeline */}
      <section className="mt-8">
        <h2 className="font-display text-sm font-semibold text-ink">Status timeline</h2>
        <ol className="mt-3 border-l border-haze pl-4">
          {timeline.map((s, i) => (
            <li key={i} className="relative pb-4 last:pb-0">
              <span
                className="absolute -left-[1.32rem] top-1 h-2.5 w-2.5 rounded-full border-2 border-paper"
                style={{
                  backgroundColor:
                    s.toStatus === 'resolved'
                      ? '#34D399'
                      : urgent
                      ? '#FB7185'
                      : '#3B82F6',
                }}
                aria-hidden="true"
              />
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm font-medium text-ink">
                  {s.fromStatus ? `${statusLabel(s.fromStatus)} → ` : ''}
                  {statusLabel(s.toStatus)}
                </span>
                <time className="code text-[10px] text-ink/45">{fmtTimestamp(s.createdAt ?? s.timestamp)}</time>
              </div>
              {s.note ? <p className="mt-0.5 text-sm text-ink/60">{s.note}</p> : null}
              {s.updatedBy?.name ? (
                <p className="code mt-0.5 text-[10px] text-ink/40">by {s.updatedBy.name}</p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <ConfirmDialog
        open={askDelete}
        title="Delete this report?"
        body="This permanently removes the report and its status history. This can’t be undone."
        confirmLabel="Delete report"
        danger
        busy={deleteMutation.isPending}
        onCancel={() => setAskDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
      />

      <LetterModal
        open={letterOpen}
        letter={letterMutation.data}
        loading={letterMutation.isPending}
        error={letterMutation.isError}
        onClose={() => setLetterOpen(false)}
      />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-2">
      <dt className="w-20 shrink-0 uppercase tracking-wide text-ink/40">{label}</dt>
      <dd className="min-w-0 break-all text-ink/70">{value}</dd>
    </div>
  );
}
