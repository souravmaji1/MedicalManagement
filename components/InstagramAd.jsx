"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import { createClient } from "@supabase/supabase-js"
import {
  Sparkles,
  Zap,
  CheckCircle,
  Instagram,
  ChevronRight,
  GanttChart,
  Briefcase,
  Globe,
  ImageIcon,
  Clock,
  Smartphone,
  Target,
  Layers,
} from "lucide-react"

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function InstagramAdCreator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [adAccounts, setAdAccounts] = useState([])
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [imageUrl, setImageUrl] = useState("")

  // Campaign creation state
  const [currentStep, setCurrentStep] = useState(1)
  const [campaignName, setCampaignName] = useState("")
  const [budget, setBudget] = useState("")
  const [selectedPage, setSelectedPage] = useState("")
  const [selectedAdAccount, setSelectedAdAccount] = useState("")
  const [objective, setObjective] = useState("OUTCOME_TRAFFIC")
  const [adDescription, setAdDescription] = useState("Check out our latest offer!")
  const [targetUrl, setTargetUrl] = useState("https://example.com")
  const [placement, setPlacement] = useState("FEED") // Instagram-specific placement
  const [audience, setAudience] = useState({
    countries: ["US"],
    ageMin: 18,
    ageMax: 65,
  })

  const [allPages, setAllPages] = useState([]) // Store all pages (not just Instagram-linked)
  const [showLinkModal, setShowLinkModal] = useState(false) // Control modal for linking
  const [selectedLinkPage, setSelectedLinkPage] = useState("") // Page to link Instagram to
  // Initialize Facebook SDK
  useEffect(() => {
    window.fbAsyncInit = () => {
      FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
        cookie: true,
        xfbml: true,
        version: "v18.0",
      })

      FB.getLoginStatus((response) => {
        statusChangeCallback(response)
      })
    }
    ;((d, s, id) => {
      const fjs = d.getElementsByTagName(s)[0]
      if (d.getElementById(id)) return
      const js = d.createElement(s)
      js.id = id
      js.src = "https://connect.facebook.net/en_US/sdk.js"
      fjs.parentNode.insertBefore(js, fjs)
    })(document, "script", "facebook-jssdk")
  }, [])

  // Handle login status
  const statusChangeCallback = (response) => {
    if (response.status === "connected") {
      setIsLoggedIn(true)
      fetchUserData()
      fetchAdAccounts()
      fetchPages()
    } else {
      setIsLoggedIn(false)
      setUserName("")
      setAdAccounts([])
      setPages([])
      setSelectedPage("")
      setSelectedAdAccount("")
      setImageUrl("")
    }
  }

  // Fetch user data
  const fetchUserData = () => {
    FB.api("/me", { fields: "name" }, (response) => {
      if (response && !response.error) {
        setUserName(response.name)
      } else {
        setError("Failed to fetch user data.")
      }
    })
  }

  // Fetch ad accounts
  const fetchAdAccounts = () => {
    setLoading(true)
    FB.api(
      "/me/adaccounts",
      { fields: "id,name,account_status,business,pages{instagram_business_account}" },
      (response) => {
        setLoading(false)
        if (response && !response.error) {
          const adAccountsWithInstagram = (response.data || []).map((account) => {
            const hasInstagramPage = account.pages?.data?.some((page) => page.instagram_business_account)
            return { ...account, hasInstagramPage }
          })
          setAdAccounts(adAccountsWithInstagram)
          if (adAccountsWithInstagram.length > 0) {
            setSelectedAdAccount(adAccountsWithInstagram[0].id)
          } else {
            setError("No ad accounts found. Please create or assign an ad account in Meta Business Manager.")
          }
          console.log("Ad Accounts with Instagram Info:", adAccountsWithInstagram)
        } else {
          setError("Failed to fetch ad accounts: " + (response.error?.message || "Unknown error"))
          console.error("Ad Accounts API Error:", response.error)
        }
      },
    )
  }

  // Fetch pages
  const fetchPages = () => {
    setLoading(true)
    FB.api("/me/accounts", { fields: "id,name,category,instagram_business_account,access_token" }, (response) => {
      setLoading(false)
      if (response && !response.error) {
        console.log("Pages API Response:", response.data)
        const instagramPages = (response.data || []).filter((page) => page.instagram_business_account)
        const allPages = (response.data || []).map((page) => ({
          id: page.id,
          name: page.name,
          category: page.category,
          instagram_business_account: page.instagram_business_account,
          access_token: page.access_token, // Needed for linking
        }))
        setPages(instagramPages)
        setAllPages(allPages) // Store all pages
        if (instagramPages.length > 0) {
          setSelectedPage(instagramPages[0].id)
        }
        if (allPages.length === 0) {
          setError("No pages found. Please create or assign a page in Meta Business Manager.")
        } else if (instagramPages.length === 0) {
          setError("No pages with linked Instagram Business Accounts found. Use the button below to link an account.")
        }
        console.log("Filtered Instagram Pages:", instagramPages)
        console.log("All Pages:", allPages)
      } else {
        setError("Failed to fetch pages: " + (response.error?.message || "Unknown error"))
        console.error("Pages API Error:", response.error)
      }
    })
  }

  const handleLinkInstagram = () => {
    if (!selectedLinkPage) {
      setError("Please select a page to link the Instagram account to.")
      return
    }

    setLoading(true)
    setError("")

    // Step 1: Prompt Instagram login with OAuth
    FB.login(
      (response) => {
        if (response.status === "connected") {
          const accessToken = response.authResponse.access_token
          const selectedPage = allPages.find((page) => page.id === selectedLinkPage)

          // Step 2: Link Instagram account to the selected page
          FB.api(
            `/${selectedLinkPage}/instagram_accounts`,
            "POST",
            {
              access_token: selectedPage.access_token,
              instagram_account_id: "", // Will be auto-detected from login
            },
            (linkResponse) => {
              setLoading(false)
              if (linkResponse && !linkResponse.error) {
                setSuccessMessage("Instagram account linked successfully!")
                setShowLinkModal(false)
                setSelectedLinkPage("")
                // Refresh pages to show the newly linked account
                fetchPages()
              } else {
                setError("Failed to link Instagram account: " + (linkResponse.error?.message || "Unknown error"))
                console.error("Link Instagram API Error:", linkResponse.error)
                // Fallback to Business Manager
                setError("Could not link Instagram account in-app. Please link it in Meta Business Manager.")
              }
            },
          )
        } else {
          setLoading(false)
          setError("Instagram login failed. Please try again or link in Meta Business Manager.")
        }
      },
      { scope: "instagram_basic,pages_manage_metadata", return_scopes: true },
    )
  }
  // Handle login
  const handleLogin = () => {
    FB.login(
      (response) => {
        statusChangeCallback(response)
      },
      {
        scope: "ads_management,pages_show_list,instagram_basic,instagram_manage_comments,pages_manage_metadata",
        return_scopes: true,
      },
    )
  }

  // Handle logout
  const handleLogout = () => {
    FB.logout((response) => {
      statusChangeCallback(response)
    })
  }

  // Handle image upload to Supabase
  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const validTypes = ["image/jpeg", "image/png"]
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPEG or PNG image.")
      return
    }
    if (file.size > maxSize) {
      setError("Image size must be less than 5MB.")
      return
    }

    setLoading(true)
    setError("")
    setImageFile(file)

    try {
      const fileName = `${Date.now()}_${file.name}`
      const { data, error } = await supabase.storage.from("avatars").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) {
        setError("Failed to upload image: " + error.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName)

      if (urlData?.publicUrl) {
        setImageUrl(urlData.publicUrl)
        setSuccessMessage("Image uploaded successfully!")
      } else {
        setError("Failed to retrieve image URL.")
      }
    } catch (err) {
      setError("An error occurred while uploading the image.")
    } finally {
      setLoading(false)
    }
  }

  // Handle navigation through steps
  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Validate current step
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1:
        return selectedAdAccount !== ""
      case 2:
        return selectedPage !== ""
      case 3:
        return campaignName !== "" && objective !== ""
      case 4:
        return budget !== "" && !isNaN(budget) && Number.parseFloat(budget) > 0
      case 5:
        return adDescription !== "" && targetUrl !== "" && imageUrl !== ""
      default:
        return true
    }
  }

  // Handle campaign creation
  const handleCreateCampaign = (e) => {
    e.preventDefault()
    if (!campaignName || !budget || !selectedPage || !selectedAdAccount || !imageUrl) {
      setError("Please fill in all required fields, including uploading an ad image.")
      return
    }
    if (isNaN(budget) || Number.parseFloat(budget) <= 0) {
      setError("Please enter a valid budget greater than 0.")
      return
    }

    setLoading(true)
    setError("")
    setSuccessMessage("")

    // Get Instagram Business Account ID
    const selectedPageData = pages.find((page) => page.id === selectedPage)
    const instagramBusinessAccountId = selectedPageData?.instagram_business_account?.id

    if (!instagramBusinessAccountId) {
      setError("Selected page does not have a linked Instagram Business Account.")
      setLoading(false)
      return
    }

    // Step 1: Create a campaign
    FB.api(
      `/${selectedAdAccount}/campaigns`,
      "POST",
      {
        name: campaignName,
        objective: objective,
        status: "PAUSED",
        special_ad_categories: [],
      },
      (campaignResponse) => {
        if (campaignResponse && !campaignResponse.error) {
          const campaignId = campaignResponse.id

          // Step 2: Create an ad set with Instagram placement
          FB.api(
            `/${selectedAdAccount}/adsets`,
            "POST",
            {
              name: `${campaignName} Instagram Ad Set`,
              campaign_id: campaignId,
              daily_budget: Math.round(Number.parseFloat(budget) * 100),
              billing_event: "IMPRESSIONS",
              optimization_goal: "LINK_CLICKS",
              bid_strategy: "LOWEST_COST_WITHOUT_CAP",
              targeting: {
                geo_locations: { countries: audience.countries },
                age_min: audience.ageMin,
                age_max: audience.ageMax,
                publisher_platforms: ["instagram"],
              },
              status: "PAUSED",
            },
            (adSetResponse) => {
              if (adSetResponse && !adSetResponse.error) {
                const adSetId = adSetResponse.id

                // Step 3: Create an ad creative for Instagram
                FB.api(
                  `/${selectedAdAccount}/adcreatives`,
                  "POST",
                  {
                    name: `${campaignName} Instagram Creative`,
                    object_story_spec: {
                      page_id: selectedPage,
                      instagram_actor_id: instagramBusinessAccountId,
                      link_data: {
                        link: targetUrl,
                        message: adDescription,
                        name: campaignName,
                        description: "Click to learn more.",
                        picture: imageUrl,
                      },
                    },
                  },
                  (creativeResponse) => {
                    if (creativeResponse && !creativeResponse.error) {
                      const creativeId = creativeResponse.id

                      // Step 4: Create an ad
                      FB.api(
                        `/${selectedAdAccount}/ads`,
                        "POST",
                        {
                          name: `${campaignName} Instagram Ad`,
                          adset_id: adSetId,
                          creative: { creative_id: creativeId },
                          status: "PAUSED",
                        },
                        (adResponse) => {
                          setLoading(false)
                          if (adResponse && !adResponse.error) {
                            setSuccessMessage(
                              "Instagram campaign created successfully! It is paused and ready for review in Meta Ads Manager.",
                            )
                            setCampaignName("")
                            setBudget("")
                            setImageUrl("")
                            setImageFile(null)
                            setCurrentStep(1)
                          } else {
                            setError("Failed to create ad: " + (adResponse.error?.message || "Unknown error"))
                          }
                        },
                      )
                    } else {
                      setLoading(false)
                      setError("Failed to create ad creative: " + (creativeResponse.error?.message || "Unknown error"))
                    }
                  },
                )
              } else {
                setLoading(false)
                setError("Failed to create ad set: " + (adSetResponse.error?.message || "Unknown error"))
              }
            },
          )
        } else {
          setLoading(false)
          setError("Failed to create campaign: " + (campaignResponse.error?.message || "Unknown error"))
        }
      },
    )
  }

  // Step 1: Ad Account Selection
  const renderAdAccountSelection = () => (
    <div className="fade-in space-y-4">
      <h3 className="text-xl font-semibold mb-5 bg-gradient-to-r from-gray-400 via-gray-400 to-gray-400 bg-clip-text text-transparent flex items-center">
        <div className="relative mr-2">
          <Briefcase size={20} className="text-gray-400" />
          <div className="absolute inset-0 bg-gray-400/20 rounded-full blur-md"></div>
        </div>
        Select Ad Account
      </h3>

      {adAccounts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {adAccounts.map((account) => (
            <div
              key={account.id}
              className={`relative group transition-all duration-300 border rounded-xl overflow-hidden cursor-pointer backdrop-blur-sm ${
                selectedAdAccount === account.id
                  ? "border-gray-500 bg-gradient-to-br from-gray-900/20 via-gray-900/20 to-gray-900/80 shadow-lg shadow-gray-500/20"
                  : "border-gray-700/30 bg-gray-900/30 hover:bg-gray-800/50 hover:border-gray-500/30"
              }`}
              onClick={() => setSelectedAdAccount(account.id)}
            >
              {selectedAdAccount === account.id && (
                <div className="absolute inset-0 border border-gray-500/50 rounded-xl animate-pulse"></div>
              )}

              <div className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                        selectedAdAccount === account.id
                          ? "bg-gradient-to-r from-gray-600 to-gray-600"
                          : "bg-gray-800/60"
                      }`}
                    >
                      <Briefcase
                        size={16}
                        className={`${selectedAdAccount === account.id ? "text-white" : "text-gray-400"}`}
                      />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-white text-lg">{account.name}</p>
                      <p className="text-sm text-gray-400">{account.id}</p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                      account.account_status === 1
                        ? "bg-green-900/40 text-green-400 border border-green-500/30"
                        : "bg-red-900/40 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {account.account_status === 1 ? "Active" : "Inactive"}
                  </div>
                </div>

                {selectedAdAccount === account.id && (
                  <div className="mt-4 bg-gray-500/10 p-3 rounded-lg border border-gray-500/20 flex items-center animate-pulse">
                    <CheckCircle size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-300">Selected for campaign</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-gray-700/30 rounded-xl bg-gradient-to-br from-gray-900/60 via-slate-900/40 to-black/60 backdrop-blur-sm p-8 text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-gray-800/60 flex items-center justify-center mx-auto mb-4">
            <Briefcase size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-300 font-medium">No ad accounts found</p>
          <p className="text-sm text-gray-500 mt-2">Create an ad account in Meta Business Manager first</p>
          <button className="mt-4 bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2 rounded-lg text-sm text-gray-300 hover:from-gray-700 hover:to-gray-800 transition border border-gray-600/50 shadow-lg hover:shadow-xl transform hover:scale-105">
            Create Ad Account
          </button>
        </div>
      )}
    </div>
  )

  // Step 2: Select Instagram Page
  const renderPageSelection = () => (
    <div className="fade-in space-y-4">
      <h3 className="text-xl font-semibold mb-5 bg-gradient-to-r from-gray-400 via-gray-400 to-gray-400 bg-clip-text text-transparent flex items-center">
        <div className="relative mr-2">
          <Instagram size={20} className="text-gray-400" />
          <div className="absolute inset-0 bg-gray-400/20 rounded-full blur-md"></div>
        </div>
        Select Instagram Account
      </h3>

      {pages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pages.map((page) => (
            <div
              key={page.id}
              className={`relative group transition-all duration-300 border rounded-xl overflow-hidden cursor-pointer backdrop-blur-sm ${
                selectedPage === page.id
                  ? "border-gray-500 bg-gradient-to-br from-gray-900/20 via-gray-900/20 to-gray-900/80 transform scale-[1.02] shadow-lg shadow-gray-500/20"
                  : "border-gray-700/30 bg-gray-900/30 hover:bg-gray-800/50 hover:scale-[1.01] hover:border-gray-500/30"
              }`}
              onClick={() => setSelectedPage(page.id)}
            >
              <div className="p-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
                        selectedPage === page.id ? "bg-gradient-to-r from-gray-600 to-gray-600" : "bg-gray-900/40"
                      }`}
                    >
                      <span className="text-white font-bold text-xl">{page.name.charAt(0)}</span>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-white text-lg">{page.name}</p>
                      <p className="text-sm text-gray-400">
                        Instagram ID: {page.instagram_business_account?.id || "N/A"}
                      </p>
                      <p className="text-sm text-gray-400">Category: {page.category}</p>
                    </div>
                  </div>
                  {selectedPage === page.id && <CheckCircle size={16} className="text-gray-400" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-gray-700/30 rounded-xl bg-gradient-to-br from-gray-900/60 via-slate-900/40 to-black/60 backdrop-blur-sm p-8 text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-gray-800/60 flex items-center justify-center mx-auto mb-4">
            <Instagram size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-300 font-medium">No Instagram accounts found</p>
          <p className="text-sm text-gray-500 mt-2">Link an Instagram Business Account to a Facebook page.</p>
          <button
            onClick={() => setShowLinkModal(true)}
            className="mt-4 bg-gradient-to-r from-gray-600 to-gray-600 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 transition shadow-lg shadow-gray-500/20 transform hover:scale-105"
          >
            Link Instagram Account
          </button>
          <button
            onClick={() => window.open("https://business.facebook.com/settings/instagram-accounts", "_blank")}
            className="mt-2 bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2 rounded-lg text-sm text-gray-300 hover:from-gray-700 hover:to-gray-800 transition border border-gray-600/50 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Link in Meta Business Manager
          </button>
        </div>
      )}

      {/* Modal for Linking Instagram Account */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900/90 to-black/90 rounded-xl p-6 w-full max-w-md border border-gray-700/30 shadow-xl shadow-gray-500/10">
            <h3 className="text-lg font-semibold text-white mb-4">Link Instagram Account</h3>
            <p className="text-sm text-gray-400 mb-4">
              Select a Facebook Page to link your Instagram Business Account to.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Page</label>
              <select
                value={selectedLinkPage}
                onChange={(e) => setSelectedLinkPage(e.target.value)}
                className="w-full border border-gray-700/30 rounded-xl px-4 py-3 bg-gray-900/60 text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50 shadow-sm hover:shadow-gray-500/20"
              >
                <option value="">Select a page</option>
                {allPages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.name}
                  </option>
                ))}
              </select>
            </div>

            {allPages.length === 0 && (
              <p className="text-sm text-red-400 mb-4">
                No pages available. Create a page in Meta Business Manager first.
              </p>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowLinkModal(false)
                  setSelectedLinkPage("")
                }}
                className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg text-gray-300 hover:from-gray-700 hover:to-gray-800 transition border border-gray-600/50 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={handleLinkInstagram}
                disabled={loading || !selectedLinkPage}
                className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-600 rounded-lg text-white hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-gray-500/20 transform hover:scale-105"
              >
                {loading ? "Linking..." : "Link Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Step 3: Campaign Setup
  const renderCampaignSetup = () => (
    <div className="fade-in space-y-6">
      <h3 className="text-xl font-semibold mb-5 bg-gradient-to-r from-gray-400 via-gray-400 to-gray-400 bg-clip-text text-transparent flex items-center">
        <div className="relative mr-2">
          <GanttChart size={20} className="text-gray-400" />
          <div className="absolute inset-0 bg-gray-400/20 rounded-full blur-md"></div>
        </div>
        Campaign Setup
      </h3>

      <div className="space-y-6">
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900/60 text-gray-400 mr-2 text-xs">
              1
            </span>
            Campaign Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full border border-gray-700/30 rounded-xl px-4 py-3.5 bg-gray-900/60 text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all pl-10 shadow-sm hover:shadow-gray-500/20"
              placeholder="Enter a name for your campaign"
            />
            <div className="absolute left-3 top-3.5 text-gray-400">
              <GanttChart size={18} />
            </div>
            <div
              className={`absolute right-3 top-3.5 transition-opacity ${campaignName ? "opacity-100" : "opacity-0"}`}
            >
              <CheckCircle size={18} className="text-gray-400" />
            </div>
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900/60 text-gray-400 mr-2 text-xs">
              2
            </span>
            Campaign Objective
          </label>
          <div className="relative">
            <select
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full border border-gray-700/30 rounded-xl px-4 py-3.5 bg-gray-900/60 text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all pl-10 shadow-sm hover:shadow-gray-500/20"
            >
              <option value="OUTCOME_AWARENESS">Brand Awareness</option>
              <option value="OUTCOME_TRAFFIC">Website Traffic</option>
              <option value="OUTCOME_ENGAGEMENT">Engagement</option>
              <option value="OUTCOME_LEADS">Lead Generation</option>
              <option value="OUTCOME_SALES">Conversions</option>
            </select>
            <div className="absolute left-3 top-3.5 text-gray-400">
              <Target size={18} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/20 to-gray-900/20 backdrop-blur-sm rounded-xl p-4 border border-gray-500/20 shadow-lg">
          <div className="flex items-center text-gray-300 mb-2">
            <Sparkles size={16} className="mr-2" />
            <span className="text-sm font-medium">Pro Tip</span>
          </div>
          <p className="text-sm text-gray-400">
            "Engagement" works great for Instagram to boost likes, comments, and shares on your posts.
          </p>
        </div>
      </div>
    </div>
  )

  // Step 4: Budget & Audience
  const renderBudgetAndAudience = () => (
    <div className="fade-in space-y-6">
      <h3 className="text-xl font-semibold mb-5 bg-gradient-to-r from-gray-400 via-gray-400 to-gray-400 bg-clip-text text-transparent flex items-center">
        <div className="relative mr-2">
          <Layers size={20} className="text-gray-400" />
          <div className="absolute inset-0 bg-gray-400/20 rounded-full blur-md"></div>
        </div>
        Budget & Audience
      </h3>

      <div className="space-y-6">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900/60 text-gray-400 mr-2 text-xs">
              1
            </span>
            Daily Budget (USD)
          </label>
          <div className="relative">
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full border border-gray-700/30 rounded-xl px-4 py-3.5 bg-gray-900/60 text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all pl-10 shadow-sm hover:shadow-gray-500/20"
              placeholder="Enter daily budget amount"
              min="1"
            />
            <div className="absolute left-3 top-3.5 text-gray-400 font-medium">$</div>
            {budget && Number.parseFloat(budget) >= 5 && (
              <div className="absolute right-3 top-3.5">
                <CheckCircle size={18} className="text-gray-400" />
              </div>
            )}
          </div>
          <div className="mt-2 flex items-center">
            <Clock size={14} className="text-gray-500 mr-1" />
            <p className="text-xs text-gray-400">Minimum recommended budget: $5.00/day</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900/60 text-gray-400 mr-2 text-xs">
                2
              </span>
              Target Countries
            </label>
            <div className="relative">
              <select
                value={audience.countries[0]}
                onChange={(e) => setAudience({ ...audience, countries: [e.target.value] })}
                className="w-full border border-gray-700/30 rounded-xl px-4 py-3.5 bg-gray-900/60 text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all pl-10 shadow-sm hover:shadow-gray-500/20"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="IN">India</option>
              </select>
              <div className="absolute left-3 top-3.5 text-gray-400">
                <Globe size={18} />
              </div>
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900/60 text-gray-400 mr-2 text-xs">
                3
              </span>
              Age Range
            </label>
            <div className="flex space-x-4">
              <div className="relative w-1/2">
                <select
                  value={audience.ageMin}
                  onChange={(e) => setAudience({ ...audience, ageMin: Number(e.target.value) })}
                  className="w-full border border-gray-700/30 rounded-xl px-4 py-3.5 bg-gray-900/60 text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all shadow-sm hover:shadow-gray-500/20"
                >
                  {[...Array(48)].map((_, i) => (
                    <option key={i} value={i + 18}>
                      {i + 18} years
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative w-1/2">
                <select
                  value={audience.ageMax}
                  onChange={(e) => setAudience({ ...audience, ageMax: Number(e.target.value) })}
                  className="w-full border border-gray-700/30 rounded-xl px-4 py-3.5 bg-gray-900/60 text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all shadow-sm hover:shadow-gray-500/20"
                >
                  {[...Array(48)].map((_, i) => (
                    <option key={i} value={i + 18}>
                      {i + 18}+ years
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/20 to-gray-900/20 backdrop-blur-sm rounded-xl p-4 border border-gray-500/20 shadow-lg">
          <div className="flex items-center text-gray-300 mb-2">
            <Sparkles size={16} className="mr-2" />
            <span className="text-sm font-medium">Audience Insights</span>
          </div>
          <p className="text-sm text-gray-400">
            You're targeting{" "}
            <span className="text-gray-300">
              {audience.countries[0] === "US" ? "United States" : audience.countries[0]}
            </span>{" "}
            users aged{" "}
            <span className="text-gray-300">
              {audience.ageMin}-{audience.ageMax}
            </span>
            . Estimated potential reach: <span className="text-gray-300">100M+ people</span>
          </p>
        </div>
      </div>
    </div>
  )

  // Step 5: Ad Creative
  const renderAdCreative = () => (
    <div className="fade-in space-y-6">
      <h3 className="text-xl font-semibold mb-5 bg-gradient-to-r from-gray-400 via-gray-400 to-gray-400 bg-clip-text text-transparent flex items-center">
        <div className="relative mr-2">
          <ImageIcon size={20} className="text-gray-400" />
          <div className="absolute inset-0 bg-gray-400/20 rounded-full blur-md"></div>
        </div>
        Ad Creative
      </h3>

      <div className="space-y-6">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900/60 text-gray-400 mr-2 text-xs">
              1
            </span>
            Ad Description
          </label>
          <div className="relative">
            <textarea
              value={adDescription}
              onChange={(e) => setAdDescription(e.target.value)}
              className="w-full border border-gray-700/30 rounded-xl px-4 py-3.5 bg-gray-900/60 text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all resize-none shadow-sm hover:shadow-gray-500/20"
              placeholder="Enter your ad text"
              rows={3}
            />
            <div className="absolute bottom-3 right-3 text-xs px-2 py-1 rounded-md bg-gray-800/70 text-gray-400">
              {adDescription.length}/125
            </div>
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900/60 text-gray-400 mr-2 text-xs">
              2
            </span>
            Destination URL
          </label>
          <div className="relative">
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full border border-gray-700/30 rounded-xl px-4 py-3.5 bg-gray-900/60 text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all pl-10 shadow-sm hover:shadow-gray-500/20"
              placeholder="https://yourdomain.com"
            />
            <div className="absolute left-3 top-3.5 text-gray-400">
              <Globe size={18} />
            </div>
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900/60 text-gray-400 mr-2 text-xs">
              3
            </span>
            Instagram Placement
          </label>
          <div className="relative">
            <select
              value={placement}
              onChange={(e) => setPlacement(e.target.value)}
              className="w-full border border-gray-700/30 rounded-xl px-4 py-3.5 bg-gray-900/60 text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all pl-10 shadow-sm hover:shadow-gray-500/20"
            >
              <option value="FEED">Instagram Feed</option>
              <option value="STORIES">Instagram Stories</option>
            </select>
            <div className="absolute left-3 top-3.5 text-gray-400">
              <Smartphone size={18} />
            </div>
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900/60 text-gray-400 mr-2 text-xs">
              4
            </span>
            Ad Image
          </label>
          <div className="border-2 border-dashed border-gray-700/30 rounded-xl p-8 text-center bg-gray-900/30 hover:bg-gray-900/50 transition-all cursor-pointer group backdrop-blur-sm">
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-gray-800/60 flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-900/20 transition-all">
                <ImageIcon className="h-8 w-8 text-gray-400 group-hover:text-gray-400 transition-all" />
              </div>
              <p className="mt-2 text-gray-300 font-medium group-hover:text-white transition-all">
                {imageFile ? imageFile.name : "Upload ad image or creative"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {placement === "FEED"
                  ? "Recommended size: 1080 × 1080 pixels (JPEG or PNG, max 5MB)"
                  : "Recommended size: 1080 × 1920 pixels (JPEG or PNG, max 5MB)"}
              </p>
              <button
                className="mt-4 px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-600 text-white text-sm font-medium rounded-lg shadow-md shadow-gray-500/10 hover:shadow-lg hover:shadow-gray-500/20 transition-all transform hover:scale-105"
                disabled={loading}
              >
                {loading ? "Uploading..." : "Select Image"}
              </button>
            </label>
            {imageUrl && (
              <div className="mt-4 flex items-center justify-center text-gray-400">
                <CheckCircle size={16} className="mr-2" />
                <span className="text-sm">Image uploaded successfully</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/20 to-gray-900/20 backdrop-blur-sm rounded-xl p-4 border border-gray-500/20 shadow-lg">
          <div className="flex items-center text-gray-300 mb-2">
            <Sparkles size={16} className="mr-2" />
            <span className="text-sm font-medium">Creative Tips</span>
          </div>
          <p className="text-sm text-gray-400">
            Use vibrant visuals and concise text. For Stories, vertical images with bold CTAs work best.
          </p>
        </div>
      </div>
    </div>
  )

  // renderStepContent
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderAdAccountSelection()
      case 2:
        return renderPageSelection()
      case 3:
        return renderCampaignSetup()
      case 4:
        return renderBudgetAndAudience()
      case 5:
        return renderAdCreative()
      default:
        return null
    }
  }

  // Enhanced renderMobilePreview function
  const renderMobilePreview = () => (
    <div className="relative group">
      <div className="absolute -inset-4 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-cyan-600/20 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-[3rem] border-2 border-slate-700/50 p-4 shadow-2xl shadow-purple-500/20 transform group-hover:scale-[1.02] transition-all duration-500">
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-28 h-6 bg-slate-800 rounded-full border border-slate-600 shadow-inner"></div>
        <div className="rounded-3xl overflow-hidden border-2 border-slate-700/50 bg-slate-950 shadow-inner">
          <div className="bg-slate-950 h-8 flex items-center justify-between px-6">
            <div className="text-white text-sm font-medium">9:41</div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-green-500"></div>
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500"></div>
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-400 to-red-500"></div>
            </div>
          </div>
          <div className="bg-slate-900">
            <div className="bg-gradient-to-r from-pink-900 via-purple-900 to-pink-900 py-3 px-4 flex items-center justify-between border-b border-pink-700/30">
              <div className="flex items-center">
                <div className="relative">
                  <Instagram size={24} className="text-pink-400" />
                  <div className="absolute inset-0 bg-pink-400/20 rounded-full blur-sm"></div>
                </div>
                <span className="ml-3 text-white font-bold text-base">Instagram</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 shadow-inner"></div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 shadow-inner"></div>
              </div>
            </div>
            <div className="bg-slate-950 py-3">
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-y border-slate-700/30 shadow-lg">
                <div className="flex items-center px-4 py-3">
                  <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-600 to-purple-700 flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">
                      {(pages.find((p) => p.id === selectedPage)?.name || "Your Page").charAt(0)}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-400/30 to-transparent rounded-2xl"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-white text-sm font-semibold">
                      {pages.find((p) => p.id === selectedPage)?.name || "Your Page"}
                    </p>
                    <p className="text-slate-400 text-xs">
                      Sponsored · <span className="text-pink-400 font-medium">Follow</span>
                    </p>
                  </div>
                </div>
                <div className="px-4 py-2">
                  <p className="text-slate-100 text-sm leading-relaxed">
                    {adDescription || "Check out our latest offer!"}
                  </p>
                </div>
                <div className="h-44 relative overflow-hidden">
                  {imageUrl ? (
                    <img src={imageUrl || "/placeholder.svg"} alt="Ad Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon size={36} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-slate-400 text-sm">Ad Image Preview</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-3 border border-slate-600/30 shadow-inner">
                    <p className="text-white text-sm font-bold">{campaignName || "Your Campaign"}</p>
                    <p className="text-slate-400 text-xs truncate mt-1">{targetUrl || "https://example.com"}</p>
                    <button className="mt-3 w-full bg-gradient-to-r from-pink-600 to-purple-500 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                      <span className="text-white text-sm font-semibold">Learn More</span>
                    </button>
                  </div>
                </div>
                <div className="border-t border-slate-700/50 px-4 py-3 flex justify-between bg-gradient-to-r from-slate-900/50 to-slate-800/50">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center group cursor-pointer">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 group-hover:from-pink-500 group-hover:to-pink-600 transition-all duration-300"></div>
                      <span className="text-slate-400 text-xs ml-2 group-hover:text-pink-400 transition-colors">
                        Like
                      </span>
                    </div>
                    <div className="flex items-center group cursor-pointer">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 group-hover:from-purple-500 group-hover:to-purple-600 transition-all duration-300"></div>
                      <span className="text-slate-400 text-xs ml-2 group-hover:text-purple-400 transition-colors">
                        Comment
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center group cursor-pointer">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 group-hover:from-cyan-500 group-hover:to-cyan-600 transition-all duration-300"></div>
                    <span className="text-slate-400 text-xs ml-2 group-hover:text-cyan-400 transition-colors">
                      Share
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-cyan-500/30 rounded-2xl mt-4 p-3 text-center backdrop-blur-sm border border-pink-400/20">
            <span className="text-sm font-semibold bg-gradient-to-r from-pink-300 to-cyan-300 bg-clip-text text-transparent">
              Instagram Ad Preview
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Head>
        <title>Instagram Ad Campaign Creator | InstaGenius AI</title>
        <meta name="description" content="Create Instagram ad campaigns with our step-by-step wizard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-600/8 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gray-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gray-500/8 rounded-full blur-3xl animate-pulse delay-2000"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/5 via-transparent to-slate-900/5"></div>
        </div>

        <div className="relative px-4 sm:px-6 lg:px-16 pt-16 pb-24 z-10">
          {isLoggedIn ? (
            <div className="max-w-7xl mx-auto">
              {/* Header Section */}
              <div className="text-center mb-16">
                <div className="relative inline-block">
                  <h2 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-400 via-gray-400 to-gray-400 bg-clip-text text-transparent flex items-center justify-center">
                    <div className="relative mr-4">
                      <Sparkles className="text-gray-400" size={40} />
                      <div className="absolute inset-0 bg-gray-400/30 rounded-full blur-xl animate-pulse"></div>
                    </div>
                    Create Your Instagram Ad Campaign
                  </h2>
                  <div className="absolute -inset-4 bg-gradient-to-r from-gray-600/10 via-gray-600/10 to-gray-600/10 rounded-2xl blur-xl"></div>
                </div>
                <p className="mt-6 text-xl text-gray-300 font-light">
                  Follow the steps to launch your campaign in minutes
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* FORM SECTION */}
                <div className="xl:col-span-7 relative">
                  <div className="relative bg-gradient-to-br from-gray-900/60 via-slate-900/40 to-black/60 backdrop-blur-2xl border border-gray-700/30 rounded-3xl shadow-2xl shadow-black/40 overflow-hidden">
                    {/* Form header with gradient overlay */}
                    <div className="relative bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 border-b border-gray-700/50 p-8">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-gray-500/5 to-gray-500/5"></div>
                      <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-white mb-2 flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                            <span className="text-black font-bold text-sm">✓</span>
                          </div>
                          Campaign Configuration
                        </h3>
                        <p className="text-gray-400">Complete each step to build your perfect Instagram ad campaign</p>
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
                      {successMessage && (
                        <div className="relative mb-8 bg-gradient-to-r from-emerald-900/30 via-emerald-800/20 to-emerald-900/30 border border-emerald-500/30 text-emerald-300 px-6 py-4 rounded-2xl flex items-start backdrop-blur-sm">
                          <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl animate-pulse"></div>
                          <CheckCircle size={22} className="mr-3 mt-0.5 flex-shrink-0 relative z-10" />
                          <span className="relative z-10">{successMessage}</span>
                        </div>
                      )}

                      {/* Enhanced Progress Bar */}
                      <div className="mb-12 relative">
                        <div className="flex justify-between mb-8 relative">
                          <div className="absolute top-6 left-0 w-full h-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full shadow-inner border border-gray-700/30">
                            <div
                              className="h-full bg-gradient-to-r from-gray-500 via-gray-500 to-gray-500 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-gray-500/40 relative overflow-hidden"
                              style={{ width: `${(currentStep - 1) * 25}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent animate-pulse"></div>
                            </div>
                          </div>

                          {[1, 2, 3, 4, 5].map((step) => (
                            <div key={step} className="z-20 flex flex-col items-center group">
                              <div
                                className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 transform border-2 ${
                                  currentStep === step
                                    ? "bg-gradient-to-br from-gray-500 via-gray-500 to-gray-500 text-white scale-110 shadow-2xl shadow-gray-500/50 rotate-3 border-gray-400/50"
                                    : currentStep > step
                                      ? "bg-gradient-to-br from-gray-800 to-gray-800 text-gray-200 border-gray-600/50 shadow-lg"
                                      : "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-400 border-gray-600/30"
                                }`}
                              >
                                {currentStep === step && (
                                  <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-400 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
                                )}
                                {currentStep > step ? (
                                  <CheckCircle size={28} className="text-gray-200 relative z-10" />
                                ) : (
                                  <span className="font-bold text-xl relative z-10">{step}</span>
                                )}
                              </div>
                              <span
                                className={`text-sm mt-4 font-semibold transition-all duration-300 ${
                                  currentStep === step
                                    ? "text-gray-300 scale-110"
                                    : currentStep > step
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                }`}
                              >
                                {step === 1 && "Account"}
                                {step === 2 && "Page"}
                                {step === 3 && "Campaign"}
                                {step === 4 && "Budget"}
                                {step === 5 && "Creative"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Step Content Container */}
                      <div className="relative bg-gradient-to-br from-gray-900/80 via-slate-900/60 to-black/80 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-8 min-h-[500px] transition-all duration-500 shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-500/3 via-transparent to-gray-500/3 rounded-2xl"></div>
                        <div className="relative z-10">{renderStepContent()}</div>
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex justify-between mt-10">
                        {currentStep > 1 ? (
                          <button
                            onClick={prevStep}
                            disabled={loading}
                            className="group relative px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 backdrop-blur-sm text-gray-200 rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 disabled:opacity-50 border border-gray-600/50 flex items-center shadow-lg hover:shadow-2xl transform hover:scale-105"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                            <ChevronRight size={20} className="mr-3 transform rotate-180 relative z-10" />
                            <span className="relative z-10 font-medium">Previous</span>
                          </button>
                        ) : (
                          <div></div>
                        )}
                        {currentStep < 5 ? (
                          <button
                            onClick={nextStep}
                            disabled={loading || !isCurrentStepValid()}
                            className="group relative px-8 py-4 bg-gradient-to-r from-gray-600 via-gray-600 to-gray-600 rounded-2xl text-white font-semibold hover:shadow-2xl hover:shadow-gray-500/40 transition-all duration-300 flex items-center disabled:opacity-50 transform hover:scale-105 overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-700 to-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative z-10">Next Step</span>
                            <ChevronRight size={20} className="ml-3 relative z-10" />
                          </button>
                        ) : (
                          <button
                            onClick={handleCreateCampaign}
                            disabled={loading || !isCurrentStepValid()}
                            className="group relative px-8 py-4 bg-gradient-to-r from-gray-600 via-gray-600 to-gray-600 rounded-2xl text-white font-semibold hover:shadow-2xl hover:shadow-gray-500/40 transition-all duration-300 flex items-center disabled:opacity-50 transform hover:scale-105 overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-700 to-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            {loading ? (
                              <div className="relative z-10 flex items-center">
                                <span className="mr-3">Creating...</span>
                                <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
                              </div>
                            ) : (
                              <div className="relative z-10 flex items-center">
                                <span>Create Campaign</span>
                                <Zap size={20} className="ml-3" />
                              </div>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PREVIEW SECTION */}
                <div className="xl:col-span-5 flex flex-col items-center">
                  <div className="w-full max-w-sm sticky top-28">
                    {/* Enhanced Preview Header */}
                    <div className="relative bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 border border-gray-700/30 rounded-2xl p-6 mb-6 shadow-xl">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-gray-500/5 to-gray-500/5 rounded-2xl"></div>
                      <div className="relative z-10">
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                            <span className="text-black font-bold text-sm">📱</span>
                          </div>
                          Live Preview
                        </h3>
                        <p className="text-gray-400 text-sm">See how your ad will appear on mobile</p>
                      </div>
                    </div>

                    {renderMobilePreview()}

                    {/* Enhanced Campaign Summary */}
                    <div className="relative mt-8 group">
                      <div className="absolute -inset-2 bg-gradient-to-br from-gray-600/10 via-gray-600/10 to-gray-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                      <div className="relative bg-gradient-to-br from-gray-900/80 via-slate-900/60 to-black/80 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-6 shadow-xl shadow-black/40">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-transparent to-gray-500/5 rounded-2xl"></div>
                        <div className="relative z-10">
                          <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-gray-400 via-gray-400 to-gray-400 bg-clip-text text-transparent flex items-center">
                            <div className="relative mr-2">
                              <Target size={20} className="text-gray-400" />
                              <div className="absolute inset-0 bg-gray-400/20 rounded-full blur-md"></div>
                            </div>
                            Campaign Summary
                          </h3>
                          <div className="space-y-5">
                            {[
                              {
                                icon: Target,
                                label: "Objective:",
                                value:
                                  objective === "OUTCOME_AWARENESS"
                                    ? "Brand Awareness"
                                    : objective === "OUTCOME_TRAFFIC"
                                      ? "Website Traffic"
                                      : objective === "OUTCOME_ENGAGEMENT"
                                        ? "Engagement"
                                        : objective === "OUTCOME_LEADS"
                                          ? "Lead Generation"
                                          : objective === "OUTCOME_SALES"
                                            ? "Conversions"
                                            : "Not Set",
                              },
                              {
                                icon: Clock,
                                label: "Budget:",
                                value: `$${budget || "0"}/day`,
                              },
                              {
                                icon: Globe,
                                label: "Audience:",
                                value: `${audience.ageMin}-${audience.ageMax} in ${audience.countries.join(", ")}`,
                              },
                              {
                                icon: Smartphone,
                                label: "Placement:",
                                value: placement === "FEED" ? "Instagram Feed" : "Instagram Stories",
                              },
                            ].map(({ icon: Icon, label, value }, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-600/30 backdrop-blur-sm group hover:from-gray-700/60 hover:to-gray-800/60 transition-all duration-300"
                              >
                                <span className="text-gray-300 text-sm flex items-center">
                                  <div className="relative mr-3">
                                    <Icon
                                      size={18}
                                      className="text-gray-400 group-hover:text-gray-400 transition-colors duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gray-400/20 rounded-full blur-sm group-hover:bg-gray-400/20 transition-colors duration-300"></div>
                                  </div>
                                  {label}
                                </span>
                                <span className="text-white text-sm font-medium">{value}</span>
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
          ) : (
            <div className="relative z-10 max-w-5xl mx-auto text-center">
              <div className="relative">
                <div className="absolute -inset-8 bg-gradient-to-r from-gray-600/20 via-gray-600/20 to-gray-600/20 rounded-[4rem] blur-3xl"></div>
                <h1 className="relative text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                  <span className="bg-gradient-to-r from-gray-400 via-gray-400 to-gray-400 bg-clip-text text-transparent block">
                    Instagram Ad Campaigns
                  </span>
                  <span className="bg-gradient-to-r from-gray-400 via-gray-400 to-gray-400 bg-clip-text text-transparent block mt-2">
                    In Minutes, Not Hours
                  </span>
                </h1>
              </div>
              <p className="text-xl lg:text-2xl text-gray-300 font-light max-w-3xl mx-auto leading-relaxed mb-12">
                Our AI-powered platform connects directly to your Instagram account, streamlines campaign creation, and
                optimizes for maximum ROI with intelligent targeting and creative suggestions.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                <button
                  onClick={handleLogin}
                  className="group relative bg-gradient-to-r from-gray-600 via-gray-600 to-gray-600 px-12 py-6 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-gray-500/40 transition-all duration-300 overflow-hidden transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-700 to-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center">
                    <Instagram size={24} className="mr-3" />
                    Get Started Free
                  </span>
                </button>
                <div className="flex items-center text-gray-400">
                  <div className="flex -space-x-2 mr-4">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-10 h-10 rounded-full border-2 border-gray-700 ${
                          i === 0
                            ? "bg-gradient-to-br from-purple-500 to-purple-600"
                            : i === 1
                              ? "bg-gradient-to-br from-blue-500 to-blue-600"
                              : i === 2
                                ? "bg-gradient-to-br from-green-500 to-green-600"
                                : "bg-gradient-to-br from-pink-500 to-pink-600"
                        }`}
                      ></div>
                    ))}
                  </div>
                  <span className="text-sm">
                    Join <span className="text-gray-400 font-semibold">10,000+</span> marketers
                  </span>
                </div>
              </div>
              {/* Feature Grid */}

              {/* Floating Action Elements */}
              <div className="fixed bottom-8 right-8 z-50">
                <div className="group relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-gray-600/30 via-gray-600/30 to-gray-600/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <button className="relative bg-gradient-to-r from-gray-600 via-gray-600 to-gray-600 p-4 rounded-full shadow-2xl hover:shadow-gray-500/40 transition-all duration-300 transform hover:scale-110">
                    <Sparkles size={24} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
