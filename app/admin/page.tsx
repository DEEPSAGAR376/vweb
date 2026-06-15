"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Save,
  Bell,
  Gamepad2,
  Server,
  Cloud,
  FileCode,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Plus,
  Trash2,
  Cpu,
  Globe
} from "lucide-react";
import Image from "next/image";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState("notifications");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  // Loaded configs
  const [navigationConfig, setNavigationConfig] = useState<any>(null);
  const [gamesConfig, setGamesConfig] = useState<any>(null);
  const [vpsConfig, setVpsConfig] = useState<any>(null);
  const [dedicatedConfig, setDedicatedConfig] = useState<any>(null);
  const [discordConfig, setDiscordConfig] = useState<any>(null);
  const [webhostingConfig, setWebhostingConfig] = useState<any>(null);

  // Raw JSON edit modes
  const [rawJson, setRawJson] = useState("");
  const [jsonError, setJsonError] = useState("");

  // Sub-selections for editor
  const [selectedGameId, setSelectedGameId] = useState("");
  const [selectedGameCpu, setSelectedGameCpu] = useState("");
  const [selectedVpsCpu, setSelectedVpsCpu] = useState("");
  const [selectedDediCpu, setSelectedDediCpu] = useState("");
  const [selectedDiscordType, setSelectedDiscordType] = useState("");
  const [selectedWebhostType, setSelectedWebhostType] = useState("");

  // Check sessionStorage on load — we store the session TOKEN, not the raw password
  useEffect(() => {
    const storedToken = sessionStorage.getItem("admin_token");
    if (storedToken) {
      verifyToken(storedToken);
    }
  }, []);

  // Verify an existing token (e.g. from sessionStorage) by calling a protected endpoint.
  // We simply try to fetch navigation config — if it returns 401 the token is stale/invalid.
  const verifyToken = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/config?section=navigation", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setIsAuthenticated(true);
        loadAllConfigs(token);
      } else {
        sessionStorage.removeItem("admin_token");
      }
    } catch {
      sessionStorage.removeItem("admin_token");
    } finally {
      setLoading(false);
    }
  };

  // Submit the raw password ONCE to get a session token back from the server.
  const verifyPassword = async (passToVerify: string) => {
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passToVerify }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        // Store the TOKEN — never store the raw password in the browser
        sessionStorage.setItem("admin_token", data.token);
        setIsAuthenticated(true);
        loadAllConfigs(data.token);
      } else {
        setAuthError(data.error || "Invalid Password");
        sessionStorage.removeItem("admin_token");
      }
    } catch {
      setAuthError("Failed to connect to the authentication API.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setAuthError("Password cannot be empty.");
      return;
    }
    verifyPassword(password);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    setIsAuthenticated(false);
    setPassword("");
  };

  const loadAllConfigs = async (token: string) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const fetchConfig = async (section: string) => {
        const res = await fetch(`/api/admin/config?section=${section}`, { headers });
        if (res.status === 401) {
          // Token is invalid — force logout
          sessionStorage.removeItem("admin_token");
          setIsAuthenticated(false);
          throw new Error("Session expired. Please log in again.");
        }
        if (!res.ok) throw new Error(`Failed to load ${section}`);
        return res.json();
      };

      const [nav, games, vps, dedi, discord, webhost] = await Promise.all([
        fetchConfig("navigation"),
        fetchConfig("games"),
        fetchConfig("vps"),
        fetchConfig("dedicated"),
        fetchConfig("discord"),
        fetchConfig("webhosting"),
      ]);

      setNavigationConfig(nav);
      setGamesConfig(games);
      setVpsConfig(vps);
      setDedicatedConfig(dedi);
      setDiscordConfig(discord);
      setWebhostingConfig(webhost);

      if (games.games && games.games.length > 0) {
        setSelectedGameId(games.games[0].id);
        if (games.planTypes && games.planTypes.length > 0) {
          setSelectedGameCpu(games.planTypes[0].id);
        }
      }
      if (vps.planTypes && vps.planTypes.length > 0) {
        setSelectedVpsCpu(vps.planTypes[0].id);
      }
      if (dedi.planTypes && dedi.planTypes.length > 0) {
        setSelectedDediCpu(dedi.planTypes[0].id);
      }
      if (discord.planTypes && discord.planTypes.length > 0) {
        setSelectedDiscordType(discord.planTypes[0].id);
      }
      if (webhost.planTypes && webhost.planTypes.length > 0) {
        setSelectedWebhostType(webhost.planTypes[0].id);
      }
    } catch (error: any) {
      showStatus("error", error.message || "Failed to load configurations");
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (section: string, data: any) => {
    setLoading(true);
    const token = sessionStorage.getItem("admin_token") || "";
    try {
      const res = await fetch(`/api/admin/config?section=${section}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.status === 401) {
        sessionStorage.removeItem("admin_token");
        setIsAuthenticated(false);
        showStatus("error", "Session expired. Please log in again.");
        return;
      }
      if (res.ok && result.success) {
        showStatus("success", `${section} configuration updated successfully!`);
        loadAllConfigs(token);
      } else {
        showStatus("error", result.error || `Failed to save ${section}`);
      }
    } catch {
      showStatus("error", `Connection error when saving ${section}`);
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => {
      setStatusMsg({ type: "", text: "" });
    }, 4000);
  };

  // Switch advanced JSON editor configs
  useEffect(() => {
    if (activeTab === "raw") {
      setRawJson(JSON.stringify(gamesConfig, null, 2));
      setJsonError("");
    }
  }, [activeTab, gamesConfig]);

  const loadRawJsonSection = (section: string) => {
    let data;
    switch (section) {
      case "games": data = gamesConfig; break;
      case "vps": data = vpsConfig; break;
      case "dedicated": data = dedicatedConfig; break;
      case "discord": data = discordConfig; break;
      case "webhosting": data = webhostingConfig; break;
      case "navigation": data = navigationConfig; break;
    }
    if (data) {
      setRawJson(JSON.stringify(data, null, 2));
      setJsonError("");
    }
  };

  const handleRawJsonSave = (section: string) => {
    try {
      const parsed = JSON.parse(rawJson);
      saveConfig(section, parsed);
      setJsonError("");
    } catch (e: any) {
      setJsonError(`Invalid JSON: ${e.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#06070d] text-white flex flex-col items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#06070d] to-[#06070d] pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-md bg-[#0d0f1a]/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight orbitron-font text-white mb-2">
              DEZER<span className="text-blue-500">NOVA</span>
            </h1>
            <p className="text-gray-400 text-sm">Control Panel Authentication</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#131626] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-950/50 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Unlock Admin Panel</span>
                </>
              )}
            </button>
          </form>
          <div className="mt-6 text-center text-xs text-gray-600">
            Password is set via <code className="bg-gray-950 text-gray-400 px-1 py-0.5 rounded">ADMIN_PASSWORD</code> in the server&apos;s <code className="bg-gray-950 text-gray-400 px-1 py-0.5 rounded">.env</code> file.
          </div>
        </div>
      </div>
    );
  }

  // Helper variables for UI binding
  const selectedGame = gamesConfig?.games?.find((g: any) => g.id === selectedGameId);

  return (
    <div className="min-h-screen bg-[#07080f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-950/20 via-[#07080f] to-[#07080f] pointer-events-none" />
      
      {/* Toast Alert */}
      <AnimatePresence>
        {statusMsg.text && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 24, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg border flex items-center gap-2 shadow-2xl ${
              statusMsg.type === "success"
                ? "bg-green-950/90 border-green-500/30 text-green-400"
                : "bg-red-950/90 border-red-500/30 text-red-400"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-semibold text-sm">{statusMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="relative z-10 border-b border-gray-800 bg-[#0c0d17]/60 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight orbitron-font">
            DEZER<span className="text-blue-500">NOVA</span> <span className="text-xs bg-blue-950 text-blue-400 px-2 py-0.5 rounded ml-2 font-mono uppercase tracking-wider">ADMIN</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {loading && <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-gray-800 hover:border-gray-700 bg-gray-900/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Nav */}
        <aside className="lg:col-span-1 space-y-2">
          {[
            { id: "notifications", label: "Announcement Banner", icon: Bell },
            { id: "games", label: "Game Pricing", icon: Gamepad2 },
            { id: "vps", label: "VPS Plans", icon: Cloud },
            { id: "dedicated", label: "Dedicated Servers", icon: Server },
            { id: "discord", label: "Discord Bot Hosting", icon: Cpu },
            { id: "webhosting", label: "Web Hosting", icon: Globe },
            { id: "raw", label: "Raw JSON Configuration", icon: FileCode }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-950/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-900/60"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Workspace */}
        <main className="lg:col-span-3 bg-[#0d0f1a]/80 backdrop-blur-xl border border-gray-800 rounded-xl p-6 sm:p-8 shadow-xl min-h-[500px]">
          
          {/* TAB 1: NOTIFICATIONS (BANNER) */}
          {activeTab === "notifications" && navigationConfig && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-2">Announcement Banner Config</h2>
                <p className="text-gray-400 text-sm">Update the notification banner showing at the top of all website pages.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-800 pt-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Show Banner
                  </label>
                  <button
                    onClick={() => {
                      setNavigationConfig({
                        ...navigationConfig,
                        banner: { ...navigationConfig.banner, show: !navigationConfig.banner.show }
                      });
                    }}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                      navigationConfig.banner.show
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-400"
                    }`}
                  >
                    {navigationConfig.banner.show ? "Banner Active" : "Banner Hidden"}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Use Global Theme Color
                  </label>
                  <button
                    onClick={() => {
                      setNavigationConfig({
                        ...navigationConfig,
                        banner: { ...navigationConfig.banner, useThemeColor: !navigationConfig.banner.useThemeColor }
                      });
                    }}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                      navigationConfig.banner.useThemeColor
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    }`}
                  >
                    {navigationConfig.banner.useThemeColor ? "Yes (Matches Selected Palette)" : "No (Use Custom Background Class)"}
                  </button>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Banner Message
                  </label>
                  <input
                    type="text"
                    value={navigationConfig.banner.text}
                    onChange={(e) => {
                      setNavigationConfig({
                        ...navigationConfig,
                        banner: { ...navigationConfig.banner, text: e.target.value }
                      });
                    }}
                    className="w-full bg-[#131626] border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={navigationConfig.banner.couponCode}
                    onChange={(e) => {
                      setNavigationConfig({
                        ...navigationConfig,
                        banner: { ...navigationConfig.banner, couponCode: e.target.value }
                      });
                    }}
                    className="w-full bg-[#131626] border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Custom Background Class (eg: bg-red-500)
                  </label>
                  <input
                    type="text"
                    value={navigationConfig.banner.backgroundColor}
                    disabled={navigationConfig.banner.useThemeColor}
                    onChange={(e) => {
                      setNavigationConfig({
                        ...navigationConfig,
                        banner: { ...navigationConfig.banner, backgroundColor: e.target.value }
                      });
                    }}
                    className="w-full bg-[#131626] border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end border-t border-gray-800 pt-6">
                <button
                  onClick={() => saveConfig("navigation", navigationConfig)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Banner Configuration</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: GAME PRICING */}
          {activeTab === "games" && gamesConfig && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold">Game Hosting Pricing</h2>
                  <p className="text-gray-400 text-sm">Modify CPU categories and individual memory pricing slabs.</p>
                </div>
                
                {/* Selector */}
                <div className="flex flex-wrap gap-2">
                  <select
                    value={selectedGameId}
                    onChange={(e) => setSelectedGameId(e.target.value)}
                    className="bg-[#131626] border border-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none"
                  >
                    {gamesConfig.games.map((g: any) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>

                  <select
                    value={selectedGameCpu}
                    onChange={(e) => setSelectedGameCpu(e.target.value)}
                    className="bg-[#131626] border border-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none"
                  >
                    {gamesConfig.planTypes.map((pt: any) => (
                      <option key={pt.id} value={pt.id}>{pt.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-6">
                <div className="flex items-center gap-2 mb-4 bg-blue-950/20 border border-blue-800/20 p-3 rounded-lg text-blue-400 text-sm">
                  <Cpu className="w-5 h-5 flex-shrink-0" />
                  <span>
                    Editing plans for <strong>{selectedGame?.name}</strong> using <strong>{gamesConfig.planTypes.find((p:any)=>p.id===selectedGameCpu)?.name}</strong> CPU.
                  </span>
                </div>

                {/* Plan List */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {selectedGame?.plans?.[selectedGameCpu]?.map((plan: any, index: number) => (
                    <div key={index} className="bg-[#131626] border border-gray-800 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                      <div>
                        <span className="block text-xs text-gray-500 font-bold uppercase">RAM Size</span>
                        <input
                          type="text"
                          value={plan.ram}
                          onChange={(e) => {
                            const updated = { ...gamesConfig };
                            const targetGame = updated.games.find((g: any) => g.id === selectedGameId);
                            targetGame.plans[selectedGameCpu][index].ram = e.target.value;
                            setGamesConfig(updated);
                          }}
                          className="w-full bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                        />
                      </div>

                      <div>
                        <span className="block text-xs text-gray-500 font-bold uppercase">CPU Cores</span>
                        <input
                          type="text"
                          value={plan.cpu}
                          onChange={(e) => {
                            const updated = { ...gamesConfig };
                            const targetGame = updated.games.find((g: any) => g.id === selectedGameId);
                            targetGame.plans[selectedGameCpu][index].cpu = e.target.value;
                            setGamesConfig(updated);
                          }}
                          className="w-full bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                        />
                      </div>

                      <div>
                        <span className="block text-xs text-gray-500 font-bold uppercase">Price</span>
                        <input
                          type="text"
                          value={plan.price}
                          onChange={(e) => {
                            const updated = { ...gamesConfig };
                            const targetGame = updated.games.find((g: any) => g.id === selectedGameId);
                            targetGame.plans[selectedGameCpu][index].price = e.target.value;
                            setGamesConfig(updated);
                          }}
                          className="w-full bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <span className="block text-xs text-gray-500 font-bold uppercase">Storage</span>
                          <input
                            type="text"
                            value={plan.storage}
                            onChange={(e) => {
                              const updated = { ...gamesConfig };
                              const targetGame = updated.games.find((g: any) => g.id === selectedGameId);
                              targetGame.plans[selectedGameCpu][index].storage = e.target.value;
                              setGamesConfig(updated);
                            }}
                            className="w-full bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const updated = { ...gamesConfig };
                            const targetGame = updated.games.find((g: any) => g.id === selectedGameId);
                            targetGame.plans[selectedGameCpu].splice(index, 1);
                            setGamesConfig(updated);
                          }}
                          className="self-end p-2 bg-red-950 text-red-400 hover:bg-red-900 border border-red-500/20 rounded flex items-center justify-center"
                          title="Remove Plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {(!selectedGame?.plans?.[selectedGameCpu] || selectedGame.plans[selectedGameCpu].length === 0) && (
                    <div className="text-center py-6 text-gray-500">
                      No plans configured for this CPU. Click Add Plan to start.
                    </div>
                  )}
                </div>

                {/* Add plan button */}
                <button
                  onClick={() => {
                    const updated = { ...gamesConfig };
                    const targetGame = updated.games.find((g: any) => g.id === selectedGameId);
                    if (!targetGame.plans[selectedGameCpu]) {
                      targetGame.plans[selectedGameCpu] = [];
                    }
                    targetGame.plans[selectedGameCpu].push({
                      id: `${selectedGameId}-${selectedGameCpu}-${Date.now()}`,
                      name: "New Plan",
                      type: selectedGameCpu,
                      ram: "4 GB",
                      cpu: "1 Core",
                      storage: "10GB SSD",
                      price: "₹100",
                      orderLink: "https://billing.example.com"
                    });
                    setGamesConfig(updated);
                  }}
                  className="mt-4 flex items-center gap-2 text-sm text-blue-400 hover:text-white px-3 py-1.5 rounded border border-blue-900 bg-blue-950/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New memory Slab</span>
                </button>
              </div>

              {/* Locations Setup Fees */}
              <div className="border-t border-gray-800 pt-6">
                <h3 className="text-md font-bold mb-4">Location Setup Fees</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {gamesConfig.locations.map((loc: any, index: number) => (
                    <div key={loc.id} className="bg-[#131626] border border-gray-800 rounded-lg p-3">
                      <span className="text-xs text-gray-500 font-bold uppercase">{loc.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-400">₹</span>
                        <input
                          type="number"
                          value={loc.setupFee !== undefined ? loc.setupFee : 0}
                          onChange={(e) => {
                            const updated = { ...gamesConfig };
                            updated.locations[index].setupFee = Number(e.target.value);
                            setGamesConfig(updated);
                          }}
                          className="w-full bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end border-t border-gray-800 pt-6">
                <button
                  onClick={() => saveConfig("games", gamesConfig)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Game Pricing</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: VPS PLANS */}
          {activeTab === "vps" && vpsConfig && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold">VPS Server Pricing</h2>
                  <p className="text-gray-400 text-sm">Edit hardware slabs per CPU category.</p>
                </div>
                
                <select
                  value={selectedVpsCpu}
                  onChange={(e) => setSelectedVpsCpu(e.target.value)}
                  className="bg-[#131626] border border-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none"
                >
                  {vpsConfig.planTypes.map((pt: any) => (
                    <option key={pt.id} value={pt.id}>{pt.name}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-gray-800 pt-6">
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {vpsConfig.plans[selectedVpsCpu]?.map((plan: any, index: number) => (
                    <div key={index} className="bg-[#131626] border border-gray-800 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                      <div>
                        <span className="block text-xs text-gray-500 font-bold uppercase">Plan ID / Name</span>
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => {
                            const updated = { ...vpsConfig };
                            updated.plans[selectedVpsCpu][index].name = e.target.value;
                            setVpsConfig(updated);
                          }}
                          className="w-full bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                        />
                      </div>

                      <div>
                        <span className="block text-xs text-gray-500 font-bold uppercase">Cores / Memory</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={plan.cpu}
                            onChange={(e) => {
                              const updated = { ...vpsConfig };
                              updated.plans[selectedVpsCpu][index].cpu = e.target.value;
                              setVpsConfig(updated);
                            }}
                            placeholder="Cores"
                            className="w-1/2 bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={plan.ram}
                            onChange={(e) => {
                              const updated = { ...vpsConfig };
                              updated.plans[selectedVpsCpu][index].ram = e.target.value;
                              setVpsConfig(updated);
                            }}
                            placeholder="Memory"
                            className="w-1/2 bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="block text-xs text-gray-500 font-bold uppercase">Price</span>
                        <input
                          type="text"
                          value={plan.price}
                          onChange={(e) => {
                            const updated = { ...vpsConfig };
                            updated.plans[selectedVpsCpu][index].price = e.target.value;
                            setVpsConfig(updated);
                          }}
                          className="w-full bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <span className="block text-xs text-gray-500 font-bold uppercase">Storage</span>
                          <input
                            type="text"
                            value={plan.storage}
                            onChange={(e) => {
                              const updated = { ...vpsConfig };
                              updated.plans[selectedVpsCpu][index].storage = e.target.value;
                              setVpsConfig(updated);
                            }}
                            className="w-full bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const updated = { ...vpsConfig };
                            updated.plans[selectedVpsCpu].splice(index, 1);
                            setVpsConfig(updated);
                          }}
                          className="self-end p-2 bg-red-950 text-red-400 hover:bg-red-900 border border-red-500/20 rounded flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const updated = { ...vpsConfig };
                    if (!updated.plans[selectedVpsCpu]) {
                      updated.plans[selectedVpsCpu] = [];
                    }
                    updated.plans[selectedVpsCpu].push({
                      id: `vps-${selectedVpsCpu}-${Date.now()}`,
                      name: "VPS-New",
                      badge: selectedVpsCpu,
                      image: `/cpu/intel.png`,
                      cpu: "1 Core",
                      cpuDetail: "vCPU",
                      ram: "2 GB",
                      ramDetail: "DDR4",
                      storage: "25 GB",
                      storageDetail: "NVMe SSD",
                      price: "₹100",
                      period: "/mo",
                      orderLink: "#"
                    });
                    setVpsConfig(updated);
                  }}
                  className="mt-4 flex items-center gap-2 text-sm text-blue-400 hover:text-white px-3 py-1.5 rounded border border-blue-900 bg-blue-950/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add VPS Configuration</span>
                </button>
              </div>

              <div className="flex justify-end border-t border-gray-800 pt-6">
                <button
                  onClick={() => saveConfig("vps", vpsConfig)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save VPS Config</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: DEDICATED SERVERS */}
          {activeTab === "dedicated" && dedicatedConfig && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold">Dedicated Server Plans</h2>
                  <p className="text-gray-400 text-sm">Configure raw hardware plans.</p>
                </div>
                
                <select
                  value={selectedDediCpu}
                  onChange={(e) => setSelectedDediCpu(e.target.value)}
                  className="bg-[#131626] border border-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none"
                >
                  {dedicatedConfig.planTypes.map((pt: any) => (
                    <option key={pt.id} value={pt.id}>{pt.name}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-gray-800 pt-6">
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {dedicatedConfig.plans[selectedDediCpu]?.map((plan: any, index: number) => (
                    <div key={index} className="bg-[#131626] border border-gray-800 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                      <div>
                        <span className="block text-xs text-gray-500 font-bold uppercase">Processor Name</span>
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => {
                            const updated = { ...dedicatedConfig };
                            updated.plans[selectedDediCpu][index].name = e.target.value;
                            setDedicatedConfig(updated);
                          }}
                          className="w-full bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                        />
                      </div>

                      <div>
                        <span className="block text-xs text-gray-500 font-bold uppercase">Memory / Storage</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={plan.ram}
                            onChange={(e) => {
                              const updated = { ...dedicatedConfig };
                              updated.plans[selectedDediCpu][index].ram = e.target.value;
                              setDedicatedConfig(updated);
                            }}
                            placeholder="Memory"
                            className="w-1/2 bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={plan.storage}
                            onChange={(e) => {
                              const updated = { ...dedicatedConfig };
                              updated.plans[selectedDediCpu][index].storage = e.target.value;
                              setDedicatedConfig(updated);
                            }}
                            placeholder="Storage"
                            className="w-1/2 bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="block text-xs text-gray-500 font-bold uppercase">Price</span>
                        <input
                          type="text"
                          value={plan.price}
                          onChange={(e) => {
                            const updated = { ...dedicatedConfig };
                            updated.plans[selectedDediCpu][index].price = e.target.value;
                            setDedicatedConfig(updated);
                          }}
                          className="w-full bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <span className="block text-xs text-gray-500 font-bold uppercase">Cores Detail</span>
                          <input
                            type="text"
                            value={plan.cpu}
                            onChange={(e) => {
                              const updated = { ...dedicatedConfig };
                              updated.plans[selectedDediCpu][index].cpu = e.target.value;
                              setDedicatedConfig(updated);
                            }}
                            className="w-full bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const updated = { ...dedicatedConfig };
                            updated.plans[selectedDediCpu].splice(index, 1);
                            setDedicatedConfig(updated);
                          }}
                          className="self-end p-2 bg-red-950 text-red-400 hover:bg-red-900 border border-red-500/20 rounded flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const updated = { ...dedicatedConfig };
                    if (!updated.plans[selectedDediCpu]) {
                      updated.plans[selectedDediCpu] = [];
                    }
                    updated.plans[selectedDediCpu].push({
                      id: `dedi-${selectedDediCpu}-${Date.now()}`,
                      name: "Intel Xeon D-2141I",
                      badge: "Promo",
                      cpu: "8 Cores, 16 Threads",
                      cpuDetail: "Processor",
                      ram: "64 GB",
                      ramDetail: "DDR4",
                      storage: "2x 500GB SSD",
                      storageDetail: "Hard Disk",
                      bandwidth: "1 Gbps Unmetered",
                      bandwidthDetail: "Connection",
                      features: ["DDoS Protected", "99.9% Uptime SLA", "IPMI Access"],
                      price: "₹5000",
                      period: "/mo",
                      orderLink: "#"
                    });
                    setDedicatedConfig(updated);
                  }}
                  className="mt-4 flex items-center gap-2 text-sm text-blue-400 hover:text-white px-3 py-1.5 rounded border border-blue-900 bg-blue-950/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Dedicated Server Plan</span>
                </button>
              </div>

              <div className="flex justify-end border-t border-gray-800 pt-6">
                <button
                  onClick={() => saveConfig("dedicated", dedicatedConfig)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Dedicated Config</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: DISCORD BOT HOSTING */}
          {activeTab === "discord" && discordConfig && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold">Discord Bot Hosting</h2>
                  <p className="text-gray-400 text-sm">Configure packages and prices.</p>
                </div>
                
                <select
                  value={selectedDiscordType}
                  onChange={(e) => setSelectedDiscordType(e.target.value)}
                  className="bg-[#131626] border border-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none"
                >
                  {discordConfig.planTypes.map((pt: any) => (
                    <option key={pt.id} value={pt.id}>{pt.name}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-gray-800 pt-6">
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {discordConfig.plans[selectedDiscordType]?.map((plan: any, index: number) => (
                    <div key={index} className="bg-[#131626] border border-gray-800 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                      <div>
                        <span className="block text-xs text-gray-500 font-bold uppercase">Name</span>
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => {
                            const updated = { ...discordConfig };
                            updated.plans[selectedDiscordType][index].name = e.target.value;
                            setDiscordConfig(updated);
                          }}
                          className="w-full bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                        />
                      </div>

                      <div>
                        <span className="block text-xs text-gray-500 font-bold uppercase">RAM / Storage</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={plan.ram}
                            onChange={(e) => {
                              const updated = { ...discordConfig };
                              updated.plans[selectedDiscordType][index].ram = e.target.value;
                              setDiscordConfig(updated);
                            }}
                            placeholder="RAM"
                            className="w-1/2 bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={plan.storage}
                            onChange={(e) => {
                              const updated = { ...discordConfig };
                              updated.plans[selectedDiscordType][index].storage = e.target.value;
                              setDiscordConfig(updated);
                            }}
                            placeholder="Storage"
                            className="w-1/2 bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="block text-xs text-gray-500 font-bold uppercase">Price</span>
                        <input
                          type="text"
                          value={plan.price}
                          onChange={(e) => {
                            const updated = { ...discordConfig };
                            updated.plans[selectedDiscordType][index].price = e.target.value;
                            setDiscordConfig(updated);
                          }}
                          className="w-full bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <span className="block text-xs text-gray-500 font-bold uppercase">CPU allocation</span>
                          <input
                            type="text"
                            value={plan.cpu}
                            onChange={(e) => {
                              const updated = { ...discordConfig };
                              updated.plans[selectedDiscordType][index].cpu = e.target.value;
                              setDiscordConfig(updated);
                            }}
                            className="w-full bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const updated = { ...discordConfig };
                            updated.plans[selectedDiscordType].splice(index, 1);
                            setDiscordConfig(updated);
                          }}
                          className="self-end p-2 bg-red-950 text-red-400 hover:bg-red-900 border border-red-500/20 rounded flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const updated = { ...discordConfig };
                    if (!updated.plans[selectedDiscordType]) {
                      updated.plans[selectedDiscordType] = [];
                    }
                    updated.plans[selectedDiscordType].push({
                      id: `discord-${selectedDiscordType}-${Date.now()}`,
                      name: "Node-New",
                      badge: "Popular",
                      cpu: "100% Core",
                      cpuDetail: "CPU Resource",
                      ram: "4 GB",
                      ramDetail: "Memory",
                      storage: "20 GB",
                      storageDetail: "SSD Space",
                      bandwidth: "100 Mbps",
                      bandwidthDetail: "Bandwidth",
                      uptime: "99.9% Uptime",
                      price: "₹150",
                      period: "/mo",
                      orderLink: "#"
                    });
                    setDiscordConfig(updated);
                  }}
                  className="mt-4 flex items-center gap-2 text-sm text-blue-400 hover:text-white px-3 py-1.5 rounded border border-blue-900 bg-blue-950/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Discord Plan</span>
                </button>
              </div>

              <div className="flex justify-end border-t border-gray-800 pt-6">
                <button
                  onClick={() => saveConfig("discord", discordConfig)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Discord Config</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: WEB HOSTING */}
          {activeTab === "webhosting" && webhostingConfig && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold">Web Hosting Plans</h2>
                  <p className="text-gray-400 text-sm">Configure web server hosting specs.</p>
                </div>
                
                <select
                  value={selectedWebhostType}
                  onChange={(e) => setSelectedWebhostType(e.target.value)}
                  className="bg-[#131626] border border-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none"
                >
                  {webhostingConfig.planTypes.map((pt: any) => (
                    <option key={pt.id} value={pt.id}>{pt.name}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-gray-800 pt-6">
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {webhostingConfig.plans[selectedWebhostType]?.map((plan: any, index: number) => (
                    <div key={index} className="bg-[#131626] border border-gray-800 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                      <div>
                        <span className="block text-xs text-gray-500 font-bold uppercase">Plan Name</span>
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => {
                            const updated = { ...webhostingConfig };
                            updated.plans[selectedWebhostType][index].name = e.target.value;
                            setWebhostingConfig(updated);
                          }}
                          className="w-full bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                        />
                      </div>

                      <div>
                        <span className="block text-xs text-gray-500 font-bold uppercase">RAM / Storage</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={plan.ram}
                            onChange={(e) => {
                              const updated = { ...webhostingConfig };
                              updated.plans[selectedWebhostType][index].ram = e.target.value;
                              setWebhostingConfig(updated);
                            }}
                            placeholder="RAM"
                            className="w-1/2 bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={plan.storage}
                            onChange={(e) => {
                              const updated = { ...webhostingConfig };
                              updated.plans[selectedWebhostType][index].storage = e.target.value;
                              setWebhostingConfig(updated);
                            }}
                            placeholder="Storage"
                            className="w-1/2 bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="block text-xs text-gray-500 font-bold uppercase">Price</span>
                        <input
                          type="text"
                          value={plan.price}
                          onChange={(e) => {
                            const updated = { ...webhostingConfig };
                            updated.plans[selectedWebhostType][index].price = e.target.value;
                            setWebhostingConfig(updated);
                          }}
                          className="w-full bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <span className="block text-xs text-gray-500 font-bold uppercase">Bandwidth</span>
                          <input
                            type="text"
                            value={plan.bandwidth}
                            onChange={(e) => {
                              const updated = { ...webhostingConfig };
                              updated.plans[selectedWebhostType][index].bandwidth = e.target.value;
                              setWebhostingConfig(updated);
                            }}
                            className="w-full bg-[#1c1f36] border border-gray-700 rounded px-2.5 py-1 text-white text-sm mt-1 focus:outline-none"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const updated = { ...webhostingConfig };
                            updated.plans[selectedWebhostType].splice(index, 1);
                            setWebhostingConfig(updated);
                          }}
                          className="self-end p-2 bg-red-950 text-red-400 hover:bg-red-900 border border-red-500/20 rounded flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const updated = { ...webhostingConfig };
                    if (!updated.plans[selectedWebhostType]) {
                      updated.plans[selectedWebhostType] = [];
                    }
                    updated.plans[selectedWebhostType].push({
                      id: `web-${selectedWebhostType}-${Date.now()}`,
                      name: "Starter-Web",
                      badge: "Economy",
                      cpu: "0.5 Core",
                      cpuDetail: "CPU Core",
                      ram: "1 GB",
                      ramDetail: "RAM Slab",
                      storage: "5 GB",
                      storageDetail: "SSD space",
                      bandwidth: "Unmetered",
                      bandwidthDetail: "Data transfer",
                      uptime: "99.9% SLA",
                      price: "₹80",
                      period: "/mo",
                      orderLink: "#"
                    });
                    setWebhostingConfig(updated);
                  }}
                  className="mt-4 flex items-center gap-2 text-sm text-blue-400 hover:text-white px-3 py-1.5 rounded border border-blue-900 bg-blue-950/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Web Plan</span>
                </button>
              </div>

              <div className="flex justify-end border-t border-gray-800 pt-6">
                <button
                  onClick={() => saveConfig("webhosting", webhostingConfig)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Web Config</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: RAW JSON CONFIGURATIONS */}
          {activeTab === "raw" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold">Raw Config JSON Editor</h2>
                  <p className="text-gray-400 text-sm">Directly view and edit files for ultimate control.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {["navigation", "games", "vps", "dedicated", "discord", "webhosting"].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => loadRawJsonSection(sec)}
                      className="px-3 py-1.5 text-xs font-bold bg-[#131626] hover:bg-[#1a1f38] border border-gray-800 rounded uppercase tracking-wider"
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-800 pt-6 space-y-4">
                <textarea
                  value={rawJson}
                  onChange={(e) => setRawJson(e.target.value)}
                  rows={20}
                  className="w-full bg-[#0a0b12] border border-gray-800 rounded-lg p-4 font-mono text-xs text-green-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {jsonError && (
                  <div className="p-3 bg-red-950/50 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{jsonError}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    💡 Press any section button above to switch active file.
                  </span>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        // Quick validate
                        try {
                          JSON.parse(rawJson);
                          showStatus("success", "JSON is valid structure.");
                          setJsonError("");
                        } catch (e: any) {
                          setJsonError(`Invalid JSON: ${e.message}`);
                        }
                      }}
                      className="px-4 py-2 bg-gray-900 border border-gray-800 text-gray-300 hover:text-white rounded-lg text-sm font-semibold"
                    >
                      Validate Format
                    </button>
                    
                    <button
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(rawJson);
                          // Guess section
                          let guessedSec = "games";
                          if (parsed.mainNavigation) guessedSec = "navigation";
                          else if (parsed.plans && parsed.plans["intel-v4"] && parsed.plans["intel-v4"][0]?.cpuDetail === "Intel Xeon v4") guessedSec = "vps";
                          else if (parsed.plans && parsed.plans["intel-platinum"] && parsed.plans["intel-platinum"][0]?.cpuDetail === "Processor") guessedSec = "dedicated";
                          else if (parsed.plans && parsed.plans["nodejs"] && parsed.plans["nodejs"][0]?.uptime) guessedSec = "discord";
                          else if (parsed.plans && parsed.plans["shared-web"]) guessedSec = "webhosting";

                          handleRawJsonSave(guessedSec);
                        } catch (e: any) {
                          setJsonError(`Invalid JSON: ${e.message}`);
                        }
                      }}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-2 text-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>Write to Disk</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
