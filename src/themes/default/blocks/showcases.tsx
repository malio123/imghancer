'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';

import { Link } from '@/core/i18n/navigation';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import { Showcases as ShowcasesType } from '@/shared/types/blocks/landing';

function extractBeforeUrl(htmlOrText?: string) {
  if (!htmlOrText) return '';

  // 1) 支持 before=URL
  const m1 = htmlOrText.match(/before\s*=\s*(https?:\/\/\S+)/i);
  if (m1?.[1]) return m1[1].replace(/["'<>)]*$/, '');

  // 2) 支持 data-before="URL"
  const m2 = htmlOrText.match(/data-before\s*=\s*["'](https?:\/\/[^"']+)["']/i);
  if (m2?.[1]) return m2[1];

  // 3) 支持纯链接（取第一个 http(s)）
  const m3 = htmlOrText.match(/https?:\/\/\S+/);
  if (m3?.[0]) return m3[0].replace(/["'<>)]*$/, '');

  return '';
}

export function CompareSlider({
  beforeSrc,
  afterSrc,
  alt,
}: {
  beforeSrc: string;
  afterSrc: string;
  alt: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [pct, setPct] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);

  const clamp = (v: number) => Math.min(98, Math.max(2, v));

  const setFromClientX = (clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const p = (x / rect.width) * 100;
    setPct(clamp(p));
  };

  const useBlurOverlay = beforeSrc === afterSrc;

  return (
    <div
      ref={wrapRef}
      className="relative aspect-[16/10] w-full cursor-ew-resize overflow-hidden rounded-2xl border bg-muted/10"
      onMouseEnter={() => setHovering(true)}
      onMouseDown={(e) => {
        setFromClientX(e.clientX);
      }}
      onMouseMove={(e) => {
        setFromClientX(e.clientX);
      }}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => {
        setDragging(false);
        setHovering(false);
        setPct(50);
      }}
      onTouchStart={(e) => {
        setDragging(true);
        setFromClientX(e.touches[0]?.clientX ?? 0);
      }}
      onTouchMove={(e) => {
        if (!dragging) return;
        setFromClientX(e.touches[0]?.clientX ?? 0);
      }}
      onTouchEnd={() => setDragging(false)}
    >
      {/* After (base) */}
      <Image
        src={afterSrc}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
        className="object-cover"
        priority={false}
      />

      {/* Before (clipped) */}
      {beforeSrc ? (
        <div
          className={cn(
            'absolute inset-0 overflow-hidden',
            hovering ? '' : 'transition-[width] duration-300 ease-out'
          )}
          style={{ width: `${pct}%` }}
        >
          {useBlurOverlay ? (
            <div className="absolute inset-0 backdrop-blur-[3px] backdrop-saturate-[0.98] backdrop-contrast-[0.99]" />
          ) : (
            <Image
              src={beforeSrc}
              alt={alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
              className="object-cover"
              priority={false}
            />
          )}
        </div>
      ) : null}

      {/* Labels */}
      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
        <span className="rounded-full border bg-background/70 px-2 py-1 text-xs text-foreground backdrop-blur">
          Before
        </span>
      </div>
      <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-2">
        <span className="rounded-full border bg-background/70 px-2 py-1 text-xs text-foreground backdrop-blur">
          After
        </span>
      </div>

      {/* Divider */}
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0',
          hovering ? '' : 'transition-[left] duration-300 ease-out'
        )}
        style={{ left: `${pct}%` }}
      >
        <div className="h-full w-px bg-foreground/35" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center gap-1 rounded-full border bg-background/70 px-2 py-1 text-[11px] text-foreground backdrop-blur">
            <span className="inline-block size-1.5 rounded-full bg-foreground/50" />
            drag
          </div>
        </div>
      </div>

      {/* Invisible slider input for keyboard */}
      <input
        aria-label="Compare slider"
        type="range"
        min={2}
        max={98}
        value={pct}
        onChange={(e) => setPct(Number(e.target.value))}
        className="absolute bottom-3 left-1/2 w-[65%] -translate-x-1/2 appearance-none opacity-0"
      />
    </div>
  );
}

export function Showcases({
  showcases,
  className,
}: {
  showcases: ShowcasesType;
  className?: string;
}) {
  const items = showcases.items ?? [];

  // 取前三个展示更“高级”，太多会像图库
  const topItems = useMemo(() => items.slice(0, 6), [items]);

  return (
    <section
      id={showcases.id || 'showcases'}
      className={cn(
        'pt-12 pb-20 md:pt-16 md:pb-24',
        showcases.className,
        className
      )}
    >
      <div className="container">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          {showcases.sr_only_title && (
            <h1 className="sr-only">{showcases.sr_only_title}</h1>
          )}
          <div className="mb-4 flex items-center justify-center gap-2">
            <Badge variant="secondary">Before / After</Badge>
            <Badge variant="outline">Interactive</Badge>
          </div>

          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-balance lg:text-4xl">
            {showcases.title || 'See the difference instantly'}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base lg:text-lg">
            {showcases.description ||
              'Drag the slider to compare. Try it with your own image in seconds.'}
          </p>

        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {topItems.map((item, index) => {
            const afterSrc = item.image?.src ?? '';
            const beforeSrc = extractBeforeUrl(item.description) || afterSrc;
            const alt = item.image?.alt || item.title || 'showcase';

            const href = item.url || '/enhance';

            return (
              <Link key={index} href={href} target={item.target || '_self'}>
                <Card className="group overflow-hidden rounded-3xl border bg-card p-0 transition-all hover:shadow-lg hover:shadow-black/10">
                  <CardContent className="p-0">
                    <div className="p-3">
                      <CompareSlider
                        beforeSrc={beforeSrc}
                        afterSrc={afterSrc}
                        alt={alt}
                      />
                    </div>

                    <div className="px-5 pb-5">
                      <div className="flex items-center justify-between">
                        <h3 className="mt-1 line-clamp-1 text-base font-semibold">
                          {item.title || 'Image Enhance'}
                        </h3>
                        <span className="text-muted-foreground text-xs opacity-0 transition-opacity group-hover:opacity-100">
                          Open →
                        </span>
                      </div>

                      <p
                        className="text-muted-foreground mt-2 line-clamp-2 text-sm"
                        // 这里的 description 我们可能塞了 before 链接，所以显示时做个降噪
                        dangerouslySetInnerHTML={{
                          __html:
                            (item.description || '')
                              .replace(/before\s*=\s*https?:\/\/\S+/gi, '')
                              .trim() || 'Upscale and restore details with one click.',
                        }}
                      />

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="outline">2× / 4×</Badge>
                        <Badge variant="outline">Sharpen</Badge>
                        <Badge variant="outline">Denoise</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
