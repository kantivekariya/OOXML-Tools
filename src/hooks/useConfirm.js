import { useState, useCallback, useRef } from 'react';

export function useConfirm() {
  const [dialog, setDialog] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback((title, message, confirmText = 'Confirm', icon = '⚠️') => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialog({ title, message, confirmText, icon });
    });
  }, []);

  const onConfirm = useCallback(() => {
    setDialog(null);
    resolveRef.current?.(true);
  }, []);

  const onCancel = useCallback(() => {
    setDialog(null);
    resolveRef.current?.(false);
  }, []);

  return { dialog, confirm, onConfirm, onCancel };
}
