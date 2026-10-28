import React from 'react';
import { HardDrive, FileText, Layers, AlertTriangle, RefreshCw } from 'lucide-react';
import type { AdminStorageStats } from '../../services/admin/adminStorage.service';

interface StorageStatsCardsProps {
  stats: AdminStorageStats | null;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenUpload: () => void;
}

export const StorageStatsCards: React.FC<StorageStatsCardsProps> = ({
  stats,
  isLoading,
  onRefresh,
  onOpenUpload,
}) => {
  const isDurable = stats?.isDurable || false;

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Durability Notice Banner if in ephemeral /tmp */}
      {!isDurable && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(234, 179, 8, 0.08)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <AlertTriangle size={18} color="#eab308" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: 'var(--text-xs)', lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700, color: '#fef08a' }}>
              Ephemeral Serverless Storage Active ({stats?.provider || 'local'} /tmp):
            </span>{' '}
            <span style={{ color: 'var(--text-secondary)' }}>
              In Vercel production, files written to local scratch disk remain until the serverless instance is recycled. For persistent, multi-region durable asset hosting with zero egress fees, configure Cloudflare R2 credentials in environment variables.
            </span>
          </div>
        </div>
      )}

      {/* Grid of 4 Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Card 1: Total Stored Assets */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            backgroundColor: 'var(--panel)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Total Assets
            </span>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'rgba(166, 255, 61, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={15} color="var(--accent-lime)" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
            {isLoading ? '...' : stats?.totalFiles ?? 0}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Catalogued product binaries
          </div>
        </div>

        {/* Card 2: Space Consumed */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            backgroundColor: 'var(--panel)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Storage Consumed
            </span>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'rgba(181, 168, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HardDrive size={15} color="var(--accent-violet)" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
            {isLoading ? '...' : stats?.totalSizeFormatted ?? '0.00 MB'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Max file upload limit: 50 MB
          </div>
        </div>

        {/* Card 3: Storage Provider */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            backgroundColor: 'var(--panel)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Active Provider
            </span>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Layers size={15} color="#38bdf8" />
            </div>
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#ffffff',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
            }}
          >
            {isLoading ? '...' : stats?.provider || 'local'}
          </div>
          <div style={{ fontSize: '11px', color: isDurable ? '#86efac' : '#fde047', marginTop: '4px', fontWeight: 600 }}>
            {isDurable ? '● Cloud Durable (Persistent)' : '○ Local Vault (Scratch)'}
          </div>
        </div>

        {/* Card 4: Quick Action Controls */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            backgroundColor: 'var(--panel-light)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <button
            onClick={onOpenUpload}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              justifyContent: 'center',
            }}
          >
            <span>+ Upload Digital Asset</span>
          </button>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              backgroundColor: 'transparent',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            <span>Sync Storage</span>
          </button>
        </div>
      </div>
    </div>
  );
};
