export interface CommentItem {
  id: string;
  content: string;
  createdAt: Date;
  authorId: number;
  isAnonymous: boolean;
  isMine: boolean;
  author: {
    id: number;
    name: string;
    email: string;
  };
}
