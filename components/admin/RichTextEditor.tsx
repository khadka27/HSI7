'use client';

import { useEditor, EditorContent, Editor, NodeViewWrapper, NodeViewProps, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Node as TiptapNode, mergeAttributes } from '@tiptap/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, Code, Minus, AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Image as ImageIcon, Undo, Redo, Type,
} from 'lucide-react';

// ── Resizable Image Node View ─────────────────────────────────────────────────
function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, alt, width, align } = node.attrs as {
    src: string; alt: string; width: string; align: string;
  };

  const wrapperClass = align === 'center'
    ? 'flex justify-center'
    : align === 'right'
    ? 'flex justify-end'
    : 'flex justify-start';

  return (
    <NodeViewWrapper className={`my-3 ${wrapperClass}`}>
      <div className={`relative inline-block group ${selected ? 'ring-2 ring-amber-400 rounded-lg' : ''}`}>
        <img
          src={src}
          alt={alt || ''}
          style={{ width: width || 'auto', maxWidth: '100%', display: 'block', borderRadius: '8px' }}
        />
        {/* Floating toolbar — shows on select */}
        {selected && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gray-900 text-white rounded-lg px-2 py-1 shadow-xl z-10 whitespace-nowrap">
            {/* Alignment */}
            {(['left', 'center', 'right'] as const).map(a => (
              <button key={a} type="button" title={`Align ${a}`}
                onClick={() => updateAttributes({ align: a })}
                className={`p-1 rounded transition-colors ${align === a ? 'bg-amber-500' : 'hover:bg-gray-700'}`}>
                {a === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                {a === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                {a === 'right' && <AlignRight className="w-3.5 h-3.5" />}
              </button>
            ))}
            <div className="w-px h-4 bg-gray-600 mx-0.5" />
            {/* Size presets */}
            {[['25%','XS'],['50%','S'],['75%','M'],['100%','Full']].map(([w, label]) => (
              <button key={w} type="button" title={`Width ${w}`}
                onClick={() => updateAttributes({ width: w })}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${width === w ? 'bg-amber-500' : 'hover:bg-gray-700'}`}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

// ── Custom Image Extension with resize + align ────────────────────────────────

const ResizableImage = TiptapNode.create({
  name: 'resizableImage',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src:   { default: null },
      alt:   { default: '' },
      width: { default: '100%' },
      align: { default: 'left' },
    };
  },

  parseHTML() {
    return [{ tag: 'img[src]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { align, width, ...rest } = HTMLAttributes;
    const wrapStyle = align === 'center' ? 'text-align:center' : align === 'right' ? 'text-align:right' : 'text-align:left';
    return ['div', { style: wrapStyle }, ['img', mergeAttributes(rest, { style: `width:${width};max-width:100%;border-radius:8px;`, loading: 'lazy' })]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

// ── Slash command menu items ──────────────────────────────────────────────────
const SLASH_COMMANDS = [
  { id: 'h1',        label: 'Heading 1',      desc: 'Large section heading',   icon: '𝗛𝟭', keys: ['/h1'] },
  { id: 'h2',        label: 'Heading 2',      desc: 'Medium section heading',  icon: '𝗛𝟮', keys: ['/h2'] },
  { id: 'h3',        label: 'Heading 3',      desc: 'Small section heading',   icon: '𝗛𝟯', keys: ['/h3'] },
  { id: 'bullet',    label: 'Bullet List',    desc: 'Unordered list',          icon: '•',  keys: ['/bullet', '/ul'] },
  { id: 'ordered',   label: 'Numbered List',  desc: 'Ordered list',            icon: '1.', keys: ['/ordered', '/ol'] },
  { id: 'blockquote',label: 'Quote',          desc: 'Blockquote',              icon: '❝',  keys: ['/quote'] },
  { id: 'code',      label: 'Code Block',     desc: 'Code snippet',            icon: '<>', keys: ['/code'] },
  { id: 'divider',   label: 'Divider',        desc: 'Horizontal rule',         icon: '—',  keys: ['/divider', '/hr'] },
  { id: 'link',      label: 'Link',           desc: 'Insert a hyperlink',      icon: '🔗', keys: ['/link'] },
  { id: 'image',     label: 'Image',          desc: 'Insert image with alt',   icon: '🖼', keys: ['/image'] },
  { id: 'button',    label: 'Button',         desc: 'Insert a CTA button',     icon: '⬛', keys: ['/button'] },
  { id: 'review',    label: 'Review Card',    desc: 'User review with rating', icon: '★',  keys: ['/review'] },
];

// ── Toolbar button ────────────────────────────────────────────────────────────
function ToolBtn({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        active
          ? 'bg-gray-900 text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

// ── Toolbar ───────────────────────────────────────────────────────────────────
function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Enter URL:', prev ?? 'https://');
    if (url === null) return;
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run();
  };

  const insertImage = () => {
    const url = window.prompt('Image URL:');
    if (!url) return;
    const alt = window.prompt('Alt text (for accessibility):') ?? '';
    editor.chain().focus().insertContent({
      type: 'resizableImage',
      attrs: { src: url, alt, width: '100%', align: 'left' },
    }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-xl">
      {/* History */}
      <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo className="w-3.5 h-3.5" /></ToolBtn>
      <div className="w-px h-4 bg-gray-300 mx-1" />

      {/* Headings */}
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1"><Heading1 className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 className="w-3.5 h-3.5" /></ToolBtn>
      <div className="w-px h-4 bg-gray-300 mx-1" />

      {/* Inline marks */}
      <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code"><Code className="w-3.5 h-3.5" /></ToolBtn>
      <div className="w-px h-4 bg-gray-300 mx-1" />

      {/* Alignment */}
      <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left"><AlignLeft className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center"><AlignCenter className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right"><AlignRight className="w-3.5 h-3.5" /></ToolBtn>
      <div className="w-px h-4 bg-gray-300 mx-1" />

      {/* Lists & blocks */}
      <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list"><List className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list"><ListOrdered className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><Quote className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block"><Type className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus className="w-3.5 h-3.5" /></ToolBtn>
      <div className="w-px h-4 bg-gray-300 mx-1" />

      {/* Link & Image */}
      <ToolBtn onClick={setLink} active={editor.isActive('link')} title="Insert link"><LinkIcon className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn onClick={insertImage} title="Insert image"><ImageIcon className="w-3.5 h-3.5" /></ToolBtn>
    </div>
  );
}

// ── Slash command menu ────────────────────────────────────────────────────────
function SlashMenu({
  query, position, onSelect, onClose,
}: {
  query: string;
  position: { top: number; left: number };
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [active, setActive] = useState(0);
  const filtered = SLASH_COMMANDS.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.keys.some(k => k.includes(query.toLowerCase()))
  );

  useEffect(() => { setActive(0); }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter')     { e.preventDefault(); if (filtered[active]) onSelect(filtered[active].id); }
      if (e.key === 'Escape')    { onClose(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active, filtered, onSelect, onClose]);

  if (!filtered.length) return null;

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-xl w-72 overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
        Insert block
      </div>
      <div className="max-h-72 overflow-y-auto py-1">
        {filtered.map((cmd, i) => (
          <button
            key={cmd.id}
            type="button"
            onMouseDown={e => { e.preventDefault(); onSelect(cmd.id); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
              i === active ? 'bg-amber-50 text-amber-900' : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-sm font-bold flex-shrink-0">
              {cmd.icon}
            </span>
            <div>
              <div className="text-sm font-medium">{cmd.label}</div>
              <div className="text-xs text-gray-400">{cmd.desc}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="px-3 py-2 border-t border-gray-100 text-xs text-gray-400">
        ↑↓ navigate · Enter select · Esc close
      </div>
    </div>
  );
}

// ── Link dialog ───────────────────────────────────────────────────────────────
function LinkDialog({ onInsert, onClose }: { onInsert: (href: string, text: string) => void; onClose: () => void }) {
  const [href, setHref] = useState('https://');
  const [text, setText] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-96 space-y-4">
        <h3 className="font-semibold text-gray-900">Insert Link</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
          <input value={href} onChange={e => setHref(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="https://example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link text (optional)</label>
          <input value={text} onChange={e => setText(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Click here" />
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button type="button" onClick={() => onInsert(href, text)} className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium">Insert</button>
        </div>
      </div>
    </div>
  );
}

// ── Image dialog ──────────────────────────────────────────────────────────────
function ImageDialog({ onInsert, onClose }: { onInsert: (src: string, alt: string) => void; onClose: () => void }) {
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', 'content');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) setSrc(data.url);
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-96 space-y-4">
        <h3 className="font-semibold text-gray-900">Insert Image</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload from device</label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-amber-400 hover:text-amber-600 transition-colors">
            {uploading ? 'Uploading…' : '📁 Click to upload image'}
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Or image URL</label>
          <input value={src} onChange={e => setSrc(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="https://..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Alt text <span className="text-red-500">*</span></label>
          <input value={alt} onChange={e => setAlt(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Describe the image for accessibility" />
        </div>
        {src && <img src={src} alt={alt} className="w-full h-32 object-cover rounded-lg border border-gray-200" />}
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button type="button" onClick={() => { if (src) onInsert(src, alt); }} disabled={!src}
            className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg font-medium">Insert</button>
        </div>
      </div>
    </div>
  );
}

// ── Button dialog ─────────────────────────────────────────────────────────────
function ButtonDialog({ onInsert, onClose }: { onInsert: (label: string, href: string, style: string) => void; onClose: () => void }) {
  const [label, setLabel] = useState('Click here');
  const [href, setHref] = useState('https://');
  const [style, setStyle] = useState('primary');

  const styles = [
    { value: 'primary',      label: 'Primary',        preview: 'bg-emerald-600 text-white' },
    { value: 'amber',        label: 'Amber',           preview: 'bg-amber-500 text-white' },
    { value: 'secondary',    label: 'Outline',         preview: 'bg-transparent text-emerald-600 border-2 border-emerald-600' },
    { value: 'dark',         label: 'Dark',            preview: 'bg-slate-900 text-white' },
    { value: 'primary-pill', label: 'Primary Pill',    preview: 'bg-emerald-600 text-white rounded-full' },
    { value: 'amber-pill',   label: 'Amber Pill',      preview: 'bg-amber-500 text-white rounded-full' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[420px] space-y-4">
        <h3 className="font-semibold text-gray-900">Insert Button</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Button label</label>
          <input value={label} onChange={e => setLabel(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
          <input value={href} onChange={e => setHref(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
          <div className="grid grid-cols-3 gap-2">
            {styles.map(s => (
              <button key={s.value} type="button" onClick={() => setStyle(s.value)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${s.preview} ${style === s.value ? 'border-amber-400 ring-2 ring-amber-300' : 'border-transparent'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        {/* Live preview */}
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <span className="text-xs text-gray-400 block mb-2">Preview</span>
          <span className={`inline-block px-5 py-2.5 rounded-xl text-sm font-bold ${styles.find(s => s.value === style)?.preview}`}>
            {label || 'Button'}
          </span>
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button type="button" onClick={() => onInsert(label, href, style)} className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium">Insert</button>
        </div>
      </div>
    </div>
  );
}

// ── Review dialog ─────────────────────────────────────────────────────────────
function ReviewDialog({ onInsert, onClose }: {
  onInsert: (data: { name: string; location: string; rating: number; text: string; date: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hovered, setHovered] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[480px] max-w-[95vw] space-y-4">
        <h3 className="font-semibold text-gray-900 text-base">Insert Review Card</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Reviewer Name <span className="text-red-500">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="John D." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
            <input value={location} onChange={e => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="New York, USA" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Rating</label>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(star => (
                <button key={star} type="button"
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                  className="text-2xl leading-none transition-transform hover:scale-110">
                  <span className={(hovered || rating) >= star ? 'text-amber-400' : 'text-gray-200'}>★</span>
                </button>
              ))}
              <span className="text-sm text-gray-500 ml-1">{rating}/5</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Review Text <span className="text-red-500">*</span></label>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            placeholder="Share your experience with this product…" />
        </div>

        {/* Live preview */}
        {(name || text) && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Preview</p>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {name ? name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{name || 'Reviewer'}</p>
                    {location && <p className="text-xs text-gray-400">{location}</p>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-amber-400 text-sm">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</div>
                  {date && <p className="text-xs text-gray-400 mt-0.5">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>}
                </div>
              </div>
              {text && <p className="text-sm text-gray-600 leading-relaxed">{text}</p>}
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button type="button" disabled={!name || !text}
            onClick={() => onInsert({ name, location, rating, text, date })}
            className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-lg font-medium">
            Insert Review
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────────────────────────
interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = 'Type \'/\' for commands…' }: RichTextEditorProps) {
  const [slashMenu, setSlashMenu] = useState<{ query: string; pos: { top: number; left: number } } | null>(null);
  const [slashStart, setSlashStart] = useState<number | null>(null);
  const [dialog, setDialog] = useState<'link' | 'image' | 'button' | 'review' | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false, underline: false, link: false }),
      Heading.configure({ levels: [1, 2, 3] }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } }),
      ResizableImage,
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
  });

  // Sync external value changes (e.g. when editing an existing product)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  // Detect "/" key to open slash menu
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!editor) return;

    if (e.key === '/') {
      const { from } = editor.state.selection;
      setSlashStart(from);
      // Get caret position for menu placement
      const domSel = window.getSelection();
      if (domSel && domSel.rangeCount > 0) {
        const range = domSel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSlashMenu({ query: '', pos: { top: rect.bottom + 8, left: rect.left } });
      }
    }

    if (slashMenu) {
      if (e.key === 'Backspace') {
        const newQuery = slashMenu.query.slice(0, -1);
        if (newQuery === '' && slashStart !== null) {
          setSlashMenu(null);
          setSlashStart(null);
        } else {
          setSlashMenu(m => m ? { ...m, query: newQuery } : null);
        }
      } else if (e.key.length === 1 && e.key !== '/') {
        setSlashMenu(m => m ? { ...m, query: m.query + e.key } : null);
      }
    }
  }, [editor, slashMenu, slashStart]);

  const closeSlash = useCallback(() => {
    setSlashMenu(null);
    setSlashStart(null);
  }, []);

  const executeCommand = useCallback((id: string) => {
    if (!editor) return;

    // Delete the slash + query text
    if (slashStart !== null) {
      const { from } = editor.state.selection;
      editor.chain().focus().deleteRange({ from: slashStart, to: from }).run();
    }

    closeSlash();

    switch (id) {
      case 'h1': editor.chain().focus().toggleHeading({ level: 1 }).run(); break;
      case 'h2': editor.chain().focus().toggleHeading({ level: 2 }).run(); break;
      case 'h3': editor.chain().focus().toggleHeading({ level: 3 }).run(); break;
      case 'bullet': editor.chain().focus().toggleBulletList().run(); break;
      case 'ordered': editor.chain().focus().toggleOrderedList().run(); break;
      case 'blockquote': editor.chain().focus().toggleBlockquote().run(); break;
      case 'code': editor.chain().focus().toggleCodeBlock().run(); break;
      case 'divider': editor.chain().focus().setHorizontalRule().run(); break;
      case 'link': setDialog('link'); break;
      case 'image': setDialog('image'); break;
      case 'button': setDialog('button'); break;
      case 'review': setDialog('review'); break;
    }
  }, [editor, slashStart, closeSlash]);

  const insertLink = (href: string, text: string) => {
    if (!editor) return;
    setDialog(null);
    if (text) {
      editor.chain().focus().insertContent(`<a href="${href}" target="_blank">${text}</a>`).run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href, target: '_blank' }).run();
    }
  };

  const insertImage = (src: string, alt: string) => {
    if (!editor) return;
    setDialog(null);
    editor.chain().focus().insertContent({
      type: 'resizableImage',
      attrs: { src, alt, width: '100%', align: 'left' },
    }).run();
  };

  const insertReview = (data: { name: string; location: string; rating: number; text: string; date: string }) => {
    if (!editor) return;
    setDialog(null);
    const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating);
    const initial = data.name.charAt(0).toUpperCase();
    const formattedDate = data.date
      ? new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '';
    const html = `
<div class="review-card">
  <div class="review-card-header">
    <div class="review-card-avatar">${initial}</div>
    <div class="review-card-meta">
      <span class="review-card-name">${data.name}</span>
      ${data.location ? `<span class="review-card-location">${data.location}</span>` : ''}
    </div>
    <div class="review-card-right">
      <div class="review-card-stars">${stars}</div>
      ${formattedDate ? `<span class="review-card-date">${formattedDate}</span>` : ''}
    </div>
  </div>
  <p class="review-card-text">${data.text}</p>
  <div class="review-card-badge">Verified Purchase</div>
</div>`;
    editor.chain().focus().insertContent(html).run();
  };

  const insertButton = (label: string, href: string, style: string) => {    if (!editor) return;
    setDialog(null);
    const classMap: Record<string, string> = {
      primary:   'btn btn-primary',
      amber:     'btn btn-amber',
      secondary: 'btn btn-secondary',
      dark:      'btn btn-dark',
      'primary-pill':   'btn btn-primary btn-pill',
      'amber-pill':     'btn btn-amber btn-pill',
    };
    const cls = classMap[style] || 'btn btn-primary';
    editor.chain().focus().insertContent(
      `<p><a href="${href}" target="_blank" class="${cls}">${label}</a></p>`
    ).run();
  };

  if (!editor) return null;

  return (
    <div className="relative">
      <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-transparent transition-all">
        <Toolbar editor={editor} />
        <div ref={editorRef} onKeyDown={handleKeyDown} className="bg-white">
          <EditorContent editor={editor} />
        </div>
        <div className="px-4 py-1.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
          Type <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-mono">/</kbd> for commands · <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-mono">Ctrl+B</kbd> bold · <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-mono">Ctrl+I</kbd> italic
        </div>
      </div>

      {/* Slash command menu */}
      {slashMenu && (
        <SlashMenu
          query={slashMenu.query}
          position={slashMenu.pos}
          onSelect={executeCommand}
          onClose={closeSlash}
        />
      )}

      {/* Dialogs */}
      {dialog === 'link'   && <LinkDialog   onInsert={insertLink}   onClose={() => setDialog(null)} />}
      {dialog === 'image'  && <ImageDialog  onInsert={insertImage}  onClose={() => setDialog(null)} />}
      {dialog === 'button' && <ButtonDialog onInsert={insertButton} onClose={() => setDialog(null)} />}
      {dialog === 'review' && <ReviewDialog onInsert={insertReview} onClose={() => setDialog(null)} />}
    </div>
  );
}
