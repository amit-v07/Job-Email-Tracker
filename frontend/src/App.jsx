import React, { useState, useMemo } from 'react';
import { useEmails } from './hooks/useEmails';
import EmailCard from './components/EmailCard';
import { RefreshCw, Bell, Filter, HelpCircle, Briefcase, User, Layers, Mail, X, SlidersHorizontal } from 'lucide-react';

const STATUSES = ['All', 'New', 'Applied', 'Assessment Pending', 'Interview Scheduled', 'Rejected'];

function Sidebar({ accountFilter, setAccountFilter, statusFilter, setStatusFilter, linkFilter, setLinkFilter, unreadFilter, setUnreadFilter, onClose }) {
  return (
    <aside className="flex flex-col gap-7 p-6 h-full overflow-y-auto">
      {onClose && (
        <div className="flex justify-between items-center pb-2 border-b border-gray-800">
          <span className="text-sm font-bold text-gray-300 uppercase tracking-widest">Filters</span>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-200 p-1 rounded-lg hover:bg-gray-800 transition-colors">
            <X size={18}/>
          </button>
        </div>
      )}

      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Account</h3>
        <div className="space-y-1">
          {['All', 'work', 'personal'].map(acc => (
            <button
              key={acc}
              onClick={() => { setAccountFilter(acc); onClose?.(); }}
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
          {STATUSES.map(status => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); onClose?.(); }}
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
        <div className="space-y-1">
          {[
            { label: 'Unread Only', value: unreadFilter, set: setUnreadFilter },
            { label: 'Has Links', value: linkFilter, set: setLinkFilter },
          ].map(({ label, value, set }) => (
            <label key={label} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-800 rounded-lg group">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${value ? 'bg-blue-500 border-blue-500' : 'border-gray-600 group-hover:border-gray-500'}`}>
                {value && <div className="w-2 h-2 bg-white rounded-full"/>}
              </div>
              <input type="checkbox" checked={value} onChange={e => set(e.target.checked)} className="hidden"/>
              <span className="text-sm font-medium text-gray-400 group-hover:text-gray-200 transition-colors">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}

function App() {
  const [accountFilter, setAccountFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [linkFilter, setLinkFilter] = useState(false);
  const [unreadFilter, setUnreadFilter] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const sidebarProps = { accountFilter, setAccountFilter, statusFilter, setStatusFilter, linkFilter, setLinkFilter, unreadFilter, setUnreadFilter };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Mobile filter drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)}/>
          <div className="absolute left-0 top-0 h-full w-72 bg-gray-900 border-r border-gray-800 shadow-2xl z-50">
            <Sidebar {...sidebarProps} onClose={() => setDrawerOpen(false)}/>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-20 shadow-lg shadow-black/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <SlidersHorizontal size={18}/>
            </button>
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <Mail size={16} className="text-white"/>
            </div>
            <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">JobTracker</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={manualFetch}
              disabled={fetchingManual}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full text-xs sm:text-sm font-medium text-slate-300 transition-all duration-200 disabled:opacity-50 hover:border-gray-600 whitespace-nowrap"
            >
              <RefreshCw size={13} className={fetchingManual ? 'animate-spin text-blue-400' : 'text-slate-400'}/>
              <span className="hidden sm:inline">{fetchingManual ? 'Syncing...' : 'Sync Emails'}</span>
              <span className="sm:hidden">Sync</span>
            </button>

            <div className="relative">
              <Bell className="text-slate-400 hover:text-slate-200 cursor-pointer transition-colors" size={18}/>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>

            <div className="ml-1 flex gap-1.5 border-l border-gray-700 pl-3 sm:pl-4">
              <a href="/api/auth/gmail/work" className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 px-2.5 py-1.5 flex items-center gap-1 rounded-lg text-slate-300 transition-all duration-200 hover:text-white">
                <Briefcase size={11} className="text-blue-400"/>
                <span className="hidden sm:inline">Work</span>
              </a>
              <a href="/api/auth/gmail/personal" className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 px-2.5 py-1.5 flex items-center gap-1 rounded-lg text-slate-300 transition-all duration-200 hover:text-white">
                <User size={11} className="text-indigo-400"/>
                <span className="hidden sm:inline">Personal</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-gray-950 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 grid grid-cols-2 sm:flex sm:gap-10 gap-4">
          {[
            { label: 'Total', value: emails.length, color: 'text-white' },
            { label: 'Unread', value: unreadCount, color: 'text-blue-400' },
            { label: 'Action Needed', value: actionNeededCount, color: 'text-amber-400' },
            { label: 'Interviews', value: interviewCount, color: 'text-emerald-400' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-1">{label}</div>
              <div className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex gap-8 items-start">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-56 shrink-0 sticky top-24 bg-gray-900/50 rounded-2xl border border-gray-800">
          <Sidebar {...sidebarProps} onClose={null}/>
        </div>

        {/* Feed */}
        <div className="flex-1 min-w-0">
          <div className="mb-5 sm:mb-6 flex justify-between items-end border-b border-gray-800 pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Email Feed</h2>
            <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1.5">
              <Filter size={12}/>
              <span className="truncate max-w-[120px] sm:max-w-none">{statusFilter} • {emails.length}</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20 gap-3">
              <RefreshCw className="animate-spin text-blue-500" size={22}/>
              <span className="text-base font-medium text-gray-400">Loading emails...</span>
            </div>
          ) : emails.length === 0 ? (
            <div className="py-20 text-center bg-gray-900 rounded-2xl border border-gray-800 border-dashed">
              <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle size={24} className="text-gray-600"/>
              </div>
              <h3 className="text-lg font-bold text-gray-300 mb-2">No emails found</h3>
              <p className="text-gray-500 text-sm mb-6 px-8">No job tracker emails match your current filters.</p>
              {statusFilter !== 'All' && (
                <button onClick={() => setStatusFilter('All')} className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {emails.map(email => (
                <EmailCard key={email.id} email={email} onUpdate={refetch}/>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
