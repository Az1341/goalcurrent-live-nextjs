"use client";

import { serializeJsonLd } from "@/lib/seo/serialize-json-ld";

type JsonLdScriptProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export default function JsonLdScript({ data }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
