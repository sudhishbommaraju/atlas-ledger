import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

export const metadata = {
  title: 'Privacy Policy — Atlas',
};

export default async function PrivacyPage() {
  const filePath = path.join(process.cwd(), 'app/legal/privacy-policy.md');
  const markdown = fs.readFileSync(filePath, 'utf-8');
  const html = await marked(markdown);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
