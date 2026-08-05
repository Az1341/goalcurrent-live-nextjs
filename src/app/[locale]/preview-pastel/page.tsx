import type { Metadata } from "next";
import PastelMatchCenter from "@/components/pastel/PastelMatchCenter";

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
  return <PastelMatchCenter />;
}
