'use client'
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

import { 
  Music,
  Plus,
  Trash2,
  Eye,
  Copy,
  Save,
  ArrowLeft,
  Link,
  Palette,
  Settings,
  Share2,
  Smartphone,
  ExternalLink,
  Check,
  User,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Zap,
  Bell,
  ChevronDown
} from 'lucide-react';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const MusicLinkTreeCreator = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [existingLinktree, setExistingLinktree] = useState(null);

  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    profileImage: '',
    backgroundColor: 'gradient-1',
    textColor: 'white'
  });

  const [musicLinks, setMusicLinks] = useState([
    { id: 1, platform: 'spotify', url: '', isActive: true },
    { id: 2, platform: 'apple-music', url: '', isActive: true },
    { id: 3, platform: 'youtube-music', url: '', isActive: true }
  ]);

  const [socialLinks, setSocialLinks] = useState([
    { id: 1, platform: 'instagram', url: '', isActive: false },
    { id: 2, platform: 'twitter', url: '', isActive: false },
    { id: 3, platform: 'facebook', url: '', isActive: false },
    { id: 4, platform: 'youtube', url: '', isActive: false }
  ]);

  const [previewMode, setPreviewMode] = useState(false);
  const [savedUrl, setSavedUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch existing linktree data on component mount
  useEffect(() => {
    const fetchLinktree = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('musicians_linktree')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data && !error) {
          setExistingLinktree(data);
          setProfileData(data.profile);
          setMusicLinks(data.music_links);
          setSocialLinks(data.social_links);
          setSavedUrl(`https://yourdomain.com/link/${data.slug}`);
        }
      } catch (error) {
        console.error('Error fetching linktree:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinktree();
  }, [user]);

  const musicPlatforms = {
    'spotify': { name: 'Spotify', color: '#1DB954', icon: '🎵' },
    'apple-music': { name: 'Apple Music', color: '#FA243C', icon: '🍎' },
    'youtube-music': { name: 'YouTube Music', color: '#FF0000', icon: '🎬' },
    'soundcloud': { name: 'SoundCloud', color: '#FF5500', icon: '☁️' },
    'deezer': { name: 'Deezer', color: '#FEAA2D', icon: '🎶' },
    'tidal': { name: 'Tidal', color: '#000000', icon: '🌊' }
  };

  const socialPlatforms = {
    'instagram': { name: 'Instagram', color: '#E4405F', icon: Instagram },
    'twitter': { name: 'Twitter', color: '#1DA1F2', icon: Twitter },
    'facebook': { name: 'Facebook', color: '#4267B2', icon: Facebook },
    'youtube': { name: 'YouTube', color: '#FF0000', icon: Youtube }
  };

  const backgroundOptions = [
    { id: 'gradient-1', name: 'Purple Gradient', class: 'bg-gradient-to-br from-purple-600 to-pink-600' },
    { id: 'gradient-2', name: 'Blue Gradient', class: 'bg-gradient-to-br from-blue-600 to-cyan-500' },
    { id: 'gradient-3', name: 'Green Gradient', class: 'bg-gradient-to-br from-green-500 to-teal-600' },
    { id: 'gradient-4', name: 'Orange Gradient', class: 'bg-gradient-to-br from-orange-500 to-red-600' },
    { id: 'dark', name: 'Dark', class: 'bg-gray-900' },
    { id: 'light', name: 'Light', class: 'bg-white' }
  ];

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleMusicLinkChange = (id, field, value) => {
    setMusicLinks(prev => prev.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  const handleSocialLinkChange = (id, field, value) => {
    setSocialLinks(prev => prev.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  const addMusicLink = (platform) => {
    const newId = Math.max(...musicLinks.map(l => l.id), 0) + 1;
    setMusicLinks(prev => [...prev, { 
      id: newId, 
      platform, 
      url: '', 
      isActive: true 
    }]);
  };

  const removeMusicLink = (id) => {
    setMusicLinks(prev => prev.filter(link => link.id !== id));
  };

  const saveLinktree = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const linktreeData = {
        user_id: user.id,
        profile: profileData,
        music_links: musicLinks.filter(link => link.url && link.isActive),
        social_links: socialLinks.filter(link => link.url && link.isActive),
        updated_at: new Date().toISOString()
      };

      // Generate a URL-friendly slug from the display name
      const slug = profileData.displayName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') || `user-${user.id.slice(0, 8)}`;
      
      let savedData;
      
      if (existingLinktree) {
        // Update existing linktree
        const { data, error } = await supabase
          .from('musicians_linktree')
          .update({ ...linktreeData, slug })
          .eq('id', existingLinktree.id)
          .select()
          .single();

        if (error) throw error;
        savedData = data;
      } else {
        // Create new linktree
        const { data, error } = await supabase
          .from('musicians_linktree')
          .insert([{ ...linktreeData, slug }])
          .select()
          .single();

        if (error) throw error;
        savedData = data;
      }

      const generatedUrl = `http://localhost:3000/link/${savedData.slug}`;
      setSavedUrl(generatedUrl);
      setExistingLinktree(savedData);
      
    } catch (error) {
      console.error('Error saving linktree:', error);
      alert('Error saving your LinkTree. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async () => {
    if (savedUrl) {
      await navigator.clipboard.writeText(savedUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const MobilePreview = () => (
    <div className="bg-black rounded-3xl p-2 shadow-2xl w-80 mx-auto">
      <div className="bg-gray-900 rounded-2xl overflow-hidden">
        {/* Phone Status Bar */}
        <div className="bg-black px-4 py-2 flex justify-between items-center text-white text-xs">
          <span>9:41</span>
          <div className="flex space-x-1">
            <div className="w-4 h-2 bg-white rounded-sm"></div>
            <div className="w-1 h-2 bg-white rounded-sm"></div>
            <div className="w-6 h-2 bg-white rounded-sm"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`min-h-[600px] ${backgroundOptions.find(bg => bg.id === profileData.backgroundColor)?.class || 'bg-gradient-to-br from-purple-600 to-pink-600'} relative`}>
          <div className="px-6 py-8 text-center">
            {/* Profile Section */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
                {profileData.profileImage ? (
                  <img src={profileData.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <Music size={32} className="text-white" />
                )}
              </div>
              <h1 className={`text-xl font-bold mb-2 ${profileData.textColor === 'white' ? 'text-white' : 'text-gray-900'}`}>
                {profileData.displayName || 'Your Artist Name'}
              </h1>
              <p className={`text-sm ${profileData.textColor === 'white' ? 'text-white/80' : 'text-gray-700'}`}>
                {profileData.bio || 'Add your bio here'}
              </p>
            </div>

            {/* Music Links */}
            <div className="space-y-3 mb-6">
              {musicLinks.filter(link => link.url && link.isActive).map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between hover:bg-white/30 transition-all block"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{musicPlatforms[link.platform]?.icon}</span>
                    <span className="text-white font-medium">{musicPlatforms[link.platform]?.name}</span>
                  </div>
                  <ExternalLink size={16} className="text-white/70" />
                </a>
              ))}
            </div>

            {/* Social Links */}
            {socialLinks.filter(link => link.url && link.isActive).length > 0 && (
              <div className="flex justify-center space-x-4">
                {socialLinks.filter(link => link.url && link.isActive).map((link) => {
                  const Icon = socialPlatforms[link.platform]?.icon;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                    >
                      <Icon size={20} className="text-white" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setPreviewMode(false)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Editor</span>
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={saveLinktree}
                disabled={saving}
                className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Save & Generate Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <MobilePreview />
            </div>
            
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Your Music LinkTree</h2>
              
              {savedUrl ? (
                <div className="space-y-4">
                  <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center space-x-2 text-green-400 mb-2">
                      <Check size={20} />
                      <span className="font-medium">LinkTree Created Successfully!</span>
                    </div>
                    <p className="text-gray-300 text-sm">Your music LinkTree is now live and ready to share.</p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <label className="text-gray-400 text-sm mb-2 block">Your LinkTree URL:</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={savedUrl}
                        readOnly
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      />
                      <button
                        onClick={copyToClipboard}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          copySuccess 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-600 hover:bg-gray-500 text-white'
                        }`}
                      >
                        {copySuccess ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2">
                      <Share2 size={18} />
                      <span>Share LinkTree</span>
                    </button>
                    <a
                      href={savedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <ExternalLink size={18} />
                      <span>View Live</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Smartphone size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Preview Your LinkTree</h3>
                  <p className="text-gray-400 mb-6">This is how your LinkTree will look on mobile devices. Save it to generate a shareable link.</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="font-medium text-amber-400">Music Links</div>
                      <div>{musicLinks.filter(l => l.url && l.isActive).length} active</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="font-medium text-blue-400">Social Links</div>
                      <div>{socialLinks.filter(l => l.url && l.isActive).length} active</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Top Navigation */}
      

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
       

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Setup */}
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <User size={20} />
                <span>Profile Information</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Display Name</label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => handleProfileChange('displayName', e.target.value)}
                    placeholder="Your Artist Name"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    placeholder="Tell your fans about yourself..."
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Profile Image URL</label>
                  <input
                    type="url"
                    value={profileData.profileImage}
                    onChange={(e) => handleProfileChange('profileImage', e.target.value)}
                    placeholder="https://example.com/profile.jpg"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Background Style</label>
                  <div className="grid grid-cols-3 gap-3">
                    {backgroundOptions.map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => handleProfileChange('backgroundColor', bg.id)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          profileData.backgroundColor === bg.id 
                            ? 'border-amber-500' 
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className={`w-full h-8 rounded ${bg.class} mb-2`}></div>
                        <span className="text-xs text-gray-300">{bg.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Text Color</label>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleProfileChange('textColor', 'white')}
                      className={`px-4 py-2 rounded-lg border-2 ${
                        profileData.textColor === 'white' 
                          ? 'border-amber-500 bg-gray-700' 
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                        <span className="text-gray-300 text-sm">White</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleProfileChange('textColor', 'black')}
                      className={`px-4 py-2 rounded-lg border-2 ${
                        profileData.textColor === 'black' 
                          ? 'border-amber-500 bg-gray-700' 
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gray-900 rounded-full"></div>
                        <span className="text-gray-300 text-sm">Black</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Music Platform Links */}
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Music size={20} />
                  <span>Music Platform Links</span>
                </h3>
                <div className="relative">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addMusicLink(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="">Add Platform</option>
                    {Object.entries(musicPlatforms).map(([key, platform]) => (
                      <option key={key} value={key}>{platform.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {musicLinks.map((link) => (
                  <div key={link.id} className="bg-gray-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{musicPlatforms[link.platform]?.icon}</span>
                        <span className="text-white font-medium">{musicPlatforms[link.platform]?.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={link.isActive}
                            onChange={(e) => handleMusicLinkChange(link.id, 'isActive', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-gray-400 text-sm">Active</span>
                        </label>
                        <button
                          onClick={() => removeMusicLink(link.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleMusicLinkChange(link.id, 'url', e.target.value)}
                      placeholder={`Enter your ${musicPlatforms[link.platform]?.name} URL`}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Share2 size={20} />
                <span>Social Media Links</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {socialLinks.map((link) => {
                  const Icon = socialPlatforms[link.platform]?.icon;
                  return (
                    <div key={link.id} className="bg-gray-800/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Icon size={20} className="text-white" />
                          <span className="text-white font-medium">{socialPlatforms[link.platform]?.name}</span>
                        </div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={link.isActive}
                            onChange={(e) => handleSocialLinkChange(link.id, 'isActive', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-gray-400 text-sm">Show</span>
                        </label>
                      </div>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => handleSocialLinkChange(link.id, 'url', e.target.value)}
                        placeholder={`Enter your ${socialPlatforms[link.platform]?.name} URL`}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                        disabled={!link.isActive}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">Live Preview</h3>
                  <button
                    onClick={() => setPreviewMode(true)}
                    className="text-amber-400 hover:text-amber-300 transition-colors flex items-center space-x-1 text-sm"
                  >
                    <Eye size={16} />
                    <span>Full Preview</span>
                  </button>
                </div>

                <div className="transform scale-75 origin-top">
                  <MobilePreview />
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => setPreviewMode(true)}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Eye size={18} />
                    <span>Preview & Save</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicLinkTreeCreator;