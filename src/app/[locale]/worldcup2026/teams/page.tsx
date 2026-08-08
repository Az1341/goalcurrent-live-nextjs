import type { Metadata } from "next";
import TeamsSection from "@/components/wc26/TeamsSection";
import Wc26SectionPage from "@/components/wc26/Wc26SectionPage";
import { getWc26Section } from "@/lib/wc26-sections";
import { buildPageMetadata } from "@/lib/page-metadata";

const section = getWc26Section("teams")!;

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
export default function TeamsPage() {
  return (
    <Wc26SectionPage
      breadcrumb={section.breadcrumb}
      titleHighlight={section.titleHighlight}
      intro={section.description}
    >
      <TeamsSection />
    </Wc26SectionPage>
  );
}
