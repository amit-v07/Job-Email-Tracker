import React, { useState, useMemo } from 'react';
import { useEmails } from './hooks/useEmails';
import EmailCard from './components/EmailCard';
import { RefreshCw, Bell, Filter, HelpCircle, Briefcase, User, Layers } from 'lucide-react';

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
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">JT</div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">JobTracker</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={manualFetch} 
              disabled={fetchingManual}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={fetchingManual ? "animate-spin" : ""} />
              {fetchingManual ? 'Syncing...' : 'Sync Emails'}
            </button>
            <div className="relative">
              <Bell className="text-slate-500" size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white flex items-center justify-center text-[10px] font-bold rounded-full border border-white">
                  {unreadCount}
                </span>
              )}
            </div>
            {/* Quick auth links - in testing mode */}
            <div className="ml-4 flex gap-2 border-l pl-4">
               <a href="http://localhost:8000/auth/gmail/work" className="text-xs bg-slate-100 px-2 py-1 flex items-center gap-1 rounded hover:bg-slate-200"><Briefcase size={12}/> Work Login</a>
               <a href="http://localhost:8000/auth/gmail/personal" className="text-xs bg-slate-100 px-2 py-1 flex items-center gap-1 rounded hover:bg-slate-200"><User size={12}/> Personal Login</a>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-slate-900 text-white py-4">
        <div className="max-w-5xl mx-auto px-6 flex gap-8">
          <div><div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Total</div><div className="text-2xl font-semibold">{emails.length}</div></div>
          <div><div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Unread</div><div className="text-2xl font-semibold text-blue-400">{unreadCount}</div></div>
          <div><div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Action Needed</div><div className="text-2xl font-semibold text-yellow-400">{actionNeededCount}</div></div>
          <div><div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Interviews</div><div className="text-2xl font-semibold text-green-400">{interviewCount}</div></div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8 flex gap-8 items-start">
        {/* Sidebar Filters */}
        <aside className="w-64 shrink-0 space-y-8 sticky top-24">
          
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Account</h3>
            <div className="space-y-1">
              {['All', 'work', 'personal'].map(acc => (
                <button 
                  key={acc}
                  onClick={() => setAccountFilter(acc)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${accountFilter === acc ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {acc === 'All' ? <Layers size={16}/> : acc === 'work' ? <Briefcase size={16}/> : <User size={16}/>}
                  {acc.charAt(0).toUpperCase() + acc.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Status</h3>
            <div className="space-y-1">
              {['All', 'New', 'Applied', 'Assessment Pending', 'Interview Scheduled', 'Rejected'].map(status => (
                <button 
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Filters</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
                <input type="checkbox" checked={unreadFilter} onChange={e => setUnreadFilter(e.target.checked)} className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500" />
                <span className="text-sm font-medium text-slate-700">Unread Only</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
                <input type="checkbox" checked={linkFilter} onChange={e => setLinkFilter(e.target.checked)} className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500" />
                <span className="text-sm font-medium text-slate-700">Has Extracted Links</span>
              </label>
            </div>
          </div>

        </aside>

        {/* Feed */}
        <div className="flex-1 min-w-0">
          <div className="mb-6 flex justify-between items-end border-b pb-4 border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Email Feed</h2>
            <div className="text-sm text-slate-500 flex items-center gap-1.5"><Filter size={16}/> Viewing: {statusFilter} • {emails.length} results</div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20 text-slate-400 gap-3">
               <RefreshCw className="animate-spin" size={24} />
               <span className="text-lg font-medium">Loading emails...</span>
            </div>
          ) : emails.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-1">No emails found</h3>
              <p className="text-slate-500 mb-6">We couldn't find any tracker emails matching your filters.</p>
              {statusFilter !== 'All' && (
                 <button onClick={() => setStatusFilter('All')} className="text-sm font-medium text-blue-600 hover:text-blue-700">Clear filters</button>
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
