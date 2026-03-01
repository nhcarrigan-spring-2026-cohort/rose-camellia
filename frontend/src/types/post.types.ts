export type PostType = 'lost' | 'found' | 'sighting';
export type PetSize = 'small' | 'medium' | 'large' | 'extra-large';

export interface PostSummary {
  id: string;
  postType: PostType;
  title: string;
  description: string;
  location: string;
  lostFoundDate: string;
  authorUsername?: string;
  petName?: string;
  petType?: string;
  breed?: string;
  color?: string;
  size?: PetSize;
  latitude?: number;
  longitude?: number;
  contactEmail?: string;
  contactPhone?: string;
  reward?: string;
  resolved: boolean;
  hasVerification: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostDetail extends PostSummary {
  comments: import('./comment.types').Comment[];
}

export interface CreatePostRequest {
  postType: PostType;
  title: string;
  description: string;
  location: string;
  lostFoundDate: string;
  authorUsername?: string;
  petName?: string;
  petType?: string;
  breed?: string;
  color?: string;
  size?: PetSize;
  latitude?: number;
  longitude?: number;
  contactEmail?: string;
  contactPhone?: string;
  reward?: string;
}

export interface CreatePostResponse extends PostSummary {
  verificationCode?: string;
  verificationMessage?: string;
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {}

export interface GetPostsQuery {
  postType?: PostType;
  authorUsername?: string;
  resolved?: boolean;
  petType?: string;
  location?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface VerificationCodeResponse {
  postId: string;
  postTitle: string;
  verificationCode: string;
  message: string;
}

export interface VerifyOwnershipRequest {
  code: string;
}

export interface VerifyOwnershipResponse {
  verified: boolean;
  message: string;
  ownerInfo?: {
    name: string;
    contactEmail?: string;
    contactPhone?: string;
  };
  petInfo?: {
    title: string;
    petName?: string;
  };
  warning?: string;
}
