
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { AlertCircle, X, Info, CheckCircle } from "lucide-react"

export function Toaster() {
  const { toasts, dismiss } = useToast();

  // Show only the latest toast, if any
  const latestToast = toasts.length ? toasts[0] : null;

  if (!latestToast) return null;

  // Determine the icon and colors based on toast variant
  const getToastStyles = (variant?: 'default' | 'destructive' | 'info' | 'success') => {
    switch (variant) {
      case 'destructive':
        return {
          icon: <AlertCircle className="w-5 h-5 text-white" />,
          bg: '#ea384c', // Red
          iconBg: '#273052'
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5 text-white" />,
          bg: '#10b981', // Green
          iconBg: '#273052'
        };
      case 'info':
        return {
          icon: <Info className="w-5 h-5 text-white" />,
          bg: '#3b82f6', // Blue
          iconBg: '#273052'
        };
      default:
        return {
          icon: <AlertCircle className="w-5 h-5 text-white" />,
          bg: '#ea384c', // Default to red for errors
          iconBg: '#273052'
        };
    }
  };

  const { icon, bg, iconBg } = getToastStyles(latestToast.variant as 'default' | 'destructive' | 'info' | 'success');

  return (
    <ToastProvider>
      <Toast
        key={latestToast.id}
        open={latestToast.open}
        onOpenChange={(open) => {
          if (!open) dismiss(latestToast.id);
        }}
        className="fixed right-5 bottom-5 z-[1080] w-[345px] border-none bg-[#181e38] shadow-xl rounded-xl animate-fade-in dark:bg-[#181e38] dark:text-blue-100 text-blue-900 flex items-center gap-2"
        style={{
          minHeight: 70,
          paddingLeft: 20,
          paddingRight: 16,
          paddingTop: 14,
          paddingBottom: 14,
          border: "1.5px solid #273052"
        }}
      >
        <div className="flex items-start flex-1">
          {/* Icon */}
          <div className="mr-3 mt-0.5">
            <span 
              className="inline-flex items-center justify-center w-7 h-7 rounded-full" 
              style={{ backgroundColor: iconBg }}
            >
              {/* Icon based on toast type */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill={bg} />
                {latestToast.variant === 'info' ? (
                  <>
                    <path d="M12 8v1" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 12v4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                  </>
                ) : latestToast.variant === 'success' ? (
                  <path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                ) : (
                  <>
                    <path d="M12 7.5V13" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="16" r="1" fill="#fff"/>
                  </>
                )}
              </svg>
            </span>
          </div>
          {/* Message */}
          <div className="flex flex-col gap-1 mr-5">
            {latestToast.title && (
              <ToastTitle className="text-base font-semibold text-white">
                {latestToast.title}
              </ToastTitle>
            )}
            {(latestToast.description || latestToast.title === undefined) && (
              <ToastDescription className="text-sm font-normal text-blue-100 max-w-[260px] break-words">
                {latestToast.description || latestToast.title}
              </ToastDescription>
            )}
          </div>
        </div>
        {/* Close/X button */}
        <button
          aria-label="Dismiss"
          className="absolute top-2 right-2 rounded-md hover:bg-[#25306f]/30 p-1 group"
          style={{ lineHeight: 0 }}
          onClick={() => dismiss(latestToast.id)}
        >
          <X className="w-5 h-5 text-blue-200 group-hover:text-red-400" />
        </button>
      </Toast>
    </ToastProvider>
  )
}
