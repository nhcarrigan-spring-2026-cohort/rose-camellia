import { useState } from 'react'
import { PawPrint } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useImagesQuery } from '@/hooks/queries/useImages'

export default function ImageGallery({ postId }: { postId: string }) {
  const { data: images } = useImagesQuery(postId)
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
        <PawPrint className="h-16 w-16 text-amber-200" />
      </div>
    )
  }

  const primary = images.find((img) => img.isPrimary) ?? images[0]
  const rest = images.filter((img) => img.id !== primary.id)

  return (
    <>
      <div className="space-y-2">
        <img
          src={primary.url}
          alt="Primary"
          className="w-full h-64 object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
          onClick={() => setSelectedUrl(primary.url)}
        />
        {rest.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {rest.map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt=""
                className="h-20 w-20 flex-shrink-0 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedUrl(img.url)}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedUrl} onOpenChange={(open) => !open && setSelectedUrl(null)}>
        <DialogContent className="max-w-3xl p-2">
          {selectedUrl && (
            <img
              src={selectedUrl}
              alt="Full size"
              className="w-full h-auto rounded-lg object-contain max-h-[80vh]"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
