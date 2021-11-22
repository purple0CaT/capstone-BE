export interface PostType {
  text: string;
  media: string;
  author: object;
  location?: string[];
  createdAt: string;
  updatedAt: string;
  likes?: string;
  comments?: [];
}
