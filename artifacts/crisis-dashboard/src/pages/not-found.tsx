import { useEffect, useState } from "react";
import {
  ArrowRight,
  Dribbble,
  Facebook,
  Instagram,
  Linkedin,
  Menu,
  Twitter,
  X,
  Youtube,
} from "lucide-react";
import { BackgroundVideo } from "@/components/layout/BackgroundVideo";

const navLinks = ["Domain", "Servers", "Cloud", "Managed", "Email", "Privacy"];

const footerColumns = [
  {
    title: "SERVERS",
    links: ["Web Servers", "VPS Servers", "Cloud Servers", "Managed Instances", "Bare Metal"],
  },
  {
    title: "DOMAINS",
    links: ["Find Domain", "Move Domains", "DNS Manager", "Domain Costs"],
  },
  {
    title: "HELP US",
    links: ["Open a Ticket", "FAQs", "Docs", "Tutorials", "Forum"],
  },
  {
    title: "ABOUT",
    links: ["Our Story", "Leadership Team", "Press Room", "We Hire", "Alliance", "Blog"],
  },
];

const socialIcons = [Facebook, Twitter, Dribbble, Youtube, Linkedin, Instagram];

const logoPaths = [
  "M480 240a240 240 0 0 0-240 240 240 240 0 0 0 240-240Z",
  "M240 0A240 240 0 0 0 0 240 240 240 0 0 0 240 0Z",
  "M480 240A240 240 0 0 0 240 0a240 240 0 0 0 240 240Z",
  "M240 480A240 240 0 0 0 0 240a240 240 0 0 0 240 240Z",
];

