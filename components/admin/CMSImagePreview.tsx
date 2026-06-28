import React, { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import { Crop, Trash2, Maximize, Move } from "lucide-react";

interface CMSImagePreviewProps {
  src: string;
  alt?: string;
  initialWidth?: number;
  initialHeight?: number;
  initialX?: number;
  initialY?: number;
  onChange?: (dimensions: { width: number; height: number; x: number; y: number }) => void;
  onRemove?: () => void;
}

// Custom Handle Dot for corners
const HandleDot = ({ position, isSelected }: { position: string; isSelected: boolean }) => {
  if (!isSelected) return null;
  return (
    <div
      className={`w-3.5 h-3.5 bg-blue-600 border-2 border-white rounded-full shadow-md hover:scale-125 transition-transform absolute pointer-events-auto ${
        position === "tl" ? "-top-1.5 -left-1.5 cursor-nwse-resize" :
        position === "tr" ? "-top-1.5 -right-1.5 cursor-nesw-resize" :
        position === "bl" ? "-bottom-1.5 -left-1.5 cursor-nesw-resize" :
        "-bottom-1.5 -right-1.5 cursor-nwse-resize"
      }`}
    />
  );
};

// Custom Handle Bar for edges
const HandleBar = ({ position, isSelected }: { position: string; isSelected: boolean }) => {
  if (!isSelected) return null;
  return (
    <div
      className={`bg-blue-600 border border-white rounded-full shadow-sm hover:bg-blue-700 transition-colors absolute pointer-events-auto ${
        position === "t" ? "-top-1 left-1/2 -translate-x-1/2 w-8 h-2 cursor-n-resize" :
        position === "b" ? "-bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 cursor-s-resize" :
        position === "l" ? "top-1/2 -translate-y-1/2 -left-1 w-2 h-8 cursor-w-resize" :
        "top-1/2 -translate-y-1/2 -right-1 w-2 h-8 cursor-e-resize"
      }`}
    />
  );
};

export default function CMSImagePreview({
  src,
  alt = "Preview",
  initialWidth = 320,
  initialHeight = 240,
  initialX = 40,
  initialY = 40,
  onChange,
  onRemove,
}: CMSImagePreviewProps) {
  const [isSelected, setIsSelected] = useState(false);
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const containerRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  // Click outside to deselect
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        parentRef.current &&
        !parentRef.current.contains(e.target as Node)
      ) {
        setIsSelected(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSelected(true);
  };

  return (
    <div
      ref={parentRef}
      className="space-y-3 w-full"
    >
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span className="uppercase tracking-wider">CMS Live Resize Preview</span>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-mono">
            {size.width} × {size.height} px
          </span>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
              title="Remove image"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Boundary Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[400px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center pattern-grid"
        onClick={() => setIsSelected(false)}
      >
        <Rnd
          size={{ width: size.width, height: size.height }}
          position={{ x: position.x, y: position.y }}
          bounds="parent"
          onDragStop={(e, d) => {
            setPosition({ x: d.x, y: d.y });
            onChange?.({ width: size.width, height: size.height, x: d.x, y: d.y });
          }}
          onResize={(e, direction, ref, delta, pos) => {
            setSize({
              width: ref.offsetWidth,
              height: ref.offsetHeight,
            });
            setPosition(pos);
          }}
          onResizeStop={(e, direction, ref, delta, pos) => {
            const finalSize = {
              width: ref.offsetWidth,
              height: ref.offsetHeight,
            };
            setSize(finalSize);
            setPosition(pos);
            onChange?.({ ...finalSize, x: pos.x, y: pos.y });
          }}
          disableDragging={!isSelected}
          enableResizing={isSelected}
          resizeHandleComponent={{
            topLeft: <HandleDot position="tl" isSelected={isSelected} />,
            topRight: <HandleDot position="tr" isSelected={isSelected} />,
            bottomLeft: <HandleDot position="bl" isSelected={isSelected} />,
            bottomRight: <HandleDot position="br" isSelected={isSelected} />,
            top: <HandleBar position="t" isSelected={isSelected} />,
            right: <HandleBar position="r" isSelected={isSelected} />,
            bottom: <HandleBar position="b" isSelected={isSelected} />,
            left: <HandleBar position="l" isSelected={isSelected} />,
          }}
          className={`flex items-center justify-center transition-shadow select-none ${
            isSelected ? "ring-2 ring-blue-500 rounded-lg shadow-2xl z-30" : "hover:ring-1 hover:ring-slate-700"
          }`}
        >
          {/* Inner Image container */}
          <div
            className="w-full h-full relative cursor-pointer group"
            onClick={handleSelect}
          >
            {/* Drag Handle Indicator */}
            {isSelected && (
              <div className="absolute top-1.5 left-1.5 bg-blue-600/90 text-white rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 select-none pointer-events-none shadow-md z-10 animate-fade-in">
                <Move className="w-2.5 h-2.5" /> Drag to move
              </div>
            )}
            <img
              src={src}
              alt={alt}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              className="w-full h-full object-fill block select-none pointer-events-none rounded-lg"
            />
          </div>
        </Rnd>
      </div>

      <style jsx global>{`
        .pattern-grid {
          background-size: 20px 20px;
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
}
