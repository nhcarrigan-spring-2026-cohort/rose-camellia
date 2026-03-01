import { useState, useEffect, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import PostCard from '@/components/shared/PostCard'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorMessage from '@/components/shared/ErrorMessage'
import PostFilters from '@/components/posts/PostFilters'
import PostMap from '@/components/map/PostMap'
import { usePostsQuery } from '@/hooks/queries/usePosts'
import type { GetPostsQuery, PostSummary } from '@/types'

const PAGE_SIZE = 20

export default function HomePage() {
  const [filters, setFilters] = useState<GetPostsQuery>({ limit: PAGE_SIZE, offset: 0 })
  const [selectedPostId, setSelectedPostId] = useState<string | undefined>()
  const [allPosts, setAllPosts] = useState<PostSummary[]>([])
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const { data, isLoading, error } = usePostsQuery(filters)

  useEffect(() => {
    if (data) {
      if ((filters.offset ?? 0) === 0) {
        setAllPosts(data.posts)
      } else {
        setAllPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id))
          const newPosts = data.posts.filter((p) => !existingIds.has(p.id))
          return [...prev, ...newPosts]
        })
      }
    }
  }, [data])

  function handleFiltersChange(newFilters: GetPostsQuery) {
    setFilters({ ...newFilters, limit: PAGE_SIZE, offset: 0 })
  }

  function handleLoadMore() {
    setFilters((prev) => ({ ...prev, offset: allPosts.length }))
  }

  function handleSelectPost(id: string) {
    setSelectedPostId(id)
    const el = cardRefs.current[id]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  function handleCardClick(id: string) {
    setSelectedPostId(id)
  }

  const hasMore = data?.pagination.hasMore ?? false

  const postList = (
    <div className="p-4 space-y-3">
      {isLoading && allPosts.length === 0 ? (
        <div className="flex justify-center py-8"><LoadingSpinner /></div>
      ) : error ? (
        <ErrorMessage error={error} />
      ) : allPosts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No posts found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          {allPosts.map((post) => (
            <div key={post.id} ref={(el) => { cardRefs.current[post.id] = el }}>
              <PostCard
                post={post}
                isSelected={post.id === selectedPostId}
                onClick={() => handleCardClick(post.id)}
              />
            </div>
          ))}
          {hasMore && (
            <Button
              variant="outline"
              className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? 'Loading…' : 'Load More'}
            </Button>
          )}
        </>
      )}
    </div>
  )

  const mapPanel = (
    <PostMap
      posts={allPosts}
      selectedPostId={selectedPostId}
      onSelectPost={handleSelectPost}
    />
  )

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <PostFilters filters={filters} onChange={handleFiltersChange} />

      {/* Desktop */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <div className="w-[55%] relative">
          {mapPanel}
        </div>
        <div className="flex-1 overflow-y-auto">
          {postList}
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden flex-1 overflow-hidden">
        <Tabs defaultValue="list" className="flex flex-col flex-1">
          <TabsList className="mx-4 mt-2 self-start">
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
          <TabsContent value="map" className="flex-1 mt-0">
            {mapPanel}
          </TabsContent>
          <TabsContent value="list" className="flex-1 overflow-y-auto mt-0">
            {postList}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
