import { AnalyzerView } from "@/components/analyzer/analyzer-view";

export default function AnalyzerPage({ params }: { params: { id: string } }) {
  return <AnalyzerView key={params.id} id={params.id} />;
}
