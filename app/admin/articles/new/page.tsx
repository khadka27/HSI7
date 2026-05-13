'use client';

import { useRouter } from 'next/navigation';
import ArticleEditor from '@/components/admin/ArticleEditor';

export default function NewArticlePage() {
  const router = useRouter();

  const handleSave = async (data: any, publish: boolean) => {
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, status: publish ? 'PUBLISHED' : 'DRAFT' }),
    });
    if (!res.ok) throw new Error('Failed to create article');
    const article = await res.json();
    router.push(`/admin/articles/${article.id}`);
  };

  return <ArticleEditor onSave={handleSave} />;
}
