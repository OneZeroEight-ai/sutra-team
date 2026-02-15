export default function BlogPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto py-20">
        <h1 className="text-3xl font-bold mb-6">Blog</h1>
        <p className="text-zinc-400 leading-relaxed mb-8">
          Coming soon. In the meantime, read the book that started it all.
        </p>
        <a href="/book"
          className="inline-block bg-violet-600 hover:bg-violet-700 text-white
            font-medium py-3 px-6 rounded-lg transition">
          The Portable Mind &rarr;
        </a>
      </div>
    </div>
  );
}
