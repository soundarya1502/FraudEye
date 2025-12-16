// client/src/ScanHistory.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { fetchScans, createScan } from './api';
import { useAuth } from './auth';

function ScanHistory() {
  const { user } = useAuth(); // user === null when not logged in
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // allow user to toggle between "All scans" and "My scans" when logged in
  const [mineOnly, setMineOnly] = useState(false);

  useEffect(() => {
    // If user logs in/out or toggles mineOnly, reload scans
    const loadScans = async () => {
      try {
        setLoading(true);
        // fetchScans accepts { mine: boolean } option and api attaches token automatically
        const res = await fetchScans({ mine: !!(mineOnly && user) });
        setScans(res.data.scans || []);
        setError('');
      } catch (err) {
        console.error('Error fetching scans:', err);
        setError('Failed to load scan history');
      } finally {
        setLoading(false);
      }
    };

    loadScans();
  }, [user, mineOnly]);

  const stats = useMemo(() => {
    const total = scans.length;
    const fake = scans.filter(s => s.resultLabel === 'fake').length;
    const real = scans.filter(s => s.resultLabel === 'real').length;
    const uncertain = scans.filter(s => s.resultLabel === 'uncertain').length;
    return { total, fake, real, uncertain };
  }, [scans]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!content.trim()) {
      setSubmitError('Content / snippet is required.');
      return;
    }

    try {
      setSubmitLoading(true);

      const payload = {
        // Do NOT send userId — server will use token if present; otherwise anonymous
        url: url.trim() || undefined,
        contentSnippet: content.trim(),
        source: 'dashboard',
      };

      const res = await createScan(payload);
      const newScan = res.data.scan;

      // Prepend new scan to the list
      setScans(prev => [newScan, ...prev]);

      // Clear form
      setUrl('');
      setContent('');
    } catch (err) {
      console.error('Error creating scan:', err);
      setSubmitError('Failed to analyze content. Please check backend & ML service.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="h-10 w-10 border-2 border-slate-600 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-rose-400 mt-8">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      {/* NEW SCAN FORM + controls */}
      <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-50 mb-1">New Verification</h2>
              <p className="text-xs text-slate-400 mb-4">
                Paste an article URL and a snippet of its content. FraudEye will analyze it using the ML service.
              </p>
            </div>

            <div className="text-xs text-slate-300">
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Signed in as:</span>
                  <span className="font-medium text-slate-100">{user.name}</span>
                </div>
              ) : (
                <div className="text-slate-400">You are not signed in — scans will be anonymous.</div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 mt-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Article URL (optional)</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/news-article"
                className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500/70"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Content / Snippet <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste 2–4 key paragraphs from the article or suspicious text..."
                rows={5}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500/70 resize-y"
              />
            </div>

            {submitError && <p className="text-xs text-rose-400">{submitError}</p>}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitLoading}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {submitLoading ? 'Analyzing…' : 'Analyze Content'}
              </button>

              {/* Toggle to view "My scans" if user logged in */}
              {user && (
                <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={mineOnly}
                    onChange={() => setMineOnly(v => !v)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900/60"
                  />
                  <span className="text-xs">Show only my scans</span>
                </label>
              )}
            </div>
          </form>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 h-fit">
          <StatCard label="Total Scans" value={stats.total} pill="All time" accent="from-sky-500/40 to-indigo-500/40" />
          <StatCard label="Fake" value={stats.fake} pill="Flagged" accent="from-rose-500/40 to-orange-500/40" />
          <StatCard label="Real" value={stats.real} pill="Likely trustworthy" accent="from-emerald-500/40 to-teal-500/40" />
          <StatCard label="Uncertain" value={stats.uncertain} pill="Needs review" accent="from-amber-400/40 to-pink-500/40" />
        </div>
      </div>

      {/* TABLE */}
      {scans.length === 0 ? (
        <div className="mt-4 bg-slate-900/70 border border-dashed border-slate-700 rounded-2xl p-8 text-center">
          <p className="text-lg font-medium text-slate-100">No scans yet</p>
          <p className="text-sm text-slate-400 mt-2">Run your first verification to see results here.</p>
        </div>
      ) : (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mt-4">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-50">Scan History</h2>
              <p className="text-xs text-slate-400">Latest {Math.min(scans.length, 50)} verifications</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900/90">
                <tr className="text-left text-slate-300 border-b border-slate-800">
                  <Th>#</Th>
                  <Th>URL</Th>
                  <Th>Snippet</Th>
                  <Th>Label</Th>
                  <Th>Score</Th>
                  <Th>Source</Th>
                  <Th>Created At</Th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan, idx) => (
                  <tr key={scan._id || idx} className="border-b border-slate-800/70 last:border-0 hover:bg-slate-800/60 transition-colors">
                    <Td>{idx + 1}</Td>
                    <Td className="max-w-xs">
                      {scan.url ? (
                        <a href={scan.url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline break-all">
                          {scan.url}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </Td>
                    <Td className="max-w-md">
                      <p className="line-clamp-3 text-slate-100">{scan.contentSnippet}</p>
                    </Td>
                    <Td><LabelBadge label={scan.resultLabel} /></Td>
                    <Td>
                      <span className="font-medium text-slate-100">{scan.credibilityScore}</span>
                      <span className="text-xs text-slate-400 ml-1">/ 100</span>
                    </Td>
                    <Td className="capitalize text-slate-300">{scan.source || 'dashboard'}</Td>
                    <Td className="text-slate-300">{scan.createdAt ? new Date(scan.createdAt).toLocaleString() : '—'}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, pill, accent }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent} opacity-60`} />
      <div className="relative flex flex-col gap-2">
        <span className="text-xs text-slate-300">{label}</span>
        <span className="text-2xl font-semibold text-slate-50">{value}</span>
        <span className="inline-flex w-fit items-center rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-700/80">{pill}</span>
      </div>
    </div>
  );
}

function LabelBadge({ label }) {
  let colorClasses = 'bg-slate-800 text-slate-100 border border-slate-600';
  if (label === 'fake') colorClasses = 'bg-rose-500/15 text-rose-300 border border-rose-500/40';
  else if (label === 'real') colorClasses = 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40';
  else if (label === 'uncertain') colorClasses = 'bg-amber-500/15 text-amber-300 border border-amber-500/40';

  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colorClasses}`}>{label || 'unknown'}</span>;
}

function Th({ children }) {
  return <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">{children}</th>;
}
function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 align-top text-sm text-slate-200 ${className}`}>{children}</td>;
}

export default ScanHistory;
