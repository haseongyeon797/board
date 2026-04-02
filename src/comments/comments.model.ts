export interface CommentItem {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  date: Date;
  authorId: number | null;
  isAnonymous: boolean;
  isdeleted: boolean;
  isUpdated: boolean;
  isMine: boolean;
  author: {
    id: number | null;
    name: string;
    email: string;
  };
}
