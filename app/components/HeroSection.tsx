"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import heroConfig from "../config/sections/hero.json"
import type { HeroConfig } from "../types/hero"
import uiConfig from "../config/sections/ui.json"

const config = heroConfig as HeroConfig;
import { ArrowRight, Server, Shield, Clock, Users } from "lucide-react"
import { FiExternalLink } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

const generateBlurDataURL = () => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxZjI5MzciLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxMTE4MjciLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==';
};

export default function HeroSection() {
  const { t } = useLanguage();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState(new Set<number>())
  const [preloadedImages, setPreloadedImages] = useState(new Set<number>())
  const controls = useAnimation()
  const preloadTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const preloadImage = useCallback((index: number) => {
    if (preloadedImages.has(index)) return;

    const img = new window.Image();
    img.onload = () => {
      setPreloadedImages(prev => new Set([...prev, index]));
      setImagesLoaded(prev => new Set([...prev, index]));
    };
    img.src = config.hero.games[index]?.banner;
  }, [preloadedImages]);
  const preloadNextImages = useCallback((currentIndex: number) => {
    const nextIndex = (currentIndex + 1) % config.hero.games.length;
    const nextNextIndex = (currentIndex + 2) % config.hero.games.length;
    preloadImage(nextIndex);
    preloadTimeoutRef.current = setTimeout(() => {
      preloadImage(nextNextIndex);
    }, 1000);
  }, [preloadImage]);
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    preloadImage(0);
    preloadImage(1);
    setTimeout(() => preloadImage(2), 500);
    setImagesLoaded(new Set([0]));
    interval = setInterval(() => {
      setCurrentBannerIndex((prev) => {
        const next = (prev + 1) % config.hero.games.length;
        preloadNextImages(next);
        return next;
      });
    }, config.hero.cycleInterval);

    return () => {
      if (interval) clearInterval(interval);
      if (preloadTimeoutRef.current) clearTimeout(preloadTimeoutRef.current);
    };
  }, [preloadImage, preloadNextImages])

  const currentGame = config.hero.games[currentBannerIndex] || config.hero.games[0]
  const partners = config.hero.partners
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 60,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100,
        duration: 0.8,
      },
    },
  }

  const featureBoxVariants = {
    hidden: {
      opacity: 0,
      y: 40,
      scale: 0.9,
      rotateX: 15,
    },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 120,
        delay: 0.4 + index * 0.1,
        duration: 0.7,
      },
    }),
    hover: {
      scale: 1.02,
      y: -5,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 300,
      },
    },
  }

  const iconVariants = {
    initial: { scale: 1, rotate: 0 },
    animate: {
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
    hover: {
      scale: 1.2,
      rotate: 10,
      transition: {
        type: "spring" as const,
        damping: 15,
        stiffness: 300,
      },
    },
  }

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring" as const,
        damping: 15,
        stiffness: 300,
      },
    },
    tap: { scale: 0.98 },
  }

  const decorativeSvgVariants = {
    initial: {
      opacity: 0,
      scale: 0.8,
    },
    animate: {
      opacity: 0.6,
      scale: 1,
      transition: {
        duration: 2,
        ease: "easeOut" as const,
      },
    },
  }

  return (
    <motion.div
      className="bg-gray-50 dark:bg-[#0a0b0f] relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBannerIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={currentGame.banner}
              alt={`${currentGame.displayName} game banner`}
              fill
              priority={currentBannerIndex === 0}
              className={`object-cover object-center w-full h-full transition-opacity duration-700 ${imagesLoaded.has(currentBannerIndex) ? 'opacity-100' : 'opacity-0'
                }`}
              quality={currentBannerIndex === 0 ? 85 : 75}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
              placeholder="blur"
              blurDataURL={generateBlurDataURL()}
              loading={currentBannerIndex < 3 ? "eager" : "lazy"}
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              onLoad={() => {
                setImagesLoaded(prev => new Set([...prev, currentBannerIndex]));
              }}
            />
            {!imagesLoaded.has(currentBannerIndex) && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
            )}
          </motion.div>
        </AnimatePresence>
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-gray-50 via-gray-50/40 to-transparent dark:from-[#0a0b0f]/50 dark:via-[#0a0b0f]/10 dark:to-transparent"
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/60 to-gray-50/40 dark:from-[#0a0b0f] dark:via-[#0a0b0f]/90 dark:to-[#0a0b0f]/40"
        />
      </div>
      <motion.div
        className="absolute top-0 right-0 z-0 pointer-events-none w-screen h-screen overflow-hidden"
        variants={decorativeSvgVariants}
        initial="initial"
        animate="animate"
      >
        <svg
          className="absolute right-[-10%] top-[-5%] w-[700px] h-[700px]"
          viewBox="0 0 803 808"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_f_top)">
            <ellipse cx="401.5" cy="404" rx="101.5" ry="104" className="blob-primary" />
          </g>
          <defs>
            <filter
              id="filter0_f_top"
              x="0"
              y="0"
              width="803"
              height="808"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="150" result="effect1_foregroundBlur_top" />
            </filter>
          </defs>
        </svg>
      </motion.div>
      <div className="relative z-0">
        <section className="flex items-center px-4 sm:px-6 lg:px-8 pt-32 sm:pt-52 pb-16">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <motion.div
                className="text-left"
                variants={itemVariants}
              >
                <motion.div
                  variants={itemVariants}
                  className="mb-8"
                >
                  <motion.h1
                    className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight orbitron-font"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      damping: 20,
                      stiffness: 100,
                      delay: 0.3,
                    }}
                  >
                    <motion.span
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                    >
                      {t('hero.titlePrefix')}
                    </motion.span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={currentGame.displayName}
                        initial={{ opacity: 0, y: 30, rotateX: 90 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, y: -30, rotateX: -90 }}
                        transition={{
                          duration: 1,
                          ease: [0.25, 0.46, 0.45, 0.94],
                          rotateX: { duration: 0.8 }
                        }}
                        className="block text-secondary"
                        style={{ perspective: "1000px" }}
                      >
                        {currentGame.displayName}
                        {currentGame.showSuffix && (
                          <span className="text-gray-900 dark:text-white"> {t('hero.titleSuffix')}</span>
                        )}
                      </motion.span>
                    </AnimatePresence>
                  </motion.h1>
                  <motion.p
                    className="text-md sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      damping: 25,
                      stiffness: 120,
                      delay: 0.7,
                    }}
                  >
                    {t('hero.description')}
                  </motion.p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-4 items-start mb-8"
                >
                  <motion.div
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    className="relative"
                  >
                    <a
                      href="/games"
                      className="group button-primary text-button-primary px-4 py-3 rounded-md font-bold text-md transition-all duration-300 flex items-center gap-2 backdrop-blur-sm no-underline shadow-none hover:shadow-none relative"
                    >
                      <span className="orbitron-font">{t('hero.getStarted')}</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </motion.div>
                    </a>
                    {uiConfig.christmasTheme.enabled && (
                      <>
                        <Image
                          src="/christmas/button-deco-up.png"
                          alt="Christmas decoration"
                          width={40}
                          height={40}
                          className="absolute -top-3 -right-3 pointer-events-none"
                        />
                        <Image
                          src="/christmas/button-deco-down.png"
                          alt="Christmas decoration"
                          width={40}
                          height={40}
                          className="absolute -bottom-3 -left-3 pointer-events-none"
                        />
                      </>
                    )}
                  </motion.div>

                  <motion.div
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <a
                      href="#"
                      className="hidden sm:inline-flex text-gray-700 dark:text-white hover:bg-transparent hover:shadow-none px-8 py-3 rounded-lg orbitron-font text-md transition-all duration-300 items-center gap-2 no-underline"
                    >
                      {t('hero.learnMore')}
                      <FiExternalLink className="w-4 h-4" />
                    </a>

                  </motion.div>
                </motion.div>


                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-3 -mt-6 ml-4"
                >
                  <motion.svg
                    fill="currentColor"
                    className="w-6 h-6 icon-primary"
                    viewBox="0 0 342.674 342.674"
                    xmlns="http://www.w3.org/2000/svg"

                  >
                    <g>
                      <g>
                        <path d="M18.36,36.83c0-3.672,0-7.956-1.224-11.628c-0.612-3.672-7.344-3.672-7.956,0c-0.612,3.672-0.612,7.344-1.224,11.016c0,2.448,0,4.284,0,6.732c0,1.224,0,2.448,0.612,3.672c0.612,0.612,1.224,1.224,1.836,1.836c-1.224-0.612-1.224-1.224-0.612,0c1.224,2.448,4.896,2.448,5.508,0v-0.612l0,0c1.224-1.224,1.224-2.448,1.224-4.284C18.36,41.726,18.36,39.278,18.36,36.83z" />
                        <path d="M7.956,87.014c0-1.836-2.448-1.836-3.06,0c-0.612,11.016-3.672,22.032-3.672,33.048c0,6.732,10.404,6.732,10.404,0C11.628,109.046,9.18,98.03,7.956,87.014z" />
                        <path d="M12.24,157.394c0.612-2.448-3.06-4.896-4.896-1.836c-2.448,5.508-4.284,11.016-4.896,17.136c-0.612,5.508-1.836,11.016,0.612,15.912c1.224,2.447,4.896,2.447,6.12,0c2.448-3.672,1.836-7.957,1.836-12.24C11.016,169.634,11.628,163.514,12.24,157.394z" />
                        <path d="M11.016,241.238c-2.448-6.12-4.284-11.628-4.896-17.748c-0.612-3.672-6.12-3.672-6.12,0c0,5.508,0,11.016,0.612,15.912c0.612,5.508,1.836,12.852,6.12,16.523c1.836,1.836,6.12,1.225,6.732-1.836C14.688,249.194,12.852,245.522,11.016,241.238z" />
                        <path d="M48.348,287.138c-3.06-2.447-7.956-1.836-11.628-3.06c-4.896-1.224-8.568-4.284-10.404-9.18c-1.224-3.061-6.12-0.612-4.896,1.836c1.836,6.12,5.508,10.403,10.404,13.464c4.896,2.448,12.24,5.508,17.136,1.836C50.184,290.81,50.184,288.362,48.348,287.138z" />
                        <path d="M108.936,293.87c-7.344-6.732-19.584-4.896-28.764-4.284c-4.284,0-4.284,6.12,0,6.732c4.284,0,8.568,0.611,12.852,1.224s9.18,2.448,13.464,1.836C108.936,299.378,111.384,296.318,108.936,293.87z" />
                        <path d="M175.031,292.646c-10.404-6.12-25.091-4.284-36.107,0c-4.284,1.836-2.448,7.956,1.836,6.731c11.016-2.448,21.42,0,32.436,0.612C177.48,300.603,178.703,294.482,175.031,292.646z" />
                        <path d="M236.844,289.586c-9.791-3.06-20.809-1.224-30.6-0.612c-4.896,0-4.896,7.345,0,7.345c9.791,0.611,21.42,2.447,30.6-0.612C240.516,295.094,240.516,290.81,236.844,289.586z" />
                        <path d="M294.984,287.138c-4.285-4.283-9.793-2.447-15.301-1.836c-6.119,0.612-12.24,1.836-18.359,3.672c-4.285,1.836-3.061,8.568,1.836,7.345c6.119-1.836,12.24-2.448,18.359-2.448c4.896,0,9.18,1.224,12.852-2.448C296.207,290.81,296.207,288.362,294.984,287.138z" />
                        <path d="M337.824,282.854c-14.076-3.673-23.869-15.301-37.332-20.809c-4.896-1.836-7.344,5.508-3.672,8.568c9.18,6.12,17.135,14.688,26.928,20.808c-3.672,3.061-7.344,6.12-11.629,9.181c-4.283,3.06-11.016,4.283-14.076,8.567c-1.836,2.448-2.447,6.12,0,8.568c11.629,10.404,34.885-14.688,42.229-22.645C344.557,290.81,342.721,284.078,337.824,282.854z" />
                      </g>
                    </g>
                  </motion.svg>
                  <motion.span
                    className="text-gray-600 -mb-4 dark:text-gray-300 text-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                  >
                    {t('hero.getStartedFree')}
                  </motion.span>
                </motion.div>
              </motion.div>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4"
                variants={containerVariants}
              >
                {[
                  { icon: Server, titleKey: "instantSetup", descKey: "instantSetupDesc", index: 0 },
                  { icon: Shield, titleKey: "ddosProtection", descKey: "ddosProtectionDesc", index: 1 },
                  { icon: Clock, titleKey: "uptime", descKey: "uptimeDesc", index: 2 },
                  { icon: Users, titleKey: "support", descKey: "supportDesc", index: 3 },
                ].map((feature) => (
                  <motion.div
                    key={feature.titleKey}
                    custom={feature.index}
                    variants={featureBoxVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    className="bg-white/20 dark:bg-white/5 backdrop-blur-sm border border-primary rounded-md hover:border-secondary hover:hover-gradient group transition-all duration-300 relative cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 p-4">
                        <motion.h3
                          className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-icon-text-primary transition-colors"
                        >
                          {t(`hero.${feature.titleKey}`)}
                        </motion.h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-tight group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{t(`hero.${feature.descKey}`)}</p>
                      </div>
                      <div className="w-12 h-12 border-l border-b border-primary rounded-tr-lg flex items-center justify-center flex-shrink-0">
                        <motion.div
                          variants={iconVariants}
                          initial="initial"
                          animate="animate"
                          whileHover="hover"
                        >
                          <feature.icon className="w-6 h-6 icon-primary" />
                        </motion.div>
                      </div>
                    </div>
                    {uiConfig.christmasTheme.enabled && feature.index === 3 && (
                      <Image
                        src="/christmas/ice.png"
                        alt="Christmas decoration"
                        width={90}
                        height={90}
                        className="absolute -bottom-24  pointer-events-none"
                      />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </div>
            <motion.div
              className="mt-16 md:mt-24 overflow-hidden relative h-16 sm:h-20"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <div className="flex gap-24 absolute whitespace-nowrap animate-scroll will-change-transform">
                {[...partners, ...partners].map((partner, index) => (
                  <div
                    key={`${partner.name}-${index}`}
                    className="flex-shrink-0 w-[200px] hover:scale-110 transition-transform duration-300"
                  >
                    <Image
                      src={partner.src}
                      alt={`${partner.name} - Our trusted partner`}
                      width={128}
                      height={64}
                      className="h-12 sm:h-16 w-24 sm:w-32 object-contain opacity-20 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 filter brightness-0 dark:invert"
                      loading="lazy"
                      quality={60}
                      sizes="(max-width: 640px) 96px, 128px"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </motion.div>
  )
}
