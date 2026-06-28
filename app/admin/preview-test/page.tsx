"use client";

import { useState } from "react";
import CMSImagePreview from "@/components/admin/CMSImagePreview";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Sliders, RefreshCw } from "lucide-react";

export default function PreviewTestPage() {
  const [imageUrl, setImageUrl] = useState<string>(
    "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=800&auto=format&fit=crop&q=80"
  );
  const [dimensions, setDimensions] = useState({
    width: 320,
    height: 240,
    x: 40,
    y: 40,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setDimensions({
      width: 320,
      height: 240,
      x: 40,
      y: 40,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col gap-3">
          <Link
            href="/admin/products"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Image Resizer Playground
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Upload or use a preset image to test real-time canvas resizing
              </p>
            </div>
          </div>
        </div>

        {/* Control Center & Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Sidebar Settings Panel */}
          <div className="md:col-span-1 space-y-5 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-800">
              <Sliders className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold">Resizer Controls</h3>
            </div>

            {/* Upload form */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Upload Test Image
              </label>
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Or Preset Images
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setImageUrl(
                      "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=800&auto=format&fit=crop&q=80"
                    )
                  }
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-[10px] font-semibold transition-colors border border-slate-200"
                >
                  Landscape
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setImageUrl(
                      "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&auto=format&fit=crop&q=80"
                    )
                  }
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-[10px] font-semibold transition-colors border border-slate-200"
                >
                  Vintage
                </button>
              </div>
            </div>

            {/* Dimension State Values */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                State Variables (Preserved)
              </label>
              <div className="bg-slate-50 rounded-2xl p-3.5 font-mono text-[10px] text-slate-600 space-y-1.5">
                <div className="flex justify-between">
                  <span>Width:</span>
                  <span className="font-semibold text-slate-900">{dimensions.width}px</span>
                </div>
                <div className="flex justify-between">
                  <span>Height:</span>
                  <span className="font-semibold text-slate-900">{dimensions.height}px</span>
                </div>
                <div className="flex justify-between">
                  <span>Offset X:</span>
                  <span className="font-semibold text-slate-900">{dimensions.x}px</span>
                </div>
                <div className="flex justify-between">
                  <span>Offset Y:</span>
                  <span className="font-semibold text-slate-900">{dimensions.y}px</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-1.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Layout
            </button>
          </div>

          {/* Preview Container */}
          <div className="md:col-span-2 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-800">
              <ImageIcon className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold">Interactive Sandbox</h3>
            </div>

            <CMSImagePreview
              src={imageUrl}
              alt="Demo Resizer"
              initialWidth={dimensions.width}
              initialHeight={dimensions.height}
              initialX={dimensions.x}
              initialY={dimensions.y}
              onChange={(d) => setDimensions(d)}
            />

            <p className="text-[10px] text-slate-400 text-center">
              💡 Click on the image to activate handles and border. Drag the corners/edges to resize, and drag the body to reposition inside the bounding box. Click outside to deselect.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
