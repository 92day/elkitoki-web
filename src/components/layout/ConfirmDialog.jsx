import { useEffect } from 'react';

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  tone = 'danger',
  pending = false,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !pending) onClose?.();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, pending, onClose]);

  if (!open) return null;

  return (
    <div
      className="confirm-dialog-overlay"
      onClick={() => {
        if (!pending) onClose?.();
      }}
    >
      <div
        className="confirm-dialog-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`confirm-dialog-icon ${tone}`}>
          <span>!</span>
        </div>
        <div className="confirm-dialog-content">
          <div className="confirm-dialog-eyebrow">확인 필요</div>
          <h3 className="confirm-dialog-title" id="confirm-dialog-title">{title}</h3>
          <p className="confirm-dialog-description" id="confirm-dialog-description">
            {description}
          </p>
        </div>
        <div className="confirm-dialog-actions">
          <button className="btn-sm react-btn-auto" type="button" onClick={onClose} disabled={pending}>
            {cancelLabel}
          </button>
          <button
            className={`confirm-dialog-confirm ${tone}`}
            type="button"
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? '처리 중...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
