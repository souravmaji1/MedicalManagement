import React, { useState, useEffect } from 'react';
import { 
  Search, Target, Users, Facebook, Instagram, Play, TrendingUp, 
  DollarSign, Star, ChevronRight, ArrowRight, Sparkles, 
  BarChart3, Zap, Eye, Heart, MessageCircle, Share2,
  Activity, Layers, Globe, Smartphone, Monitor, Tablet
} from 'lucide-react';

export default function EnhancedPlatformSection() {
  const [activePlatform, setActivePlatform] = useState(0);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Auto-cycle through animation phases for the active platform
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [activePlatform]);

  const platformFeatures = [
    {
      platform: "Google Ads",
      icon: Search,
      color: "from-blue-500 via-blue-600 to-indigo-600",
      bgColor: "from-blue-500/10 via-blue-600/20 to-indigo-600/10",
      users: "4.3B+ Users",
      description: "Dominate search results with precision-targeted ads that capture high-intent customers at the exact moment they're searching for your products or services.",
      features: [
        "AI-Powered Keyword Optimization",
        "Real-time Bid Management",
        "Cross-Device Campaign Sync",
        "Advanced Audience Targeting",
        "Performance Max Campaigns"
      ]
    },
    {
      platform: "Facebook",
      icon: Facebook,
      color: "from-blue-600 via-indigo-600 to-purple-600",
      bgColor: "from-blue-600/10 via-indigo-600/20 to-purple-600/10",
      users: "2.9B+ Users",
      description: "Leverage the world's most sophisticated social targeting system to reach your ideal customers through engaging content and precise demographic targeting.",
      features: [
        "Lookalike Audience Creation",
        "Dynamic Product Ads",
        "Conversion API Integration",
        "Creative Testing Suite",
        "Attribution Modeling"
      ]
    },
    {
      platform: "Instagram",
      icon: Instagram,
      color: "from-pink-500 via-purple-600 to-orange-500",
      bgColor: "from-pink-500/10 via-purple-600/20 to-orange-500/10",
      users: "2.4B+ Users",
      description: "Create visually stunning campaigns that drive engagement and conversions through Instagram's highly visual and interactive advertising formats.",
      features: [
        "Story & Reels Advertising",
        "Shopping Tag Integration",
        "AR Filter Campaigns",
        "Influencer Partnership Tools",
        "Visual Content Optimizer"
      ]
    },
    {
      platform: "YouTube",
      icon: Play,
      color: "from-red-500 via-orange-500 to-yellow-500",
      bgColor: "from-red-500/10 via-orange-500/20 to-yellow-500/10",
      users: "2.7B+ Users",
      description: "Capture attention with compelling video content that drives brand awareness and conversions through YouTube's massive global audience.",
      features: [
        "TrueView Campaign Optimization",
        "YouTube Shorts Integration",
        "Brand Safety Controls",
        "Video Action Campaigns",
        "Connected TV Targeting"
      ]
    }
  ];

  const VideoDemo = ({ platform }) => {
    const [currentMetric, setCurrentMetric] = useState(0);
    
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentMetric(prev => (prev + 1) % 3);
      }, 2000);
      return () => clearInterval(interval);
    }, []);

    if (platform === 0) { // Google Ads
      return (
        <div className="relative h-96 overflow-hidden bg-gradient-to-br from-blue-900/20 via-indigo-900/30 to-purple-900/20">
          {/* Animated Search Interface */}
          <div className="absolute inset-0 p-6 space-y-4">
            {/* Search Bar with Typing Animation */}
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-2xl">
              <div className="flex items-center space-x-3">
                <Search size={20} className="text-blue-400 animate-pulse" />
                <div className="flex-1 relative">
                  <div className="text-white text-lg font-medium">
                    {animationPhase === 0 && "best running shoes"}
                    {animationPhase === 1 && "wireless headphones"}
                    {animationPhase === 2 && "laptop deals"}
                    {animationPhase === 3 && "organic coffee"}
                    <span className="animate-pulse">|</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
                  <Search size={16} className="text-white" />
                </div>
              </div>
            </div>
            
            {/* Dynamic Ad Results */}
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} 
                     className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border-l-4 border-blue-400 shadow-xl transform transition-all duration-1000 hover:scale-105" 
                     style={{
                       animationDelay: `${i * 0.3}s`,
                       transform: `translateX(${animationPhase === i ? '0' : '10px'})`,
                       opacity: animationPhase === i ? 1 : 0.7
                     }}>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Target size={18} className="text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="bg-gradient-to-r from-blue-400 to-indigo-400 h-4 rounded-full w-3/4 animate-pulse"></div>
                        <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-1 rounded-full font-bold">Ad</span>
                      </div>
                      <div className="bg-gray-600/50 h-3 rounded-full w-2/3"></div>
                      <div className="flex items-center space-x-3">
                        <span className="text-green-400 font-bold text-sm">+{(i + 1) * 150}% CTR</span>
                        <span className="text-yellow-400 font-bold text-sm">${(2.5 + i * 0.5).toFixed(2)} CPC</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Real-time Metrics */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Impressions", value: "2.5M", color: "text-blue-400", icon: Eye },
                { label: "CTR", value: "8.5%", color: "text-green-400", icon: TrendingUp },
                { label: "CPC", value: "$4.20", color: "text-yellow-400", icon: DollarSign }
              ].map((metric, i) => (
                <div key={i} 
                     className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border transition-all duration-500 ${
                       currentMetric === i ? 'border-white/30 scale-105 shadow-xl' : 'border-white/10'
                     }`}>
                  <div className="flex items-center justify-center mb-2">
                    <metric.icon size={16} className={`${metric.color} animate-pulse`} />
                  </div>
                  <div className={`${metric.color} font-bold text-xl animate-pulse`}>{metric.value}</div>
                  <div className="text-gray-300 text-xs">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (platform === 1) { // Facebook
      return (
        <div className="relative h-96 overflow-hidden bg-gradient-to-br from-blue-900/20 via-purple-900/30 to-indigo-900/20">
          <div className="absolute inset-0 p-6 space-y-4">
            {/* Audience Builder */}
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <Users size={20} className="text-blue-400 animate-pulse" />
                <span className="text-white font-bold">Smart Audience Builder</span>
                <div className="ml-auto bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                  ACTIVE
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Age: 25-45", progress: 75, color: "bg-blue-500" },
                  { label: "Tech Interest", progress: 90, color: "bg-purple-500" },
                  { label: "Location: US", progress: 60, color: "bg-indigo-500" },
                  { label: "Lookalike", progress: 85, color: "bg-pink-500" }
                ].map((item, i) => (
                  <div key={i} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm font-medium">{item.label}</span>
                      <span className="text-gray-300 text-xs">{item.progress}%</span>
                    </div>
                    <div className="bg-gray-700/50 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`${item.color} h-full rounded-full transition-all duration-2000 animate-pulse`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Social Media Post Preview */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Facebook size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-white font-bold">Your Brand</div>
                  <div className="text-gray-300 text-xs">Sponsored • 2 hours ago</div>
                </div>
                <div className="ml-auto bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-bold">
                  PROMOTED
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-600/20 via-purple-600/30 to-pink-600/20 rounded-xl h-32 flex items-center justify-center mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse"></div>
                <Play size={32} className="text-white animate-bounce" />
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                  LIVE
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-6">
                  <div className="flex items-center space-x-2">
                    <Heart size={18} className="text-red-400 animate-pulse" />
                    <span className="text-white font-bold">1.2K</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageCircle size={18} className="text-blue-400 animate-pulse" />
                    <span className="text-white font-bold">234</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Share2 size={18} className="text-green-400 animate-pulse" />
                    <span className="text-white font-bold">89</span>
                  </div>
                </div>
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-lg text-white font-bold hover:scale-105 transition-transform">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (platform === 2) { // Instagram
      return (
        <div className="relative h-96 overflow-hidden bg-gradient-to-br from-pink-900/20 via-purple-900/30 to-orange-900/20">
          <div className="absolute inset-0 p-6 space-y-4">
            {/* Stories Preview */}
            <div className="flex space-x-3 mb-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} 
                     className="w-16 h-28 bg-gradient-to-b from-pink-500/30 to-purple-500/30 rounded-2xl overflow-hidden border-2 border-pink-400/50 relative shadow-lg transform hover:scale-105 transition-all duration-300">
                  <div className="absolute inset-2 bg-gradient-to-br from-pink-600/30 to-purple-600/30 rounded-xl flex items-center justify-center">
                    <Instagram size={14} className="text-white" />
                  </div>
                  <div className="absolute bottom-1 left-1 right-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-sm px-1 py-0.5">
                    <span className="text-white text-xs font-bold">Ad</span>
                  </div>
                  <div className="absolute top-1 left-1 right-1 h-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full">
                    <div className="bg-white h-full rounded-full animate-pulse" 
                         style={{ width: `${(i + 1) * 25}%`, animationDelay: `${i * 0.2}s` }}></div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Main Feed Post */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Instagram size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-white font-bold">your_brand</div>
                  <div className="text-gray-300 text-xs">Sponsored • 1 hour ago</div>
                </div>
                <div className="ml-auto">
                  <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-white rounded-full animate-pulse my-1"></div>
                  <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-pink-600/20 via-purple-600/30 to-orange-600/20 rounded-xl h-40 flex items-center justify-center relative overflow-hidden mb-4">
                <div className="absolute inset-0 bg-gradient-to-45 from-pink-500/10 via-purple-500/20 to-orange-500/10 animate-pulse"></div>
                <Sparkles size={32} className="text-white animate-spin" />
                
                {/* Floating Elements */}
                <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-full p-2 animate-bounce">
                  <Heart size={12} className="text-pink-400" />
                </div>
                <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 animate-bounce" style={{animationDelay: '0.5s'}}>
                  <Star size={12} className="text-yellow-400" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <Heart size={20} className="text-red-400 animate-pulse" />
                    <span className="text-white font-bold">5.2K</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageCircle size={20} className="text-blue-400 animate-pulse" />
                    <span className="text-white font-bold">342</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Share2 size={20} className="text-green-400 animate-pulse" />
                  </div>
                </div>
                <button className="bg-gradient-to-r from-pink-500 via-purple-600 to-orange-500 px-4 py-2 rounded-full text-white font-bold text-sm hover:scale-105 transition-transform shadow-lg">
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (platform === 3) { // YouTube
      return (
        <div className="relative h-96 overflow-hidden bg-gradient-to-br from-red-900/20 via-orange-900/30 to-yellow-900/20">
          <div className="absolute inset-0 p-6 space-y-4">
            {/* Video Player */}
            <div className="bg-black/60 backdrop-blur-lg rounded-2xl overflow-hidden relative h-56 border border-white/20 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-orange-600/30 to-yellow-600/20"></div>
              
              {/* Video Content */}
              <div className="absolute inset-6 bg-gradient-to-br from-red-500/30 to-orange-500/30 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="bg-red-600 p-6 rounded-full shadow-2xl hover:scale-110 transition-transform cursor-pointer">
                  <Play size={32} className="text-white ml-1" />
                </div>
                
                {/* Pulse Effect */}
                <div className="absolute inset-0 bg-red-500/20 rounded-xl animate-pulse"></div>
                
                {/* Floating Engagement Icons */}
                <div className="absolute top-4 right-4 space-y-2">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 animate-bounce">
                    <TrendingUp size={16} className="text-green-400" />
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 animate-bounce" style={{animationDelay: '0.3s'}}>
                    <Eye size={16} className="text-blue-400" />
                  </div>
                </div>
              </div>
              
              {/* Video Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold text-lg">Epic Product Launch</div>
                    <div className="text-gray-300 text-sm">1.2M views • 2 days ago</div>
                  </div>
                  <div className="bg-red-600 px-3 py-1 rounded-full text-white text-sm font-bold animate-pulse">
                    Ad
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-red-600/30 h-2">
                <div className="bg-red-600 h-full animate-pulse" 
                     style={{ 
                       width: `${25 + (animationPhase * 20)}%`,
                       transition: 'width 3s ease-in-out'
                     }}></div>
              </div>
            </div>
            
            {/* Video Analytics */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Views", value: "1.2M", color: "text-red-400", icon: Eye },
                { label: "Engagement", value: "12%", color: "text-green-400", icon: Activity },
                { label: "Retention", value: "85%", color: "text-blue-400", icon: BarChart3 },
                { label: "CTR", value: "8.5%", color: "text-yellow-400", icon: Zap }
              ].map((metric, i) => (
                <div key={i} 
                     className={`bg-white/10 backdrop-blur-lg rounded-xl p-3 text-center transition-all duration-500 ${
                       currentMetric === i ? 'scale-105 border border-white/30 shadow-xl' : 'border border-white/10'
                     }`}>
                  <div className="flex items-center justify-center mb-2">
                    <metric.icon size={16} className={`${metric.color} animate-pulse`} />
                  </div>
                  <div className={`${metric.color} font-bold text-lg animate-pulse`}>{metric.value}</div>
                  <div className="text-gray-300 text-xs">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <section id="platforms" className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-24 relative overflow-hidden mb-32   ">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full px-6 py-2 mb-6">
            <Layers size={16} className="text-amber-400" />
            <span className="text-amber-400 font-medium">Platform Mastery</span>
          </div>
          
          <h2 className="text-5xl lg:text-7xl font-black mb-8 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Master Every Platform
          </h2>
          
          <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Unlock the full potential of each advertising platform with our 
            <span className="text-amber-400 font-bold"> AI-powered tools</span> and 
            <span className="text-orange-400 font-bold"> real-time insights</span>
          </p>
          
          {/* Platform Icons */}
          <div className="flex items-center justify-center space-x-6 mt-12">
            {platformFeatures.map((platform, index) => (
              <div key={index} 
                   className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 cursor-pointer ${
                     activePlatform === index 
                       ? `bg-gradient-to-br ${platform.color} shadow-2xl scale-110` 
                       : 'bg-white/10 hover:bg-white/20 hover:scale-105'
                   }`}
                   onClick={() => setActivePlatform(index)}>
                <platform.icon size={24} className="text-white" />
              </div>
            ))}
          </div>
        </div>

        {/* Platform Tabs */}
        <div className="mb-16">
          <div className="flex flex-wrap justify-center mb-12 gap-4">
            <div className="bg-gradient-to-r from-gray-900/90 via-slate-900/80 to-black/90 backdrop-blur-2xl border border-gray-700/50 rounded-3xl p-4 shadow-2xl">
              <div className="flex flex-wrap gap-2">
                {platformFeatures.map((platform, index) => (
                  <button
                    key={index}
                    onClick={() => setActivePlatform(index)}
                    className={`flex items-center space-x-4 px-8 py-4 rounded-2xl transition-all duration-700 transform hover:scale-105 relative overflow-hidden ${
                      activePlatform === index
                        ? `bg-gradient-to-r ${platform.color} text-white shadow-2xl scale-105`
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    {/* Background Animation */}
                    {activePlatform === index && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-pulse"></div>
                    )}
                    
                    <div className="relative z-10 flex items-center space-x-3">
                      <platform.icon size={22} className={activePlatform === index ? 'animate-pulse' : ''} />
                      <div className="text-left">
                        <div className="font-bold text-lg">{platform.platform}</div>
                        <div className="text-xs opacity-75">{platform.users}</div>
                      </div>
                      {activePlatform === index && (
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Platform Content */}
          <div className="relative">
            {/* Glowing Background */}
            <div className={`absolute -inset-8 bg-gradient-to-r ${platformFeatures[activePlatform].bgColor} rounded-[4rem] blur-3xl animate-pulse`}></div>
            
            <div className="relative bg-gradient-to-br from-gray-900/95 via-slate-900/80 to-black/95 backdrop-blur-2xl border border-gray-700/50 rounded-4xl p-8 lg:p-16 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                
                {/* Left Content */}
                <div className="space-y-10">
                  <div className="flex items-center mb-8">
                    <div className={`bg-gradient-to-br ${platformFeatures[activePlatform].color} p-6 rounded-3xl mr-8 shadow-2xl transform hover:scale-110 transition-all duration-500`}>
                      {React.createElement(platformFeatures[activePlatform].icon, { size: 40, className: "text-white" })}
                    </div>
                    <div>
                      <h3 className="text-4xl lg:text-5xl font-black text-white mb-3">
                        {platformFeatures[activePlatform].platform}
                      </h3>
                      <div className="flex items-center space-x-6">
                        <p className="text-amber-400 font-bold text-xl">{platformFeatures[activePlatform].users}</p>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                                                        <Star
                              key={i}
                              size={16}
                              className={`${
                                i < 4 ? 'text-yellow-400' : 'text-gray-600'
                              } fill-current`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-lg text-gray-300 leading-relaxed">
                    {platformFeatures[activePlatform].description}
                  </p>

                  <ul className="space-y-4">
                    {platformFeatures[activePlatform].features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-center space-x-3 text-gray-200"
                      >
                        <div
                          className={`bg-gradient-to-r ${platformFeatures[activePlatform].color} w-2 h-2 rounded-full animate-pulse`}
                        ></div>
                        <span className="text-lg">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex space-x-4">
                    <button
                      className={`bg-gradient-to-r ${platformFeatures[activePlatform].color} text-white font-bold py-4 px-8 rounded-full hover:scale-105 transition-transform shadow-lg flex items-center space-x-2`}
                    >
                      <span>Get Started</span>
                      <ArrowRight size={20} />
                    </button>
                    <button
                      className="bg-gray-800/50 text-gray-200 font-bold py-4 px-8 rounded-full hover:bg-gray-700/50 hover:scale-105 transition-transform flex items-center space-x-2"
                    >
                      <span>Learn More</span>
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                {/* Right Content - Video Demo */}
                <div className="relative">
                  <div
                    className={`absolute -inset-4 bg-gradient-to-r ${platformFeatures[activePlatform].bgColor} rounded-3xl blur-xl animate-pulse opacity-50`}
                  ></div>
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                    <VideoDemo platform={activePlatform} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Device Compatibility Section */}
        <div className="mt-24 text-center">
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-8">
            Seamless Cross-Device Optimization
          </h3>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-12">
            Our platform ensures your campaigns are perfectly optimized for every
            device, delivering a consistent and engaging experience.
          </p>
          <div className="flex justify-center space-x-8">
            {[
              { icon: Smartphone, label: 'Mobile' },
              { icon: Tablet, label: 'Tablet' },
              { icon: Monitor, label: 'Desktop' },
              { icon: Globe, label: 'Web' },
            ].map((device, i) => (
              <div
                key={i}
                className="flex flex-col items-center space-y-2 group"
              >
                <div
                  className={`bg-gradient-to-r ${platformFeatures[activePlatform].color} p-4 rounded-full group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <device.icon size={24} className="text-white" />
                </div>
                <span className="text-gray-200 font-medium">{device.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}