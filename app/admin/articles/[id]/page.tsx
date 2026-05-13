'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import ArticleEditor from '@/components/admin/ArticleEditor';

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/articles/${id}`).then(r => r.json()).then(data => {
      if (!data.error) setArticle(data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (data: any, publish: boolean) => {
    const res = await fetch(`/api/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, status: publish ? 'PUBLISHED' : 'DRAFT' }),
    });
    if (!res.ok) throw new Error('Failed to update article');
  };

  if (loading) return <div className="animate-pulse h-96 bg-gray-100 rounded-2xl" />;
  if (!article) return <p className="text-red-500">Article not found.</p>;

  return <ArticleEditor initialData={article} onSave={handleSave} />;
}