export default function NotFound() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  useEffect(() => {
    if (mobileMenuOpen) {
      const openTimer = window.setTimeout(() => setMenuVisible(true), 10);
      return () => window.clearTimeout(openTimer);
    }

    setMenuVisible(false);
    return undefined;
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseMenu();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  const handleOpenMenu = () => {
    setMobileMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setMenuVisible(false);
    window.setTimeout(() => setMobileMenuOpen(false), 500);
  };

  const toggleMenu = () => {
    if (mobileMenuOpen) {
      handleCloseMenu();
      return;
    }

    handleOpenMenu();
  };

  return (
    <div
      className="relative flex min-h-screen w-full flex-col overflow-hidden"
      style={{ fontFamily: '"Helvetica Now Var", Helvetica, Arial, sans-serif' }}
    >
      <BackgroundVideo overlayClassName="bg-[radial-gradient(circle_at_top,rgba(70,196,255,0.14),transparent_32%),linear-gradient(180deg,rgba(5,10,25,0.2),rgba(2,6,23,0.86))]" />

      <div className="relative z-[2] flex min-h-screen flex-col">
        <nav className="px-6 py-5 md:px-12 lg:px-16">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <svg viewBox="0 0 480 480" className="h-8 w-8 fill-white" aria-hidden="true">
                {logoPaths.map((path) => (
                  <path key={path} d={path} />
                ))}
              </svg>
              <span className="text-xl font-bold tracking-[0.22em] text-white">NEXOVA</span>
            </a>

            <div className="hidden items-center gap-8 lg:flex">
              {navLinks.map((link) => (
                <a
                  key={link}
                  href="/"
                  className="text-sm tracking-wide text-white/80 transition-colors duration-200 hover:text-white"
                >
                  {link}
                </a>
              ))}
            </div>

            <div className="hidden lg:block">
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white"
              >
                <span>LOG IN</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <button
              type="button"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              onClick={toggleMenu}
              className="relative z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white lg:hidden"
            >
              <Menu
                className={`absolute h-5 w-5 transition-all duration-300 ${
                  mobileMenuOpen ? "rotate-90 scale-75 opacity-0" : "rotate-0 scale-100 opacity-100"
                }`}
              />
              <X
                className={`absolute h-5 w-5 transition-all duration-300 ${
                  mobileMenuOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-75 opacity-0"
                }`}
              />
            </button>
          </div>
        </nav>

        {mobileMenuOpen ? (
          <>
            <button
              type="button"
              aria-label="Close mobile menu"
              className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-md transition-opacity duration-400 ${
                menuVisible ? "opacity-100" : "opacity-0"
              }`}
              onClick={handleCloseMenu}
            />

            <div className="absolute left-0 right-0 top-[68px] z-50 px-4 sm:px-6">
              <div className="relative overflow-hidden rounded-b-2xl">
                <div className="absolute inset-0 rounded-b-2xl backdrop-blur-xl" />
                <div className="relative z-10 flex flex-col items-center gap-5 px-6 py-8">
                  {navLinks.map((link, index) => (
                    <a
                      key={link}
                      href="/"
                      onClick={handleCloseMenu}
                      className={`text-center text-lg font-light tracking-[0.08em] text-white/80 transition-all duration-400 ease-out hover:text-white sm:text-xl ${
                        menuVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                      }`}
                      style={{
                        transitionDelay: menuVisible ? `${350 + index * 50}ms` : "0ms",
                      }}
                    >
                      {link}
                    </a>
                  ))}

                  <a
                    href="/"
                    onClick={handleCloseMenu}
                    className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-400 ease-out ${
                      menuVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                    }`}
                    style={{
                      transitionDelay: menuVisible ? `${350 + navLinks.length * 50}ms` : "0ms",
                    }}
                  >
                    <span>LOG IN</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </>
        ) : null}

        <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center sm:px-6 sm:py-16 md:py-0">
          <h1 className="mb-1 text-lg font-light leading-snug tracking-tight text-white/80 sm:mb-2 sm:text-3xl md:text-5xl">
            This page seems to have
          </h1>
          <h1 className="mb-8 text-lg font-light leading-snug tracking-tight text-white/80 sm:mb-12 sm:text-3xl md:text-5xl">
            slipped beyond our reach :/
          </h1>

          <div className="relative mb-8 flex w-full justify-center overflow-visible sm:mb-12">
            <span className="four-oh-four select-none text-[80px] leading-none font-black tracking-tighter text-white sm:text-[140px] md:text-[200px] lg:text-[260px]">
              404
            </span>
          </div>

          <a
            href="/"
            className="liquid-glass rounded-full px-6 py-3 text-[10px] font-medium uppercase tracking-[0.15em] text-white sm:px-8 sm:py-3.5 sm:text-sm sm:tracking-[0.2em]"
          >
            Return to Main Page
          </a>
        </main>

        <footer className="relative z-10 px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-16 md:px-12 lg:px-16">
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4 lg:grid-cols-6 lg:gap-6">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h2 className="mb-3 text-[10px] font-bold tracking-[0.15em] text-white sm:mb-4 sm:text-xs">
                  {column.title}
                </h2>
                <div className="space-y-2 sm:space-y-2.5">
                  {column.links.map((link) => (
                    <a
                      key={link}
                      href="/"
                      className="block text-[10px] text-white/50 transition-colors duration-200 hover:text-white/80 sm:text-xs"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}

            <div className="col-span-2 lg:col-span-2">
              <h2 className="mb-3 text-[10px] font-bold tracking-[0.15em] text-white sm:mb-4 sm:text-xs">
                JOIN FOR EXCLUSIVE DEALS
              </h2>
              <form className="flex max-w-sm">
                <input
                  type="email"
                  placeholder="Type your email to sign up"
                  className="min-w-0 flex-1 rounded-l-md border-0 bg-white px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  className="rounded-r-md bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-2 text-xs font-bold tracking-wider text-white"
                >
                  SEND IT
                </button>
              </form>

              <h2 className="mb-3 mt-5 text-[10px] font-bold tracking-[0.15em] text-white sm:mb-4 sm:mt-6 sm:text-xs">
                CONNECT
              </h2>
              <div className="flex items-center gap-3">
                {socialIcons.map((Icon, index) => (
                  <a key={index} href="/" className="text-white/50 transition-colors duration-200 hover:text-white">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
