import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

// ─────────────────────────────────────────────────────────────────
//  TWEET DATA — sourced directly from screenshots
//  avatarUrl: drop real profile photos into /public and update paths
// ─────────────────────────────────────────────────────────────────
const TWEETS = [
  {
    id: "1960156761853145343",
    url: "https://x.com/NewsArenaIndia/status/1960156761853145343",
    author: {
      name: "News Arena India",
      handle: "@NewsArenaIndia",
      // Replace with actual NAI logo saved to /public
      avatarUrl: "/nai-avatar-clean.png",
      avatarFallbackColor: "#C0392B",
      avatarInitial: "N",
      verified: true,
      officialGold: false,
    },
    lines: [
      "India's first AI-Enabled smart village declared in Nagpur's Satnavari due to efforts of CM Devendra Fadnavis.",
      "Farmers in Satnavari said they now use drones and sensors for soil testing, spraying, and fertiliser management.",
    ],
    // Village aerial shot — already in your /public
    mediaUrl: "/nai-avatar.png",
    mediaAlt: "News Arena India",
    date: "May 2025",
    stats: { replies: 47, retweets: 312, likes: 1800 },
  },
  {
    id: "1959550932846592288",
    url: "https://x.com/CMOMaharashtra/status/1959550932846592288",
    author: {
      name: "CMO Maharashtra",
      handle: "@CMOMaharashtra",
      avatarUrl: "/cmo-avatar-clean.png",
      avatarFallbackColor: "#1A5276",
      avatarInitial: "C",
      verified: true,
    },
    lines: [
      "Inauguration and stone plaque unveiling of 'India's first Smart and Intelligent Village (pilot project) - Satnavari, Nagpur' at the hands of CM Devendra Fadnavis.",
      "Minister Chandrashekhar Bawankule, MLA Charansingh Thakur and other dignitaries were present...",
    ],
    mediaUrl: "/cmo-avatar.png",
    mediaAlt: "CMO Maharashtra",
    date: "24 Aug 2025 · 12:45 PM",
    hashtags: ["#Maharashtra", "#DevendraFadnavis", "#SmartVillage"],
    stats: { replies: 214, retweets: 892, likes: 3421 },
  },
  {
    id: "2051601182037270783",
    url: "https://x.com/JM_Scindia/status/2051601182037270783",
    author: {
      name: "Jyotiraditya M. Scindia",
      handle: "@JM_Scindia",
      avatarUrl: "/scindia-avatar-clean.png",
      avatarFallbackColor: "#1B4F72",
      avatarInitial: "J",
      verified: true,
    },
    lines: [
      "Chaired a productive Stakeholder Advisory Committee meeting of the Telecom Research Standardisation & Innovation Committee.",
      "Also discussed the Smart Intelligent Village project by the industry and its potential synergy with @DoT_India's Samriddh Gram initiative, advancing the Aatmanirbhar Bharat vision through inclusive and locally driven rural transformation.",
    ],
    mediaUrl: "/recognition_sadan.png",
    mediaAlt: "Jyotiraditya M. Scindia",
    date: "3:23 PM · May 5, 2026",
    stats: { replies: 398, retweets: 1340, likes: 5102 },
  },
];

// ─────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────
function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// X (Twitter) bird logo
const XLogo = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-label="X (Twitter)"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Blue verified badge — exact X/Twitter SVG
const BlueBadge = () => (
  <svg
    viewBox="0 0 22 22"
    aria-label="Verified account"
    className="inline w-[18px] h-[18px] ml-[3px] shrink-0 translate-y-[-1px]"
  >
    <path
      fill="#1d9bf0"
      d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"
    />
  </svg>
);

// Gold government badge — exact X/Twitter gold verified SVG
const GoldBadge = () => (
  <svg
    viewBox="0 0 22 22"
    aria-label="Government account"
    className="inline w-[18px] h-[18px] ml-[2px] shrink-0 translate-y-[-1px]"
  >
    <path
      fill="#FFD400"
      d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"
    />
  </svg>
);

// Reply icon
const ReplyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
    <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
  </svg>
);

// Retweet icon
const RetweetIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
    <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
  </svg>
);

// Like icon
const LikeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
    <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
  </svg>
);

// Share icon
const ShareIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
    <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────
