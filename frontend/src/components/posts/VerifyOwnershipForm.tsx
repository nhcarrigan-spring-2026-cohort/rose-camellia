import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import ErrorMessage from '@/components/shared/ErrorMessage'
import { useVerifyOwnershipMutation } from '@/hooks/queries/usePosts'
import type { VerifyOwnershipResponse } from '@/types'

interface VerifyOwnershipFormProps {
  postId: string
  hasVerification: boolean
}

export default function VerifyOwnershipForm({ postId, hasVerification }: VerifyOwnershipFormProps) {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<VerifyOwnershipResponse | null>(null)
  const mutation = useVerifyOwnershipMutation(postId)

  if (!hasVerification) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await mutation.mutateAsync({ code: code.toUpperCase() })
    setResult(res)
  }

  return (
    <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-4 space-y-3">
      <h3 className="text-base font-semibold text-gray-800">Verify Pet Ownership</h3>
      <p className="text-xs text-gray-500">
        Enter the verification code from the owner's lost post to prove you found their pet.
      </p>

      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label>Verification Code</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC-123"
              className="font-mono uppercase tracking-widest"
              maxLength={7}
            />
          </div>
          {mutation.error && <ErrorMessage error={mutation.error} />}
          <Button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            disabled={mutation.isPending || code.length < 6}
          >
            {mutation.isPending ? 'Verifying…' : 'Verify Code'}
          </Button>
        </form>
      ) : result.verified ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-green-700 font-semibold">
            <CheckCircle className="h-5 w-5" />
            Verified! Owner Contact Info
          </div>
          {result.ownerInfo && (
            <div className="text-sm space-y-1 text-green-800">
              <p><span className="font-medium">Name:</span> {result.ownerInfo.name}</p>
              {result.ownerInfo.contactEmail && (
                <p><span className="font-medium">Email:</span> {result.ownerInfo.contactEmail}</p>
              )}
              {result.ownerInfo.contactPhone && (
                <p><span className="font-medium">Phone:</span> {result.ownerInfo.contactPhone}</p>
              )}
              {result.petInfo?.petName && (
                <p><span className="font-medium">Pet:</span> {result.petInfo.petName}</p>
              )}
            </div>
          )}
          <button
            className="text-xs text-green-600 underline hover:text-green-800"
            onClick={() => { setResult(null); setCode('') }}
          >
            Try another code
          </button>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-red-700 font-semibold">
            <XCircle className="h-5 w-5" />
            Verification Failed
          </div>
          <p className="text-sm text-red-600">{result.warning ?? result.message}</p>
          <button
            className="text-xs text-red-500 underline hover:text-red-700"
            onClick={() => { setResult(null); setCode('') }}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
