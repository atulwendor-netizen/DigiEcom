import React, { useState, useRef } from 'react';
import { X, UploadCloud, AlertCircle, Loader2 } from 'lucide-react';
import { AdminStorageService, AdminStoredFile } from '../../services/admin/adminStorage.service';
import productsJson from '../../data/products.json';

interface StorageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newFile: AdminStoredFile) => void;
}

export const StorageUploadModal: React.FC<StorageUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [associatedProductId, setAssociatedProductId] = useState('');
  const [category, setCategory] = useState('ebooks-guides');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Size check (50 MB)
      if (file.size > 50 * 1024 * 1024) {
        setErrorMessage('File size exceeds the maximum allowed limit of 50 MB.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const result = reader.result as string;
        // Strip data:*;base64, prefix
        const base64Content = result.split(',')[1] || result;

        const uploadRes = await AdminStorageService.uploadFile({
          filename: selectedFile.name,
          contentBase64: base64Content,
          category,
          associatedProductId: associatedProductId || undefined,
        });

        setIsUploading(false);

        if (uploadRes.success && uploadRes.metadata) {
          onUploadSuccess(uploadRes.metadata);
          onClose();
        } else {
          setErrorMessage(uploadRes.error || 'Failed to upload asset');
        }
      };

      reader.onerror = () => {
        setIsUploading(false);
        setErrorMessage('Error reading local file into buffer.');
      };

      reader.readAsDataURL(selectedFile);
    } catch (err: any) {
      setIsUploading(false);
      setErrorMessage(err.message || 'Unexpected upload error.');
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 200,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--panel)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              Upload Digital Asset
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Files are verified for magic bytes and isolated in private storage.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close upload modal"
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

        {errorMessage && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#fca5a5',
              fontSize: 'var(--text-xs)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleUploadSubmit}>
          {/* File Drag / Drop Selector Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '28px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: 'var(--panel-light)',
              marginBottom: '16px',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-lime)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-card)')}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.epub,.zip,.fig,.xlsx,.json,.md,.png"
              style={{ display: 'none' }}
            />
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'rgba(166, 255, 61, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px auto',
              }}
            >
              <UploadCloud size={22} color="var(--accent-lime)" />
            </div>

            {selectedFile ? (
              <div>
                <span style={{ fontWeight: 700, color: '#ffffff', fontSize: 'var(--text-sm)', display: 'block' }}>
                  {selectedFile.name}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)' }}>
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                </span>
              </div>
            ) : (
              <div>
                <span style={{ fontWeight: 600, color: '#ffffff', fontSize: 'var(--text-sm)', display: 'block' }}>
                  Click to select digital asset file
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                  Supported formats: PDF, EPUB, ZIP, FIG, XLSX, JSON, MD (Max 50 MB)
                </span>
              </div>
            )}
          </div>

          {/* Associated Product Dropdown */}
          <div style={{ marginBottom: '14px' }}>
            <label
              htmlFor="upload-product-select"
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}
            >
              Associate with Catalogue Product (Optional)
            </label>
            <select
              id="upload-product-select"
              value={associatedProductId}
              onChange={(e) => setAssociatedProductId(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                backgroundColor: 'var(--panel-light)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
                fontSize: 'var(--text-xs)',
                outline: 'none',
              }}
            >
              <option value="">None (Stand-alone digital asset)</option>
              {Array.isArray(productsJson) &&
                productsJson.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="upload-category-select"
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}
            >
              Category
            </label>
            <select
              id="upload-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                backgroundColor: 'var(--panel-light)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
                fontSize: 'var(--text-xs)',
                outline: 'none',
              }}
            >
              <option value="ebooks-guides">E-books & Guides</option>
              <option value="templates">Templates & Playbooks</option>
              <option value="prompts">AI Prompts & Models</option>
              <option value="code-devtools">Code & DevTools</option>
              <option value="design-assets">Design Assets</option>
              <option value="spreadsheets">Spreadsheets & Models</option>
            </select>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              style={{
                padding: '8px 16px',
                fontSize: 'var(--text-xs)',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="btn btn-primary"
              style={{
                padding: '8px 18px',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                opacity: isUploading || !selectedFile ? 0.6 : 1,
                cursor: isUploading || !selectedFile ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {isUploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Validating & Uploading...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={14} />
                  <span>Store Asset in Vault</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
