import ScanHistory from './ScanHistory';
import AuthPanel from './AuthPanel';
import { useAuth } from './auth';

function App() {
  const { loading } = useAuth(); // ensure provider ready
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-gradient-to-r from-indigo-500/20 via-slate-900 to-emerald-500/20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">FraudEye</h1>
            <p className="text-sm text-slate-300">AI-Powered Fake News &amp; Content Verifier</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-slate-900/70 border border-slate-700 rounded-full px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Backend · ML Service · Dashboard online</span>
            </div>

            <div>
              <AuthPanel />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <ScanHistory />
      </main>
    </div>
  );
}
export default App;
