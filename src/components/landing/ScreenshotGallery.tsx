'use client';

import { useRef, useState, useEffect } from 'react';

const screenshots = [
  { src: '/screenshots/03_create_agent_all.png', label: 'Agent Templates' },
  { src: '/screenshots/04_create_agent_technical.png', label: 'Technical Templates' },
  { src: '/screenshots/05_create_agent_form.png', label: 'Agent Builder' },
  { src: '/screenshots/02_expert_agents_list.png', label: 'Expert Agents' },
  { src: '/screenshots/06_skill_browser.png', label: 'Skill Browser' },
  { src: '/screenshots/07_skill_moltbook_detail.png', label: 'Skill Details' },
  { src: '/screenshots/09_agent_jim_bond.png', label: 'Agent Config' },
  { src: '/screenshots/10_persona_heartbeat_channels.png', label: 'Heartbeat & Channels' },
  { src: '/screenshots/14_channel_integrations.png', label: 'Telegram & Slack' },
  { src: '/screenshots/11_slack_memory.png', label: 'Agent Memory' },
  { src: '/screenshots/08_audit_log.png', label: 'Audit Trail' },
  { src: '/screenshots/12_promoter_instructions.png', label: 'The Promoter' },
  { src: '/screenshots/13_promoter_budget_byok.png', label: 'Budget & BYOK' },
  { src: '/screenshots/15_promoter_checklist.png', label: 'Agent Output' },
  { src: '/screenshots/16_launch_commander.png', label: 'Launch Commander' },
  { src: '/screenshots/17_launch_commander_book.png', label: 'Web Search Skill' },
  { src: '/screenshots/18_launch_commander_strategy.png', label: 'Strategy Output' },
  { src: '/screenshots/01_chat_sdac_strategist.png', label: 'Agent Chat' },
];

export default function ScreenshotGallery() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
  }, []);

  useEffect(() => {
    if (!isAutoScrolling) return;
    const el = scrollRef.current;
    if (!el) return;

    autoScrollRef.current = setInterval(() => {
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 280, behavior: 'smooth' });
      }
    }, 3000);

    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [isAutoScrolling]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    setIsAutoScrolling(false);
    const amount = direction === 'left' ? -300 : 300;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const handleUserScroll = () => {
    setIsAutoScrolling(false);
    checkScroll();
  };

  return (
    <section className="w-full py-16 md:py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-10">
        <h2
          className="text-sutra-text mb-3"
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontWeight: 400,
            fontSize: 'clamp(28px, 4vw, 42px)',
          }}
        >
          See it in action
        </h2>
        <p className="text-sutra-muted text-lg max-w-2xl">
          Templates, skills, channels, audit trails, and agents working
          autonomously — all from your phone.
        </p>
      </div>

      <div className="relative group">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10
                       w-10 h-10 rounded-full bg-black/70 border border-white/10
                       flex items-center justify-center text-white
                       opacity-0 group-hover:opacity-100 transition-opacity
                       hover:bg-white/10 backdrop-blur-sm"
            aria-label="Scroll left"
          >
            &#x2190;
          </button>
        )}

        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10
                       w-10 h-10 rounded-full bg-black/70 border border-white/10
                       flex items-center justify-center text-white
                       opacity-0 group-hover:opacity-100 transition-opacity
                       hover:bg-white/10 backdrop-blur-sm"
            aria-label="Scroll right"
          >
            &#x2192;
          </button>
        )}

        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0a0a0f] to-transparent z-[5] pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0a0a0f] to-transparent z-[5] pointer-events-none" />

        <div
          ref={scrollRef}
          onScroll={handleUserScroll}
          className="screenshot-scroll flex gap-5 overflow-x-auto px-8 md:px-16 pb-4"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {screenshots.map((shot, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[220px] md:w-[260px] group/card"
            >
              <div
                className="rounded-2xl overflow-hidden border border-white/[0.06]
                           bg-white/[0.02] shadow-2xl shadow-black/40
                           transition-transform duration-300
                           group-hover/card:scale-[1.02]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shot.src}
                  alt={shot.label}
                  loading={i < 5 ? 'eager' : 'lazy'}
                  className="w-full h-auto"
                  width={460}
                  height={850}
                />
              </div>
              <p className="text-center text-xs text-sutra-dim mt-3 font-medium tracking-wide uppercase">
                {shot.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
