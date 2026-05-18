import * as React from "react";
import { WifiCogIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import iconImage from "../../public/iconImage.png";

const HeroSection = () => {
  const { t } = useTranslation();

  const scrollToProjects = () => {
    const element = document.getElementById("projects-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center bg-white p-2.5 overflow-hidden">
      <div className="container mx-auto pt-24 md:pt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* RIGHT CONTENT (IMAGE) - First on mobile, Last on desktop */}
          <div className="relative flex justify-center lg:justify-end items-center w-full min-h-[400px] lg:min-h-[500px] order-first lg:order-last">
            <div className="relative w-full lg:w-[85%]">
              <img
                src={iconImage}
                alt="Main Collection"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating Card - Touched to bottom center on Mobile, Offset Left on Desktop */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 lg:bottom-10 lg:left-[-40px] lg:translate-x-0 bg-white p-5 rounded-2xl shadow-xl z-30 flex items-center gap-4 border border-slate-100">
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                <WifiCogIcon className="text-[#fda603] w-6 h-6 stroke-[3px]" />
              </div>
              <div>
                <p className="font-bold text-slate-900 whitespace-nowrap">{t('digital_empowerment')}</p>
                <p className="text-xs text-slate-500">{t('connectivity_subtitle')}</p>
              </div>
            </div>
          </div>

          {/* LEFT CONTENT (TEXT) - Center aligned on mobile, Left aligned on desktop */}
          <div className="flex flex-col items-center lg:items-start space-y-6 md:space-y-8 animate-in fade-in slide-in-from-left duration-700 text-center lg:text-left order-last lg:order-first">
            <div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                {t('hero_smart')} <span className="text-[#fda603]">{t('hero_intelligent')}</span> {t('hero_village')} <br />
              </h1>

              <p className="mt-6 text-lg text-slate-600 max-w-lg leading-relaxed mx-auto lg:mx-0">
                {t('hero_description')}
              </p>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Button size="lg" variant="outline" className="px-8 h-14 text-lg rounded-md border-slate-200" onClick={scrollToProjects}>
                {t('dashboard')}
              </Button>
            </div>

            {/* Stats - Centered on mobile */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-2">
              <div>
                <p className="text-xl font-bold tracking-wide">{t('connected')}</p>
                <p className="text-sm text-slate-500">{t('rural_infrastructure')}</p>
              </div>
              <div className="hidden md:block h-10 w-px bg-slate-200" />
              <div>
                <p className="text-xl font-bold tracking-wide">{t('scalable')}</p>
                <p className="text-sm text-slate-500">{t('iot_solutions')}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;