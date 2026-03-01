import { Routes, Route } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import { Toaster } from '@/components/ui/toaster'
import HomePage from '@/pages/HomePage'
import PostDetailPage from '@/pages/PostDetailPage'
import CreatePostPage from '@/pages/CreatePostPage'
import EditPostPage from '@/pages/EditPostPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import UserProfilePage from '@/pages/UserProfilePage'

export default function App() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/posts/new" element={<CreatePostPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/posts/:id/edit" element={<EditPostPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/users/:username" element={<UserProfilePage />} />
      </Routes>
      <Toaster />
    </div>
  )
}
