import React, { useState } from 'react';
import { formatDistanceToNow, addHours, addDays, getISODay } from 'date-fns';
import { Link, Clock, CheckCircle, XCircle, MoreVertical, Building } from 'lucide-react';
import { updateEmailStatus, updateEmailSnooze, markAsRead, dismissEmail } from '../services/api';

const STATUS_COLORS = {
  'New': 'bg-blue-100 text-blue-800',
  'Applied': 'bg-purple-100 text-purple-800',
  'Assessment Pending': 'bg-yellow-100 text-yellow-800',
  'Interview Scheduled': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
  'Dismissed': 'bg-gray-100 text-gray-800'
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
    // Rough approximations
    if (hours === 'tomorrow') {
       until = addDays(new Date(), 1);
       until.setHours(9, 0, 0, 0); // 9 AM tomorrow
    } else if (hours === '2days') {
       until = addDays(new Date(), 2);
       until.setHours(9, 0, 0, 0); 
    }
    
    await updateEmailSnooze(email.id, until.toISOString());
    setShowSnoozeDropdown(false);
    onUpdate();
  };

  const handleDismiss = async () => {
    await dismissEmail(email.id);
    onUpdate();
  };

  const timeAgo = (() => {
    try { return formatDistanceToNow(new Date(email.received_at), { addSuffix: true }); }
    catch { return email.received_at || ''; }
  })();

  return (
    <div className={`p-5 rounded-xl shadow-sm border ${email.is_unread ? 'border-l-4 border-l-blue-500 bg-white' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {email.is_unread && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-sm font-medium text-slate-700">
            <Building size={16} className="text-slate-500" />
            {email.company}
          </div>
          <span className="text-sm text-gray-500 font-medium">{email.account}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium">{timeAgo}</span>
          
          {/* Status Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[email.status] || 'bg-gray-100 text-gray-800'}`}
            >
              {email.status}
            </button>
            {showStatusDropdown && (
              <div className="absolute right-0 mt-1 w-48 bg-white border shadow-lg rounded-xl z-10 py-1">
                {Object.keys(STATUS_COLORS).filter(s => s !== 'Dismissed').map(s => (
                  <button key={s} onClick={() => handleStatusChange(s)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-slate-50">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => setShowSnoozeDropdown(!showSnoozeDropdown)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <Clock size={18} />
            </button>
            {showSnoozeDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border shadow-lg rounded-xl z-10 py-1">
                <button onClick={() => handleSnooze(3)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-slate-50">3 hours</button>
                <button onClick={() => handleSnooze(12)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-slate-50">Tonight (12h)</button>
                <button onClick={() => handleSnooze('tomorrow')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-slate-50">Tomorrow 9 AM</button>
                <button onClick={() => handleSnooze('2days')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-slate-50">In 2 days</button>
              </div>
            )}
          </div>

          <button onClick={handleDismiss} className="text-gray-400 hover:text-red-500 transition-colors">
            <XCircle size={18} />
          </button>
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-gray-900 mb-1">{email.subject}</h3>
      <div className="text-sm text-gray-600 mb-2 truncate">From: {email.sender_name} &lt;{email.sender_email}&gt;</div>
      
      <p className="text-sm text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis mb-4">{email.snippet}</p>

      {/* URLs Chips */}
      {email.urls && email.urls.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          {email.urls
            .filter(url => {
              try { return Boolean(new URL(url)); }
              catch { return false; }
            })
            .map((url, idx) => {
              let hostname = url;
              try { hostname = new URL(url).hostname; } catch { /* ignore */ }
              return (
                <a key={idx} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                  <Link size={12} />
                  {hostname}
                </a>
              );
            })
          }
        </div>
      )}
      
      {email.is_unread && (
         <button 
           onClick={async () => { await markAsRead(email.id); onUpdate(); }} 
           className="mt-4 text-xs font-medium text-blue-600 hover:text-blue-800"
         >
           Mark as read
         </button>
      )}
    </div>
  );
}
