
import { LayoutDashboard } from "lucide-react";
import { useTranslation } from 'react-i18next';

const StatsSection = () => {
  const { t } = useTranslation();
    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-4 py-2 mb-6">
                  <LayoutDashboard className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">{t('dashboard')}</span>
                </div>
                <h2 className="section-title mb-4">
                  {t('unified_dashboard')} <span className="gradient-text">{t('village_title')}</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">{t('real_time_desc')}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <div className="text-center p-10 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="stat-number mb-2 text-5xl font-bold text-primary">24</div>
                  <p className="text-muted-foreground font-medium uppercase tracking-wider">{t('organizations')}</p>
                </div>
                <div className="text-center p-10 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-center">
                  <div className="stat-number font-bold text-lg md:text-xl mb-2 text-foreground">Bharat Net | WiFi | Private Net</div>
                  <p className="text-muted-foreground font-medium uppercase tracking-wider">{t('connectivity')}</p>
                </div>
                <div className="text-center p-10 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="stat-number mb-2 text-5xl font-bold text-primary">24/7</div>
                  <p className="text-muted-foreground font-medium uppercase tracking-wider">{t('monitoring')}</p>
                </div>
              </div>
            </div>
    );
};

export default StatsSection;