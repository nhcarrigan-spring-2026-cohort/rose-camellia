import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { parseApiError } from '@/api/errors'

export default function ErrorMessage({ error }: { error: unknown }) {
  if (!error) return null

  const { message, fieldErrors } = parseApiError(error)
  const fieldEntries = Object.entries(fieldErrors)

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        {fieldEntries.length > 0 && (
          <ul className="mt-1 list-disc list-inside text-sm">
            {fieldEntries.map(([field, msg]) => (
              <li key={field}>{msg}</li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  )
}
