import { AlertTriangle, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface VerificationCodeModalProps {
  code: string
  postId: string
  onClose: () => void
}

export default function VerificationCodeModal({ code, onClose }: VerificationCodeModalProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md overflow-y-auto max-h-[90vh] [&>button:last-child]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            Save Your Verification Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <p className="text-sm text-amber-600 mb-3">Your verification code</p>
            <p className="font-mono text-4xl font-bold tracking-widest text-amber-700">{code}</p>
          </div>

          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 text-sm">
              This code will <strong>not</strong> be shown again. Save it now — finders need it
              to prove your pet's identity before you share contact info.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>
            <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white" onClick={onClose}>
              I've Saved It
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
