export interface PostImage {
  id: string;
  postId: string;
  url: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface UploadImageParams {
  image: File;
  postId: string;
  isPrimary?: boolean;
}
