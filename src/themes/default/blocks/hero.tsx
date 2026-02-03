'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { LazyImage, SmartIcon } from '@/shared/blocks/common';
import { AnimatedGridPattern } from '@/shared/components/ui/animated-grid-pattern';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { Hero as HeroType } from '@/shared/types/blocks/landing';

import { SocialAvatars } from './social-avatars';

const createFadeInVariant = (delay: number) => ({
  initial: { opacity: 0, y: 18, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as const },
});

function getDefaultButtons(hero: HeroType) {
  // 如果 CMS/配置里没给 buttons，我们给一个默认的产品向 CTA
  if (hero.buttons && hero.buttons.length > 0) return hero.buttons;

  return [
    {
      title: 'Try Enhance',
      url: '/enhance',
      target: '_self',
      variant: 'default',
      size: 'default',
      icon: 'sparkles',
    },
    {
      title: 'See examples',
      url: '#showcases',
      target: '_self',
      variant: 'outline',
      size: 'default',
      icon: 'arrow-right',
    },
  ] as any[];
}

export function Hero({
  hero,
  className,
}: {
  hero: HeroType;
  className?: string;
}) {
  const title = hero.title || 'Enhance images instantly with imghancer';
  const description =
    hero.description ||
    '2×/4× upscale with clearer details. Fast preview, ready to download. No clutter, just results.';

  const highlightText = hero.highlight_text ?? '';
  let texts: string[] | null = null;
  if (highlightText) {
    texts = title.split(highlightText, 2);
  }

  const buttons = getDefaultButtons(hero);

  return (
    <>
      <section
        id={hero.id}
        className={cn(
          'relative pt-24 pb-10 md:pt-34 md:pb-14',
          hero.className,
          className
        )}
      >
        {/* subtle top glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[-120px] mx-auto h-[320px] max-w-6xl rounded-[48px] bg-[radial-gradient(closest-side,rgba(255,255,255,0.10),transparent)] blur-2xl"
        />

        {hero.announcement && (
          <motion.div {...createFadeInVariant(0)}>
            <Link
              href={hero.announcement.url || ''}
              target={hero.announcement.target || '_self'}
              className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto mb-8 flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
            >
              <span className="text-foreground text-sm">
                {hero.announcement.title}
              </span>
              <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

              <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                  <span className="flex size-6">
                    <ArrowRight className="m-auto size-3" />
                  </span>
                  <span className="flex size-6">
                    <ArrowRight className="m-auto size-3" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-10 px-4 text-center">
          {/* Copy */}
          <div className="text-center">
            <motion.div {...createFadeInVariant(0.12)}>
              <div className="text-muted-foreground mb-4 inline-flex items-center gap-2 rounded-full border bg-muted/30 px-3 py-1 text-xs font-medium">
                <span className="inline-flex size-5 items-center justify-center rounded-full border bg-background">
                  <Sparkles className="size-3" />
                </span>
                AI Image Enhancer · imghancer
              </div>

              {texts && texts.length > 0 ? (
                <h1 className="text-foreground text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
                  {texts[0]}
                  {highlightText}
                  {texts[1]}
                </h1>
              ) : (
                <h1 className="text-foreground text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
                  {title}
                </h1>
              )}
            </motion.div>

            <motion.p
              {...createFadeInVariant(0.26)}
              className="text-muted-foreground mt-6 text-base leading-relaxed text-balance sm:text-lg"
              dangerouslySetInnerHTML={{ __html: description }}
            />

            {/* Quick bullets (product-y) */}
            <motion.div
              {...createFadeInVariant(0.34)}
              className="mt-6 flex flex-wrap items-center justify-center gap-2"
            >
              {[
                '2×/4× upscale',
                'Preview before download',
                'PNG/JPG/WEBP',
                'No-store (MVP)',
              ].map((t) => (
                <span
                  key={t}
                  className="text-muted-foreground rounded-full border bg-muted/20 px-3 py-1 text-xs"
                >
                  {t}
                </span>
              ))}
            </motion.div>

            {/* Buttons */}
            <motion.div
              {...createFadeInVariant(0.42)}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              {buttons.map((button: any, idx: number) => {
                const isPrimary = (button.variant || 'default') === 'default';
                return (
                  <Button
                    asChild
                    size={button.size || 'default'}
                    variant={button.variant || 'default'}
                    key={idx}
                    className={cn(
                      'h-10 px-5 text-sm',
                      isPrimary
                        ? 'shadow-lg shadow-black/15 ring-1 ring-foreground/10'
                        : 'bg-background'
                    )}
                  >
                    <Link href={button.url ?? ''} target={button.target ?? '_self'}>
                      {/* 兼容 SmartIcon；如果没有 icon，就不给 */}
                      {button.icon ? (
                        <span className="mr-2 inline-flex items-center">
                          <SmartIcon name={button.icon as string} />
                        </span>
                      ) : null}
                      <span>{button.title}</span>
                    </Link>
                  </Button>
                );
              })}
            </motion.div>

            {hero.tip && (
              <motion.p
                {...createFadeInVariant(0.55)}
                className="text-muted-foreground mt-5 text-sm"
                dangerouslySetInnerHTML={{ __html: hero.tip ?? '' }}
              />
            )}

            {hero.show_avatars && (
              <motion.div {...createFadeInVariant(0.68)} className="mt-6">
                <SocialAvatars tip={hero.avatars_tip || ''} />
              </motion.div>
            )}
          </div>

          {/* Right visual */}
          {(hero.image?.src || hero.image_invert?.src) && (
            <motion.div
              {...createFadeInVariant(0.22)}
              className="relative mx-auto w-full max-w-[520px]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-6 rounded-[28px] bg-[radial-gradient(closest-side,rgba(255,255,255,0.08),transparent)] blur-xl"
              />
              <div className="relative overflow-hidden rounded-3xl border bg-card shadow-xl shadow-black/10">
                {/* top bar */}
                <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-foreground/30" />
                    <span className="size-2 rounded-full bg-foreground/20" />
                    <span className="size-2 rounded-full bg-foreground/10" />
                  </div>
                  <div className="text-muted-foreground text-xs">
                    imghancer · Enhance
                  </div>
                </div>

                <div className="p-3">
                  <LazyImage
                    className="border-border/25 relative z-2 hidden w-full rounded-2xl border object-cover dark:block"
                    src={hero.image_invert?.src || hero.image?.src || ''}
                    alt={hero.image_invert?.alt || hero.image?.alt || ''}
                  />
                  <LazyImage
                    className="border-border/25 relative z-2 w-full rounded-2xl border object-cover dark:hidden"
                    src={hero.image?.src || hero.image_invert?.src || ''}
                    alt={hero.image?.alt || hero.image_invert?.alt || ''}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Background grid pattern (kept) */}
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          '[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]',
          'inset-x-0 inset-y-[-30%] h-[200%] skew-y-12'
        )}
      />
    </>
  );
}
