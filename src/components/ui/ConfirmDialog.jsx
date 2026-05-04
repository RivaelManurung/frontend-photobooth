import React, { useEffect } from 'react';
import Button from './Button';
import '../../styles/ConfirmDialog.css';

/**
 * Reusable Confirmation Dialog component.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the dialog is visible
 * @param {Function} props.onClose - Called when the user cancels or closes the dialog
 * @param {Function} props.onConfirm - Called when the user confirms the action
 * @param {string} props.title - The dialog title
 * @param {string} props.description - The dialog description text
 * @param {string} props.confirmText - Text for the confirm button
 * @param {string} props.cancelText - Text for the cancel button
 * @param {string} props.variant - Variant for the confirm button (default, destructive)
 * @param {boolean} props.isLoading - Whether the confirm action is in progress
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Hapus",
  description = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
  confirmText = "Hapus",
  cancelText = "Batal",
  variant = "destructive",
  isLoading = false
}) => {
  // Prevent scrolling when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay" onClick={onClose}>
      <div 
        className="confirm-dialog-content" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-dialog-header">
          <h3 className="confirm-dialog-title">{title}</h3>
          <p className="confirm-dialog-description">{description}</p>
        </div>
        
        <div className="confirm-dialog-footer">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant} 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
