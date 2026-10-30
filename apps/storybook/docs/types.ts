export interface ComponentDoc {
  name: string;
  title: string;
  category: string;
  description: string;
  design: string[];
  restrictions: string[];
  accessibility: string[];
  interaction: string;
  stateNotes: string;
  propNotes: Record<string, { description: string; default?: string }>;
}
