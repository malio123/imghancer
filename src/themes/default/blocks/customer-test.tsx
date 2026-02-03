import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function CustomFeatures({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section
      id={section.id}
      className={cn('py-16 md:py-24', section.className)}
    >
      <div className="container">
        <h2 className="text-2xl font-bold">{section.title}</h2>
        <p className="text-muted-foreground">{section.description}</p>
        <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {section.items?.map((item) => (
            <li key={item.id} className="rounded-md border p-4">
              <h3 className="text-lg font-bold">{item.title}</h3>
              <p className="text-sm">{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
