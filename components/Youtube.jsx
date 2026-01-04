"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { ChevronRight, CheckCircle, Target, PieChart, Globe, Clock, Sparkles, Video, Calendar, ImageIcon } from "lucide-react";

export default function GoogleCreateYouTubeCampaign() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [managerCustomerId, setManagerCustomerId] = useState("2500236286");
  const [campaignName, setCampaignName] = useState("");
  const [budget, setBudget] = useState("");
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchCustomerIds = async () => {
      try {
        const refreshToken = localStorage.getItem("googleAdsRefreshToken");
        if (!refreshToken) {
          setError("No refresh token found. Please reconnect Google Ads.");
          router.push("/connect-ads?error=Missing%20refresh%20token");
          return;
        }

        const response = await fetch("/api/getcustomerids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch customer IDs");
        }

        setCustomers(data.customers || []);
        if (data.customers.length > 0) {
          setSelectedCustomerId(data.customers[0].id);
        }
        if (data.managerCustomerIds.length > 0) {
          setManagerCustomerId(data.managerCustomerIds[0]);
        }
      } catch (err) {
        setError(`Failed to fetch customer IDs: ${err.message}`);
        console.error("Error fetching customer IDs:", err);
      }
    };

    fetchCustomerIds();
  }, [router]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    if (!selectedCustomerId) {
      setError("Please select a customer ID");
      setIsSubmitting(false);
      return;
    }

    if (campaignName.length < 3) {
      setError("Campaign name must be at least 3 characters long");
      setIsSubmitting(false);
      return;
    }

    if (!budget || Number(budget) <= 0) {
      setError("Budget must be a positive number");
      setIsSubmitting(false);
      return;
    }

    if (!youtubeVideoUrl || !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(youtubeVideoUrl)) {
      setError("Valid YouTube video URL required (e.g., https://www.youtube.com/watch?v=...)");
      setIsSubmitting(false);
      return;
    }

    if (!businessName || businessName.length < 3) {
      setError("Business name must be at least 3 characters");
      setIsSubmitting(false);
      return;
    }

    if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      setError("Valid start date required (YYYY-MM-DD)");
      setIsSubmitting(false);
      return;
    }

    if (!endDate || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      setError("Valid end date required (YYYY-MM-DD)");
      setIsSubmitting(false);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (startDate < today) {
      setError("Start date cannot be in the past");
      setIsSubmitting(false);
      return;
    }

    if (endDate < startDate) {
      setError("End date must be after start date");
      setIsSubmitting(false);
      return;
    }

    try {
      const refreshToken = localStorage.getItem("googleAdsRefreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token found. Please reconnect Google Ads.");
      }

      const response = await fetch("/api/youtubecreate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: '9702617552',
          refreshToken,
          campaignDetails: {
            name: campaignName,
            budgetMicros: Number(budget) * 1000000,
            youtubeVideoUrl,
            businessName,
            startDate,
            endDate,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create campaign");
      }

      setSuccess("YouTube campaign created successfully!");
      setCampaignName("");
      setBudget("");
      setYoutubeVideoUrl("");
      setBusinessName("");
      setStartDate("");
      setEndDate("");
      setCurrentStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!selectedCustomerId;
      case 2:
        return campaignName.length >= 3;
      case 3:
        return !!budget && Number(budget) > 0;
      case 4:
        return (
          youtubeVideoUrl &&
          /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(youtubeVideoUrl) &&
          businessName.length >= 3 &&
          startDate &&
          /^\d{4}-\d{2}-\d{2}$/.test(startDate) &&
          endDate &&
          /^\d{4}-\d{2}-\d{2}$/.test(endDate) &&
          startDate >= new Date().toISOString().split('T')[0] &&
          endDate >= startDate
        );
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (isCurrentStepValid()) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const renderCustomerSelection = () => (
    <div className="fade-in space-y-6">
      <h3 className="text-xl font-semibold mb-5 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent flex items-center">
        <div className="relative mr-2">
          <Target size={20} className="text-amber-400" />
          <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-md"></div>
        </div>
        Select Customer Account
      </h3>
      {customers.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className={`relative group transition-all duration-300 border rounded-2xl overflow-hidden cursor-pointer backdrop-blur-sm ${
                selectedCustomerId === customer.id
                  ? "border-amber-500 bg-gradient-to-br from-amber-900/20 via-orange-900/20 to-gray-900/80 shadow-lg shadow-amber-500/20"
                  : "border-gray-700/30 bg-gray-900/30 hover:bg-gray-800/50 hover:border-amber-500/30"
              }`}
              onClick={() => setSelectedCustomerId(customer.id)}
            >
              {selectedCustomerId === customer.id && (
                <div className="absolute inset-0 border border-amber-500/50 rounded-2xl animate-pulse"></div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
                        selectedCustomerId === customer.id
                          ? "bg-gradient-to-r from-amber-600 to-orange-600"
                          : "bg-gray-800/60"
                      }`}
                    >
                      <Target size={18} className={`${selectedCustomerId === customer.id ? "text-white" : "text-gray-400"}`} />
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-white text-lg">{customer.name}</p>
                      <p className="text-sm text-gray-400">{customer.id}</p>
                    </div>
                  </div>
                  {selectedCustomerId === customer.id && (
                    <div className="ml-2 bg-amber-500/20 h-8 w-8 rounded-full flex items-center justify-center">
                      <CheckCircle size={16} className="text-amber-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-gray-700/30 rounded-2xl bg-gradient-to-br from-gray-900/60 via-slate-900/40 to-black/60 backdrop-blur-sm p-8 text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-gray-800/60 flex items-center justify-center mx-auto mb-4">
            <Target size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-300 font-medium">No customer accounts found</p>
          <p className="text-sm text-gray-500 mt-2">Connect your Google Ads account first</p>
          <button
            onClick={() => router.push("/connect-ads")}
            className="mt-4 bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-3 rounded-lg text-sm text-gray-300 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 border border-gray-600/50 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Connect Google Ads
          </button>
        </div>
      )}
    </div>
  );

  const renderCampaignSetup = () => (
    <div className="fade-in space-y-6">
      <h3 className="text-xl font-semibold mb-5 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent flex items-center">
        <div className="relative mr-2">
          <PieChart size={20} className="text-amber-400" />
          <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-md"></div>
        </div>
        Campaign Setup
      </h3>
      <div className="space-y-6">
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-900/60 text-amber-400 mr-2 text-xs">1</span>
            Campaign Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full border border-gray-700/30 rounded-xl px-4 py-3.5 bg-gray-900/60 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all pl-10 shadow-sm hover:shadow-amber-500/20"
              placeholder="Enter a name for your campaign"
            />
            <div className="absolute left-3 top-3.5 text-gray-400">
              <PieChart size={18} />
            </div>
            <div className={`absolute right-3 top-3.5 transition-opacity ${campaignName.length >= 3 ? "opacity-100" : "opacity-0"}`}>
              <CheckCircle size={18} className="text-amber-400" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-900/20 to-gray-900/20 backdrop-blur-sm rounded-xl p-4 border border-amber-500/20 shadow-lg">
          <div className="flex items-center text-amber-300 mb-2">
            <Sparkles size={16} className="mr-2" />
            <span className="text-sm font-medium">Pro Tip</span>
          </div>
          <p className="text-sm text-gray-400">
            Choose a descriptive campaign name to easily track your YouTube video promotion.
          </p>
        </div>
      </div>
    </div>
  );

  const renderBudgetSetup = () => (
    <div className="fade-in space-y-6">
      <h3 className="text-xl font-semibold mb-5 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent flex items-center">
        <div className="relative mr-2">
          <Globe size={20} className="text-amber-400" />
          <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-md"></div>
        </div>
        Budget Setup
      </h3>
      <div className="space-y-6">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-900/60 text-amber-400 mr-2 text-xs">1</span>
            Daily Budget (USD)
          </label>
          <div className="relative">
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full border border-gray-700/30 rounded-xl px-4 py-3.5 bg-gray-900/60 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all pl-10 shadow-sm hover:shadow-amber-500/20"
              placeholder="Enter daily budget amount"
              min="1"
              step="0.01"
            />
            <div className="absolute left-3 top-3.5 text-amber-400 font-medium">$</div>
            {budget && parseFloat(budget) >= 1 && (
              <div className="absolute right-3 top-3.5">
                <CheckCircle size={18} className="text-amber-400" />
              </div>
            )}
          </div>
          <div className="mt-2 flex items-center">
            <Clock size={14} className="text-gray-500 mr-1" />
            <p className="text-xs text-gray-400">Minimum recommended budget: $10.00/day</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-900/20 to-gray-900/20 backdrop-blur-sm rounded-xl p-4 border border-amber-500/20 shadow-lg">
          <div className="flex items-center text-amber-300 mb-2">
            <Sparkles size={16} className="mr-2" />
            <span className="text-sm font-medium">Budget Insights</span>
          </div>
          <p className="text-sm text-gray-400">
            A daily budget of $20-$100 is recommended for YouTube campaigns to maximize reach.
          </p>
        </div>
      </div>
    </div>
  );

  const renderAdContentSetup = () => (
    <div className="fade-in space-y-6">
      <h3 className="text-xl font-semibold mb-5 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent flex items-center">
        <div className="relative mr-2">
          <Video size={20} className="text-amber-400" />
          <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-md"></div>
        </div>
        Ad Content
      </h3>
      <div className="space-y-6">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-900/60 text-amber-400 mr-2 text-xs">1</span>
            YouTube Video URL
          </label>
          <div className="relative">
            <input
              type="text"
              value={youtubeVideoUrl}
              onChange={(e) => setYoutubeVideoUrl(e.target.value)}
              className="w-full border border-gray-700/30 rounded-xl px-4 py-3.5 bg-gray-900/60 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all pl-10 shadow-sm hover:shadow-amber-500/20"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <div className="absolute left-3 top-3.5 text-gray-400">
              <Video size={18} />
            </div>
            {youtubeVideoUrl && /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(youtubeVideoUrl) && (
              <div className="absolute right-3 top-3.5">
                <CheckCircle size={18} className="text-amber-400" />
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-900/60 text-amber-400 mr-2 text-xs">2</span>
            Business Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full border border-gray-700/30 rounded-xl px-4 py-3.5 bg-gray-900/60 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all pl-10 shadow-sm hover:shadow-amber-500/20"
              placeholder="Enter your business name"
            />
            <div className="absolute left-3 top-3.5 text-gray-400">
              <Target size={18} />
            </div>
            {businessName.length >= 3 && (
              <div className="absolute right-3 top-3.5">
                <CheckCircle size={18} className="text-amber-400" />
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-900/60 text-amber-400 mr-2 text-xs">3</span>
            Start Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-700/30 rounded-xl px-4 py-3.5 bg-gray-900/60 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all pl-10 shadow-sm hover:shadow-amber-500/20"
              min={new Date().toISOString().split('T')[0]}
            />
            <div className="absolute left-3 top-3.5 text-gray-400">
              <Calendar size={18} />
            </div>
            {startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate) && startDate >= new Date().toISOString().split('T')[0] && (
              <div className="absolute right-3 top-3.5">
                <CheckCircle size={18} className="text-amber-400" />
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-900/60 text-amber-400 mr-2 text-xs">4</span>
            End Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-700/30 rounded-xl px-4 py-3.5 bg-gray-900/60 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all pl-10 shadow-sm hover:shadow-amber-500/20"
              min={startDate || new Date().toISOString().split('T')[0]}
            />
            <div className="absolute left-3 top-3.5 text-gray-400">
              <Calendar size={18} />
            </div>
            {endDate && /^\d{4}-\d{2}-\d{2}$/.test(endDate) && endDate >= startDate && (
              <div className="absolute right-3 top-3.5">
                <CheckCircle size={18} className="text-amber-400" />
              </div>
            )}
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-900/20 to-gray-900/20 backdrop-blur-sm rounded-xl p-4 border border-amber-500/20 shadow-lg">
          <div className="flex items-center text-amber-300 mb-2">
            <Sparkles size={16} className="mr-2" />
            <span className="text-sm font-medium">Ad Content Tips</span>
          </div>
          <p className="text-sm text-gray-400">
            Ensure your YouTube video is engaging, your business name is clear, and campaign dates are set appropriately to attract viewers.
          </p>
        </div>
      </div>
    </div>
  );


  // youtube preview 

  const renderPreview = () => {
  const getBusinessName = () => {
    return businessName || 'Your Business';
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-4 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-cyan-600/20 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-[3rem] border-2 border-slate-700/50 p-4 shadow-2xl shadow-purple-500/20 transform group-hover:scale-[1.02] transition-all duration-500">
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-28 h-6 bg-slate-800 rounded-full border border-slate-600 shadow-inner"></div>
        <div className="rounded-3xl overflow-hidden border-2 border-slate-700/50 bg-slate-950 shadow-inner">
          {/* Status Bar */}
          <div className="bg-slate-950 h-8 flex items-center justify-between px-6">
            <div className="text-white text-sm font-medium">9:41</div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-green-500"></div>
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500"></div>
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-400 to-red-500"></div>
            </div>
          </div>
          <div className="bg-slate-900">
            {/* App Header */}
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 py-3 px-4 flex items-center justify-between border-b border-blue-700/30">
              <div className="flex items-center">
                <div className="relative">
                  <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.54-4.385-8.816zM9 16V8l8 4-8 4z"/>
                  </svg>
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-sm"></div>
                </div>
                <span className="ml-3 text-white font-bold text-base">YouTube</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 shadow-inner"></div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 shadow-inner"></div>
              </div>
            </div>
            {/* Ad Content */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-y border-slate-700/30 shadow-lg">
              <div className="flex items-center px-4 py-3">
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">
                    {getBusinessName().charAt(0)}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-transparent rounded-2xl"></div>
                </div>
                <div className="ml-3">
                  <p className="text-white text-sm font-semibold">{getBusinessName()}</p>
                  <p className="text-slate-400 text-xs">Sponsored · <span className="text-blue-400 font-medium">Ad</span></p>
                </div>
              </div>
              <div className="px-4 py-2">
                <p className="text-slate-100 text-sm leading-relaxed">
                 Check out our latest video!
                </p>
              </div>
              <div className="h-44 relative overflow-hidden">
                {youtubeVideoUrl ? (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-10 h-10 mx-auto text-red-500 mb-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      <p className="text-slate-400 text-sm">Video Preview</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon size={36} className="mx-auto text-slate-400 mb-2" />
                      <p className="text-slate-400 text-sm">Ad Video Preview</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-3 border border-slate-600/30 shadow-inner">
                  <p className="text-white text-sm font-bold">{campaignName || 'Your Campaign'}</p>
                  <p className="text-slate-400 text-xs truncate mt-1">{youtubeVideoUrl || 'https://www.youtube.com/watch?v=...'}</p>
                  <button className="mt-3 w-full bg-gradient-to-r from-blue-600 to-blue-500 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                    <span className="text-white text-sm font-semibold">Watch Now</span>
                  </button>
                </div>
              </div>
              <div className="border-t border-slate-700/50 px-4 py-3 flex justify-between bg-gradient-to-r from-slate-900/50 to-slate-800/50">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center group cursor-pointer">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 group-hover:from-red-500 group-hover:to-red-600 transition-all duration-300"></div>
                    <span className="text-slate-400 text-xs ml-2 group-hover:text-red-400 transition-colors">Like</span>
                  </div>
                  <div className="flex items-center group cursor-pointer">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 group-hover:from-blue-500 group-hover:to-blue-600 transition-all duration-300"></div>
                    <span className="text-slate-400 text-xs ml-2 group-hover:text-blue-400 transition-colors">Comment</span>
                  </div>
                </div>
                <div className="flex items-center group cursor-pointer">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 group-hover:from-green-500 group-hover:to-green-600 transition-all duration-300"></div>
                  <span className="text-slate-400 text-xs ml-2 group-hover:text-green-400 transition-colors">Share</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 rounded-2xl mt-4 p-3 text-center backdrop-blur-sm border border-purple-400/20">
          <span className="text-sm font-semibold bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
            YouTube Ads Mobile Preview
          </span>
        </div>
      </div>
    </div>
  );
};

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderCustomerSelection();
      case 2:
        return renderCampaignSetup();
      case 3:
        return renderBudgetSetup();
      case 4:
        return renderAdContentSetup();
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>YouTube Ads Campaign Creator | AdGenius AI</title>
        <meta name="description" content="Create YouTube Ads campaigns with our step-by-step wizard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-600/8 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-orange-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-yellow-500/8 rounded-full blur-3xl animate-pulse delay-2000"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/5 via-transparent to-slate-900/5"></div>
        </div>
      
        <div className="relative px-4 sm:px-6 lg:px-16 pt-16 pb-24 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="relative inline-block">
                <h2 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent flex items-center justify-center">
                  <div className="relative mr-4">
                    <Sparkles className="text-amber-400" size={40} />
                    <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-xl animate-pulse"></div>
                  </div>
                  Create Your YouTube Ads Campaign
                </h2>
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-600/10 via-orange-600/10 to-yellow-600/10 rounded-2xl blur-xl"></div>
              </div>
              <p className="mt-6 text-xl text-gray-300 font-light">Launch your YouTube video campaign in minutes with our guided wizard</p>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <div className="xl:col-span-7 relative">
                <div className="relative bg-gradient-to-br from-gray-900/60 via-slate-900/40 to-black/60 backdrop-blur-2xl border border-gray-700/30 rounded-3xl shadow-2xl shadow-black/40 overflow-hidden">
                  <div className="relative bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 border-b border-gray-700/50 p-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-yellow-500/5"></div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-white mb-2 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                          <span className="text-black font-bold text-sm">✓</span>
                        </div>
                        Campaign Configuration
                      </h3>
                      <p className="text-gray-400">Complete each step to build your perfect YouTube Ads campaign</p>
                    </div>
                  </div>
                  <div className="p-8">
                    {error && (
                      <div className="relative mb-8 bg-gradient-to-r from-red-900/30 via-red-800/20 to-red-900/30 border border-red-500/30 text-red-300 px-6 py-4 rounded-2xl flex items-start backdrop-blur-sm">
                        <div className="absolute inset-0 bg-red-500/5 rounded-2xl animate-pulse"></div>
                        <CheckCircle size={22} className="mr-3 mt-0.5 flex-shrink-0 relative z-10" />
                        <span className="relative z-10">{error}</span>
                      </div>
                    )}
                    {success && (
                      <div className="relative mb-8 bg-gradient-to-r from-emerald-900/30 via-emerald-800/20 to-emerald-900/30 border border-emerald-500/30 text-emerald-300 px-6 py-4 rounded-2xl flex items-start backdrop-blur-sm">
                        <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl animate-pulse"></div>
                        <CheckCircle size={22} className="mr-3 mt-0.5 flex-shrink-0 relative z-10" />
                        <span className="relative z-10">{success}</span>
                      </div>
                    )}
                    <div className="mb-12 relative">
                      <div className="flex justify-between mb-8 relative">
                        <div className="absolute top-6 left-0 w-full h-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full shadow-inner border border-gray-700/30">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-amber-500/40 relative overflow-hidden"
                            style={{ width: `${(currentStep - 1) * 25}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent animate-pulse"></div>
                          </div>
                        </div>
                        {[1, 2, 3, 4].map((step) => (
                          <div key={step} className="z-20 flex flex-col items-center group">
                            <div
                              className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 transform border-2 ${
                                currentStep === step
                                  ? "bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 text-white scale-110 shadow-2xl shadow-amber-500/50 rotate-3 border-amber-400/50"
                                  : currentStep > step
                                  ? "bg-gradient-to-br from-amber-800 to-orange-800 text-amber-200 border-amber-600/50 shadow-lg"
                                  : "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-400 border-gray-600/30"
                              }`}
                            >
                              {currentStep === step && (
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
                              )}
                              {currentStep > step ? (
                                <CheckCircle size={28} className="text-amber-200 relative z-10" />
                              ) : (
                                <span className="font-bold text-xl relative z-10">{step}</span>
                              )}
                            </div>
                            <span
                              className={`text-sm mt-4 font-semibold transition-all duration-300 ${
                                currentStep === step
                                  ? "text-amber-300 scale-110"
                                  : currentStep > step
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              {step === 1 && "Account"}
                              {step === 2 && "Campaign"}
                              {step === 3 && "Budget"}
                              {step === 4 && "Ad Content"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="relative bg-gradient-to-br from-gray-900/80 via-slate-900/60 to-black/80 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-8 min-h-[500px] transition-all duration-500 shadow-inner">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/3 via-transparent to-orange-500/3 rounded-2xl"></div>
                      <div className="relative z-10">{renderStepContent()}</div>
                    </div>
                    <div className="flex justify-between mt-10">
                      {currentStep > 1 ? (
                        <button
                          onClick={prevStep}
                          disabled={isSubmitting}
                          className="group relative px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 backdrop-blur-sm text-gray-200 rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 disabled:opacity-50 border border-gray-600/50 flex items-center shadow-lg hover:shadow-2xl transform hover:scale-105"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                          <ChevronRight size={20} className="mr-3 transform rotate-180 relative z-10" />
                          <span className="relative z-10 font-medium">Previous</span>
                        </button>
                      ) : (
                        <div></div>
                      )}
                      {currentStep < 4 ? (
                        <button
                          onClick={nextStep}
                          disabled={isSubmitting || !isCurrentStepValid()}
                          className="group relative px-8 py-4 bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 rounded-2xl text-white font-semibold hover:shadow-2xl hover:shadow-amber-500/40 transition-all duration-300 flex items-center disabled:opacity-50 transform hover:scale-105 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-700 via-orange-700 to-yellow-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <span className="relative z-10">Next Step</span>
                          <ChevronRight size={20} className="ml-3 relative z-10" />
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting || !isCurrentStepValid()}
                          className="group relative px-8 py-4 bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 rounded-2xl text-white font-semibold hover:shadow-2xl hover:shadow-amber-500/40 transition-all duration-300 flex items-center disabled:opacity-50 transform hover:scale-105 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-700 via-orange-700 to-yellow-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          {isSubmitting ? (
                            <div className="relative z-10 flex items-center">
                              <span className="mr-3">Creating...</span>
                              <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
                            </div>
                          ) : (
                            <div className="relative z-10 flex items-center">
                              <span>Create Campaign</span>
                              <Sparkles size={20} className="ml-3" />
                            </div>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="xl:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-sm sticky top-28">
                  <div className="relative bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 border border-gray-700/30 rounded-2xl p-6 mb-6 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-yellow-500/5 rounded-2xl"></div>
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                          <span className="text-black font-bold text-sm">📱</span>
                        </div>
                        Live Preview
                      </h3>
                      <p className="text-gray-400 text-sm">See how your ad will appear</p>
                    </div>
                  </div>
                  {renderPreview()}
                  <div className="relative mt-8 group">
                    <div className="absolute -inset-2 bg-gradient-to-br from-amber-600/10 via-orange-600/10 to-yellow-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-gradient-to-br from-gray-900/80 via-slate-900/60 to-black/80 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-6 shadow-xl shadow-black/40">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 rounded-2xl"></div>
                      <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent flex items-center">
                          <div className="relative mr-2">
                            <Target size={20} className="text-amber-400" />
                            <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-md"></div>
                          </div>
                          Campaign Summary
                        </h3>
                        <div className="space-y-5">
                          {[
                            {
                              icon: Target,
                              label: "Channel:",
                              value: "YouTube Shorts",
                            },
                            {
                              icon: Clock,
                              label: "Budget:",
                              value: `$${budget || "0"}/day`,
                            },
                            {
                              icon: Video,
                              label: "Video URL:",
                              value: youtubeVideoUrl || "Not Set",
                            },
                            {
                              icon: Target,
                              label: "Business Name:",
                              value: businessName || "Not Set",
                            },
                            {
                              icon: Calendar,
                              label: "Start Date:",
                              value: startDate || "Not Set",
                            },
                            {
                              icon: Calendar,
                              label: "End Date:",
                              value: endDate || "Not Set",
                            },
                          ].map(({ icon: Icon, label, value }, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-600/30 backdrop-blur-sm group hover:from-gray-700/60 hover:to-gray-800/60 transition-all duration-300"
                            >
                              <div className="text-gray-300 text-sm flex items-center">
                                <div className="relative mr-3">
                                  <Icon size={18} className="text-amber-400 group-hover:text-orange-400 transition-colors duration-300" />
                                  <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-sm group-hover:bg-orange-400/20 transition-colors duration-300"></div>
                                </div>
                                <span>{label}</span>
                              </div>
                              <span className="text-white text-sm font-medium truncate">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}