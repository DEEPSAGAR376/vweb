"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { Mail, Phone, Gamepad2, ExternalLink } from "lucide-react"
import DiscordBanner from "./DiscordBanner"
import { useLanguage } from "../contexts/LanguageContext"

export default function Footer() {
  const { t } = useLanguage()

  const quickLinks = [
    { name: t('footer.clientArea'), href: "#" },
    { name: t('footer.discord'), href: "#" },
    { name: t('footer.vpsHosting'), href: "/vps" },
    { name: t('footer.dedicatedServerHosting'), href: "/dedicated" },
    { name: t('footer.gameServerHosting'), href: "/games" },
  ]

  const legalLinks = [
    { name: t('navbar.termsOfService'), href: "/terms-of-services" },
    { name: t('navbar.privacyPolicy'), href: "/privacy-policy" },
  ]

  const contactInfo = [
    { icon: Mail, label: t('footer.email'), value: "support@dezerx.com", href: "mailto:support@dezerx.com" },
    { icon: Phone, label: t('footer.phone'), value: "N/A", href: "tel:+15551234567" },
    { icon: Gamepad2, label: t('footer.gamePanel'), value: "panel.dezerx.com", href: "https://panel.dezerx.com" },
  ]

  return (
    <div className="relative">
      <div className="relative z-30 -mb-47">
        <DiscordBanner />
      </div>

      <footer className="bg-gray-100 dark:bg-[#0a0b0f] border-t border-gray-200 dark:border-white/10 relative z-10 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 mt-24  md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1"
            >
              <div className="mb-6">
                <Image
                  src="/meta/Logo.png"
                  alt="Dezer Logo"
                  width={200}
                  height={60}
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                {t('footer.description')}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {/* HEY, HOLD UR HORSES, EITHER FULLY REMOVE IT OR KEEP IT. IT WOULD BE A SHAME IF I BUSTED YOU FOR CLAIMING YOU DID SOMETHING THAT U DIDN'T, RIGHT?  */}
                Made by <span className="icon-text-primary font-medium">Anthony S</span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-1"
            >
              <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-6 orbitron-font">{t('footer.quickLinks')}</h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-icon-text-primary dark:hover:text-icon-text-primary transition-colors duration-300 text-sm flex items-center group"
                    >
                      <span>{link.name}</span>
                      <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-6 orbitron-font">{t('footer.legal')}</h3>
              <ul className="space-y-3">
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-icon-text-primary dark:hover:text-icon-text-primary transition-colors duration-300 text-sm flex items-center group"
                    >
                      <span>{link.name}</span>
                      <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-1"
            >
              <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-6 orbitron-font">{t('footer.contactUs')}</h3>
              <ul className="space-y-4">
                {contactInfo.map((contact, index) => (
                  <li key={index}>
                    <a
                      href={contact.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-icon-text-primary dark:hover:text-icon-text-primary transition-colors duration-300 text-sm flex items-center group"
                    >
                      <contact.icon className="w-4 h-4 mr-3 icon-text-primary" />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide">{contact.label}</div>
                        <div className="group-hover:text-icon-text-primary dark:group-hover:text-icon-text-primary transition-colors duration-300">{contact.value}</div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 pt-8 border-t border-gray-200 dark:border-white/10"
          >
            {/* HEY HEY HEY, WE CAN TALK ABOUT THIS PLEASE. DONT REMOVE IT, PLSSSS. think about it..  */}
            {/* Look, remove the DezerNova add ur own hosting, but go above and change ur name to MY NAME AGAIN. come onn man, it would look like i worked for you. come on buddy, i know u want to keep it.  */}
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-500 dark:text-gray-500 text-sm mb-4 md:mb-0">
                © {new Date().getFullYear()} DezerNova. All rights reserved.
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}
