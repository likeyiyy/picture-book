export interface PictureBook {
  id: string;
  title: string;
  theme: string;
  ageGroup: string;
  pageCount: number;
  artStyle: string;
  pages: Page[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Page {
  id: string;
  pageNumber: number;
  text: string;
  imagePrompt: string;
  imageUrl?: string;
  imageProcessing?: boolean;
}

export interface GenerateBookRequest {
  theme: string;
  ageGroup: '2-4' | '4-6' | '6-8';
  pageCount: number;
  artStyle: 'cartoon' | 'watercolor' | 'flat' | 'realistic' | 'chinese';
  mainCharacter: string;
  setting: string;
  moral: string;
}

export interface GenerateImageRequest {
  prompt: string;
  style: string;
  size?: 'square' | 'landscape' | 'portrait';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}