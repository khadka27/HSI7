"use client";

// Simple image compression using canvas (no external dependencies)
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Downscale if too large; keep images comfortably below request limits.
        const maxDimension = 1600;
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.drawImage(img, 0, 0, width, height);

        const mimeCandidates = ["image/webp", "image/jpeg"] as const;

        const encode = (
          mimeType: (typeof mimeCandidates)[number],
          quality: number,
        ) =>
          new Promise<Blob | null>((resolveBlob) => {
            canvas.toBlob((blob) => resolveBlob(blob), mimeType, quality);
          });

        const tryCompress = async () => {
          for (const mimeType of mimeCandidates) {
            let quality = 0.82;
            while (quality >= 0.2) {
              const blob = await encode(mimeType, quality);
              if (blob && blob.size <= 100 * 1024) {
                resolve(blob);
                return;
              }
              if (blob && quality <= 0.2) {
                resolve(blob);
                return;
              }
              quality = Number((quality - 0.1).toFixed(2));
            }
          }

          const fallback = await encode("image/jpeg", 0.2);
          resolve(fallback || file);
        };

        void tryCompress();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function getCompressedFileName(fileName: string, mimeType: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  const extension = mimeType === "image/webp" ? "webp" : "jpg";
  return `${baseName}.${extension}`;
}

import {
  useEditor,
  EditorContent,
  Editor,
  NodeViewWrapper,
  NodeViewProps,
  ReactNodeViewRenderer,
  NodeViewRendererProps,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Node as TiptapNode, mergeAttributes } from "@tiptap/react";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Type,
  FlaskConical,
  Search,
  Pencil,
  Trash2,
  GripVertical,
} from "lucide-react";

