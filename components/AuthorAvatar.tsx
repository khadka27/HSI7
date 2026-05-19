"use client";

import { useState } from "react";
import Image from "next/image";

interface AuthorAvatarProps {
  src?: string | null;
  name: string;
  alt?: string;
  className?: string;
}

export default function AuthorAvatar({
  src,
  name,
  alt,
  className = "",
}: AuthorAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const imageSrc = src || "";
  const showImage = Boolean(imageSrc) && !imageFailed;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {showImage ? (
        <Image
          src={imageSrc}
          alt={alt || name}
          fill
          className="object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 to-slate-200 text-slate-500 font-black">
          {initial}
        </div>
      )}
    </div>
  );
}
