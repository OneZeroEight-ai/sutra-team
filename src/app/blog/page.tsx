import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata = {
  title: "Blog",
  description: "Updates, insights, and guides from the Sutra.team crew.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-[720px] mx-auto px-6 py-20 pt-32">
      <h1
        className="text-sutra-text mb-3"
        style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontWeight: 400,
          fontSize: "clamp(32px, 5vw, 48px)",
        }}
      >
        Blog
      </h1>
      <p className="text-sutra-muted text-lg mb-12">
        Updates, insights, and guides from the Sutra.team crew.
      </p>

      {posts.length === 0 ? (
        <p className="text-sutra-muted">No posts yet. Check back soon.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block group bg-sutra-surface border border-sutra-border rounded-xl overflow-hidden no-underline transition-all hover:border-sutra-border-hover hover:-translate-y-0.5"
            >
              {post.image && (
                <img
                  src={post.image}
                  alt=""
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <time className="text-xs text-sutra-dim font-mono">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  {post.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2 py-0.5 rounded bg-sutra-accent/10 text-sutra-accent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-xl font-semibold text-sutra-text mb-2 group-hover:text-sutra-accent transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-sutra-muted leading-relaxed">
                  {post.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
