'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Menu,
  X,
  Sparkles,
  Scissors,
  Layers,
  User,
  Shield,
  Focus,
  History,
  Grid2X2,
} from 'lucide-react';

import { Link, usePathname } from '@/core/i18n/navigation';
import {
  BrandLogo,
  LocaleSelector,
  SignUser,
  ThemeToggler,
} from '@/shared/blocks/common';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger as RawNavigationMenuTrigger,
} from '@/shared/components/ui/navigation-menu';
import { useMedia } from '@/shared/hooks/use-media';
import { cn } from '@/shared/lib/utils';
import { Header as HeaderType } from '@/shared/types/blocks/landing';

// Avoid hydration mismatch for NavigationMenuTrigger
function NavigationMenuTrigger(
  props: React.ComponentProps<typeof RawNavigationMenuTrigger>
) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <RawNavigationMenuTrigger {...props} />;
}

type ToolItem = {
  title: string;
  description: string;
  href: string;
  badge?: 'Live' | 'Soon';
  icon: React.ReactNode;
};

export function Header({ header }: { header: HeaderType }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isLarge = useMedia('(min-width: 64rem)');
  const pathname = usePathname();

  // Track which top nav dropdown is open (NavigationMenu value)
  const [openNav, setOpenNav] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tools: ToolItem[] = useMemo(
    () => [
      {
        title: 'Image Enhance',
        description: 'Upscale 2×/4× with clearer details',
        href: '/enhance',
        badge: 'Live',
        icon: <Sparkles className="h-4 w-4" />,
      },
      {
        title: 'Background Remover',
        description: 'Remove background in one click',
        href: '#',
        badge: 'Soon',
        icon: <Scissors className="h-4 w-4" />,
      },
      {
        title: 'Image Compressor',
        description: 'Shrink size without losing quality',
        href: '#',
        badge: 'Soon',
        icon: <Layers className="h-4 w-4" />,
      },
      {
        title: 'Portrait Retouch',
        description: 'Skin, face, and lighting touch-up',
        href: '#',
        badge: 'Soon',
        icon: <User className="h-4 w-4" />,
      },
      {
        title: 'Denoise',
        description: 'Fix low-light noise and grain',
        href: '#',
        badge: 'Soon',
        icon: <Shield className="h-4 w-4" />,
      },
      {
        title: 'Sharpen',
        description: 'Make blurry photos crisp',
        href: '#',
        badge: 'Soon',
        icon: <Focus className="h-4 w-4" />,
      },
      {
        title: 'Old Photo Restore',
        description: 'Repair scratches & boost clarity',
        href: '#',
        badge: 'Soon',
        icon: <History className="h-4 w-4" />,
      },
      {
        title: 'Batch Enhance',
        description: 'Upload multiple images at once',
        href: '#',
        badge: 'Soon',
        icon: <Grid2X2 className="h-4 w-4" />,
      },
    ],
    []
  );

  function isActive(href: string) {
    if (!href || href === '#') return false;
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  }

  /**
   * ✅ 关键修复：imghancer/这套 NavigationMenu 的 viewport 会用 CSS 变量控高度
   * 如果变量太小，就会把 dropdown 底部裁剪掉。
   * 我们在 dropdown 打开时直接把变量设置成一个足够大的值（72vh 上限 760px）。
   */
  useEffect(() => {
    const setViewportHeight = () => {
      if (!openNav) {
        document.documentElement.style.removeProperty(
          '--navigation-menu-viewport-height'
        );
        return;
      }
      const px = Math.min(Math.floor(window.innerHeight * 0.72), 760);
      document.documentElement.style.setProperty(
        '--navigation-menu-viewport-height',
        `${px}px`
      );
    };

    setViewportHeight();

    window.addEventListener('resize', setViewportHeight);
    return () => window.removeEventListener('resize', setViewportHeight);
  }, [openNav]);

  const NavMenu = () => {
    return (
      <NavigationMenu
        value={openNav}
        onValueChange={(v) => setOpenNav(v ?? '')}
        className="max-lg:hidden"
      >
        <NavigationMenuList className="bg-muted/30 ring-foreground/10 gap-1 rounded-full p-1 ring-1">
          {/* Tools dropdown */}
          <NavigationMenuItem value="Tools">
            <NavigationMenuTrigger className="rounded-full px-3 py-2 text-sm font-medium">
              <span className="flex items-center gap-2">
                <Grid2X2 className="h-4 w-4" />
                Tools
              </span>
            </NavigationMenuTrigger>

            <NavigationMenuContent className="origin-top p-0 pt-4.5 shadow-none ring-0">
              <div className="bg-background ring-foreground/10 w-[760px] overflow-hidden rounded-2xl border shadow-lg shadow-black/10 ring-1">
                <div className="border-b px-5 py-4">
                  <div className="text-sm font-semibold">AI Tools</div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    Start with Enhance, more tools coming soon.
                  </div>
                </div>

                {/* Scroll area (留出底部空间，避免 sticky footer 遮住内容) */}
                <div className="max-h-[min(64vh,560px)] overflow-auto p-3 pb-16">
                  <div className="grid grid-cols-2 gap-2">
                    {tools.map((t) => (
                      <NavigationMenuLink asChild key={t.title}>
                        <Link
                          href={t.href}
                          className={cn(
                            'group flex gap-3 rounded-xl border p-3 transition',
                            t.href === '#'
                              ? 'opacity-70'
                              : 'hover:bg-muted/30',
                            isActive(t.href) ? 'bg-muted/30' : ''
                          )}
                          onClick={(e) => {
                            if (t.href === '#') e.preventDefault();
                            // 点击可用项后关闭 dropdown
                            if (t.href !== '#') setOpenNav('');
                          }}
                        >
                          <div className="bg-background ring-foreground/10 flex size-9 items-center justify-center rounded-lg border shadow-sm ring-1">
                            {t.icon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium">{t.title}</div>
                              <Badge value={t.badge} />
                            </div>
                            <div className="text-muted-foreground line-clamp-1 text-xs">
                              {t.description}
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Pricing / Blog 占位 */}
          <NavigationMenuItem value="Pricing">
            <NavigationMenuLink asChild>
              <Link
                href="/pricing"
                onClick={(e) => e.preventDefault()}
                className="rounded-full px-3 py-2 text-sm font-medium opacity-80"
              >
                <span className="flex items-center gap-2">
                  Pricing <Badge value="Soon" />
                </span>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem value="Blog">
            <NavigationMenuLink asChild>
              <Link
                href="/blog"
                onClick={(e) => e.preventDefault()}
                className="rounded-full px-3 py-2 text-sm font-medium opacity-80"
              >
                <span className="flex items-center gap-2">
                  Blog <Badge value="Soon" />
                </span>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
  };

  const MobileMenu = ({ closeMenu }: { closeMenu: () => void }) => {
    return (
      <nav
        role="navigation"
        className="w-full [--color-border:--alpha(var(--color-foreground)/5%)] [--color-muted:--alpha(var(--color-foreground)/5%)]"
      >
        <Accordion
          type="single"
          collapsible
          className="-mx-4 mt-0.5 space-y-0.5 **:hover:no-underline"
        >
          <AccordionItem
            value="tools"
            className="group relative border-b-0 before:pointer-events-none before:absolute before:inset-x-4 before:bottom-0 before:border-b"
          >
            <AccordionTrigger className="data-[state=open]:bg-muted flex items-center justify-between px-4 py-3 text-lg **:!font-normal">
              Tools
            </AccordionTrigger>

            <AccordionContent className="pb-5">
              <ul className="space-y-1">
                {tools.map((t) => (
                  <li key={t.title}>
                    <Link
                      href={t.href}
                      onClick={(e) => {
                        if (t.href === '#') {
                          e.preventDefault();
                          return;
                        }
                        closeMenu();
                      }}
                      className="hover:bg-muted/30 grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl px-4 py-2"
                    >
                      <div className="flex items-center justify-center">{t.icon}</div>
                      <div className="min-w-0">
                        <div className="text-base">{t.title}</div>
                        <div className="text-muted-foreground line-clamp-1 text-xs">
                          {t.description}
                        </div>
                      </div>
                      <Badge value={t.badge} />
                    </Link>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {[
            { title: 'Pricing', href: '/pricing', soon: true },
            { title: 'Blog', href: '/blog', soon: true },
          ].map((item) => (
            <AccordionItem
              key={item.title}
              value={item.title}
              className="group relative border-b-0 before:pointer-events-none before:absolute before:inset-x-4 before:bottom-0 before:border-b"
            >
              <Link
                href={item.href}
                onClick={(e) => {
                  if (item.soon) {
                    e.preventDefault();
                    return;
                  }
                  closeMenu();
                }}
                className="data-[state=open]:bg-muted flex items-center justify-between px-4 py-3 text-lg **:!font-normal"
              >
                <span className="flex items-center gap-2">
                  {item.title}
                  {item.soon ? <Badge value="Soon" /> : null}
                </span>
              </Link>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-6 px-4" />
      </nav>
    );
  };

  return (
    <>
      <header
        data-state={isMobileMenuOpen ? 'active' : 'inactive'}
        {...(isScrolled && { 'data-scrolled': true })}
        className="has-data-[state=open]:bg-background/50 fixed inset-x-0 top-0 z-50 has-data-[state=open]:h-screen has-data-[state=open]:backdrop-blur"
      >
        <div
          className={cn(
            'absolute inset-x-0 top-0 z-50 h-18 border-transparent ring-1 ring-transparent transition-all duration-300',
            'in-data-scrolled:border-foreground/5 in-data-scrolled:bg-background/75 in-data-scrolled:border-b in-data-scrolled:backdrop-blur',
            'has-data-[state=open]:ring-foreground/5 has-data-[state=open]:bg-card/75 has-data-[state=open]:h-[calc(var(--navigation-menu-viewport-height)+3.4rem)] has-data-[state=open]:border-b has-data-[state=open]:shadow-lg has-data-[state=open]:shadow-black/10 has-data-[state=open]:backdrop-blur',
            'max-lg:in-data-[state=active]:bg-background/75 max-lg:h-14 max-lg:overflow-hidden max-lg:border-b max-lg:in-data-[state=active]:h-screen max-lg:in-data-[state=active]:backdrop-blur'
          )}
        >
          <div className="container">
            <div className="relative flex flex-wrap items-center justify-between lg:py-5">
              <div className="flex justify-between gap-8 max-lg:h-14 max-lg:w-full max-lg:border-b">
                {header.brand && <BrandLogo brand={header.brand} />}

                {isLarge ? <NavMenu /> : null}

                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
                  className="relative z-20 -m-2.5 -mr-3 block cursor-pointer p-2.5 lg:hidden"
                >
                  <Menu className="m-auto size-5 duration-200 in-data-[state=active]:scale-0 in-data-[state=active]:rotate-180 in-data-[state=active]:opacity-0" />
                  <X className="absolute inset-0 m-auto size-5 scale-0 -rotate-180 opacity-0 duration-200 in-data-[state=active]:scale-100 in-data-[state=active]:rotate-0 in-data-[state=active]:opacity-100" />
                </button>
              </div>

              {!isLarge && isMobileMenuOpen ? (
                <MobileMenu closeMenu={() => setIsMobileMenuOpen(false)} />
              ) : null}

              <div className="mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 in-data-[state=active]:flex max-lg:in-data-[state=active]:mt-6 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-4 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                <div className="flex w-full flex-row items-center gap-4 sm:flex-row sm:gap-4 sm:space-y-0 md:w-fit">
                  {header.show_theme ? <ThemeToggler /> : null}
                  {header.show_locale ? <LocaleSelector /> : null}
                  <div className="flex-1 md:hidden" />
                  {header.show_sign ? <SignUser userNav={header.user_nav} /> : null}

                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

function Badge({ value }: { value?: 'Live' | 'Soon' }) {
  if (!value) return null;
  const cls =
    value === 'Live'
      ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20'
      : 'bg-muted text-muted-foreground ring-foreground/10';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1',
        cls
      )}
    >
      {value}
    </span>
  );
}
