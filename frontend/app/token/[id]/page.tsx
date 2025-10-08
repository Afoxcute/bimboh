import Ticker from "@/components/sections/ticker";

export async function generateStaticParams() {
  // For static export, we'll generate a few common token IDs
  // In a real app, you might want to fetch this from your database
  return [
    { id: '189229' },
    { id: '123456' },
    { id: '789012' },
  ];
}

export default function Page({ params }: { params: { id: string } }) {
  return <Ticker params={params} />;
}
