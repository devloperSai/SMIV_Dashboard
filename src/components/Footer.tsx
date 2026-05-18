import { motion } from "framer-motion";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { useTranslation } from 'react-i18next'; // Added import
import voiceLogo from "../../public/voicelogonew.jpeg";

const Footer = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: t('home'), href: "#" },
    { label: t('projects'), href: "#projects" },
    { label: t('about_us'), href: "#" },
    { label: t('contact'), href: "#" },
  ];

  return (
      <footer className="relative bg-navy text-primary-foreground overflow-hidden">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 pattern-dots opacity-10" />

        <div className="relative z-10">
          {/* Main Footer Content */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">

              {/* Brand Section */}
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="lg:col-span-2"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center overflow-hidden">
                    <img src={voiceLogo} alt="VoICE Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl">{t('footer_consortium')}</h3>
                    <p className="text-xs text-primary-foreground/60">{t('tagline')}</p>
                  </div>
                </div>
                <p className="text-sm text-primary-foreground/70 mb-4 max-w-md">
                  <span className="font-bold"></span> {t('footer_description')}
                </p>
                <div className="flex items-center gap-2 text-sm text-primary-foreground/60">
                  <span>{t('powered_by')}</span>
                  <span className="font-semibold text-1xl">
                  <span className="text-[#0e7ece]">Insta ICT</span>{' '}<span className="text-[#ffc700]">Solutions</span>
                </span>
                </div>
              </motion.div>

              {/* Quick Links Section */}
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
              >
                <h4 className="font-display font-semibold text-lg mb-4">{t('quick_links')}</h4>
                <ul className="space-y-3">
                  {quickLinks.map((link) => (
                      <li key={link.label}>
                        <a
                            href={link.href}
                            className="text-sm text-primary-foreground/70 hover:text-saffron transition-colors inline-flex items-center gap-2 group"
                        >
                          <span>{link.label}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </li>
                  ))}
                </ul>
              </motion.div>

              {/* Contact Info Section */}
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
              >
                <h4 className="font-display font-semibold text-lg mb-4">{t('contact')}</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-1 text-saffron flex-shrink-0" />
                    <span className="text-sm text-primary-foreground/70">
                    {t('village_location')}
                  </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-saffron flex-shrink-0" />
                    <span className="text-sm text-primary-foreground/70">rkbhatinagar.dg.voice@gmail.com</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-saffron flex-shrink-0" />
                    <span className="text-sm text-primary-foreground/70">+91 93508 36103</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>

          {/* Bottom Bar Section */}
          <div className="border-t border-primary-foreground/10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-xs text-primary-foreground/50 text-center md:text-left">
                  © {currentYear} {t('footer_consortium')}. {t('rights_reserved')}
                </p>
                <div className="flex items-center gap-4 md:gap-6">
                  <a href="#" className="text-xs text-primary-foreground/50 hover:text-saffron transition-colors">
                    {t('privacy_policy')}
                  </a>
                  <a href="#" className="text-xs text-primary-foreground/50 hover:text-saffron transition-colors">
                    {t('terms_of_service')}
                  </a>
                  <a href="#" className="text-xs text-primary-foreground/50 hover:text-saffron transition-colors">
                    {t('accessibility')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
  );
};

export default Footer;