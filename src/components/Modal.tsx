import { useState, useEffect, useCallback } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ open, onClose, children, className = "" }: ModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (open) {
      setShowModal(true);
      setIsClosing(false);
    } else if (showModal && !isClosing) {
      setIsClosing(true);
      const timer = setTimeout(() => setShowModal(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open, showModal, isClosing]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      onClose();
    }, 300);
  }, [onClose]);

  if (!showModal) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-space-deepest/80 backdrop-blur-md ${
        isClosing ? "animate-modal-overlay-out" : "animate-modal-overlay-in"
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-lg animate-modal-zoom-in ${
          isClosing ? "animate-modal-zoom-out" : ""
        } ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
