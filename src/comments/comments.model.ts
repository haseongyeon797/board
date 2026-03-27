export interface CommentItem {
  id: string;
  content: string;
  createdAt: Date;
  authorId: number;
  author: {
    id: number;
    name: string;
    email: string;
  };
}
