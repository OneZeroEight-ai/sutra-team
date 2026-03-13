import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.meta.title,
    description: post.meta.description,
    openGraph: post.meta.image
      ? { images: [{ url: post.meta.image }] }
      : undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="pb-20 pt-28">
      {/* ── Hero image ── */}
      {post.meta.image && (
        <div className="max-w-[920px] mx-auto px-6 mb-10">
          <img
            src={post.meta.image}
            alt=""
            className="w-full max-h-[520px] object-contain rounded-2xl border border-sutra-border"
          />
        </div>
      )}

      {/* ── Header ── */}
      <header className="max-w-[720px] mx-auto px-6 mb-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-sutra-muted hover:text-sutra-accent transition-colors no-underline mb-8"
        >
          <ArrowLeft size={14} /> Back to blog
        </Link>

        {/* Tags */}
        {post.meta.tags && (
          <div className="flex gap-2 flex-wrap mb-4">
            {post.meta.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-[11px] px-2.5 py-1 rounded-full bg-sutra-accent/10 text-sutra-accent font-medium tracking-wide uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1
          className="text-sutra-text mb-5"
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontWeight: 400,
            fontSize: "clamp(32px, 5vw, 52px)",
            lineHeight: 1.1,
          }}
        >
          {post.meta.title}
        </h1>

        <p className="text-lg text-sutra-muted leading-relaxed mb-6">
          {post.meta.description}
        </p>

        {/* Author + date row */}
        <div className="flex items-center gap-4 pt-6 border-t border-sutra-border">
          {post.meta.author && (
            <span className="text-sm font-semibold text-sutra-text">
              {post.meta.author}
            </span>
          )}
          <time className="text-sm text-sutra-dim font-mono">
            {new Date(post.meta.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="max-w-[720px] mx-auto px-6">
        <div className="prose prose-lg prose-invert max-w-none
          prose-headings:text-sutra-text
          prose-headings:font-semibold
          prose-h2:text-[26px]
          prose-h2:mt-14
          prose-h2:mb-5
          prose-h3:text-[20px]
          prose-h3:mt-10
          prose-h3:mb-4
          prose-p:text-sutra-muted
          prose-p:leading-[1.8]
          prose-p:mb-6
          prose-a:text-sutra-accent
          prose-a:underline
          prose-a:decoration-sutra-accent/30
          prose-a:underline-offset-2
          hover:prose-a:decoration-sutra-accent
          prose-strong:text-sutra-text
          prose-strong:font-semibold
          prose-em:text-sutra-muted
          prose-li:text-sutra-muted
          prose-li:leading-[1.8]
          prose-ol:pl-5
          prose-ul:pl-5
          prose-blockquote:border-l-sutra-accent
          prose-blockquote:bg-sutra-surface
          prose-blockquote:rounded-r-lg
          prose-blockquote:py-4
          prose-blockquote:px-6
          prose-blockquote:not-italic
          prose-blockquote:text-sutra-muted
          prose-code:text-sutra-accent
          prose-code:bg-sutra-surface
          prose-code:px-1.5
          prose-code:py-0.5
          prose-code:rounded
          prose-code:text-sm
          prose-code:before:content-none
          prose-code:after:content-none
          prose-hr:border-sutra-border
          prose-hr:my-12
          prose-img:rounded-xl
          prose-img:border
          prose-img:border-sutra-border
        ">
          <MDXRemote source={post.content} />
        </div>
      </div>

      {/* ── Bottom nav ── */}
      <div className="max-w-[720px] mx-auto px-6 mt-16 pt-8 border-t border-sutra-border flex justify-between items-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-sutra-muted hover:text-sutra-accent transition-colors no-underline"
        >
          <ArrowLeft size={14} /> All posts
        </Link>
        <Link
          href="/quick-start"
          className="text-sm text-sutra-accent no-underline hover:underline"
        >
          Try Sutra Team →
        </Link>
      </div>
    </article>
  );
}
