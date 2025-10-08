import dynamic from 'next/dynamic';

const Home = dynamic(() => import("@/components/sections/home"), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading Bimboh...</p>
      </div>
    </div>
  )
});

export default function HomePage() {
  return <Home />;
}
