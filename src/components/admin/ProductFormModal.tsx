import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Package,
  FileText,
  UploadCloud,
  Eye,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  Plus,
} from 'lucide-react';
import {
  ManagedProduct,
  CreateProductInput,
  ProductService,
  ProductStatus,
} from '../../services/product.service';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: ManagedProduct | null;
  onSaveSuccess: (product: ManagedProduct) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  initialProduct,
  onSaveSuccess,
}) => {
  const isEditing = Boolean(initialProduct);

  const [activeTab, setActiveTab] = useState<'essentials' | 'details' | 'file' | 'preview'>('essentials');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [category, setCategory] = useState('ebooks-guides');
  const [priceInr, setPriceInr] = useState('499');
  const [status, setStatus] = useState<ProductStatus>('published');
  const [isFeatured, setIsFeatured] = useState(false);
  const [coverVisualType, setCoverVisualType] = useState<'playbook' | 'blueprint' | 'audio' | 'component'>('playbook');

  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [contents, setContents] = useState<string[]>(['']);
  const [tagsInput, setTagsInput] = useState('');
  const [licenseType, setLicenseType] = useState('Personal & Commercial Reading License');
  const [compatibility, setCompatibility] = useState('Compatible with all modern operating systems.');

  // File deliverable state
  const [attachedFileId, setAttachedFileId] = useState<string | undefined>(undefined);
  const [attachedFileName, setAttachedFileName] = useState<string | undefined>(undefined);
  const [attachedFileSize, setAttachedFileSize] = useState<number | undefined>(undefined);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setSlug(initialProduct.slug);
      setIsSlugCustomized(true);
      setCategory(initialProduct.category);
      setPriceInr((initialProduct.pricePaise / 100).toString());
      setStatus(initialProduct.status);
      setIsFeatured(Boolean(initialProduct.isFeatured));
      setCoverVisualType(initialProduct.coverVisualType as any || 'playbook');
      setShortDescription(initialProduct.shortDescription || '');
      setFullDescription(initialProduct.fullDescription || '');
      setContents(initialProduct.contents && initialProduct.contents.length > 0 ? initialProduct.contents : ['']);
      setTagsInput(initialProduct.tags ? initialProduct.tags.join(', ') : '');
      setLicenseType(initialProduct.licenseType || 'Personal & Commercial Reading License');
      setCompatibility(initialProduct.compatibility || 'Compatible with all modern operating systems.');
      setAttachedFileId(initialProduct.attachedFileId);
      setAttachedFileName(initialProduct.attachedFileName);
      setAttachedFileSize(initialProduct.attachedFileSize);
    } else {
      setName('');
      setSlug('');
      setIsSlugCustomized(false);
      setCategory('ebooks-guides');
      setPriceInr('499');
      setStatus('published');
      setIsFeatured(false);
      setCoverVisualType('playbook');
      setShortDescription('');
      setFullDescription('');
      setContents(['Primary Digital Guide / Template File']);
      setTagsInput('Architecture, Engineering');
      setLicenseType('Personal & Commercial Reading License');
      setCompatibility('Compatible with all modern operating systems.');
      setAttachedFileId(undefined);
      setAttachedFileName(undefined);
      setAttachedFileSize(undefined);
    }
    setSelectedUploadFile(null);
    setErrorMessage(null);
    setActiveTab('essentials');
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugCustomized) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  const handleAddContentRow = () => {
    setContents((prev) => [...prev, '']);
  };

  const handleRemoveContentRow = (index: number) => {
    setContents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContentChange = (index: number, val: string) => {
    setContents((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const handleDeliverableFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.size > 50 * 1024 * 1024) {
        setErrorMessage('Attached file exceeds 50 MB limit.');
        return;
      }
      setSelectedUploadFile(f);
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Product title is required.');
      setActiveTab('essentials');
      return;
    }

    const priceNum = parseFloat(priceInr);
    if (isNaN(priceNum) || priceNum < 0) {
      setErrorMessage('Please enter a valid non-negative price.');
      setActiveTab('essentials');
      return;
    }

    if (!shortDescription.trim()) {
      setErrorMessage('Short description is required.');
      setActiveTab('details');
      return;
    }

    setIsSaving(true);

    try {
      let finalFileId = attachedFileId;
      let finalFileName = attachedFileName;
      let finalFileSize = attachedFileSize;
      let finalFileMime: string | undefined = undefined;

      // If user selected a new deliverable file to upload
      if (selectedUploadFile) {
        setIsUploadingFile(true);
        const uploadRes = await ProductService.uploadDeliverableAttachment(
          selectedUploadFile,
          initialProduct ? initialProduct.id : undefined
        );
        setIsUploadingFile(false);

        if (!uploadRes.success || !uploadRes.fileId) {
          throw new Error(uploadRes.error || 'Failed to upload deliverable file to vault.');
        }

        finalFileId = uploadRes.fileId;
        finalFileName = uploadRes.originalName;
        finalFileSize = uploadRes.sizeBytes;
        finalFileMime = uploadRes.mimeType;
      }

      const tagsArray = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const cleanedContents = contents.map((c) => c.trim()).filter(Boolean);

      const payload: CreateProductInput = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        category,
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim() || shortDescription.trim(),
        pricePaise: Math.round(priceNum * 100),
        currency: 'INR',
        coverVisualType,
        contents: cleanedContents.length > 0 ? cleanedContents : [name.trim()],
        licenseType,
        compatibility,
        status,
        isFeatured,
        tags: tagsArray.length > 0 ? tagsArray : [category],
        attachedFileId: finalFileId,
        attachedFileName: finalFileName,
        attachedFileSize: finalFileSize,
        attachedFileMime: finalFileMime,
      };

      if (isEditing && initialProduct) {
        const updateRes = await ProductService.updateProduct(initialProduct.id, payload);
        if (!updateRes.success || !updateRes.product) {
          throw new Error(updateRes.error || 'Failed to update product');
        }
        onSaveSuccess(updateRes.product);
      } else {
        const createRes = await ProductService.createProduct(payload);
        if (!createRes.success || !createRes.product) {
          throw new Error(createRes.error || 'Failed to create product');
        }
        onSaveSuccess(createRes.product);
      }

      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
      setIsUploadingFile(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 3, 10, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          backgroundColor: 'var(--panel)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(166, 255, 61, 0.1)',
                border: '1px solid rgba(166, 255, 61, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Package size={17} color="var(--accent-lime)" />
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                {isEditing ? 'Edit Digital Product' : 'Add New Digital Product'}
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>
                {isEditing ? `Modifying catalogue item ${initialProduct?.id}` : 'Create, configure, and publish a new deliverable item'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close product modal"
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

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-card)',
            padding: '0 24px',
            backgroundColor: 'var(--panel-light)',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('essentials')}
            style={{
              padding: '10px 14px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'essentials' ? '2px solid var(--accent-lime)' : '2px solid transparent',
              color: activeTab === 'essentials' ? 'var(--accent-lime)' : 'var(--text-secondary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Package size={13} />
            <span>Essentials</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('details')}
            style={{
              padding: '10px 14px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'details' ? '2px solid var(--accent-lime)' : '2px solid transparent',
              color: activeTab === 'details' ? 'var(--accent-lime)' : 'var(--text-secondary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FileText size={13} />
            <span>Copy & Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('file')}
            style={{
              padding: '10px 14px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'file' ? '2px solid var(--accent-lime)' : '2px solid transparent',
              color: activeTab === 'file' ? 'var(--accent-lime)' : 'var(--text-secondary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <UploadCloud size={13} />
            <span>Digital Attachment</span>
            {(attachedFileId || selectedUploadFile) && (
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-lime)',
                }}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            style={{
              padding: '10px 14px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'preview' ? '2px solid var(--accent-lime)' : '2px solid transparent',
              color: activeTab === 'preview' ? 'var(--accent-lime)' : 'var(--text-secondary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Eye size={13} />
            <span>Live Card Preview</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '24px', flex: 1 }}>
            {errorMessage && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: 'var(--text-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '18px',
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: ESSENTIALS */}
            {activeTab === 'essentials' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Modern Cloud Microservices Architecture Playbook"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'var(--panel-light)',
                      border: '1px solid var(--border-card)',
                      borderRadius: 'var(--radius-md)',
                      color: '#ffffff',
                      fontSize: 'var(--text-xs)',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => {
                        setIsSlugCustomized(true);
                        setSlug(e.target.value);
                      }}
                      placeholder="e.g. cloud-microservices-playbook"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: 'var(--panel-light)',
                        border: '1px solid var(--border-card)',
                        borderRadius: 'var(--radius-md)',
                        color: '#ffffff',
                        fontSize: 'var(--text-xs)',
                        fontFamily: 'var(--font-mono)',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: 'var(--panel-light)',
                        border: '1px solid var(--border-card)',
                        borderRadius: 'var(--radius-md)',
                        color: '#ffffff',
                        fontSize: 'var(--text-xs)',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="ebooks-guides">E-books & Guides</option>
                      <option value="templates">Templates & Kits</option>
                      <option value="presets">Audio & Presets</option>
                      <option value="code-snippets">Code & Components</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Price in INR (₹) *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--text-dim)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 700,
                        }}
                      >
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={priceInr}
                        onChange={(e) => setPriceInr(e.target.value)}
                        placeholder="499"
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 28px',
                          backgroundColor: 'var(--panel-light)',
                          border: '1px solid var(--border-card)',
                          borderRadius: 'var(--radius-md)',
                          color: '#ffffff',
                          fontSize: 'var(--text-xs)',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Publishing State *
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ProductStatus)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: 'var(--panel-light)',
                        border: '1px solid var(--border-card)',
                        borderRadius: 'var(--radius-md)',
                        color: '#ffffff',
                        fontSize: 'var(--text-xs)',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="published">Published (Live in Storefront)</option>
                      <option value="draft">Draft (Admin Only)</option>
                      <option value="unpublished">Unpublished (Hidden from Store)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Visual Style Theme
                    </label>
                    <select
                      value={coverVisualType}
                      onChange={(e) => setCoverVisualType(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: 'var(--panel-light)',
                        border: '1px solid var(--border-card)',
                        borderRadius: 'var(--radius-md)',
                        color: '#ffffff',
                        fontSize: 'var(--text-xs)',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="playbook">Playbook (Deep Purple Gradient)</option>
                      <option value="blueprint">Blueprint (Deep Navy Blue)</option>
                      <option value="audio">Audio / Media (Violet Magenta)</option>
                      <option value="component">Component (Emerald Cyan)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', paddingTop: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: 'var(--text-xs)', color: '#ffffff' }}>
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        style={{ accentColor: 'var(--accent-lime)', width: '16px', height: '16px' }}
                      />
                      <span>Feature on Homepage Spotlight</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: COPY & DETAILS */}
            {activeTab === 'details' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Short Storefront Summary *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Brief 1-2 sentence description shown on catalogue cards..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'var(--panel-light)',
                      border: '1px solid var(--border-card)',
                      borderRadius: 'var(--radius-md)',
                      color: '#ffffff',
                      fontSize: 'var(--text-xs)',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Full Product Description
                  </label>
                  <textarea
                    rows={4}
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    placeholder="Comprehensive overview shown on product detail page..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'var(--panel-light)',
                      border: '1px solid var(--border-card)',
                      borderRadius: 'var(--radius-md)',
                      color: '#ffffff',
                      fontSize: 'var(--text-xs)',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Deliverable Contents Checklist
                    </label>
                    <button
                      type="button"
                      onClick={handleAddContentRow}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-lime)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Plus size={12} /> Add item
                    </button>
                  </div>
                  {contents.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleContentChange(idx, e.target.value)}
                        placeholder={`Content item #${idx + 1}`}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          backgroundColor: 'var(--panel-light)',
                          border: '1px solid var(--border-card)',
                          borderRadius: 'var(--radius-md)',
                          color: '#ffffff',
                          fontSize: 'var(--text-xs)',
                        }}
                      />
                      {contents.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveContentRow(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#f87171',
                            cursor: 'pointer',
                            padding: '6px',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="Architecture, TypeScript, PDF"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: 'var(--panel-light)',
                        border: '1px solid var(--border-card)',
                        borderRadius: 'var(--radius-md)',
                        color: '#ffffff',
                        fontSize: 'var(--text-xs)',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      License Terms
                    </label>
                    <input
                      type="text"
                      value={licenseType}
                      onChange={(e) => setLicenseType(e.target.value)}
                      placeholder="Single-user reading & commercial license"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: 'var(--panel-light)',
                        border: '1px solid var(--border-card)',
                        borderRadius: 'var(--radius-md)',
                        color: '#ffffff',
                        fontSize: 'var(--text-xs)',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: DIGITAL DELIVERABLE FILE */}
            {activeTab === 'file' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: 'var(--panel-light)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-card)',
                  }}
                >
                  <h4 style={{ margin: '0 0 6px 0', fontSize: 'var(--text-xs)', color: 'var(--accent-lime)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Vault Deliverable Protection
                  </h4>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Digital files are stored privately in your serverless storage vault outside the web root. They are never given a public URL and can only be accessed through short-lived, tamper-resistant HMAC vouchers issued post-purchase.
                  </p>
                </div>

                {attachedFileId && !selectedUploadFile && (
                  <div
                    style={{
                      padding: '14px',
                      backgroundColor: 'rgba(166, 255, 61, 0.05)',
                      border: '1px solid rgba(166, 255, 61, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--accent-lime)', display: 'block' }}>
                        Currently Attached Deliverable
                      </span>
                      <strong style={{ fontSize: 'var(--text-xs)', color: '#ffffff' }}>
                        {attachedFileName || 'Vault Binary Asset'}
                      </strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        UUID: {attachedFileId} • {attachedFileSize ? `${(attachedFileSize / (1024 * 1024)).toFixed(2)} MB` : ''}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachedFileId(undefined);
                        setAttachedFileName(undefined);
                        setAttachedFileSize(undefined);
                      }}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        color: '#f87171',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      Detach File
                    </button>
                  </div>
                )}

                {/* Upload or Replace Field */}
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {attachedFileId ? 'Replace Deliverable Binary File' : 'Upload & Attach Digital File (Max 50 MB)'}
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleDeliverableFileSelect}
                    accept=".pdf,.epub,.zip,.json,.png,.jpg,.jpeg,.mp3,.wav"
                    style={{ display: 'none' }}
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: selectedUploadFile ? '2px solid var(--accent-lime)' : '2px dashed var(--border-card)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: 'var(--panel-light)',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <UploadCloud size={24} color={selectedUploadFile ? 'var(--accent-lime)' : 'var(--text-dim)'} style={{ margin: '0 auto 8px auto' }} />
                    {selectedUploadFile ? (
                      <div>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#ffffff', display: 'block' }}>
                          Selected: {selectedUploadFile.name}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--accent-lime)' }}>
                          {(selectedUploadFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to ingest into vault on save
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span style={{ fontSize: 'var(--text-xs)', color: '#ffffff', fontWeight: 600, display: 'block' }}>
                          Click to select or drag deliverable file
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          Supports PDF, EPUB, ZIP, MP3, PNG (up to 50 MB)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: LIVE STOREFRONT PREVIEW */}
            {activeTab === 'preview' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', textAlign: 'center' }}>
                  Interactive live preview of how this product appears on the DigiEcom customer storefront:
                </span>

                <div
                  className="card"
                  style={{
                    width: '100%',
                    maxWidth: '340px',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-card)',
                    backgroundColor: 'var(--panel)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  {/* Thumbnail Banner */}
                  <div
                    style={{
                      height: '140px',
                      background: coverVisualType === 'blueprint'
                        ? 'linear-gradient(135deg, #091e3a 0%, #173b75 100%)'
                        : coverVisualType === 'audio'
                        ? 'linear-gradient(135deg, #2b0b3a 0%, #5c187d 100%)'
                        : coverVisualType === 'component'
                        ? 'linear-gradient(135deg, #0c2a26 0%, #155c52 100%)'
                        : 'linear-gradient(135deg, #1e1035 0%, #3b1d6e 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '14px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(0, 0, 0, 0.4)',
                          color: '#ffffff',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        {category}
                      </span>
                      {isFeatured && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(166, 255, 61, 0.2)',
                            color: 'var(--accent-lime)',
                            border: '1px solid var(--accent-lime)',
                          }}
                        >
                          Featured
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'var(--font-mono)' }}>
                      {coverVisualType.toUpperCase()} DELIVERABLE
                    </span>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '16px' }}>
                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: '#ffffff', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                      {name || 'Untitled Digital Product'}
                    </h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 14px 0', lineHeight: 1.4, maxHeight: '34px', overflow: 'hidden' }}>
                      {shortDescription || 'No description provided yet.'}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-card)' }}>
                      <span style={{ fontSize: 'var(--text-md)', fontWeight: 800, color: '#ffffff' }}>
                        ₹{parseFloat(priceInr || '0').toFixed(2)}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: status === 'published' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                          color: status === 'published' ? '#86efac' : '#fde047',
                          border: `1px solid ${status === 'published' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-card)',
              backgroundColor: 'var(--panel-light)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: 'var(--text-xs)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
              style={{
                padding: '8px 20px',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{isUploadingFile ? 'Uploading Deliverable...' : 'Saving Product...'}</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>{isEditing ? 'Save Changes' : 'Create Product'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
