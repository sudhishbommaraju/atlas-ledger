import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

export const metadata = {
  title: 'Terms of Service — Atlas',
};

export default async function TermsPage() {
  const filePath = path.join(process.cwd(), 'app/legal/terms-of-service.md');
  const markdown = fs.readFileSync(filePath, 'utf-8');
  const html = await marked(markdown);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
