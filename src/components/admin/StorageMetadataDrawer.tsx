import React, { useState } from 'react';
import { X, Copy, Check, Key, ExternalLink, Code2 } from 'lucide-react';
import { AdminStoredFile, AdminStorageService } from '../../services/admin/adminStorage.service';

interface StorageMetadataDrawerProps {
  file: AdminStoredFile | null;
  onClose: () => void;
}

export const StorageMetadataDrawer: React.FC<StorageMetadataDrawerProps> = ({ file, onClose }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [tokenTtl, setTokenTtl] = useState(900); // 15 mins default
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  if (!file) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGenerateToken = async () => {
    setIsGeneratingToken(true);
    const result = await AdminStorageService.generateDownloadToken(file.fileId, tokenTtl);
    setIsGeneratingToken(false);

    if (result.success && result.token && result.downloadUrl) {
      setGeneratedToken(result.token);
      setDownloadUrl(result.downloadUrl);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 3, 10, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 210,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '100%',
          backgroundColor: 'var(--panel)',
          borderLeft: '1px solid var(--border-card)',
          padding: '24px',
          boxSizing: 'border-box',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Drawer Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(166, 255, 61, 0.1)',
                color: 'var(--accent-lime)',
                border: '1px solid rgba(166, 255, 61, 0.3)',
                display: 'inline-block',
                marginBottom: '8px',
              }}
            >
              {file.extension.toUpperCase()} Asset
            </span>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: 0, color: '#ffffff', wordBreak: 'break-all' }}>
              {file.originalName}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close metadata drawer"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Section 1: Identifiers & Cryptographic Checksum */}
        <div
          style={{
            backgroundColor: 'var(--panel-light)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
          }}
        >
          <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
            Storage Identity & Checksum
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 'var(--text-xs)' }}>
            {/* File ID */}
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>File UUID:</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <code style={{ color: '#ffffff', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
                  {file.fileId}
                </code>
                <button
                  onClick={() => handleCopy(file.fileId, 'fileId')}
                  aria-label="Copy fileId"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: copiedField === 'fileId' ? 'var(--accent-lime)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                  }}
                >
                  {copiedField === 'fileId' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* SHA-256 Digest */}
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>SHA-256 Digest:</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <code
                  style={{
                    color: 'var(--accent-lime)',
                    fontFamily: 'var(--font-mono)',
                    wordBreak: 'break-all',
                    fontSize: '11px',
                  }}
                >
                  {file.sha256Hash || 'Calculated on ingest'}
                </code>
                <button
                  onClick={() => handleCopy(file.sha256Hash, 'hash')}
                  aria-label="Copy sha256 hash"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: copiedField === 'hash' ? 'var(--accent-lime)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                  }}
                >
                  {copiedField === 'hash' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Metadata Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginTop: '4px',
                paddingTop: '8px',
                borderTop: '1px solid var(--border-card)',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-dim)' }}>File Size:</span>{' '}
                <strong style={{ color: '#ffffff' }}>{(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>MIME:</span>{' '}
                <strong style={{ color: '#ffffff' }}>{file.mimeType}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Category:</span>{' '}
                <span style={{ color: '#ffffff' }}>{file.category || 'General'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Product ID:</span>{' '}
                <span style={{ color: '#ffffff' }}>{file.associatedProductId || 'None'}</span>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--text-dim)' }}>Uploaded At:</span>{' '}
                <span style={{ color: '#ffffff' }}>{new Date(file.uploadedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Temporary Download Token Generator */}
        <div
          style={{
            backgroundColor: 'var(--panel-light)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Key size={16} color="var(--accent-lime)" />
            <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#ffffff', margin: 0, textTransform: 'uppercase' }}>
              Generate Authorized Download Voucher
            </h4>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: 1.4 }}>
            Creates a tamper-resistant, short-lived HMAC download voucher strictly bound to this asset UUID.
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <select
              value={tokenTtl}
              onChange={(e) => setTokenTtl(Number(e.target.value))}
              aria-label="Token expiration period"
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: 'var(--panel)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
                fontSize: 'var(--text-xs)',
              }}
            >
              <option value={900}>Valid for 15 Minutes (Default)</option>
              <option value={3600}>Valid for 1 Hour</option>
              <option value={21600}>Valid for 6 Hours</option>
              <option value={86400}>Valid for 24 Hours</option>
            </select>

            <button
              onClick={handleGenerateToken}
              disabled={isGeneratingToken}
              className="btn btn-primary"
              style={{
                padding: '8px 14px',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              {isGeneratingToken ? 'Generating...' : 'Issue Token'}
            </button>
          </div>

          {generatedToken && downloadUrl && (
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: 'rgba(166, 255, 61, 0.08)',
                border: '1px solid rgba(166, 255, 61, 0.3)',
                borderRadius: 'var(--radius-md)',
                fontSize: '11px',
              }}
            >
              <span style={{ fontWeight: 700, color: 'var(--accent-lime)', display: 'block', marginBottom: '4px' }}>
                Active Token Generated:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                    textDecoration: 'underline',
                    wordBreak: 'break-all',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{downloadUrl}</span>
                  <ExternalLink size={11} style={{ flexShrink: 0 }} />
                </a>
                <button
                  onClick={() => handleCopy(downloadUrl, 'downloadUrl')}
                  aria-label="Copy download link"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: copiedField === 'downloadUrl' ? 'var(--accent-lime)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                >
                  {copiedField === 'downloadUrl' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Raw JSON Inspector */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Code2 size={15} color="var(--text-secondary)" />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Raw Storage Metadata JSON
            </span>
          </div>
          <pre
            style={{
              padding: '12px',
              backgroundColor: 'var(--panel-light)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              color: '#d4d4d4',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              overflowX: 'auto',
              margin: 0,
            }}
          >
            {JSON.stringify(file, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
