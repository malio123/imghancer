import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { Landing } from '@/shared/types/blocks/landing';
import { getMetadata } from '@/shared/lib/seo';

export const generateMetadata = getMetadata({
  title: 'Image Enhancer Toolkit: Upscale, Restore, Remove BG | Imghancer',
  description:
    'Enhance images in seconds: upscale 2x/4x, denoise, sharpen, restore old photos, and remove backgrounds. Fast, clean results—right in your browser.',
  canonicalUrl: '/',
});

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // load page data
  const t = await getTranslations('landing');

  // build page params
  const page: Landing & { showcases?: unknown; workflow?: unknown } = {
    hero: t.raw('hero'),
    logos: t.raw('logos'),
    introduce: t.raw('introduce'),
    benefits: t.raw('benefits'),
    usage: t.raw('usage'),
    features: t.raw('features'),
    stats: t.raw('stats'),
    subscribe: t.raw('subscribe'),
    testimonials: t.raw('testimonials'),
    faq: t.raw('faq'),
    cta: t.raw('cta'),
    ...(locale === 'en'
      ? { showcases: t.raw('showcases'), workflow: t.raw('workflow') }
      : {}),
  };

  // load page component
  const Page = await getThemePage('landing');

  return <Page locale={locale} page={page} />;
}
