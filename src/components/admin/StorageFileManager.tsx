import React, { useState } from 'react';
import {
  Search,
  Filter,
  FileText,
  FileArchive,
  BookOpen,
  Code2,
  Trash2,
  Info,
  Copy,
  Check,
  UploadCloud,
} from 'lucide-react';
import type { AdminStoredFile } from '../../services/admin/adminStorage.service';

interface StorageFileManagerProps {
  files: AdminStoredFile[];
  isLoading: boolean;
  onInspectFile: (file: AdminStoredFile) => void;
  onDeleteFile: (fileId: string) => void;
  onOpenUpload: () => void;
}

export const StorageFileManager: React.FC<StorageFileManagerProps> = ({
  files,
  isLoading: _isLoading,
  onInspectFile,
  onDeleteFile,
  onOpenUpload,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (fileId: string) => {
    navigator.clipboard.writeText(fileId);
    setCopiedId(fileId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredFiles = files.filter((f) => {
    const matchesSearch =
      f.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.associatedProductId && f.associatedProductId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.category && f.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      f.fileId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFormat =
      selectedFormat === 'ALL' || f.extension.toLowerCase() === selectedFormat.toLowerCase();

    return matchesSearch && matchesFormat;
  });

  const getFormatIcon = (ext: string) => {
    switch (ext.toLowerCase()) {
      case '.pdf':
        return <FileText size={16} color="var(--accent-lime)" />;
      case '.zip':
        return <FileArchive size={16} color="var(--accent-orange)" />;
      case '.epub':
        return <BookOpen size={16} color="var(--accent-violet)" />;
      case '.json':
      case '.md':
        return <Code2 size={16} color="#38bdf8" />;
      default:
        return <FileText size={16} color="var(--text-secondary)" />;
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
      {/* Controls Bar: Search & Filters */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '400px' }}>
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
              display: 'flex',
            }}
          >
            <Search size={15} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by filename, product ID, or category..."
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              backgroundColor: 'var(--panel-light)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              color: '#ffffff',
              fontSize: 'var(--text-xs)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Format Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <Filter size={14} color="var(--text-dim)" style={{ marginRight: '4px' }} />
          {['ALL', '.pdf', '.zip', '.epub', '.fig', '.xlsx', '.json'].map((fmt) => {
            const isActive = selectedFormat === fmt;
            return (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: `1px solid ${isActive ? 'var(--accent-lime)' : 'var(--border-card)'}`,
                  backgroundColor: isActive ? 'var(--accent-lime-subtle)' : 'var(--panel-light)',
                  color: isActive ? 'var(--accent-lime)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {fmt === 'ALL' ? 'All Formats' : fmt.replace('.', '')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Files Table / Empty State */}
      {filteredFiles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(166, 255, 61, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto',
            }}
          >
            <UploadCloud size={26} color="var(--accent-lime)" />
          </div>
          <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 700, margin: '0 0 6px 0', color: '#ffffff' }}>
            No Digital Assets Found
          </h4>
          <p style={{ margin: '0 0 16px 0', fontSize: 'var(--text-xs)', maxWidth: '400px', marginInline: 'auto' }}>
            {files.length === 0
              ? 'Your storage vault is currently empty. Upload your first protected digital product asset to begin.'
              : 'No stored assets match your active search or format filters.'}
          </p>
          {files.length === 0 && (
            <button onClick={onOpenUpload} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 'var(--text-xs)' }}>
              + Upload Asset Now
            </button>
          )}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-xs)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '10px' }}>
                <th style={{ padding: '12px 14px' }}>Asset Filename</th>
                <th style={{ padding: '12px 14px' }}>File UUID</th>
                <th style={{ padding: '12px 14px' }}>Product Linked</th>
                <th style={{ padding: '12px 14px' }}>Size</th>
                <th style={{ padding: '12px 14px' }}>Category</th>
                <th style={{ padding: '12px 14px' }}>Uploaded</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr
                  key={file.fileId}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Filename & Format Icon */}
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getFormatIcon(file.extension)}
                      <span style={{ fontWeight: 600, color: '#ffffff' }}>{file.originalName}</span>
                    </div>
                  </td>

                  {/* UUID with copy */}
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{file.fileId.substring(0, 8)}...</span>
                      <button
                        onClick={() => handleCopyId(file.fileId)}
                        aria-label={`Copy UUID for ${file.originalName}`}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: copiedId === file.fileId ? 'var(--accent-lime)' : 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                      >
                        {copiedId === file.fileId ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </td>

                  {/* Associated Product */}
                  <td style={{ padding: '12px 14px' }}>
                    {file.associatedProductId ? (
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          color: '#7dd3fc',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {file.associatedProductId}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Stand-alone</span>
                    )}
                  </td>

                  {/* Size */}
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                    {(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                  </td>

                  {/* Category */}
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                    {file.category || 'General'}
                  </td>

                  {/* Upload Date */}
                  <td style={{ padding: '12px 14px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => onInspectFile(file)}
                        title="Inspect Metadata & Tokens"
                        aria-label={`Inspect metadata for ${file.originalName}`}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: 'var(--panel-light)',
                          border: '1px solid var(--border-card)',
                          borderRadius: 'var(--radius-md)',
                          color: '#ffffff',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                        }}
                      >
                        <Info size={13} color="var(--accent-lime)" />
                        <span>Inspect</span>
                      </button>

                      <button
                        onClick={() => onDeleteFile(file.fileId)}
                        title="Delete asset from vault"
                        aria-label={`Delete ${file.originalName}`}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: 'var(--radius-md)',
                          color: '#f87171',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                        }}
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
