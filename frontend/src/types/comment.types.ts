export interface Comment {
  id: string;
  postId: string;
  authorUsername?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  User?: {
    username: string;
    name: string;
    isGuest: boolean;
  };
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
  authorUsername?: string;
}

export interface UpdateCommentRequest {
  content: string;
}
