import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, Languages, Home, Info, LayoutDashboard, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from "react-router-dom";
import voiceLogo from "../../public/voicelogonew.jpeg";
import InstaICTLogo from "../../public/instaictlogo-removebg-preview.png";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Method explanation: Manages application responsive layout headers with seamless smooth target routing and unified desktop/mobile language dropdown navigation.
const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  const location = useLocation();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'mr', label: 'मराठी' },
    { code: 'hi', label: 'हिन्दी' }
  ];

  const currentLanguageLabel = languages.find(lang => lang.code === i18n.language)?.label || 'English';

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleNavigation = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } });
    } else {
      scrollToSection(id);
    }
  };

  const scrollToSection = (id: string) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
      <motion.header
          variants={{
            visible: { y: 0 },
            hidden: { y: "-100%" },
          }}
          animate={hidden ? "hidden" : "visible"}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="bg-white shadow-sm w-full z-50 fixed top-0 left-0"
      >
        <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Left Side - Logo */}
            <div className="flex items-center">
              <Link to="/" onClick={() => scrollToSection('top')} className="flex items-center">
                <div className="w-12 h-12 md:w-20 md:h-20 bg-background flex items-center justify-center overflow-hidden">
                  <img src={voiceLogo} alt="VoICE Logo" className="w-full h-full object-contain" />
                </div>
              </Link>
            </div>

            {/* Center - Tagline (Desktop) */}
            <div className="hidden lg:flex items-center">
              <span className="text-sm text-muted-foreground italic">
                {t('tagline', '•Smart Intelligent Village')}
              </span>
            </div>

            {/* Right Side - Navigation, Language, & Powered By */}
            <div className="flex items-center gap-2 sm:gap-4">

              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center gap-1 lg:gap-4">
                <Link to="/about-us">
                  <Button variant="ghost" size="sm" className="text-sm font-medium">
                    {t('about_us')}
                  </Button>
                </Link>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigation('projects')}
                    className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {t('solutions')}
                </Button>

                {/* Desktop Language Dropdown Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 ml-2 h-9 px-3"
                    >
                      <Languages className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">{currentLanguageLabel}</span>
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32 bg-white border border-slate-200 shadow-md">
                    {languages.map((lang) => (
                        <DropdownMenuItem
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`cursor-pointer text-sm px-3 py-2 dynamic-lang-item ${
                                i18n.language === lang.code ? 'bg-slate-100 text-primary font-medium' : ''
                            }`}
                        >
                          {lang.label}
                        </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Powered By Section */}
              <div className="hidden md:flex items-center gap-3 border-l pl-4 ml-2">
                <span className="text-xs text-muted-foreground">{t('powered_by', 'Powered by')}</span>
                <div className="w-10 h-10 bg-background flex items-center justify-center overflow-hidden">
                  <img src={InstaICTLogo} alt="Logo" className="h-full w-auto object-contain" />
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full border-primary/20 hover:bg-primary/5">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2">
                    <DropdownMenuItem onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
                      <Home className="w-4 h-4" />
                      <span>{t('home')}</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link to="/about-us" className="flex items-center gap-2 cursor-pointer w-full">
                        <Info className="w-4 h-4" />
                        <span>{t('about_us')}</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleNavigation('projects')} className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>{t('projects')}</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Subheader context item for mobile selection visualization */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                      <Languages className="w-3.5 h-3.5 text-primary" />
                      <span>Language / भाषा</span>
                    </div>
                    {languages.map((lang) => (
                        <DropdownMenuItem
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`pl-8 cursor-pointer text-sm py-1.5 ${
                                i18n.language === lang.code ? 'bg-slate-100 text-primary font-medium' : ''
                            }`}
                        >
                          {lang.label}
                        </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </motion.header>
  );
};

export default Navbar;