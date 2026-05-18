import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tweet } from 'react-tweet';
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowRight } from "lucide-react";


// ─────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────
const AboutUs = () => {
    const { t } = useTranslation();

    const galleryImages = [
        "/inogration_by_cm.jpg",
        "/inogration_by_cm2.jpg",
        "/inogration_by_cm3.jpg",
        "/meeting_with_cm.jpeg",
        "/meeting_with_cm2.jpeg",
        "/meeting_with_cm3.jpeg",
        "/meeting_with_cm4.jpeg",
        "/smart_village_image1.jpg",
        "/smart_village_image2.jpg",
        "/smart_village_image3.jpg",
        "/smart_village_image4.jpg",
        "/smart_village_image5.jpg",
        "/smart_village_image6.jpg",
        "/recognition_newspaper.jpeg",
        "/recognition_booklaunch.jpeg",
        "/recognition_nmc.jpeg",
        "/recognition_sadan.jpeg",
    ];

    const [selectedImage, setSelectedImage] = useState(galleryImages[0]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [visibleCount, setVisibleCount] = useState(6);
    const featuredRef = useRef<HTMLDivElement>(null);

    const handleSelectImage = (img: string) => {
        setSelectedImage(img);
        setTimeout(() => {
            featuredRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main>
                {/* ── Hero ── */}
                <section className="relative h-[60vh] w-full overflow-hidden mt-16 md:mt-20">
                    <img
                        src="/hero-village.jpg"
                        alt="Smart Village Overview"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center text-white px-4"
                        >
                            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight py-2">
                                {t('about_hero_title')}
                            </h1>
                            <p className="text-lg md:text-xl text-lime-100 max-w-2xl mx-auto opacity-90 leading-relaxed py-1">
                                {t('about_hero_subtitle')}
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* ── Gallery ── */}
                <section className="py-16 bg-secondary/10">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="max-w-5xl mx-auto"
                        >
                            <h2 className="text-3xl font-bold mb-8 text-center gradient-text">{t('gallery_title')}</h2>

                            <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
                                <DialogTrigger asChild>
                                    <div ref={featuredRef} className="mb-8 overflow-hidden shadow-2xl md:h-[550px] cursor-pointer group relative">
                                        <img
                                            src={selectedImage}
                                            alt="Featured Village View"
                                            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-transparent border-none shadow-none [&>button]:text-white [&>button]:opacity-100">
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <img
                                            src={selectedImage}
                                            alt="Enlarged view"
                                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                                        />
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                                <AnimatePresence mode="popLayout">
                                    {galleryImages.slice(0, visibleCount).map((img, index) => (
                                        <motion.div
                                            key={img}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.4, delay: index % 6 * 0.1 }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleSelectImage(img)}
                                            className={`cursor-pointer overflow-hidden shadow-md border-2 transition-all 
                                                ${selectedImage === img ? 'border-primary' : 'border-transparent'}`}
                                        >
                                            <img
                                                src={img}
                                                alt={`Gallery item ${index + 1}`}
                                                className="w-full aspect-video object-cover"
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {visibleCount < galleryImages.length && (
                                <div className="mt-12 text-center">
                                    <Button
                                        onClick={() => setVisibleCount(galleryImages.length)}
                                        variant="link"
                                        className="p-0 h-auto text-primary font-bold text-lg hover:no-underline group"
                                    >
                                        {t('load_more')}
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </section>

                {/* ── Official Recognition ── */}
                <section className="bg-white py-20">
                    {/* Force all react-tweet articles to fill the height of their wrapper */}
                    <style>{`
                        .tweet-card-wrap > div,
                        .tweet-card-wrap article {
                            height: 100% !important;
                            display: flex !important;
                            flex-direction: column !important;
                        }
                    `}</style>
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                                {t('official_recognition')}
                            </h2>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch justify-items-center">

                            {/* Card 1 — Tweet */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                whileHover={{
                                    y: -8,
                                    scale: 1.02,
                                    transition: { duration: 0.25, ease: "easeOut" },
                                }}
                                transition={{ duration: 0.5, delay: 0 }}
                                viewport={{ once: true }}
                                className="w-full flex justify-center cursor-pointer"
                                data-theme="light"
                            >
                                <div className="tweet-card-wrap w-full max-w-[550px]" style={{ minHeight: 500 }}>
                                    <Tweet id="1960156761853145343" />
                                </div>
                            </motion.div>

                            {/* Card 2 — Tweet */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                whileHover={{
                                    y: -8,
                                    scale: 1.02,
                                    transition: { duration: 0.25, ease: "easeOut" },
                                }}
                                transition={{ duration: 0.5, delay: 0.12 }}
                                viewport={{ once: true }}
                                className="w-full flex justify-center cursor-pointer"
                                data-theme="light"
                            >
                                <div className="tweet-card-wrap w-full max-w-[550px]" style={{ minHeight: 500 }}>
                                    <Tweet id="1959550932846592288" />
                                </div>
                            </motion.div>

                            {/* Card 3 — Tweet (Jyotiraditya M Scindia) */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                whileHover={{
                                    y: -8,
                                    scale: 1.02,
                                    transition: { duration: 0.25, ease: "easeOut" },
                                }}
                                transition={{ duration: 0.5, delay: 0.24 }}
                                viewport={{ once: true }}
                                className="w-full flex justify-center cursor-pointer"
                                data-theme="light"
                            >
                                <div className="tweet-card-wrap w-full max-w-[550px]" style={{ minHeight: 500 }}>
                                    <Tweet id="2051601182037270783" />
                                </div>
                            </motion.div>

                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default AboutUs;