import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react"; // Imported for the arrow icon
import eventImg1 from "/public/teamPhoto.png";
import eventImg2 from "/public/inogration_by_cm.jpg";
import eventImg3 from "/public/inogration_by_cm2.jpg";

const EventSection = () => {
  const { t } = useTranslation();

  return (
      <section id="event-section" className="py-16 md:py-20 bg-secondary relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">

            <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
              <Carousel
                  plugins={[Autoplay({ delay: 3000 })]}
                  className="w-full overflow-hidden shadow-2xl border border-border rounded-2xl"
              >
                <CarouselContent>
                  {[eventImg1, eventImg2, eventImg3].map((img, index) => (
                      <CarouselItem key={index}>
                        <div className="relative aspect-video">
                          <img
                              src={img}
                              alt={`Event image ${index + 1}`}
                              className="w-full h-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-navy">
                {t('inaugurated_by')}
              </h2>
              <h3 className="text-xl font-semibold text-primary">
                <span className="gradient-text">{t('discussion_title')}</span>
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('meeting_description')}
              </p>
              <div className="pt-2">
                <Link to="/about-us">
                  <Button
                      variant="link"
                      className="p-0 h-auto text-primary font-bold text-lg hover:no-underline group"
                  >
                    {t('view_recognition')}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
  );
};

export default EventSection;