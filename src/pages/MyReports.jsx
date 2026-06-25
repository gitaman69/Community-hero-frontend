import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import IssueCard from '../components/IssueCard.jsx';
import Spinner, { EmptyState } from '../components/Spinner.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { deleteIssue, fetchIssues } from '../lib/api.js';
import { useAuth } from '../lib/AuthContext.jsx';
import { isResolved } from '../lib/constants.js';

export default function MyReports() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(null); // issue queued for deletion
  const [toast, setToast] = useState(null);

  // Simplest reliable approach per contract: fetch all, filter client-side.
  const { data, isLoading, isError } = useQuery({
    queryKey: ['issues', 'all-for-mine'],
    queryFn: () => fetchIssues({}),
    refetchInterval: 30000,
  });

  const delMutation = useMutation({
    mutationFn: (id) => deleteIssue(id),
    onSuccess: () => {
      setToast('Report deleted.');
      setPending(null);
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setTimeout(() => setToast(null), 2400);
    },
    onError: (err) => {
      setToast(err?.response?.data?.error || 'Could not delete the report.');
      setPending(null);
      setTimeout(() => setToast(null), 3000);
    },
  });

  const mine = useMemo(() => {
    const all = data ?? [];
    return all.filter((it) => {
      const rb = it.reportedBy;
      const rbId = typeof rb === 'string' ? rb : rb?._id;
      return rbId === user?._id;
    });
  }, [data, user]);

  const open = mine.filter((it) => !isResolved(it.status)).length;
  const resolved = mine.filter((it) => isResolved(it.status)).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="code mb-1 text-[10px] uppercase tracking-widest text-civic">
        Civic Wayfinding · Your trail
      </div>
      <h1 className="font-display text-2xl font-semibold text-ink animate-fade-in">My reports</h1>
      <p className="mt-1 text-sm text-ink/60">
        Everything you’ve flagged, with live status.{' '}
        <span className="code text-ink/50">
          {mine.length} total · {open} open · {resolved} resolved
        </span>
      </p>

      {toast ? (
        <div className="mt-4 animate-fade-in rounded-lg border border-white/10 bg-surface/80 px-3 py-2 text-sm text-ink/70 shadow-sm">
          {toast}
        </div>
      ) : null}

      <div className="mt-6 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner label="Loading your reports…" />
          </div>
        ) : isError ? (
          <EmptyState icon="⚠" title="Couldn’t load your reports">
            The API may be unreachable. Try again shortly.
          </EmptyState>
        ) : mine.length === 0 ? (
          <EmptyState icon="◇" title="You haven’t reported anything yet">
            Spotted something off in your neighborhood?{' '}
            <Link to="/report" className="text-civic underline-offset-2 hover:underline">
              File your first report
            </Link>
            .
          </EmptyState>
        ) : (
          mine.map((issue, i) => (
            <div key={issue._id} style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }} className="animate-fade-in-up">
              <IssueCard
                issue={issue}
                onDelete={(it) => setPending(it)}
                deleting={delMutation.isPending && pending?._id === issue._id}
              />
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!pending}
        title="Delete this report?"
        body={
          <>
            This permanently removes{' '}
            <span className="font-medium text-ink">
              “{pending?.title || 'your report'}”
            </span>{' '}
            and its status history. This can’t be undone.
          </>
        }
        confirmLabel="Delete report"
        danger
        busy={delMutation.isPending}
        onCancel={() => setPending(null)}
        onConfirm={() => delMutation.mutate(pending._id)}
      />
    </div>
  );
}
