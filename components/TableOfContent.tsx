'use client';

import { useEffect, useState, useRef } from 'react';
import { List, ChevronDown, ChevronUp } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface Props {
  contentSelector?: string;
}

export default function TableOfContents({ contentSelector = '.product-content' }: Props) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [open, setOpen] = useState(false); // mobile toggle
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Parse headings from the rendered content
  useEffect(() => {
    const container = document.querySelector(contentSelector);
    if (!container) return;

    const headings = Array.from(container.querySelectorAll('h1, h2, h3')) as HTMLElement[];
    const tocItems: TocItem[] = headings.map((el, i) => {
      // Assign id if missing
      if (!el.id) {
        el.id = `toc-${i}-${el.textContent?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') ?? i}`;
      }
      return {
        id: el.id,
        text: el.textContent ?? '',
        level: parseInt(el.tagName.replace('H', '')),
      };
    });

    setItems(tocItems);
  }, [contentSelector]);

  // Highlight active heading on scroll
  useEffect(() => {
    if (items.length === 0) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          // Pick the topmost visible heading
          const topmost = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          setActiveId(topmost.target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    items.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [items]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 90;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
    setOpen(false);
  };

  if (items.length < 2) return null;

  return (
    <>
      {/* ── Desktop sidebar TOC ── */}
      <nav className="hidden xl:block sticky top-24 self-start">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-blue-500 to-teal-500" />
          <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
            <List className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">Contents</span>
          </div>
          <ul className="py-2 px-2 space-y-0.5 max-h-[60vh] overflow-y-auto">
            {items.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => scrollTo(item.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all duration-150 ${
                    item.level === 3 ? 'pl-6' : ''
                  } ${
                    activeId === item.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {item.level === 3 && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-50 align-middle" />
                  )}
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ── Mobile collapsible TOC ── */}
      <div className="xl:hidden mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-blue-500 to-teal-500" />
          <button
            onClick={() => setOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-900"
          >
            <span className="flex items-center gap-2">
              <List className="w-4 h-4 text-blue-600" />
              Table of Contents
            </span>
            {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {open && (
            <ul className="pb-3 px-2 space-y-0.5 border-t border-gray-50">
              {items.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollTo(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      item.level === 3 ? 'pl-6' : ''
                    } ${
                      activeId === item.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item.level === 3 && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-50 align-middle" />
                    )}
                    {item.text}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
