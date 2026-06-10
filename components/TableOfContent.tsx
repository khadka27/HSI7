'use client';

import { useEffect, useRef, useState } from 'react';
import { List, ChevronDown } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface Props {
  contentSelector?: string;
}

export default function TableOfContents({
  contentSelector = '.product-content',
}: Props) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [open, setOpen] = useState(false); // closed by default on ALL sizes
  const observerRef = useRef<IntersectionObserver | null>(null);

  /* ── Parse headings ── */
  useEffect(() => {
    const container = document.querySelector(contentSelector);
    if (!container) return;

    const headings = Array.from(
      container.querySelectorAll('h1, h2, h3'),
    ) as HTMLElement[];

    const tocItems: TocItem[] = headings.map((el, i) => {
      if (!el.id) {
        el.id = `toc-${i}-${
          el.textContent
            ?.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '') ?? i
        }`;
      }
      return {
        id: el.id,
        text: el.textContent ?? '',
        level: parseInt(el.tagName.replace('H', '')),
      };
    });

    setItems(tocItems);
  }, [contentSelector]);

  /* ── Highlight active heading on scroll ── */
  useEffect(() => {
    if (items.length === 0) return;
    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const topmost = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
          );
          setActiveId(topmost.target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [items]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top, behavior: 'smooth' });
    setOpen(false); // collapse after navigation on any screen
  };

  if (items.length < 2) return null;

  return (
    <nav className="sticky top-24 self-start mb-6 xl:mb-0">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Accent bar */}
        <div className="h-0.5 bg-gradient-to-r from-blue-500 to-teal-500" />

        {/* Toggle header — always visible */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="toc-list"
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <List className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Contents</span>
          </span>
          <ChevronDown
            className="w-4 h-4 text-gray-400 transition-transform duration-300"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>

        {/* Collapsible list — smooth grid animation */}
        <div
          id="toc-list"
          style={{
            display: 'grid',
            gridTemplateRows: open ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.28s ease',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflow: 'hidden', minHeight: 0 }}>
            <ul className="py-2 px-2 space-y-0.5 max-h-[60vh] overflow-y-auto border-t border-gray-50">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollTo(item.id)}
                    className={[
                      'w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all duration-150',
                      item.level === 3 ? 'pl-6' : '',
                      activeId === item.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50',
                    ]
                      .filter(Boolean)
                      .join(' ')}
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
        </div>
      </div>
    </nav>
  );
}
