export type CategoryId =
  | 'ebooks-guides'
  | 'ai-prompts'
  | 'business-templates'
  | 'productivity-tools'
  | 'design-assets'
  | 'other-downloads';

export interface Category {
  id: CategoryId;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  accentColor: 'lime' | 'violet' | 'orange' | 'pink' | 'cyan';
  popularFormats: string[];
}
