import React, { useState, useEffect } from 'react';
import { HardDrive, Activity, HelpCircle, UploadCloud } from 'lucide-react';
import {
  AdminStorageService,
  AdminStoredFile,
  AdminStorageStats,
  AdminActivityLogItem,
} from '../../services/admin/adminStorage.service';
import { StorageStatsCards } from '../../components/admin/StorageStatsCards';
import { StorageFileManager } from '../../components/admin/StorageFileManager';
import { StorageUploadModal } from '../../components/admin/StorageUploadModal';
import { StorageMetadataDrawer } from '../../components/admin/StorageMetadataDrawer';
import { StorageLogsTable } from '../../components/admin/StorageLogsTable';

export const AdminStoragePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'files' | 'logs' | 'guide'>('files');
  const [files, setFiles] = useState<AdminStoredFile[]>([]);
  const [stats, setStats] = useState<AdminStorageStats | null>(null);
  const [logs, setLogs] = useState<AdminActivityLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [inspectingFile, setInspectingFile] = useState<AdminStoredFile | null>(null);

  const fetchStorageData = async () => {
    setIsLoading(true);
    const [fetchedFiles, fetchedStats, fetchedLogs] = await Promise.all([
      AdminStorageService.listFiles(),
      AdminStorageService.getStats(),
      AdminStorageService.getLogs(),
    ]);
    setFiles(fetchedFiles);
    setStats(fetchedStats);
    setLogs(fetchedLogs);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStorageData();
  }, []);

  const handleDeleteFile = async (fileId: string) => {
    const file = files.find((f) => f.fileId === fileId);
    const confirmName = file ? file.originalName : fileId;
    if (window.confirm(`Are you sure you want to delete "${confirmName}" from the storage vault?`)) {
      setIsLoading(true);
      const res = await AdminStorageService.deleteFile(fileId);
      setIsLoading(false);
      if (res.success) {
        fetchStorageData();
      } else {
        alert(res.error || 'Failed to delete file.');
      }
    }
  };

  const handleUploadSuccess = (newFile: AdminStoredFile) => {
    setFiles((prev) => [newFile, ...prev]);
    fetchStorageData();
  };

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Digital Asset Storage Vault
          </h1>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Inspect, upload, validate, and manage protected digital product assets for the DigiEcom storefront.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="btn btn-primary"
            style={{
              padding: '9px 16px',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              gap: '6px',
            }}
          >
            <UploadCloud size={15} />
            <span>Upload New Asset</span>
          </button>
        </div>
      </div>

      {/* Capacity & System Metrics Cards */}
      <StorageStatsCards
        stats={stats}
        isLoading={isLoading}
        onRefresh={fetchStorageData}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid var(--border-card)',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={() => setActiveTab('files')}
          style={{
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'files' ? '2px solid var(--accent-lime)' : '2px solid transparent',
            color: activeTab === 'files' ? 'var(--accent-lime)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: 'var(--text-xs)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <HardDrive size={14} />
          <span>Stored Assets ({files.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          style={{
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'logs' ? '2px solid var(--accent-lime)' : '2px solid transparent',
            color: activeTab === 'logs' ? 'var(--accent-lime)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: 'var(--text-xs)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Activity size={14} />
          <span>Audit Logs ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          style={{
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'guide' ? '2px solid var(--accent-lime)' : '2px solid transparent',
            color: activeTab === 'guide' ? 'var(--accent-lime)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: 'var(--text-xs)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <HelpCircle size={14} />
          <span>Storage & Cloud Guide</span>
        </button>
      </div>

      {/* Tab 1: File Manager */}
      {activeTab === 'files' && (
        <StorageFileManager
          files={files}
          isLoading={isLoading}
          onInspectFile={(file) => setInspectingFile(file)}
          onDeleteFile={handleDeleteFile}
          onOpenUpload={() => setIsUploadOpen(true)}
        />
      )}

      {/* Tab 2: Activity Logs */}
      {activeTab === 'logs' && (
        <StorageLogsTable
          logs={logs}
          isLoading={isLoading}
          onRefresh={fetchStorageData}
        />
      )}

      {/* Tab 3: Environment & Durability Guide */}
      {activeTab === 'guide' && (
        <div
          className="card"
          style={{
            backgroundColor: 'var(--panel)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            lineHeight: 1.6,
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
          }}
        >
          <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: '#ffffff', margin: '0 0 12px 0' }}>
            Production Cloud Storage Configuration Guide
          </h3>
          <p style={{ margin: '0 0 16px 0' }}>
            DigiEcom features a modular storage provider architecture. You can run locally on your workstation using the local vault or seamlessly activate Cloudflare R2 / AWS S3 for zero egress fee cloud distribution.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              marginTop: '16px',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--panel-light)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-card)',
              }}
            >
              <h4 style={{ color: 'var(--accent-lime)', fontSize: 'var(--text-xs)', fontWeight: 700, margin: '0 0 8px 0' }}>
                Option A: Cloudflare R2 (Recommended Free-First)
              </h4>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
                10 GB storage free, 10M read requests free, and <strong>$0.00 egress fees forever</strong>.
                Set these in Vercel Project Settings &rarr; Environment Variables:
              </p>
              <pre
                style={{
                  backgroundColor: 'var(--panel)',
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  marginTop: '8px',
                  color: '#d4d4d4',
                  overflowX: 'auto',
                }}
              >
{`STORAGE_PROVIDER=cloudflare-r2
R2_ACCOUNT_ID=your_account_id
R2_BUCKET_NAME=your_bucket_name
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key`}
              </pre>
            </div>

            <div
              style={{
                backgroundColor: 'var(--panel-light)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-card)',
              }}
            >
              <h4 style={{ color: 'var(--accent-violet)', fontSize: 'var(--text-xs)', fontWeight: 700, margin: '0 0 8px 0' }}>
                Option B: Local Vault (Active for Scratch / Dev)
              </h4>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
                Stores binaries in <code>/tmp/.storage_vault/blobs</code> and metadata in <code>/tmp/.storage_vault/meta</code>.
                Ideal for local testing.
              </p>
              <pre
                style={{
                  backgroundColor: 'var(--panel)',
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  marginTop: '8px',
                  color: '#d4d4d4',
                  overflowX: 'auto',
                }}
              >
{`STORAGE_PROVIDER=local
ADMIN_STORAGE_API_KEY=your_secret_key
LOCAL_STORAGE_DIR=.storage_vault`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <StorageUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Inspect Metadata Drawer */}
      <StorageMetadataDrawer
        file={inspectingFile}
        onClose={() => setInspectingFile(null)}
      />
    </div>
  );
};
