export enum BoardStatus {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export interface Board {
  id: string;
  title: string;
  description: string;
  status: BoardStatus;
  authorId: number;
  author?: {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
  };
}
