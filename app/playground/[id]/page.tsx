import { getPlaygroundById } from "@/app/actions/playground";
import PlaygroundToggle from "@/app/components/PlaygroundToggle";

export default async function PlaygroundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const playground = await getPlaygroundById(id);
  if (!playground) {
    return (
      <div>
        <h1>Playground Not Found</h1>
        <p>The requested playground does not exist in the database.</p>
      </div>
    );
  }
  
  return <PlaygroundToggle playground={playground} />;
}