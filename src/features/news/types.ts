export interface News {
  id: number;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  imageKey: string | null;
  newsUrl: string;
  source: string;
  publishDate: string;
}