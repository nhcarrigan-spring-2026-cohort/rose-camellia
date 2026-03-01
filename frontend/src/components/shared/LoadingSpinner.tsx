export default function LoadingSpinner({ fullPage }: { fullPage?: boolean }) {
  const spinner = (
    <div className="h-8 w-8 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
  )

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        {spinner}
      </div>
    )
  }

  return spinner
}
