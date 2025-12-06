import { z } from 'zod';

export const StoryPageSchema = z.object({
  pageNumber: z.number().int().min(1),
  text: z.string().max(50),
  imagePrompt: z.string().describe('描述这一页画面的提示词'),
});

export const StorySchema = z.object({
  title: z.string().describe('故事标题'),
  pages: z.array(StoryPageSchema).min(3).max(10),
});

export type StoryType = z.infer<typeof StorySchema>;
export type StoryPageType = z.infer<typeof StoryPageSchema>;