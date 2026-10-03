import { PlaceholderPage } from "@/components/placeholder-page";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <PlaceholderPage title="รายละเอียดห้อง" route={`/rooms/${id}`} />;
}
