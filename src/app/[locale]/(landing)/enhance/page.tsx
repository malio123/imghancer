// src/app/[locale]/enhance/page.tsx
import EnhanceClient from './EnhanceClient';
import { Link } from '@/core/i18n/navigation';
import { Button } from '@/shared/components/ui/button';
import { CompareSlider, FAQ } from '@/themes/default/blocks';

export const metadata = {
  title: 'Enhance — imghancer',
  description: 'Upscale and enhance images online with imghancer.',
};

export default function EnhancePage() {
  return (
    <div id="top" className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-3 pt-14 md:pt-16">
        <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
          Image Enhance
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Make your images sharper in one click.
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Upscale, recover detail, and clean noise without overprocessing.
          Upload a PNG, JPG, or WEBP and get a ready-to-use result in seconds.
        </p>
      </div>

      <div className="mt-10 md:mt-12" id="enhance-tool">
        <EnhanceClient />
      </div>

      <section className="mt-14 md:mt-18">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            How to enhance your image
          </h2>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Three quick steps from upload to download.
          </p>
        </div>
        <div className="mt-6 grid gap-4 text-sm text-muted-foreground md:grid-cols-3">
          <div className="rounded-2xl border border-border/40 bg-card/20 p-5 transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/30">
            <span className="inline-flex rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
              Step 1
            </span>
            <p className="text-foreground mt-4 font-medium">
              Upload your image
            </p>
            <p className="mt-2 text-xs">
              Drag &amp; drop or click to add a PNG, JPG, or WEBP.
            </p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-card/20 p-5 transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/30">
            <span className="inline-flex rounded-full bg-sky-500/15 px-2.5 py-1 text-[11px] font-semibold text-sky-300 ring-1 ring-sky-500/30">
              Step 2
            </span>
            <p className="text-foreground mt-4 font-medium">
              Choose upscale
            </p>
            <p className="mt-2 text-xs">
              Pick 2× for speed or 4× for sharper details.
            </p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-card/20 p-5 transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/30">
            <span className="inline-flex rounded-full bg-fuchsia-500/15 px-2.5 py-1 text-[11px] font-semibold text-fuchsia-300 ring-1 ring-fuchsia-500/30">
              Step 3
            </span>
            <p className="text-foreground mt-4 font-medium">
              Enhance &amp; download
            </p>
            <p className="mt-2 text-xs">
              Run enhance, compare before/after, then save.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14 md:mt-18">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-center">
          <div className="rounded-3xl border border-border/40 bg-background/40 p-3">
            <CompareSlider
              beforeSrc="/imgs/showcases/sea.png"
              afterSrc="/imgs/showcases/sea.png"
              alt="Before and after upscale comparison"
            />
          </div>

          <div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Restore intricate details with AI upscaling
            </h2>
            <p className="text-muted-foreground mt-3 text-sm sm:text-base">
              One-click enhance for clearer edges, cleaner textures, and
              sharper details — without overprocessing.
            </p>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-border/40 bg-card/20 px-5 py-4">
          <div>
            <p className="text-foreground text-sm font-semibold">
              Want more tools than Enhance?
            </p>
            <p className="text-muted-foreground text-xs">
              Explore the full suite on the homepage.
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link href="/">Explore More Tools</Link>
          </Button>
        </div>
      </section>

      <FAQ
        faq={{
          title: 'Enhance FAQ',
          description:
            'Everything you need to know about enhancing images with 2×/4× upscale.',
          items: [
            {
              question: 'What does Enhance do?',
              answer:
                'Enhance sharpens edges, restores fine details, and reduces mild noise to improve clarity without making the image look over-processed.',
            },
            {
              question: 'Should I choose 2× or 4×?',
              answer:
                'Use 2× for faster results and smaller outputs. Use 4× when you want maximum detail or plan to print or crop.',
            },
            {
              question: 'What file types are supported?',
              answer:
                'PNG, JPG, and WEBP are supported. We recommend PNG for illustrations and JPG for photos.',
            },
            {
              question: 'How long does it take?',
              answer:
                'Most images complete in seconds. Larger inputs or 4× upscales may take a bit longer.',
            },
            {
              question: 'Do you store my images?',
              answer:
                'We only process your upload to generate the enhanced result. In the current MVP, images are not intended for long-term storage.',
            },
          ],
        }}
        className="mt-10 md:mt-12 !py-12 md:!py-16 md:max-w-5xl lg:max-w-6xl"
      />

      <section className="mt-10 md:mt-12">
        <div className="rounded-3xl border border-border/40 bg-card/20 px-6 py-10 text-center md:px-10 md:py-14">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to enhance your image?
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-sm sm:text-base">
            Jump back to the top and start enhancing in one click.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="#top">Try Enhance</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Explore More Tools</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
