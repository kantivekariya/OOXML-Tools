import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './ui/alert-dialog';

export default function ConfirmDialog({ dialog, onConfirm, onCancel }) {
  if (!dialog) return null;

  return (
    <AlertDialog open={!!dialog}>
      <AlertDialogOverlay onClick={onCancel} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            {dialog.icon && (
              <span className="text-2xl flex-shrink-0 leading-none mt-0.5">{dialog.icon}</span>
            )}
            <div>
              <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">{dialog.message}</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{dialog.confirmText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
