import type { Metadata } from "next";
import FixturesSection from "@/components/wc26/FixturesSection";
import Wc26SectionPage from "@/components/wc26/Wc26SectionPage";
import { getWc26Section } from "@/lib/wc26-sections";
import { buildPageMetadata } from "@/lib/page-metadata";

const section = getWc26Section("fixtures")!;

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: `${section.label} — World Cup 2026 Archive`,
    description: section.description,
    path: section.href,
    locale,
  });
}
export default function FixturesPage() {
  return (
    <Wc26SectionPage
      breadcrumb={section.breadcrumb}
      titleHighlight={section.titleHighlight}
      intro={section.description}
    >
      <FixturesSection />
    </Wc26SectionPage>
  );
}
