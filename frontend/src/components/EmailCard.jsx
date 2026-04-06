import React, { useState } from 'react';
import { formatDistanceToNow, addHours, addDays } from 'date-fns';
import { Link, Clock, XCircle, Building, ChevronDown, CheckCircle } from 'lucide-react';
import { updateEmailStatus, updateEmailSnooze, markAsRead, dismissEmail } from '../services/api';

const STATUS_CONFIG = {
  'New':                  { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20 border' },
  'Applied':              { bg: 'bg-violet-500/10 text-violet-400 border-violet-500/20 border' },
  'Assessment Pending':   { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20 border' },
  'Interview Scheduled':  { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 border' },
  'Rejected':             { bg: 'bg-red-500/10 text-red-400 border-red-500/20 border' },
  'Dismissed':            { bg: 'bg-gray-700/40 text-gray-500 border-gray-700 border' },
};

export default function EmailCard({ email, onUpdate }) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSnoozeDropdown, setShowSnoozeDropdown] = useState(false);

  const handleStatusChange = async (status) => {
    await updateEmailStatus(email.id, status);
    setShowStatusDropdown(false);
    onUpdate();
  };

  const handleSnooze = async (hours) => {
    let until = addHours(new Date(), hours);
    if (hours === 'tomorrow') { until = addDays(new Date(), 1); until.setHours(9, 0, 0, 0); }
    else if (hours === '2days') { until = addDays(new Date(), 2); until.setHours(9, 0, 0, 0); }
    await updateEmailSnooze(email.id, until.toISOString());
    setShowSnoozeDropdown(false);
    onUpdate();
  };

  const handleDismiss = async () => { await dismissEmail(email.id); onUpdate(); };

  const timeAgo = (() => {
    try { return formatDistanceToNow(new Date(email.received_at), { addSuffix: true }); }
    catch { return email.received_at || ''; }
  })();

  const statusClass = STATUS_CONFIG[email.status]?.bg || 'bg-gray-700/40 text-gray-500 border-gray-700 border';

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
      email.is_unread
        ? 'bg-gray-900 border-gray-700 shadow-lg shadow-black/20 hover:border-blue-500/30 hover:shadow-blue-950/30'
        : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
    }`}>
      {/* Unread indicator bar */}
      {email.is_unread && <div className="h-0.5 w-full bg-gradient-to-r from-blue-600 to-indigo-600"/>}

      <div className="p-5">
        {/* Top row */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {email.is_unread && (
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 shadow-md shadow-blue-500/50"/>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 rounded-lg text-sm font-semibold text-gray-200 border border-gray-700">
              <Building size={14} className="text-gray-400"/>
              {email.company || 'Unknown Company'}
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-800 px-2 py-1 rounded-md border border-gray-700/50">
              {email.account}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-3">
            <span className="text-xs text-gray-500">{timeAgo}</span>

            {/* Status dropdown */}
            <div className="relative">
              <button
                onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowSnoozeDropdown(false); }}
                className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${statusClass} hover:opacity-80 transition-opacity`}
              >
                {email.status} <ChevronDown size={11} className="opacity-70"/>
              </button>
              {showStatusDropdown && (
                <div className="absolute right-0 mt-1.5 w-52 bg-gray-900 border border-gray-700 shadow-2xl shadow-black/60 rounded-xl z-20 py-1.5 overflow-hidden">
                  {Object.keys(STATUS_CONFIG).filter(s => s !== 'Dismissed').map(s => (
                    <button key={s} onClick={() => handleStatusChange(s)}
                      className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                      {email.status === s && <CheckCircle size={13} className="text-blue-400 shrink-0"/>}
                      {email.status !== s && <div className="w-3.5"/>}
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Snooze */}
            <div className="relative">
              <button onClick={() => { setShowSnoozeDropdown(!showSnoozeDropdown); setShowStatusDropdown(false); }}
                className="text-gray-500 hover:text-blue-400 transition-colors p-1 rounded-lg hover:bg-gray-800">
                <Clock size={16}/>
              </button>
              {showSnoozeDropdown && (
                <div className="absolute right-0 mt-1.5 w-44 bg-gray-900 border border-gray-700 shadow-2xl shadow-black/60 rounded-xl z-20 py-1.5">
                  {[{l:'3 hours',v:3},{l:'Tonight (12h)',v:12},{l:'Tomorrow 9 AM',v:'tomorrow'},{l:'In 2 days',v:'2days'}].map(({l,v}) => (
                    <button key={v} onClick={() => handleSnooze(v)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dismiss */}
            <button onClick={handleDismiss} className="text-gray-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-gray-800">
              <XCircle size={16}/>
            </button>
          </div>
        </div>

        {/* Subject */}
        <h3 className="text-base font-bold text-gray-100 mb-1 leading-snug">{email.subject}</h3>
        <div className="text-xs text-gray-500 mb-2">From: <span className="text-gray-400">{email.sender_name}</span> &lt;{email.sender_email}&gt;</div>
        <p className="text-sm text-gray-500 truncate">{email.snippet}</p>

        {/* URL chips */}
        {email.urls && email.urls.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-800">
            {email.urls
              .filter(url => { try { return Boolean(new URL(url)); } catch { return false; } })
              .map((url, idx) => {
                let hostname = url;
                try { hostname = new URL(url).hostname; } catch {}
                return (
                  <a key={idx} href={url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/20 border border-blue-500/20 transition-colors">
                    <Link size={11}/> {hostname}
                  </a>
                );
              })}
          </div>
        )}

        {/* Mark read */}
        {email.is_unread && (
          <button onClick={async () => { await markAsRead(email.id); onUpdate(); }}
            className="mt-4 flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-blue-400 transition-colors">
            <CheckCircle size={13}/> Mark as read
          </button>
        )}
      </div>
    </div>
  );
}
