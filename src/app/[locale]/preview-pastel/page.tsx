import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PastelMatchCenter from "@/components/pastel/PastelMatchCenter";
import { isPastelPreviewAllowed } from "@/lib/pastel/preview-gate";

export const metadata: Metadata = {
  title: "Pastel Pulse Match Center Preview",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function PreviewPastelPage() {
  if (!isPastelPreviewAllowed()) {
    notFound();
  }

  return <PastelMatchCenter />;
}