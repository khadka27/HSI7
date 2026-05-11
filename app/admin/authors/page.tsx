'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Search, UserCheck, Star } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Author {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  expertise: string | null;
  avatar: string | null;
  reviewCount: number | null;
  rating: number | null;
}

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/authors').then(r => r.json()).then(setAuthors).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await fetch(`/api/authors/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    load();
  };

  const filtered = authors.filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-sm">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Authors</h1>
            <p className="text-gray-400 text-xs mt-0.5">{loading ? '…' : `${authors.length} total`}</p>
          </div>
        </div>
        <Link href="/admin/authors/new"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Author
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search authors…"
          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Author</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Title / Expertise</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500 hidden md:table-cell">Trust Signals</th>
                  <th className="px-5 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(author => (
                  <tr key={author.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-100 to-violet-100 flex-shrink-0 border border-gray-100">
                          {author.avatar
                            ? <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-sm">{author.name.charAt(0)}</div>
                          }
                        </div>
                        <span className="font-medium text-gray-900">{author.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-gray-700 text-sm">{author.title || '—'}</p>
                      {author.expertise && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{author.expertise}</p>}
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {author.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            {author.rating.toFixed(1)}
                          </span>
                        )}
                        {author.reviewCount && (
                          <span>{author.reviewCount.toLocaleString()} reviews</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Link href={`/admin/authors/${author.id}`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete author?</AlertDialogTitle>
                              <AlertDialogDescription><strong>{author.name}</strong> will be permanently deleted.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(author.id)} disabled={deletingId === author.id}
                                className="rounded-xl bg-red-500 hover:bg-red-600 text-white border-0">
                                {deletingId === author.id ? 'Deleting…' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
              <UserCheck className="w-10 h-10 text-gray-200" />
              <p className="text-sm font-medium">{search ? 'No authors match your search' : 'No authors yet'}</p>
              {!search && <Link href="/admin/authors/new" className="text-xs text-indigo-600 hover:underline">Add your first author →</Link>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
