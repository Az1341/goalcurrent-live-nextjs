"use client";

import { useState } from "react";
import RemoteImage from "@/components/ui/RemoteImage";
import {
  sanitizeRemoteImageUrl,
  upgradeRemoteNewsImageUrl,
} from "@/lib/images";

const DEFAULT_FALLBACK = "/images/football-hero-bg.jpg";

type CardMediaProps = {
  src?: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  fallbackSrc?: string;
  placeholder?: string;
};

/** Image with local hero fallback when remote thumbnail fails or is missing. */
export default function CardMedia({
  src,
  alt,
  width,
  height,
  className,
  sizes,
  fallbackSrc = DEFAULT_FALLBACK,
  placeholder = "News",
}: CardMediaProps) {
  const [failed, setFailed] = useState(false);
  const normalizedSrc = src
    ? upgradeRemoteNewsImageUrl(sanitizeRemoteImageUrl(src))
    : null;
  const hasSrc = Boolean(normalizedSrc) && !failed;

  if (!hasSrc && !fallbackSrc) {
    return <span aria-hidden="true">{placeholder}</span>;
  }

  return (
    <RemoteImage
      src={hasSrc ? normalizedSrc! : fallbackSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      onError={() => setFailed(true)}
    />
  );
}
