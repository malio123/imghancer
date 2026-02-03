import { Landing } from '@/shared/types/blocks/landing';
import {
  CTA,
  FAQ,
  Features,
  FeaturesAccordion,
  FeaturesList,
  FeaturesStep,
  Hero,
  Showcases,
  WorkflowSteps,
  Stats,
  Subscribe,
  Testimonials,
} from '@/themes/default/blocks';

export default async function LandingPage({
  page,
}: {
  locale?: string;
  page: Landing;
}) {
  // ✅ 避免 Landing 类型里还没加 showcases 导致 TS 报红
  const anyPage = page as any;

  return (
    <>
      {anyPage.hero && <Hero hero={anyPage.hero} />}

      {/* ✅ Before/After 示例区（你想要的“前后对比图”模块） */}
      {anyPage.showcases && <Showcases showcases={anyPage.showcases} />}
      {anyPage.workflow && <WorkflowSteps workflow={anyPage.workflow} />}

      {anyPage.testimonials && (
        <Testimonials testimonials={anyPage.testimonials} />
      )}
      {anyPage.faq && <FAQ faq={anyPage.faq} />}
      {anyPage.cta && <CTA cta={anyPage.cta} />}
    </>
  );
}
