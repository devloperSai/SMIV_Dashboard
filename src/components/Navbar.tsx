import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, Languages, Home, Info, LayoutDashboard } from "lucide-react";
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

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  const location = useLocation();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'mr' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleNavigation = (id: string) => {
    if (location.pathname !== '/') {
      // If not on home page, navigate to home first then scroll
      navigate('/', { state: { scrollTo: id } });
    } else {
      // If on home page, just scroll
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

                {/* Language Toggle Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 ml-2"
                >
                  <Languages className="w-4 h-4 text-primary" />
                  <span className="font-medium">
                  {i18n.language === 'en' ? 'मराठी' : 'English'}
                </span>
                </Button>
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

                    <DropdownMenuItem onClick={toggleLanguage} className="flex items-center gap-2 cursor-pointer">
                      <Languages className="w-4 h-4 text-primary" />
                      <span className="font-medium">
                      {i18n.language === 'en' ? 'मराठी' : 'English'}
                    </span>
                    </DropdownMenuItem>
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