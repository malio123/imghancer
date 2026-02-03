'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

import { cn } from '@/shared/lib/utils';
import { Workflow } from '@/shared/types/blocks/landing';

const AUTOPLAY_MS = 4500;

export function WorkflowSteps({
  workflow,
  className,
}: {
  workflow: Workflow;
  className?: string;
}) {
  const items = useMemo(() => workflow.items ?? [], [workflow.items]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;

    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(id);
  }, [items.length]);

  if (!items.length) return null;

  const leftImageSrc = '/imgs/showcases/work.png';
  const leftImageAlt = workflow.title || 'Workflow';

  return (
    <section
      id={workflow.id || 'workflow'}
      className={cn('py-16 md:py-24', workflow.className, className)}
    >
      <div className="container">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          {workflow.label ? (
            <span className="text-muted-foreground text-sm uppercase tracking-wide">
              {workflow.label}
            </span>
          ) : null}
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            {workflow.title || 'How imghancer works'}
          </h2>
          {workflow.description ? (
            <p className="text-muted-foreground mt-4 text-base md:text-lg">
              {workflow.description}
            </p>
          ) : null}
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-3xl border bg-card p-3 shadow-lg shadow-black/10">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
              <Image
                src={leftImageSrc}
                alt={leftImageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
                priority={false}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {items.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  type="button"
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'w-full rounded-2xl border px-5 py-4 text-left transition-all',
                    isActive
                      ? 'border-primary/50 bg-muted/40 shadow-sm'
                      : 'border-border/60 bg-background/40 hover:border-primary/40 hover:bg-muted/20'
                  )}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={cn(
                        'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
                        isActive
                          ? 'border-primary/60 text-primary'
                          : 'border-border/70 text-muted-foreground'
                      )}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold">
                        {item.title || `Step ${index + 1}`}
                      </h3>
                      {item.description ? (
                        <p className="text-muted-foreground mt-1 text-sm">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