// ── Resizable Image Node View ─────────────────────────────────────────────────
function ResizableImageView({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) {
  const { src, alt, width, align } = node.attrs as {
    src: string;
    alt: string;
    width: string;
    align: string;
  };

  const wrapperClass =
    align === "center"
      ? "flex justify-center"
      : align === "right"
        ? "flex justify-end"
        : "flex justify-start";

  return (
    <NodeViewWrapper className={`my-3 w-full ${wrapperClass}`}>
      <div
        className={`relative group ${selected ? "ring-2 ring-amber-400 rounded-lg" : ""}`}
        style={{ display: "block" }}
      >
        <img
          src={src}
          alt={alt || ""}
          style={{
            width: width || "auto",
            maxWidth: "100%",
            display: "block",
            borderRadius: "8px",
          }}
        />
        {/* Floating toolbar — shows on select */}
        {selected && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gray-900 text-white rounded-lg px-2 py-1 shadow-xl z-10 whitespace-nowrap">
            {/* Alignment */}
            {(["left", "center", "right"] as const).map((a) => (
              <button
                key={a}
                type="button"
                title={`Align ${a}`}
                onClick={() => updateAttributes({ align: a })}
                className={`p-1 rounded transition-colors ${align === a ? "bg-amber-500" : "hover:bg-gray-700"}`}
              >
                {a === "left" && <AlignLeft className="w-3.5 h-3.5" />}
                {a === "center" && <AlignCenter className="w-3.5 h-3.5" />}
                {a === "right" && <AlignRight className="w-3.5 h-3.5" />}
              </button>
            ))}
            <div className="w-px h-4 bg-gray-600 mx-0.5" />
            {/* Size presets */}
            {[
              ["25%", "XS"],
              ["50%", "S"],
              ["75%", "M"],
              ["100%", "Full"],
            ].map(([w, label]) => (
              <button
                key={w}
                type="button"
                title={`Width ${w}`}
                onClick={() => updateAttributes({ width: w })}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${width === w ? "bg-amber-500" : "hover:bg-gray-700"}`}
              >
                {label}
              </button>
            ))}
            <div className="w-px h-4 bg-gray-600 mx-0.5" />
            <label className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-300">
              Width
              <input
                type="text"
                value={width}
                onChange={(e) => updateAttributes({ width: e.target.value })}
                className="w-20 rounded-md border border-gray-700 bg-gray-800 px-1.5 py-0.5 text-[10px] font-medium text-white outline-none placeholder:text-gray-500"
                placeholder="100%"
              />
            </label>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

// ── Custom Image Extension with resize + align ────────────────────────────────

// ── Raw HTML block — preserves arbitrary HTML including inline styles ─────────
const RawHTML = TiptapNode.create({
  name: "rawHTML",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      html: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-raw-html]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-raw-html": "true" }, HTMLAttributes),
    ];
  },

  addNodeView() {
    return (props: NodeViewRendererProps) => {
      const dom = document.createElement("div");
      dom.setAttribute("data-raw-html", "true");
      dom.style.cssText = "display:block;width:100%;overflow:visible;";
      dom.innerHTML = props.node.attrs.html;
      return { dom };
    };
  },
});

const ResizableImage = TiptapNode.create({
  name: "resizableImage",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
      width: { default: "100%" },
      align: { default: "left" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (el) => {
          if (typeof el === "string" || !(el instanceof HTMLElement))
            return false;
          // alignment is stored on wrapper div as text-align in renderHTML
          let align = "left";
          const parent = el.parentElement;
          if (parent) {
            const ta = parent.style && parent.style.textAlign;
            if (ta === "center") align = "center";
            else if (ta === "right") align = "right";
          }

          // extract width from style attribute or width attr
          let width = el.getAttribute("width") || "";
          const style = el.getAttribute("style") || "";
          const m = style.match(/width\s*:\s*([^;]+)\s*;?/i);
          if (m && m[1]) width = m[1].trim();
          if (!width) width = "100%";

          return {
            src: el.getAttribute("src") || null,
            alt: el.getAttribute("alt") || "",
            width,
            align,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { align, width, ...rest } = HTMLAttributes;
    // Wrapper uses text-align for legacy cases, but ensure the <img> is block-level
    // and uses auto margins when centered so it also centers in previews and static HTML.
    const wrapStyle =
      align === "center"
        ? "text-align:center"
        : align === "right"
          ? "text-align:right"
          : "text-align:left";

    const imgStyleBase = `width:${width};max-width:100%;border-radius:8px;display:block;`;
    const imgStyle =
      align === "center" ? imgStyleBase + "margin:0 auto;" : imgStyleBase;

    return [
      "div",
      { style: wrapStyle },
      [
        "img",
        mergeAttributes(rest, {
          style: imgStyle,
          loading: "lazy",
        }),
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

// ── Review Card Node View (editor preview) ────────────────────────────────────
function ReviewCardView({ node, selected }: NodeViewProps) {
  const { name, location, rating, text, date } = node.attrs as {
    name: string;
    location: string;
    rating: number;
    text: string;
    date: string;
  };

  const stars = rating || 5;
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <NodeViewWrapper>
      <div
        className={`review-card my-3 select-none ${selected ? "ring-2 ring-amber-400 ring-offset-2" : ""}`}
        contentEditable={false}
        style={{ userSelect: "none" }}
      >
        <div className="review-card-header">
          <div className="review-card-avatar">{initial}</div>
          <div className="review-card-meta">
            <span className="review-card-name">{name || "Reviewer"}</span>
            {location && (
              <span className="review-card-location">📍 {location}</span>
            )}
          </div>
          <div className="review-card-right">
            <div className="review-card-stars">
              {"★".repeat(stars)}
              <span style={{ color: "#e5e7eb" }}>{"★".repeat(5 - stars)}</span>
            </div>
            {formattedDate && (
              <span className="review-card-date">{formattedDate}</span>
            )}
          </div>
        </div>
        <p className="review-card-text">{text}</p>
        <div className="review-card-badge">✓ Verified Purchase</div>
      </div>
    </NodeViewWrapper>
  );
}

// ── Review Card Tiptap Extension ──────────────────────────────────────────────
const ReviewCard = TiptapNode.create({
  name: "reviewCard",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      name: { default: "" },
      location: { default: "" },
      rating: { default: 5 },
      text: { default: "" },
      date: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "div.review-card[data-name]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { name, location, rating, text, date } = HTMLAttributes;
    const stars =
      "★".repeat(Number(rating) || 5) + "☆".repeat(5 - (Number(rating) || 5));
    const initial = (name as string)?.charAt(0)?.toUpperCase() || "?";
    const formattedDate = date
      ? new Date(date as string).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "";

    return [
      "div",
      {
        class: "review-card",
        "data-name": name || "",
        "data-location": location || "",
        "data-rating": String(rating || 5),
        "data-text": text || "",
        "data-date": date || "",
      },
      [
        "div",
        { class: "review-card-header" },
        ["div", { class: "review-card-avatar" }, initial],
        [
          "div",
          { class: "review-card-meta" },
          ["span", { class: "review-card-name" }, name || ""],
          ...(location
            ? [
                [
                  "span",
                  { class: "review-card-location" },
                  `📍 ${location}`,
                ] as [string, Record<string, string>, string],
              ]
            : []),
        ],
        [
          "div",
          { class: "review-card-right" },
          ["div", { class: "review-card-stars" }, stars],
          ...(formattedDate
            ? [
                ["span", { class: "review-card-date" }, formattedDate] as [
                  string,
                  Record<string, string>,
                  string,
                ],
              ]
            : []),
        ],
      ],
      ["p", { class: "review-card-text" }, text || ""],
      ["div", { class: "review-card-badge" }, "✓ Verified Purchase"],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ReviewCardView);
  },
});

// ── Ingredients List Node View (editor preview) ───────────────────────────────
function IngredientListView({ node, selected }: NodeViewProps) {
  const { ingredients } = node.attrs as {
    ingredients: { id: string; name: string; image: string }[];
  };

  return (
    <NodeViewWrapper>
      <div
        className={`my-6 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden select-none ${selected ? "ring-2 ring-amber-400" : ""}`}
        contentEditable={false}
      >
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">
            Active Ingredients
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {ingredients?.map((ing) => (
              <div key={ing.id} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                  <img
                    src={ing.image || "/ingredient-placeholder.png"}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-700 text-center line-clamp-2">
                  {ing.name}
                </span>
              </div>
            ))}
          </div>
          {(!ingredients || ingredients.length === 0) && (
            <p className="text-center text-xs text-gray-400 italic">
              No ingredients selected.
            </p>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}

const IngredientList = TiptapNode.create({
  name: "ingredientList",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      ingredients: { default: [] },
    };
  },

  parseHTML() {
    return [{ tag: "div.ingredient-list-block" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { ingredients } = HTMLAttributes as {
      ingredients: { id: string; name: string; image: string }[];
    };
    return [
      "div",
      {
        class: "ingredient-list-block",
        "data-ingredients": JSON.stringify(ingredients),
      },
      ["h3", { class: "text-lg font-bold mb-4" }, "Key Ingredients"],
      [
        "div",
        {
          class:
            "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4",
        },
        ...(ingredients || []).map((ing) => [
          "div",
          { class: "flex flex-col items-center gap-2" },
          [
            "img",
            {
              src: ing.image || "",
              class: "w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover",
            },
          ],
          [
            "span",
            {
              class:
                "text-xs sm:text-sm font-semibold text-gray-700 text-center line-clamp-2",
            },
            ing.name,
          ],
        ]),
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(IngredientListView);
  },
});

// ── Slash command menu items ──────────────────────────────────────────────────
const SLASH_COMMANDS = [
  {
    id: "h1",
    label: "Heading 1",
    desc: "Large section heading",
    icon: "𝗛𝟭",
    keys: ["/h1"],
  },
  {
    id: "h2",
    label: "Heading 2",
    desc: "Medium section heading",
    icon: "𝗛𝟮",
    keys: ["/h2"],
  },
  {
    id: "h3",
    label: "Heading 3",
    desc: "Small section heading",
    icon: "𝗛𝟯",
    keys: ["/h3"],
  },
  {
    id: "bullet",
    label: "Bullet List",
    desc: "Unordered list",
    icon: "•",
    keys: ["/bullet", "/ul"],
  },
  {
    id: "ordered",
    label: "Numbered List",
    desc: "Ordered list",
    icon: "1.",
    keys: ["/ordered", "/ol"],
  },
  {
    id: "blockquote",
    label: "Quote",
    desc: "Blockquote",
    icon: "❝",
    keys: ["/quote"],
  },
  {
    id: "code",
    label: "Code Block",
    desc: "Code snippet",
    icon: "<>",
    keys: ["/code"],
  },
  {
    id: "divider",
    label: "Divider",
    desc: "Horizontal rule",
    icon: "—",
    keys: ["/divider", "/hr"],
  },
  {
    id: "link",
    label: "Link",
    desc: "Insert a hyperlink",
    icon: "🔗",
    keys: ["/link"],
  },
  {
    id: "image",
    label: "Image",
    desc: "Insert image with alt",
    icon: "🖼",
    keys: ["/image"],
  },
  {
    id: "button",
    label: "Button",
    desc: "Insert a CTA button",
    icon: "⬛",
    keys: ["/button"],
  },
  {
    id: "review",
    label: "Review Card",
    desc: "User review with rating",
    icon: "★",
    keys: ["/review"],
  },
  {
    id: "productcard",
    label: "Product Cards",
    desc: "Product cards with image/specs",
    icon: "▦",
    keys: ["/productcard", "/card"],
  },
  {
    id: "ingredient",
    label: "Ingredients",
    desc: "Choose ingredients list",
    icon: "🧪",
    keys: ["/ingredient", "/ing"],
  },
];

// ── Toolbar button ────────────────────────────────────────────────────────────
function ToolBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        active
          ? "bg-gray-900 text-white"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

// ── Toolbar ───────────────────────────────────────────────────────────────────
function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL:", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url, target: "_blank" })
      .run();
  };

  const insertImage = () => {
    const url = window.prompt("Image URL:");
    if (!url) return;
    const alt = window.prompt("Alt text (for accessibility):") ?? "";
    editor
      .chain()
      .focus()
      .insertContent({
        type: "resizableImage",
        attrs: { src: url, alt, width: "100%", align: "left" },
      })
      .run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-xl">
      {/* History */}
      <ToolBtn
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo className="w-3.5 h-3.5" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo className="w-3.5 h-3.5" />
      </ToolBtn>
      <div className="w-px h-4 bg-gray-300 mx-1" />

      {/* Headings */}
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="w-3.5 h-3.5" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="w-3.5 h-3.5" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="w-3.5 h-3.5" />
      </ToolBtn>
      <div className="w-px h-4 bg-gray-300 mx-1" />

      {/* Inline marks */}
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold"
      >
        <Bold className="w-3.5 h-3.5" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic"
      >
        <Italic className="w-3.5 h-3.5" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Underline"
      >
        <UnderlineIcon className="w-3.5 h-3.5" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title="Inline code"
      >
        <Code className="w-3.5 h-3.5" />
      </ToolBtn>
      <div className="w-px h-4 bg-gray-300 mx-1" />

      {/* Alignment */}
      <ToolBtn
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        title="Align left"
      >
        <AlignLeft className="w-3.5 h-3.5" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        title="Align center"
      >
        <AlignCenter className="w-3.5 h-3.5" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        title="Align right"
      >
        <AlignRight className="w-3.5 h-3.5" />
      </ToolBtn>
      <div className="w-px h-4 bg-gray-300 mx-1" />

      {/* Lists & blocks */}
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet list"
      >
        <List className="w-3.5 h-3.5" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Numbered list"
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote className="w-3.5 h-3.5" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        title="Code block"
      >
        <Type className="w-3.5 h-3.5" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Divider"
      >
        <Minus className="w-3.5 h-3.5" />
      </ToolBtn>
      <div className="w-px h-4 bg-gray-300 mx-1" />

      {/* Link & Image */}
      <ToolBtn
        onClick={setLink}
        active={editor.isActive("link")}
        title="Insert link"
      >
        <LinkIcon className="w-3.5 h-3.5" />
      </ToolBtn>
      <ToolBtn onClick={insertImage} title="Insert image">
        <ImageIcon className="w-3.5 h-3.5" />
      </ToolBtn>
    </div>
  );
}

// ── Slash command menu ────────────────────────────────────────────────────────
function SlashMenu({
  query,
  position,
  onSelect,
  onClose,
}: {
  query: string;
  position: { top: number; left: number };
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [active, setActive] = useState(0);
  const filtered = SLASH_COMMANDS.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.keys.some((k) => k.includes(query.toLowerCase())),
  );

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[active]) onSelect(filtered[active].id);
      }
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
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
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(cmd.id);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
              i === active
                ? "bg-amber-50 text-amber-900"
                : "hover:bg-gray-50 text-gray-700"
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
function LinkDialog({
  onInsert,
  onClose,
}: {
  onInsert: (href: string, text: string) => void;
  onClose: () => void;
}) {
  const [href, setHref] = useState("https://");
  const [text, setText] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-96 space-y-4">
        <h3 className="font-semibold text-gray-900">Insert Link</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL
          </label>
          <input
            value={href}
            onChange={(e) => setHref(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="https://example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link text (optional)
          </label>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Click here"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onInsert(href, text)}
            className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium"
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Image dialog ──────────────────────────────────────────────────────────────
function ImageDialog({
  onInsert,
  onClose,
}: {
  onInsert: (src: string, alt: string) => void;
  onClose: () => void;
}) {
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowed.includes(file.type)) {
      alert("Only JPEG, PNG, WebP, or GIF allowed.");
      return;
    }

    setUploading(true);
    try {
      // Compress image client-side targeting ~100KB
      let compressedFile = file;
      try {
        const compressedBlob = await compressImage(file);
        compressedFile = new File(
          [compressedBlob],
          getCompressedFileName(file.name, compressedBlob.type),
          {
            type: compressedBlob.type,
          },
        );
        console.log(
          `Compressed: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB`,
        );
      } catch (compErr) {
        console.warn("Compression failed, proceeding with original:", compErr);
        compressedFile = file;
      }

      const fd = new FormData();
      fd.append("file", compressedFile);
      fd.append("type", "content");
      const res = await fetch("/api/upload", { method: "POST", body: fd });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Upload failed (${res.status}): ${errorText.substring(0, 100)}`,
        );
      }

      const data = await res.json();
      if (data.url) setSrc(data.url);
      else throw new Error("No URL in response");
    } catch (err) {
      console.error("Upload error:", err);
      alert(
        `Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-96 space-y-4">
        <h3 className="font-semibold text-gray-900">Insert Image</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload from device
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-amber-400 hover:text-amber-600 transition-colors"
          >
            {uploading ? "Uploading…" : "📁 Click to upload image"}
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Or image URL
          </label>
          <input
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alt text <span className="text-red-500">*</span>
          </label>
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Describe the image for accessibility"
          />
        </div>
        {src && (
          <img
            src={src}
            alt={alt}
            className="w-full h-32 object-cover rounded-lg border border-gray-200"
          />
        )}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (src) onInsert(src, alt);
            }}
            disabled={!src}
            className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg font-medium"
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Button dialog ─────────────────────────────────────────────────────────────
function ButtonDialog({
  onInsert,
  onClose,
}: {
  onInsert: (label: string, href: string, style: string) => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState("Click here");
  const [href, setHref] = useState("https://");
  const [style, setStyle] = useState("primary");

  const styles = [
    { value: "primary", label: "Primary", preview: "bg-blue-600 text-white" },
    { value: "amber", label: "Amber", preview: "bg-amber-500 text-white" },
    {
      value: "secondary",
      label: "Outline",
      preview: "bg-transparent text-blue-600 border-2 border-blue-600",
    },
    { value: "dark", label: "Dark", preview: "bg-slate-900 text-white" },
    {
      value: "primary-pill",
      label: "Primary Pill",
      preview: "bg-blue-600 text-white rounded-full",
    },
    {
      value: "amber-pill",
      label: "Amber Pill",
      preview: "bg-amber-500 text-white rounded-full",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[420px] space-y-4">
        <h3 className="font-semibold text-gray-900">Insert Button</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Button label
          </label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link URL
          </label>
          <input
            value={href}
            onChange={(e) => setHref(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Style
          </label>
          <div className="grid grid-cols-3 gap-2">
            {styles.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStyle(s.value)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${s.preview} ${style === s.value ? "border-amber-400 ring-2 ring-amber-300" : "border-transparent"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        {/* Live preview */}
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <span className="text-xs text-gray-400 block mb-2">Preview</span>
          <span
            className={`inline-block px-5 py-2.5 rounded-xl text-sm font-bold ${styles.find((s) => s.value === style)?.preview}`}
          >
            {label || "Button"}
          </span>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onInsert(label, href, style)}
            className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium"
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Review dialog ─────────────────────────────────────────────────────────────
function ReviewDialog({
  onInsert,
  onClose,
}: {
  onInsert: (data: {
    name: string;
    location: string;
    rating: number;
    text: string;
    date: string;
  }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [hovered, setHovered] = useState(0);

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const displayRating = hovered || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
              <span className="text-white text-sm font-bold">★</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                Insert Review Card
              </h3>
              <p className="text-xs text-gray-500">
                Add a customer testimonial to your content
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors text-lg font-light"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* ── Left: Form ── */}
          <div className="p-6 space-y-4 border-r border-gray-100">
            {/* Name & Location */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Reviewer Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="Sarah K."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Location
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="New York, USA"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(star)}
                    className="text-3xl leading-none transition-all duration-100 hover:scale-125 focus:outline-none"
                    style={{
                      filter:
                        displayRating >= star
                          ? "drop-shadow(0 0 6px rgba(245,158,11,0.5))"
                          : "none",
                    }}
                  >
                    <span
                      className={`transition-colors ${displayRating >= star ? "text-amber-400" : "text-gray-200"}`}
                    >
                      ★
                    </span>
                  </button>
                ))}
                <span className="text-sm font-semibold text-gray-500 ml-2 bg-gray-100 px-2.5 py-0.5 rounded-full">
                  {rating}/5
                </span>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Review Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Review Text <span className="text-red-500">*</span>
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none bg-gray-50 focus:bg-white leading-relaxed"
                placeholder="Share your experience with this product…"
              />
              <p className="text-xs text-gray-400 mt-1">
                {text.length} characters
              </p>
            </div>
          </div>

          {/* ── Right: Live Preview ── */}
          <div className="p-6 bg-gray-50/60 flex flex-col">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Live Preview
            </p>

            {/* Preview Card — mirrors .review-card exactly */}
            <div className="flex-1 flex items-start">
              <div
                className="w-full bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden relative"
                style={{
                  background:
                    "radial-gradient(circle at top right, rgba(16,185,129,0.04), transparent 40%), radial-gradient(circle at bottom left, rgba(245,158,11,0.04), transparent 40%) #ffffff",
                }}
              >
                {/* Top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />

                <div className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-md"
                      style={{ transform: "rotate(-3deg)" }}
                    >
                      {name ? name.charAt(0).toUpperCase() : "?"}
                    </div>
                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 leading-tight">
                        {name || (
                          <span className="text-gray-300 italic font-normal">
                            Reviewer name…
                          </span>
                        )}
                      </p>
                      {location && (
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <span>📍</span> {location}
                        </p>
                      )}
                    </div>
                    {/* Stars + Date */}
                    <div className="text-right flex-shrink-0">
                      <div
                        className="text-amber-400 text-sm tracking-widest"
                        style={{ fontFamily: "serif" }}
                      >
                        {"★".repeat(rating)}
                        <span className="text-gray-200">
                          {"★".repeat(5 - rating)}
                        </span>
                      </div>
                      {formattedDate && (
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">
                          {formattedDate}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Review text */}
                  <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 min-h-[48px]">
                    <p className="text-sm text-gray-600 leading-relaxed italic">
                      {text || (
                        <span className="text-gray-300 not-italic">
                          Review text will appear here…
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Badge */}
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-full w-fit">
                    <span className="w-3.5 h-3.5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-black">
                      ✓
                    </span>
                    Verified Purchase
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 text-center mt-4">
              This is how the review card will appear in your article
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-400">
            {!name && !text
              ? "Fill in name and review text to insert"
              : !name
                ? "⚠ Name is required"
                : !text
                  ? "⚠ Review text is required"
                  : "✓ Ready to insert"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!name || !text}
              onClick={() => onInsert({ name, location, rating, text, date })}
              className="px-5 py-2 text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-md shadow-amber-200 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              ★ Insert Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Ingredients dialog ────────────────────────────────────────────────────────
function IngredientDialog({
  onInsert,
  onClose,
}: {
  onInsert: (items: { id: string; name: string; image: string }[]) => void;
  onClose: () => void;
}) {
  const [ingredients, setIngredients] = useState<
    { id: string; name: string; image: string }[]
  >([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/ingredients")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setIngredients(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = ingredients.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (id: string) => {
    setSelectedIds((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center text-white">
              🧪
            </div>
            <h3 className="font-bold text-gray-900">Select Ingredients</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ingredients…"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
            />
          </div>

          <div className="max-h-72 overflow-y-auto grid grid-cols-2 gap-2 pr-1 custom-scrollbar">
            {loading ? (
              <div className="col-span-2 py-8 text-center text-gray-400 text-sm animate-pulse">
                Loading ingredients…
              </div>
            ) : filtered.length === 0 ? (
              <div className="col-span-2 py-8 text-center text-gray-400 text-sm italic">
                No ingredients found.
              </div>
            ) : (
              filtered.map((ing) => (
                <button
                  key={ing.id}
                  type="button"
                  onClick={() => toggle(ing.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all text-left ${
                    selectedIds.includes(ing.id)
                      ? "border-amber-400 bg-amber-50 ring-2 ring-amber-100"
                      : "border-gray-100 hover:border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-white overflow-hidden border border-gray-200 flex-shrink-0">
                    <img
                      src={ing.image || "/ingredient-placeholder.png"}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-800 truncate">
                      {ing.name}
                    </div>
                    <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                      {selectedIds.includes(ing.id)
                        ? "✓ Selected"
                        : "Click to add"}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-400">
            {selectedIds.length} ingredients selected
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={() =>
                onInsert(ingredients.filter((i) => selectedIds.includes(i.id)))
              }
              className="px-6 py-2 text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl font-bold shadow-md transition-all"
            >
              Insert List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Product Card Dialog ───────────────────────────────────────────────────────
interface ProductCardItem {
  id: string;
  name: string;
  image: string;
  imageAlt: string;
  rating: number;
  specs: string; // newline-separated key:value pairs
  description: string;
  price: string;
  buyLink: string;
}

function escapeHtml(text: string): string {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Escape for embedding in a double-quoted HTML attribute */
function escapeAttr(text: string): string {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}

function parseCardsJson(raw: string | undefined): ProductCardItem[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as ProductCardItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildProductCardsHtml(cards: ProductCardItem[]): string {
  const jsonAttr = escapeAttr(JSON.stringify(cards));
  if (!cards.length) {
    return `<div class="pc-grid" data-product-cards="${jsonAttr}"><div class="pc-card"><div class="pc-body"><p class="text-sm text-gray-500 m-0">No products in this block.</p></div></div></div>`;
  }
  const cardHTML = cards
    .map((card, idx) => {
      const stars = "★".repeat(card.rating) + "☆".repeat(5 - card.rating);
      const specRows = card.specs
        ? card.specs
            .split("\n")
            .filter(Boolean)
            .map((line) => {
              const [label, ...rest] = line.split(":");
              const value = rest.join(":").trim();
              const L = escapeHtml(label.trim());
              const V = escapeHtml(value);
              return value
                ? `<tr><td class="pc-spec-label">${L}</td><td class="pc-spec-value">${V}</td></tr>`
                : `<tr><td class="pc-spec-label" colspan="2">${L}</td></tr>`;
            })
            .join("")
        : "";

      const imgBlock = card.image
        ? `<div class="pc-image-wrap"><img class="pc-image" src="${escapeHtml(card.image)}" alt="${escapeHtml(card.imageAlt || card.name)}" loading="lazy" /></div>`
        : "";

      const priceBlock = card.price
        ? `<span class="pc-price">${escapeHtml(card.price)}</span>`
        : "";

      const descBlock = card.description
        ? `<p class="pc-desc">${escapeHtml(card.description)}</p>`
        : "";

      const specsBlock = specRows
        ? `<table class="pc-specs"><tbody>${specRows}</tbody></table>`
        : "";

      const buyBlock = card.buyLink
        ? `<a href="${escapeHtml(card.buyLink)}" class="pc-btn" target="_blank" rel="noopener noreferrer">Check Price</a>`
        : "";

      return `<div class="pc-card">
<div class="pc-rank">#${idx + 1}</div>
${imgBlock}
<div class="pc-body">
  <div class="pc-name">${escapeHtml(card.name)}</div>
  <div class="pc-stars">
    <span class="pc-stars-icons">${stars}</span>
    <span class="pc-rating-num">${card.rating}/5</span>
    ${priceBlock}
  </div>
  ${descBlock}
  ${specsBlock}
  ${buyBlock}
</div>
</div>`;
    })
    .join("");

  return `<div class="pc-grid" data-product-cards="${jsonAttr}">${cardHTML}</div>`;
}

/** TipTap renderHTML / ProseMirror DOM spec for one product card */
function oneCardDom(card: ProductCardItem, idx: number): unknown {
  const stars = "★".repeat(card.rating) + "☆".repeat(5 - card.rating);
  const rows: unknown[] = [];
  if (card.specs) {
    for (const line of card.specs.split("\n").filter(Boolean)) {
      const [label, ...rest] = line.split(":");
      const value = rest.join(":").trim();
      const L = escapeHtml(label.trim());
      const V = escapeHtml(value);
      if (value) {
        rows.push([
          "tr",
          {},
          ["td", { class: "pc-spec-label" }, L],
          ["td", { class: "pc-spec-value" }, V],
        ]);
      } else {
        rows.push([
          "tr",
          {},
          ["td", { class: "pc-spec-label", colspan: "2" }, L],
        ]);
      }
    }
  }

  const starsRow: unknown[] = [
    "div",
    { class: "pc-stars" },
    ["span", { class: "pc-stars-icons" }, stars],
    ["span", { class: "pc-rating-num" }, `${card.rating}/5`],
  ];
  if (card.price)
    starsRow.push(["span", { class: "pc-price" }, escapeHtml(card.price)]);

  const bodyChildren: unknown[] = [
    ["div", { class: "pc-name" }, escapeHtml(card.name)],
    starsRow,
  ];
  if (card.description) {
    bodyChildren.push([
      "p",
      { class: "pc-desc" },
      escapeHtml(card.description),
    ]);
  }
  if (rows.length) {
    bodyChildren.push(["table", { class: "pc-specs" }, ["tbody", {}, ...rows]]);
  }
  if (card.buyLink) {
    bodyChildren.push([
      "a",
      {
        class: "pc-btn",
        href: card.buyLink,
        target: "_blank",
        rel: "noopener noreferrer",
      },
      "Check Price",
    ]);
  }

  const parts: unknown[] = [["div", { class: "pc-rank" }, `#${idx + 1}`]];
  if (card.image) {
    parts.push([
      "div",
      { class: "pc-image-wrap" },
      [
        "img",
        {
          class: "pc-image",
          src: card.image,
          alt: card.imageAlt || card.name || "",
          loading: "lazy",
        },
      ],
    ]);
  }
  parts.push(["div", { class: "pc-body" }, ...bodyChildren]);

  return ["div", { class: "pc-card" }, ...parts];
}

function ProductCardGridView({
  node,
  updateAttributes,
  selected,
  deleteNode,
}: NodeViewProps) {
  const [editing, setEditing] = useState(false);
  const cards = useMemo(
    () => parseCardsJson(node.attrs.cardsJson as string | undefined),
    [node.attrs.cardsJson],
  );
  const html = useMemo(() => buildProductCardsHtml(cards), [cards]);

  return (
    <NodeViewWrapper className="my-4 block w-full max-w-full">
      <div
        className={`relative rounded-xl border bg-white overflow-hidden ${
          selected
            ? "border-amber-400 ring-2 ring-amber-300/60"
            : "border-gray-200"
        }`}
      >
        <div
          className="flex items-center gap-1.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
          contentEditable={false}
          data-drag-handle
        >
          <GripVertical
            className="w-3.5 h-3.5 text-gray-400 shrink-0 cursor-grab active:cursor-grabbing"
            aria-hidden
          />
          Product cards
        </div>
        <div
          className="p-2 sm:p-3"
          contentEditable={false}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {selected && (
          <div className="absolute top-9 right-2 flex gap-1.5 z-20">
            <button
              type="button"
              title="Edit cards"
              className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 shadow-sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setEditing(true)}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Remove block"
              className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => deleteNode()}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
      {editing && (
        <ProductCardDialog
          mode="edit"
          initialCards={cards}
          onClose={() => setEditing(false)}
          onInsert={(next) => {
            updateAttributes({
              cardsJson: JSON.stringify(next.filter((c) => c.name.trim())),
            });
            setEditing(false);
          }}
        />
      )}
    </NodeViewWrapper>
  );
}

const ProductCardGrid = TiptapNode.create({
  name: "productCardGrid",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      cardsJson: { default: "[]" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div.pc-grid[data-product-cards]",
        getAttrs: (el) => {
          if (typeof el === "string" || !(el instanceof HTMLElement))
            return false;
          const raw = el.getAttribute("data-product-cards");
          if (raw == null || raw === "") return false;
          return { cardsJson: raw };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    let cards: ProductCardItem[] = [];
    try {
      cards = JSON.parse((node.attrs.cardsJson as string) || "[]");
    } catch {
      cards = [];
    }
    const json = (node.attrs.cardsJson as string) || "[]";
    const childSpecs: unknown[] = cards.length
      ? cards.map((c, i) => oneCardDom(c, i))
      : [
          [
            "div",
            { class: "pc-card" },
            [
              "div",
              { class: "pc-body" },
              [
                "p",
                { class: "text-sm text-gray-500 m-0" },
                "No products in this block.",
              ],
            ],
          ],
        ];
    return [
      "div",
      mergeAttributes(
        { class: "pc-grid", "data-product-cards": json },
        HTMLAttributes,
      ),
      ...childSpecs,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ProductCardGridView);
  },
});

function ProductCardDialog({
  onInsert,
  onClose,
  initialCards,
  mode = "insert",
}: {
  onInsert: (cards: ProductCardItem[]) => void;
  onClose: () => void;
  initialCards?: ProductCardItem[];
  mode?: "insert" | "edit";
}) {
  const [cards, setCards] = useState<ProductCardItem[]>(() =>
    initialCards?.length
      ? initialCards.map((c, i) => ({ ...c, id: c.id || `c-${i}` }))
      : [
          {
            id: "1",
            name: "",
            image: "",
            imageAlt: "",
            rating: 5,
            specs: "",
            description: "",
            price: "",
            buyLink: "",
          },
        ],
  );
  const [activeCard, setActiveCard] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addCard = () => {
    const newCard: ProductCardItem = {
      id: Date.now().toString(),
      name: "",
      image: "",
      imageAlt: "",
      rating: 5,
      specs: "",
      description: "",
      price: "",
      buyLink: "",
    };
    setCards((p) => [...p, newCard]);
    setActiveCard(cards.length);
  };

  const removeCard = (idx: number) => {
    if (cards.length === 1) return;
    setCards((p) => p.filter((_, i) => i !== idx));
    setActiveCard(Math.max(0, idx - 1));
  };

  const updateCard = (
    idx: number,
    key: keyof ProductCardItem,
    value: string | number,
  ) => {
    setCards((p) => p.map((c, i) => (i === idx ? { ...c, [key]: value } : c)));
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", "productcard");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) updateCard(activeCard, "image", data.url);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const card = cards[activeCard];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            {mode === "edit" ? "Edit product cards" : "Product Cards"}
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addCard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              + Add Card
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Card tabs */}
        <div className="flex gap-1 px-4 pt-3 overflow-x-auto">
          {cards.map((c, i) => (
            <div key={c.id} className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveCard(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeCard === i
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {c.name || `Card ${i + 1}`}
              </button>
              {cards.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCard(i)}
                  className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-red-500 text-xs"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Card form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Product Name *
              </label>
              <input
                value={card.name}
                onChange={(e) => updateCard(activeCard, "name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Optimum Nutrition Gold Standard Whey"
              />
            </div>

            {/* Image upload */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Product Image
              </label>
              <div className="flex gap-2">
                <input
                  value={card.image}
                  onChange={(e) =>
                    updateCard(activeCard, "image", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="https://... or upload below"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                >
                  {uploading ? "…" : "Upload"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadImage(f);
                  }}
                />
              </div>
              {card.image && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={card.image}
                    alt=""
                    className="w-16 h-12 object-cover rounded-lg border border-gray-200"
                  />
                  <input
                    value={card.imageAlt}
                    onChange={(e) =>
                      updateCard(activeCard, "imageAlt", e.target.value)
                    }
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="Alt text (required for SEO)"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Rating (1–5)
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateCard(activeCard, "rating", s)}
                    className={`text-xl leading-none transition-transform hover:scale-110 ${card.rating >= s ? "text-amber-400" : "text-gray-200"}`}
                  >
                    ★
                  </button>
                ))}
                <span className="text-xs text-gray-500 ml-1">
                  {card.rating}/5
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Price
              </label>
              <input
                value={card.price}
                onChange={(e) =>
                  updateCard(activeCard, "price", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="$29.99"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Specs / Key Features
                <span className="ml-1 font-normal text-gray-400">
                  One per line, use "Label: Value" format
                </span>
              </label>
              <textarea
                value={card.specs}
                onChange={(e) =>
                  updateCard(activeCard, "specs", e.target.value)
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                placeholder={
                  "Protein: 25g per serving\nCalories: 120\nFlavors: 20+\nServings: 74"
                }
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Short Description
              </label>
              <textarea
                value={card.description}
                onChange={(e) =>
                  updateCard(activeCard, "description", e.target.value)
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                placeholder="Best overall whey protein for muscle building and recovery…"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Buy Now Link
              </label>
              <input
                type="url"
                value={card.buyLink}
                onChange={(e) =>
                  updateCard(activeCard, "buyLink", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Preview */}
          {card.name && (
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Preview
              </p>
              <div className="bg-white rounded-xl border border-gray-100 p-3 flex gap-3 shadow-sm">
                {card.image && (
                  <img
                    src={card.image}
                    alt={card.imageAlt}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{card.name}</p>
                  <div className="text-amber-400 text-xs mt-0.5">
                    {"★".repeat(card.rating)}
                    {"☆".repeat(5 - card.rating)}
                  </div>
                  {card.price && (
                    <p className="text-emerald-600 font-bold text-sm mt-0.5">
                      {card.price}
                    </p>
                  )}
                  {card.description && (
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                      {card.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {cards.length} card{cards.length !== 1 ? "s" : ""}
            {mode === "edit"
              ? " · save to update the article"
              : " · full-width list in the article"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!card.name.trim()}
              onClick={() => onInsert(cards.filter((c) => c.name.trim()))}
              className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-lg font-medium"
            >
              {mode === "edit"
                ? "Save changes"
                : `Insert ${cards.filter((c) => c.name.trim()).length || cards.length} Card${cards.length !== 1 ? "s" : ""}`}
            </button>
          </div>
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

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Type '/' for commands…",
}: RichTextEditorProps) {
  const [slashMenu, setSlashMenu] = useState<{
    query: string;
    pos: { top: number; left: number };
  } | null>(null);
  const [slashStart, setSlashStart] = useState<number | null>(null);
  const [dialog, setDialog] = useState<
    "link" | "image" | "button" | "review" | "productcard" | "ingredient" | null
  >(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        underline: false,
        link: false,
      }),
      Heading.configure({ levels: [1, 2, 3] }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      ResizableImage,
      RawHTML,
      ReviewCard,
      ProductCardGrid,
      IngredientList,
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3",
      },
    },
  });

  // Sync external value changes (e.g. when editing an existing product)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  // Detect "/" key to open slash menu
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!editor) return;

      if (e.key === "/") {
        const { from } = editor.state.selection;
        setSlashStart(from);
        // Get caret position for menu placement
        const domSel = window.getSelection();
        if (domSel && domSel.rangeCount > 0) {
          const range = domSel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSlashMenu({
            query: "",
            pos: { top: rect.bottom + 8, left: rect.left },
          });
        }
      }

      if (slashMenu) {
        if (e.key === "Backspace") {
          const newQuery = slashMenu.query.slice(0, -1);
          if (newQuery === "" && slashStart !== null) {
            setSlashMenu(null);
            setSlashStart(null);
          } else {
            setSlashMenu((m) => (m ? { ...m, query: newQuery } : null));
          }
        } else if (e.key.length === 1 && e.key !== "/") {
          setSlashMenu((m) => (m ? { ...m, query: m.query + e.key } : null));
        }
      }
    },
    [editor, slashMenu, slashStart],
  );

  const closeSlash = useCallback(() => {
    setSlashMenu(null);
    setSlashStart(null);
  }, []);

  const executeCommand = useCallback(
    (id: string) => {
      if (!editor) return;

      // Delete the slash + query text
      if (slashStart !== null) {
        const { from } = editor.state.selection;
        editor
          .chain()
          .focus()
          .deleteRange({ from: slashStart, to: from })
          .run();
      }

      closeSlash();

      switch (id) {
        case "h1":
          editor.chain().focus().toggleHeading({ level: 1 }).run();
          break;
        case "h2":
          editor.chain().focus().toggleHeading({ level: 2 }).run();
          break;
        case "h3":
          editor.chain().focus().toggleHeading({ level: 3 }).run();
          break;
        case "bullet":
          editor.chain().focus().toggleBulletList().run();
          break;
        case "ordered":
          editor.chain().focus().toggleOrderedList().run();
          break;
        case "blockquote":
          editor.chain().focus().toggleBlockquote().run();
          break;
        case "code":
          editor.chain().focus().toggleCodeBlock().run();
          break;
        case "divider":
          editor.chain().focus().setHorizontalRule().run();
          break;
        case "link":
          setDialog("link");
          break;
        case "image":
          setDialog("image");
          break;
        case "button":
          setDialog("button");
          break;
        case "review":
          setDialog("review");
          break;
        case "productcard":
          setDialog("productcard");
          break;
        case "ingredient":
          setDialog("ingredient");
          break;
      }
    },
    [editor, slashStart, closeSlash],
  );

  const insertLink = (href: string, text: string) => {
    if (!editor) return;
    setDialog(null);
    if (text) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${href}" target="_blank">${text}</a>`)
        .run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href, target: "_blank" })
        .run();
    }
  };

  const insertImage = (src: string, alt: string) => {
    if (!editor) return;
    setDialog(null);
    editor
      .chain()
      .focus()
      .insertContent({
        type: "resizableImage",
        attrs: { src, alt, width: "100%", align: "left" },
      })
      .run();
  };

  const insertReview = (data: {
    name: string;
    location: string;
    rating: number;
    text: string;
    date: string;
  }) => {
    if (!editor) return;
    setDialog(null);
    const stars = "★".repeat(data.rating) + "☆".repeat(5 - data.rating);
    const initial = data.name.charAt(0).toUpperCase();
    const formattedDate = data.date
      ? new Date(data.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "";
    const html = `<div class="review-card"><div class="review-card-header"><div class="review-card-avatar">${initial}</div><div class="review-card-meta"><span class="review-card-name">${data.name}</span>${data.location ? `<span class="review-card-location">${data.location}</span>` : ""}</div><div class="review-card-right"><div class="review-card-stars">${stars}</div>${formattedDate ? `<span class="review-card-date">${formattedDate}</span>` : ""}</div></div><p class="review-card-text">${data.text}</p><div class="review-card-badge">Verified Purchase</div></div>`;
    editor.chain().focus().insertContent(html).run();
  };

  const insertProductCards = (cards: ProductCardItem[]) => {
    if (!editor) return;
    setDialog(null);
    const filtered = cards.filter((c) => c.name.trim());
    editor
      .chain()
      .focus()
      .insertContent({
        type: "productCardGrid",
        attrs: { cardsJson: JSON.stringify(filtered) },
      })
      .run();
  };

  const insertButton = (label: string, href: string, style: string) => {
    if (!editor) return;
    setDialog(null);
    const classMap: Record<string, string> = {
      primary: "btn btn-primary",
      amber: "btn btn-amber",
      secondary: "btn btn-secondary",
      dark: "btn btn-dark",
      "primary-pill": "btn btn-primary btn-pill",
      "amber-pill": "btn btn-amber btn-pill",
    };
    const cls = classMap[style] || "btn btn-primary";
    editor
      .chain()
      .focus()
      .insertContent(
        `<p><a href="${href}" target="_blank" class="${cls}">${label}</a></p>`,
      )
      .run();
  };

  const insertIngredients = (
    items: { id: string; name: string; image: string }[],
  ) => {
    if (!editor) return;
    setDialog(null);
    editor
      .chain()
      .focus()
      .insertContent({
        type: "ingredientList",
        attrs: { ingredients: items },
      })
      .run();
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
          Type{" "}
          <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-mono">
            /
          </kbd>{" "}
          for commands ·{" "}
          <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-mono">
            Ctrl+B
          </kbd>{" "}
          bold ·{" "}
          <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-mono">
            Ctrl+I
          </kbd>{" "}
          italic
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
      {dialog === "link" && (
        <LinkDialog onInsert={insertLink} onClose={() => setDialog(null)} />
      )}
      {dialog === "image" && (
        <ImageDialog onInsert={insertImage} onClose={() => setDialog(null)} />
      )}
      {dialog === "button" && (
        <ButtonDialog onInsert={insertButton} onClose={() => setDialog(null)} />
      )}
      {dialog === "review" && (
        <ReviewDialog onInsert={insertReview} onClose={() => setDialog(null)} />
      )}
      {dialog === "productcard" && (
        <ProductCardDialog
          onInsert={insertProductCards}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "ingredient" && (
        <IngredientDialog
          onInsert={insertIngredients}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
