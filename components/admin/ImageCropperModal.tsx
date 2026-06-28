import React, { useState, useRef, useEffect } from "react";
import { X, Crop, Move, RefreshCw } from "lucide-react";

interface ImageCropperModalProps {
  src: string;
  onCrop: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropperModal({
  src,
  onCrop,
  onCancel,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 10, y: 10, w: 80, h: 80 });
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{
    type: "move" | "tl" | "tr" | "bl" | "br" | null;
    startX: number;
    startY: number;
    startCrop: { x: number; y: number; w: number; h: number };
  }>({
    type: null,
    startX: 0,
    startY: 0,
    startCrop: { x: 0, y: 0, w: 0, h: 0 },
  });

  const handleImageLoad = () => {
    if (imgRef.current) {
      const { width, height, naturalWidth, naturalHeight } = imgRef.current;
      setDisplaySize({ width, height });
      setNaturalSize({ width: naturalWidth, height: naturalHeight });
      // Reset crop to center, free form initially
      setCrop({ x: 10, y: 10, w: 80, h: 80 });
      setAspectRatio(null);
    }
  };

  // Recalculate display size on window resize
  useEffect(() => {
    const handleResize = () => {
      if (imgRef.current) {
        setDisplaySize({
          width: imgRef.current.width,
          height: imgRef.current.height,
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSetAspect = (aspect: number | null) => {
    setAspectRatio(aspect);
    if (!displaySize.width || !displaySize.height) return;

    if (!aspect) return; // Free form

    // Fits a target box centered within bounds
    let targetW = 80;
    let targetH = (targetW * displaySize.width / displaySize.height) / aspect;

    if (targetH > 80) {
      targetH = 80;
      targetW = (targetH * displaySize.height / displaySize.width) * aspect;
    }

    const targetX = (100 - targetW) / 2;
    const targetY = (100 - targetH) / 2;

    setCrop({ x: targetX, y: targetY, w: targetW, h: targetH });
  };

  const handlePointerDown = (
    e: React.PointerEvent,
    type: "move" | "tl" | "tr" | "bl" | "br"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.target as HTMLElement;
    target.setPointerCapture(e.pointerId);
    dragRef.current = {
      type,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...crop },
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag.type || !displaySize.width || !displaySize.height) return;

    const dx = ((e.clientX - drag.startX) / displaySize.width) * 100;
    const dy = ((e.clientY - drag.startY) / displaySize.height) * 100;

    let newX = drag.startCrop.x;
    let newY = drag.startCrop.y;
    let newW = drag.startCrop.w;
    let newH = drag.startCrop.h;

    const aspect = aspectRatio;

    if (drag.type === "move") {
      newX = Math.max(0, Math.min(100 - newW, drag.startCrop.x + dx));
      newY = Math.max(0, Math.min(100 - newH, drag.startCrop.y + dy));
    } else {
      // Resizing math
      if (drag.type === "br") {
        newW = Math.max(5, Math.min(100 - drag.startCrop.x, drag.startCrop.w + dx));
        if (aspect) {
          newH = (newW * displaySize.width / displaySize.height) / aspect;
          if (newY + newH > 100) {
            newH = 100 - newY;
            newW = (newH * displaySize.height / displaySize.width) * aspect;
          }
        } else {
          newH = Math.max(5, Math.min(100 - drag.startCrop.y, drag.startCrop.h + dy));
        }
      } else if (drag.type === "bl") {
        const maxXChange = drag.startCrop.w + drag.startCrop.x - 5;
        const potentialDx = Math.max(-drag.startCrop.x, Math.min(maxXChange, dx));
        newX = drag.startCrop.x + potentialDx;
        newW = drag.startCrop.w - potentialDx;
        if (aspect) {
          newH = (newW * displaySize.width / displaySize.height) / aspect;
          if (newY + newH > 100) {
            newH = 100 - newY;
            newW = (newH * displaySize.height / displaySize.width) * aspect;
            newX = drag.startCrop.x + (drag.startCrop.w - newW);
          }
        } else {
          newH = Math.max(5, Math.min(100 - drag.startCrop.y, drag.startCrop.h + dy));
        }
      } else if (drag.type === "tr") {
        newW = Math.max(5, Math.min(100 - drag.startCrop.x, drag.startCrop.w + dx));
        const maxYChange = drag.startCrop.h - 5;
        const potentialDy = Math.max(-drag.startCrop.y, Math.min(maxYChange, dy));
        if (aspect) {
          const potentialNewH = (newW * displaySize.width / displaySize.height) / aspect;
          if (drag.startCrop.y + drag.startCrop.h - potentialNewH >= 0) {
            newH = potentialNewH;
            newY = drag.startCrop.y + drag.startCrop.h - newH;
          } else {
            newY = 0;
            newH = drag.startCrop.h + drag.startCrop.y;
            newW = (newH * displaySize.height / displaySize.width) * aspect;
          }
        } else {
          newY = drag.startCrop.y + potentialDy;
          newH = drag.startCrop.h - potentialDy;
        }
      } else if (drag.type === "tl") {
        const maxXChange = drag.startCrop.w - 5;
        const potentialDx = Math.max(-drag.startCrop.x, Math.min(maxXChange, dx));
        newX = drag.startCrop.x + potentialDx;
        newW = drag.startCrop.w - potentialDx;

        if (aspect) {
          newH = (newW * displaySize.width / displaySize.height) / aspect;
          newY = drag.startCrop.y + drag.startCrop.h - newH;
          if (newY < 0) {
            newY = 0;
            newH = drag.startCrop.h + drag.startCrop.y;
            newW = (newH * displaySize.height / displaySize.width) * aspect;
            newX = drag.startCrop.x + (drag.startCrop.w - newW);
          }
        } else {
          const maxYChange = drag.startCrop.h - 5;
          const potentialDy = Math.max(-drag.startCrop.y, Math.min(maxYChange, dy));
          newY = drag.startCrop.y + potentialDy;
          newH = drag.startCrop.h - potentialDy;
        }
      }
    }

    setCrop({ x: newX, y: newY, w: newW, h: newH });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragRef.current.type) {
      const target = e.target as HTMLElement;
      target.releasePointerCapture(e.pointerId);
      dragRef.current.type = null;
    }
  };

  const handleApply = () => {
    if (!imgRef.current || !naturalSize.width || !naturalSize.height) return;

    const img = imgRef.current;
    const canvas = document.createElement("canvas");

    const cropX = (crop.x / 100) * naturalSize.width;
    const cropY = (crop.y / 100) * naturalSize.height;
    const cropW = (crop.w / 100) * naturalSize.width;
    const cropH = (crop.h / 100) * naturalSize.height;

    canvas.width = cropW;
    canvas.height = cropH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    canvas.toBlob(
      (blob) => {
        if (blob) onCrop(blob);
      },
      "image/jpeg",
      0.9
    );
  };

  const currentPixelWidth = Math.round((crop.w / 100) * naturalSize.width);
  const currentPixelHeight = Math.round((crop.h / 100) * naturalSize.height);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Crop className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Crop & Resize Image</h3>
              <p className="text-[10px] text-slate-400">Drag bounding box and corners to adjust</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace */}
        <div className="flex-1 bg-slate-950 flex items-center justify-center p-4 min-h-[300px] overflow-auto relative">
          <div
            className="relative select-none"
            style={{
              maxWidth: "100%",
              maxHeight: "60vh",
            }}
          >
            {/* The Image */}
            <img
              ref={imgRef}
              src={src}
              alt="Crop Source"
              onLoad={handleImageLoad}
              className="max-w-full max-h-[60vh] object-contain block pointer-events-none"
            />

            {/* Overlay Cover (Dimmed Area outside crop box) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Top cover */}
              <div
                className="absolute bg-black/60 left-0 top-0 right-0"
                style={{ height: `${crop.y}%` }}
              />
              {/* Bottom cover */}
              <div
                className="absolute bg-black/60 left-0 bottom-0 right-0"
                style={{ height: `${100 - crop.y - crop.h}%` }}
              />
              {/* Left cover */}
              <div
                className="absolute bg-black/60 left-0"
                style={{
                  top: `${crop.y}%`,
                  height: `${crop.h}%`,
                  width: `${crop.x}%`,
                }}
              />
              {/* Right cover */}
              <div
                className="absolute bg-black/60 right-0"
                style={{
                  top: `${crop.y}%`,
                  height: `${crop.h}%`,
                  width: `${100 - crop.x - crop.w}%`,
                }}
              />
            </div>

            {/* Crop Box Drag & Resize Element */}
            <div
              className="absolute border border-dashed border-white shadow-[0_0_0_4000px_rgba(0,0,0,0)] flex cursor-move group"
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.w}%`,
                height: `${crop.h}%`,
              }}
              onPointerDown={(e) => handlePointerDown(e, "move")}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {/* Grid Lines for crop rule-of-thirds */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity">
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-white" />
                <div className="border-r border-white" />
                <div className="div" />
              </div>

              {/* Drag Indicator (Center) */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <Move className="w-5 h-5 text-white/50" />
              </div>

              {/* Corner Handles */}
              {/* Top-Left */}
              <div
                className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border border-slate-700 rounded-full cursor-nwse-resize active:scale-125 transition-transform"
                onPointerDown={(e) => handlePointerDown(e, "tl")}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              />
              {/* Top-Right */}
              <div
                className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border border-slate-700 rounded-full cursor-nesw-resize active:scale-125 transition-transform"
                onPointerDown={(e) => handlePointerDown(e, "tr")}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              />
              {/* Bottom-Left */}
              <div
                className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border border-slate-700 rounded-full cursor-nesw-resize active:scale-125 transition-transform"
                onPointerDown={(e) => handlePointerDown(e, "bl")}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              />
              {/* Bottom-Right */}
              <div
                className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border border-slate-700 rounded-full cursor-nwse-resize active:scale-125 transition-transform"
                onPointerDown={(e) => handlePointerDown(e, "br")}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              />
            </div>
          </div>
        </div>

        {/* Toolbar & Footer */}
        <div className="bg-slate-50 px-6 py-5 border-t border-slate-100 space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Aspect Ratios */}
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-slate-400 mr-1.5 uppercase tracking-wider text-[9px]">Aspect Ratio:</span>
              <button
                type="button"
                onClick={() => handleSetAspect(null)}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  aspectRatio === null
                    ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Free Form
              </button>
              <button
                type="button"
                onClick={() => handleSetAspect(1)}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  aspectRatio === 1
                    ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Square (1:1)
              </button>
              <button
                type="button"
                onClick={() => handleSetAspect(16 / 9)}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  aspectRatio === 16 / 9
                    ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Landscape (16:9)
              </button>
              <button
                type="button"
                onClick={() => handleSetAspect(1200 / 680)}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  aspectRatio === 1200 / 680
                    ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Featured (1200×680)
              </button>
            </div>

            {/* Pixel Size Info */}
            <div className="px-3 py-1.5 bg-slate-200/50 rounded-xl font-mono text-xs text-slate-700 font-semibold">
              Crop size: {currentPixelWidth} × {currentPixelHeight} px
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-md active:translate-y-0.5 hover:-translate-y-0.5 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Crop className="w-4 h-4" /> Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
