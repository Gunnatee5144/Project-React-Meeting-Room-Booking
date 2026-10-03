import Link from "next/link";

type PlaceholderPageProps = {
  title: string;
  route: string;
};

// Temporary route marker. Replace with the assigned feature's page.
export function PlaceholderPage({ title, route }: PlaceholderPageProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="font-mono text-sm">{route}</p>
      <p>เตรียมโครงสร้างไว้แล้ว ยังไม่ได้พัฒนาฟีเจอร์</p>
      <Link className="inline-block underline" href="/">กลับหน้าแรก</Link>
    </div>
  );
}
