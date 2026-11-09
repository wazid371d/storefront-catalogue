import { useEffect, useRef } from 'react';
import { EnquiryForm } from './EnquiryForm';

interface EnquiryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productTitle: string;
}

export function EnquiryDialog({ isOpen, onClose, productId, productTitle }: EnquiryDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="enquiry-dialog"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      aria-labelledby="enquiry-dialog-title"
    >
      <div className="enquiry-dialog__inner">
        <div className="enquiry-dialog__header">
          <h2 id="enquiry-dialog-title">Enquire about this product</h2>
          <button type="button" className="enquiry-dialog__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <p className="enquiry-dialog__subtitle">{productTitle}</p>
        {/* remounted each time it opens, so a previous submission never lingers */}
        {isOpen && <EnquiryForm productId={productId} productTitle={productTitle} />}
      </div>
    </dialog>
  );
}
