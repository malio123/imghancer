'use client';

import { Star } from 'lucide-react';

import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { Image as ImageType } from '@/shared/types/blocks/common';
import { Testimonials as TestimonialsType } from '@/shared/types/blocks/landing';

export function Testimonials({
  testimonials,
  className,
}: {
  testimonials: TestimonialsType;
  className?: string;
}) {
  const TestimonialCard = ({
    name,
    role,
    image,
    quote,
  }: {
    name?: string;
    role?: string;
    image?: ImageType;
    quote?: string;
  }) => {
    return (
      <div className="bg-card/50 ring-foreground/10 flex h-full flex-col gap-6 rounded-2xl border border-transparent p-7 shadow-xl shadow-black/10 ring-1">
        <div className="flex items-center gap-1 text-amber-400">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star key={idx} className="size-4" fill="currentColor" />
          ))}
        </div>
        <p className='text-foreground text-sm leading-relaxed italic before:mr-1 before:content-["\201C"] after:ml-1 after:content-["\201D"]'>
          {quote}
        </p>
        <div className="mt-auto">
          <h3 className="sr-only">
            {name}, {role}
          </h3>
          <div className="space-y-px">
            <p className="text-sm font-medium">{name}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id={testimonials.id}
      className={`py-16 md:py-24 ${testimonials.className} ${className}`}
    >
      <div className="container">
        <ScrollAnimation>
          <div className="mx-auto max-w-2xl text-center text-balance">
            <h2 className="text-foreground mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
              {testimonials.title}
            </h2>
            <p className="text-muted-foreground mb-6 md:mb-12 lg:mb-16">
              {testimonials.description}
            </p>
          </div>
        </ScrollAnimation>
        <ScrollAnimation delay={0.2}>
          <div className="border-border/40 relative rounded-2xl">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.items?.map((item, index) => (
                <TestimonialCard key={index} {...item} />
              ))}
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
