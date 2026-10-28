import React from 'react';
import { Activity, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { AdminActivityLogItem } from '../../services/admin/adminStorage.service';

interface StorageLogsTableProps {
  logs: AdminActivityLogItem[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const StorageLogsTable: React.FC<StorageLogsTableProps> = ({ logs, isLoading, onRefresh }) => {
  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'UPLOAD':
        return { bg: 'rgba(166, 255, 61, 0.1)', border: 'rgba(166, 255, 61, 0.3)', text: 'var(--accent-lime)' };
      case 'DELETE':
        return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#fca5a5' };
      case 'VERIFY_ADMIN':
        return { bg: 'rgba(56, 189, 248, 0.1)', border: 'rgba(56, 189, 248, 0.3)', text: '#7dd3fc' };
      case 'TOKEN_ISSUED':
        return { bg: 'rgba(181, 168, 255, 0.1)', border: 'rgba(181, 168, 255, 0.3)', text: 'var(--accent-violet)' };
      case 'DOWNLOAD_ATTEMPT':
        return { bg: 'rgba(234, 179, 8, 0.1)', border: 'rgba(234, 179, 8, 0.3)', text: '#fde047' };
      default:
        return { bg: 'rgba(255, 255, 255, 0.05)', border: 'var(--border-card)', text: 'var(--text-secondary)' };
    }
  };

  return (
    <div
      className="card"
      style={{
        backgroundColor: 'var(--panel)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="var(--accent-lime)" />
          <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700, margin: 0, color: '#ffffff' }}>
            Storage Activity Audit Log
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            ({logs.length} events recorded)
          </span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Refresh audit logs"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: 'var(--text-xs)',
            backgroundColor: 'var(--panel-light)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 12px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          <span>Sync Logs</span>
        </button>
      </div>

      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <Activity size={32} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
          <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>No storage activity recorded yet in this session.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-xs)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '10px' }}>
                <th style={{ padding: '10px 12px' }}>Event</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px' }}>Details</th>
                <th style={{ padding: '10px 12px' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const badge = getActionBadgeColor(log.action);
                const isSuccess = log.status === 'success';

                return (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: badge.bg,
                          border: `1px solid ${badge.border}`,
                          color: badge.text,
                          fontWeight: 700,
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: isSuccess ? '#86efac' : '#fca5a5',
                          fontWeight: 600,
                        }}
                      >
                        {isSuccess ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        <span>{log.status}</span>
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#ffffff', wordBreak: 'break-all' }}>
                      {log.details}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