//  Avatar — real image with fallback to colored initial
// ─────────────────────────────────────────────────────────────────
const Avatar = ({
  src,
  name,
  fallbackColor,
  initial,
}: {
  src: string;
  name: string;
  fallbackColor: string;
  initial: string;
}) => {
  return (
    <div
      style={{
        position: "relative",
        width: 44,
        height: 44,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        boxShadow: "0 0 0 1.5px rgba(0,0,0,0.08)",
      }}
    >
      <img
        src={src}
        alt={name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
          display: "block",
          borderRadius: "50%",
        }}
        onError={(e) => {
          const img = e.currentTarget;
          img.style.display = "none";
          const fallback = img.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = "flex";
        }}
      />
      <div
        style={{
          display: "none",
          position: "absolute",
          inset: 0,
          backgroundColor: fallbackColor,
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 700,
          fontSize: 15,
        }}
      >
        {initial}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
//  Single Tweet Card
// ─────────────────────────────────────────────────────────────────
const TweetCard = ({
  tweet,
  index,
}: {
  tweet: (typeof TWEETS)[0];
  index: number;
}) => {
  return (
    <motion.a
      href={tweet.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.13,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.22, ease: "easeOut" },
      }}
      className="group block w-full h-full rounded-2xl bg-white border border-[#eff3f4] no-underline text-inherit cursor-pointer
                 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]
                 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15),0_2px_8px_rgba(0,0,0,0.08)]
                 hover:border-[#d6dce0]
                 transition-[box-shadow,border-color] duration-250 overflow-hidden"
      style={{ textDecoration: "none" }}
      aria-label={`Tweet by ${tweet.author.name} — click to view on X`}
    >
      {/* ── Card body ── */}
      <div className="p-4 flex flex-col h-full">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar
              src={tweet.author.avatarUrl}
              name={tweet.author.name}
              fallbackColor={tweet.author.avatarFallbackColor}
              initial={tweet.author.avatarInitial}
            />
            <div className="min-w-0 leading-none">
              <div className="flex items-center flex-wrap gap-0.5">
                <span className="font-bold text-[15px] text-[#0f1419] leading-snug">
                  {tweet.author.name}
                </span>
                {tweet.author.verified && <BlueBadge />}
                {tweet.author.officialGold && <GoldBadge />}
              </div>
              <div className="text-[13px] text-[#536471] mt-[1px]">
                {tweet.author.handle}
              </div>
            </div>
          </div>

          {/* X logo — top right */}
          <XLogo className="w-5 h-5 text-[#0f1419] shrink-0 mt-[2px] opacity-90" />
        </div>

        {/* Tweet text — grows to push image+footer to bottom */}
        <div className="flex-1 text-[15px] leading-[1.5] text-[#0f1419] mb-3 space-y-2">
          {tweet.lines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
          {/* Hashtags row */}
          {"hashtags" in tweet && tweet.hashtags && (
            <p>
              {tweet.hashtags.map((tag) => (
                <span key={tag} className="text-[#1d9bf0] mr-1.5">
                  {tag}
                </span>
              ))}
            </p>
          )}
        </div>

        {/* Media image */}
        {tweet.mediaUrl && (
          <div className="rounded-xl overflow-hidden border border-[#eff3f4] mb-3 h-[200px] shrink-0">
            <img
              src={tweet.mediaUrl}
              alt={tweet.mediaAlt}
              className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-[1.04]"
              onError={(e) => {
                (
                  e.currentTarget as HTMLImageElement
                ).parentElement!.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Date */}
        <div className="text-[13px] text-[#536471] mb-3 pb-3 border-b border-[#eff3f4]">
          {tweet.date}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-auto">
          <button
            className="flex items-center gap-1.5 text-[#536471] text-[13px] hover:text-[#1d9bf0] transition-colors group/btn"
            onClick={(e) => e.preventDefault()}
            aria-label={`${tweet.stats.replies} replies`}
          >
            <span className="group-hover/btn:bg-[#1d9bf0]/10 rounded-full p-1.5 -m-1.5 transition-colors">
              <ReplyIcon />
            </span>
            {fmtNum(tweet.stats.replies)}
          </button>

          <button
            className="flex items-center gap-1.5 text-[#536471] text-[13px] hover:text-[#00ba7c] transition-colors group/btn"
            onClick={(e) => e.preventDefault()}
            aria-label={`${tweet.stats.retweets} retweets`}
          >
            <span className="group-hover/btn:bg-[#00ba7c]/10 rounded-full p-1.5 -m-1.5 transition-colors">
              <RetweetIcon />
            </span>
            {fmtNum(tweet.stats.retweets)}
          </button>

          <button
            className="flex items-center gap-1.5 text-[#536471] text-[13px] hover:text-[#f91880] transition-colors group/btn"
            onClick={(e) => e.preventDefault()}
            aria-label={`${tweet.stats.likes} likes`}
          >
            <span className="group-hover/btn:bg-[#f91880]/10 rounded-full p-1.5 -m-1.5 transition-colors">
              <LikeIcon />
            </span>
            {fmtNum(tweet.stats.likes)}
          </button>

          <button
            className="ml-auto flex items-center gap-1.5 text-[#536471] text-[13px] hover:text-[#1d9bf0] transition-colors group/btn"
            onClick={(e) => e.preventDefault()}
            aria-label="Share"
          >
            <span className="group-hover/btn:bg-[#1d9bf0]/10 rounded-full p-1.5 -m-1.5 transition-colors">
              <ShareIcon />
            </span>
          </button>
        </div>
      </div>
    </motion.a>
  );
};

// ─────────────────────────────────────────────────────────────────
//  Section — drop-in replacement for the Official Recognition block
//  in AboutUs.tsx. Remove the old <section> and put this instead.
// ─────────────────────────────────────────────────────────────────
const OfficialRecognitionSection = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-3">
            {t("official_recognition")}
          </h2>
          <p className="flex items-center justify-center gap-1.5 text-sm text-[#536471]">
            As recognised on
            <XLogo className="w-3.5 h-3.5 text-[#536471]" />
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch justify-items-center">
          {TWEETS.map((tweet, i) => (
            <TweetCard key={tweet.id} tweet={tweet} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OfficialRecognitionSection;
