import React, { useState, useMemo } from 'react';
import { useEmails } from './hooks/useEmails';
import EmailCard from './components/EmailCard';
import { RefreshCw, Bell, Filter, HelpCircle, Briefcase, User, Layers, Mail } from 'lucide-react';

function App() {
  const [accountFilter, setAccountFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [linkFilter, setLinkFilter] = useState(false);
  const [unreadFilter, setUnreadFilter] = useState(false);

  const filterParams = useMemo(() => {
    const params = {};
    if (accountFilter !== 'All') params.account = accountFilter;
    if (statusFilter !== 'All') params.status = statusFilter;
    if (linkFilter) params.has_links = true;
    if (unreadFilter) params.is_unread = true;
    return params;
  }, [accountFilter, statusFilter, linkFilter, unreadFilter]);

  const { emails, loading, manualFetch, fetchingManual, refetch } = useEmails(filterParams);

  const unreadCount = emails.filter(e => e.is_unread).length;
  const actionNeededCount = emails.filter(e => e.status === 'Applied' || e.status === 'Assessment Pending').length;
  const interviewCount = emails.filter(e => e.status === 'Interview Scheduled').length;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-20 shadow-lg shadow-black/30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Mail size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">JobTracker</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={manualFetch}
              disabled={fetchingManual}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full text-sm font-medium text-slate-300 transition-all duration-200 disabled:opacity-50 hover:border-gray-600"
            >
              <RefreshCw size={15} className={fetchingManual ? 'animate-spin text-blue-400' : 'text-slate-400'} />
              {fetchingManual ? 'Syncing...' : 'Sync Emails'}
            </button>
            <div className="relative">
              <Bell className="text-slate-400 hover:text-slate-200 cursor-pointer transition-colors" size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {/* Auth links */}
            <div className="ml-2 flex gap-2 border-l border-gray-700 pl-4">
              <a href="/api/auth/gmail/work" className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-1.5 flex items-center gap-1.5 rounded-lg text-slate-300 transition-all duration-200 hover:text-white">
                <Briefcase size={12} className="text-blue-400"/> Work
              </a>
              <a href="/api/auth/gmail/personal" className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-1.5 flex items-center gap-1.5 rounded-lg text-slate-300 transition-all duration-200 hover:text-white">
                <User size={12} className="text-indigo-400"/> Personal
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-gray-950 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-5 flex gap-10">
          <div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-1">Total</div>
            <div className="text-3xl font-bold text-white">{emails.length}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-1">Unread</div>
            <div className="text-3xl font-bold text-blue-400">{unreadCount}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-1">Action Needed</div>
            <div className="text-3xl font-bold text-amber-400">{actionNeededCount}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-1">Interviews</div>
            <div className="text-3xl font-bold text-emerald-400">{interviewCount}</div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8 flex gap-8 items-start">
        {/* Sidebar Filters */}
        <aside className="w-56 shrink-0 space-y-7 sticky top-24">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Account</h3>
            <div className="space-y-1">
              {['All', 'work', 'personal'].map(acc => (
                <button
                  key={acc}
                  onClick={() => setAccountFilter(acc)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                    accountFilter === acc
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  {acc === 'All' ? <Layers size={15}/> : acc === 'work' ? <Briefcase size={15}/> : <User size={15}/>}
                  {acc.charAt(0).toUpperCase() + acc.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Status</h3>
            <div className="space-y-1">
              {['All', 'New', 'Applied', 'Assessment Pending', 'Interview Scheduled', 'Rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    statusFilter === status
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Quick Filters</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-800 rounded-lg group">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${unreadFilter ? 'bg-blue-500 border-blue-500' : 'border-gray-600 group-hover:border-gray-500'}`}>
                  {unreadFilter && <div className="w-2 h-2 bg-white rounded-full"/>}
                </div>
                <input type="checkbox" checked={unreadFilter} onChange={e => setUnreadFilter(e.target.checked)} className="hidden" />
                <span className="text-sm font-medium text-gray-400 group-hover:text-gray-200 transition-colors">Unread Only</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-800 rounded-lg group">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${linkFilter ? 'bg-blue-500 border-blue-500' : 'border-gray-600 group-hover:border-gray-500'}`}>
                  {linkFilter && <div className="w-2 h-2 bg-white rounded-full"/>}
                </div>
                <input type="checkbox" checked={linkFilter} onChange={e => setLinkFilter(e.target.checked)} className="hidden" />
                <span className="text-sm font-medium text-gray-400 group-hover:text-gray-200 transition-colors">Has Links</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Feed */}
        <div className="flex-1 min-w-0">
          <div className="mb-6 flex justify-between items-end border-b border-gray-800 pb-4">
            <h2 className="text-2xl font-bold text-white">Email Feed</h2>
            <div className="text-sm text-gray-500 flex items-center gap-1.5">
              <Filter size={14}/>
              <span>{statusFilter} • {emails.length} results</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24 text-gray-600 gap-3">
              <RefreshCw className="animate-spin text-blue-500" size={24} />
              <span className="text-lg font-medium text-gray-400">Loading emails...</span>
            </div>
          ) : emails.length === 0 ? (
            <div className="py-24 text-center bg-gray-900 rounded-2xl border border-gray-800 border-dashed">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle size={28} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">No emails found</h3>
              <p className="text-gray-500 mb-6">No job tracker emails match your current filters.</p>
              {statusFilter !== 'All' && (
                <button onClick={() => setStatusFilter('All')} className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {emails.map(email => (
                <EmailCard key={email.id} email={email} onUpdate={refetch} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
