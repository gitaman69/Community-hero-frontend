import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import ReportForm from '../components/ReportForm.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Spinner from '../components/Spinner.jsx';
import { createIssue, fetchIssue } from '../lib/api.js';
import { normalizeIssueDetail, fmtCoord } from '../lib/format.js';
import { categoryMeta, isUrgent } from '../lib/constants.js';

const POLL_INTERVAL = 2500;
const MAX_POLLS = 24; // ~60s

// phases: form | analyzing | done | timeout | error
export default function Report() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState('form');
  const [submitting, setSubmitting] = useState(false);
  const [issue, setIssue] = useState(null);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => () => clearTimeout(pollRef.current), []);

  const startPolling = (id, attempt = 0) => {
    pollRef.current = setTimeout(async () => {
      try {
        const data = await fetchIssue(id);
        const { issue: fresh } = normalizeIssueDetail(data);
        setIssue(fresh);
        if (fresh?.aiProcessed) {
          setPhase('done');
          queryClient.invalidateQueries({ queryKey: ['issues'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
          return;
        }
        if (attempt + 1 >= MAX_POLLS) {
          setPhase('timeout');
          return;
        }
        startPolling(id, attempt + 1);
      } catch (err) {
        // Keep trying a few times on transient errors, then surface.
        if (attempt + 1 >= MAX_POLLS) {
          setError('Lost contact while analyzing. Your report was saved.');
          setPhase('timeout');
        } else {
          startPolling(id, attempt + 1);
        }
      }
    }, POLL_INTERVAL);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError(null);
    try {
      const created = await createIssue(payload);
      setIssue(created);
      setPhase('analyzing');
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      if (created?._id) {
        if (created.aiProcessed) {
          setPhase('done');
        } else {
          startPolling(created._id, 0);
        }
      } else {
        setError('The server did not return a report id.');
        setPhase('error');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not submit your report. Try again.');
      setPhase('error');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    clearTimeout(pollRef.current);
    setPhase('form');
    setIssue(null);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <div className="code mb-1 text-[10px] uppercase tracking-widest text-civic">
        Civic Wayfinding · New report
      </div>
      <h1 className="font-display text-2xl font-semibold text-ink">Report an issue</h1>
      <p className="mt-1 text-sm text-ink/60">
        One photo and your location is all we need. Our AI sorts the rest.
      </p>

      <div className="mt-6">
        {phase === 'form' || phase === 'error' ? (
          <>
            {phase === 'error' && error ? (
              <p role="alert" className="mb-3 rounded-md bg-signal/10 px-3 py-2 text-sm text-signal">
                {error}
              </p>
            ) : null}
            <ReportForm
              onSubmit={handleSubmit}
              submitting={submitting}
              onConfirmedExisting={(id) => navigate(`/issues/${id}`)}
            />
          </>
        ) : null}

        {phase === 'analyzing' ? (
          <div className="glass rounded-2xl p-6 text-center">
            <div className="animate-pulse-soft text-3xl text-civic" aria-hidden="true">
              ◎
            </div>
            <p className="mt-3 font-display text-lg font-medium text-ink">Analyzing…</p>
            <p className="mt-1 text-sm text-ink/60">
              Gemini is reviewing your photo to categorize and rate the issue. This usually takes a
              few seconds.
            </p>
            <div className="mt-4 flex justify-center">
              <Spinner label="Awaiting categorization" />
            </div>
          </div>
        ) : null}

        {phase === 'done' && issue ? (
          <ResultCard
            issue={issue}
            onAnother={reset}
            onView={() => navigate(`/issues/${issue._id}`)}
          />
        ) : null}

        {phase === 'timeout' && issue ? (
          <div className="glass rounded-2xl p-6 text-center">
            <p className="font-display text-lg font-medium text-ink">Report saved</p>
            <p className="mt-1 text-sm text-ink/60">
              {error ||
                'Still categorizing — this can take a little longer. You can check back on the issue page.'}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Link to={`/issues/${issue._id}`} className="btn-civic">
                View report
              </Link>
              <button type="button" onClick={reset} className="btn-ghost">
                Report another
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ResultCard({ issue, onAnother, onView }) {
  const cat = categoryMeta(issue.category);
  return (
    <div className="animate-scale-in rounded-2xl border border-verified/40 bg-surface/80 p-6 text-center shadow-[0_0_40px_-12px_rgba(52,211,153,0.5)]">
      <div className="text-3xl text-verified" aria-hidden="true">
        ✓
      </div>
      <p className="mt-2 font-display text-lg font-medium text-ink">Report filed</p>
      <p className="mt-1 text-sm text-ink/70">
        Categorized as{' '}
        <span className="font-medium text-ink">
          {cat.icon} {cat.label}
        </span>
        {issue.severity != null ? (
          <>
            {' '}
            · Severity <span className="code font-medium">{issue.severity}</span>
          </>
        ) : null}
      </p>

      <div className="mt-3 flex items-center justify-center gap-2">
        <StatusBadge status={issue.status} urgent={isUrgent(issue)} />
        {issue.location?.coordinates ? (
          <span className="code text-[10px] text-ink/45">
            {fmtCoord(issue.location.coordinates[1], issue.location.coordinates[0])}
          </span>
        ) : null}
      </div>

      {issue.title ? (
        <p className="mt-3 font-display text-sm font-medium text-ink">{issue.title}</p>
      ) : null}
      {issue.description ? (
        <p className="mt-1 text-sm text-ink/60">{issue.description}</p>
      ) : null}

      <div className="mt-5 flex justify-center gap-2">
        <button type="button" onClick={onView} className="btn-civic">
          View report
        </button>
        <button type="button" onClick={onAnother} className="btn-ghost">
          Report another
        </button>
      </div>
    </div>
  );
}
