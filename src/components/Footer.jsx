import React from 'react';
import { FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

/* ── Contact / social link data ─────────────────────────────────────── */
const CONTACT_LINKS = [
  {
    id: 'linkedin',
    Icon: FaLinkedin,
    label: 'LinkedIn',
    display: 'Shahbaz Qalander',
    href: 'https://www.linkedin.com/in/shahbaz-qalander-20a8852bb/',
    external: true,
    /* Per-icon accent colours applied on hover via Tailwind group + CSS var trick */
    iconClass: 'text-[#0A66C2]',
    hoverBg: 'hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/40',
    hoverText: 'hover:text-[#0A66C2]',
  },
  {
    id: 'github',
    Icon: FaGithub,
    label: 'GitHub',
    display: 'shahbazqalander388',
    href: 'https://github.com/shahbazqalander388',
    external: true,
    iconClass: 'text-slate-300',
    hoverBg: 'hover:bg-white/10 hover:border-white/20',
    hoverText: 'hover:text-white',
  },
  {
    id: 'email',
    Icon: FaEnvelope,
    label: 'Email',
    display: 'syedshahbaz2004@gmail.com',
    href: 'mailto:syedshahbaz2004@gmail.com',
    external: false,
    iconClass: 'text-primary-400',
    hoverBg: 'hover:bg-primary-500/10 hover:border-primary-500/40',
    hoverText: 'hover:text-primary-400',
  },
];

/* ── Quick navigation columns ────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Cart', to: '/cart' },
  { label: 'Dashboard', to: '/dashboard' },
];

/* ═════════════════════════════════════════════════════════════════════ */

const Footer = () => (
  <footer
    className="bg-slate-900 text-slate-400 border-t border-slate-800/70"
    aria-label="Site footer"
  >
    {/* ── Top section ─────────────────────────────────────────────── */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">

      {/*
        Main row: Brand  |  Nav Links  |  Contact Block
        Stacks vertically on mobile, goes side-by-side from md breakpoint.
      */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">

        {/* ── 1. Brand column ─────────────────────────────────────── */}
        <div className="flex flex-col gap-3 max-w-xs">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-extrabold text-white
                       hover:text-primary-400 transition-colors duration-200 w-fit"
            aria-label="E-Store — go to homepage"
          >
            <ShoppingBag className="h-6 w-6 text-primary-500" aria-hidden="true" />
            E-Store
          </Link>
          <p className="text-sm leading-relaxed">
            Curated premium products across tech, fashion & lifestyle — crafted
            for those who value modern elegance.
          </p>
        </div>

        {/* ── 2. Quick nav links ───────────────────────────────────── */}
        <nav aria-label="Quick site navigation">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
            Quick Links
          </h3>
          {/*
            Desktop: single row  |  Mobile: 2-column grid
          */}
          <ul className="grid grid-cols-2 sm:flex sm:flex-row sm:flex-wrap gap-x-6 gap-y-2.5 text-sm">
            {NAV_LINKS.map(({ label, to }) => (
              <li key={label}>
                <Link
                  to={to}
                  className="hover:text-white transition-colors duration-200
                             focus-visible:outline-none focus-visible:text-primary-400"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── 3. Contact / Social block ────────────────────────────── */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
            Get in Touch
          </h3>

          {/*
            Desktop: all three links in ONE horizontal row (flex-row).
            Mobile / small: stacks vertically (flex-col).
            Tablet (sm): still flex-col, goes horizontal at lg.
          */}
          <ul
            className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4"
            role="list"
          >
            {CONTACT_LINKS.map(({ id, Icon, label, display, href, external, iconClass, hoverBg, hoverText }) => (
              <li key={id} role="listitem">
                <a
                  href={href}
                  aria-label={`${label}: ${display}${external ? ' (opens in new tab)' : ''}`}
                  {...(external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className={[
                    /* Base pill shape */
                    'flex items-center gap-2 px-4 py-2.5',
                    'rounded-xl border border-slate-700/60 bg-slate-800/50',
                    'text-sm text-slate-300 font-medium',
                    /* Smooth transitions */
                    'transition-all duration-300 ease-out',
                    /* Hover */
                    hoverBg,
                    hoverText,
                    'hover:border-opacity-60 hover:scale-[1.02]',
                    'hover:shadow-lg hover:shadow-black/20',
                    /* Focus */
                    'focus-visible:outline-none focus-visible:ring-2',
                    'focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                    'focus-visible:ring-offset-slate-900',
                    /* Active press */
                    'active:scale-[0.97]',
                  ].join(' ')}
                >
                  {/* Icon */}
                  <Icon
                    className={`shrink-0 text-lg ${iconClass}`}
                    aria-hidden="true"
                  />

                  {/* Text — label + display value, stacked */}
                  <span className="flex flex-col leading-tight">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {label}
                    </span>
                    <span className="text-sm font-semibold truncate max-w-[190px]">
                      {display}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Divider ─────────────────────────────────────────────────── */}
      <hr
        className="my-8 border-slate-800"
        role="separator"
        aria-hidden="true"
      />

      {/* ── Bottom bar ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">

        {/* Copyright */}
        <p>
          &copy; 2026{' '}
          <a
            href="https://www.linkedin.com/in/shahbaz-qalander-20a8852bb/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-400 hover:text-primary-400
                       underline underline-offset-2 transition-colors duration-200"
            aria-label="Shahbaz Qalander's LinkedIn profile"
          >
            Shahbaz Qalander
          </a>
          . All Rights Reserved.
        </p>

        {/* Social icon-only shortcut row (bottom right) */}
        <div
          className="flex items-center gap-3"
          role="list"
          aria-label="Social media links"
        >
          {CONTACT_LINKS.map(({ id, Icon, label, href, external, iconClass }) => (
            <a
              key={id}
              href={href}
              role="listitem"
              aria-label={label}
              {...(external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className={[
                'flex items-center justify-center h-8 w-8 rounded-lg',
                'border border-slate-800 bg-slate-800/60',
                'transition-all duration-300 ease-out',
                'hover:scale-110 hover:border-slate-600',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                'focus-visible:ring-offset-slate-900',
                'active:scale-95',
              ].join(' ')}
            >
              <Icon className={`text-base ${iconClass}`} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
