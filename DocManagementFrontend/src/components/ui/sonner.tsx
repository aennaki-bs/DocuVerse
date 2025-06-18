import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      expand={true}
      richColors={true}
      closeButton={true}
      toastOptions={{
        duration: 4000,
        style: {
          fontSize: '16px',
          padding: '16px 20px',
          minHeight: '60px',
          borderRadius: '12px',
          fontWeight: '500',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
        },
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm group-[.toast]:mt-1",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:bg-green-900/90 group-[.toast]:text-green-100 group-[.toast]:border-green-700/50",
          error: "group-[.toast]:bg-red-900/90 group-[.toast]:text-red-100 group-[.toast]:border-red-700/50",
          info: "group-[.toast]:bg-blue-900/90 group-[.toast]:text-blue-100 group-[.toast]:border-blue-700/50",
          warning: "group-[.toast]:bg-amber-900/90 group-[.toast]:text-amber-100 group-[.toast]:border-amber-700/50",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
