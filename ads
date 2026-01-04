'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef } from 'react';
import { useAdContext } from '../../../lib/Allcontext';
import {
  Send,
  Loader2,
  Bookmark,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Image as ImageIcon,
  Video,
  Box,
  Music,
  Paperclip,
  X
} from 'lucide-react';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { socialSharingController } from '@/api/controllers/socialSharingController';
/* ----------  TYPES  ---------- */
type MintStatus = 'idle' | 'minting' | 'minted' | 'error';
type MintingStates = Record<string, { status: MintStatus; txHash?: string; error?: string }>;

/* ----------  METADATA HELPER  ---------- */


/* ----------  MAIN PAGE  ---------- */
export default function Main() {
  const [input, setInput] = useState('');
    
    const { googleAds, facebookAds } = useAdContext();
// NEW
const [files, setFiles] = useState<File[]>([]);
const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [mintingStates, setMintingStates] = useState<MintingStates>({});
  const [started, setStarted] = useState(false);

 const { messages, sendMessage } = useChat({
  // api: '/api/chattwo',        // DELETE this line
  transport: new DefaultChatTransport({
  api: '/api/chat',        // ← put your endpoint here
    prepareSendMessagesRequest: ({ id, messages }) => ({
      body: {
        id,
        messages,
        googleAds: {
          customerId:   googleAds.customerId,
          managerId:    googleAds.managerId,
          refreshToken: googleAds.refreshToken,
        },
        facebookAds: {                // <-- NEW
          adAccountId:  facebookAds.adAccountId,
          accessToken:  facebookAds.accessToken,
          pageId: facebookAds.pageId,
      },
      },
    }),
  }),
  onFinish: () => { if (!started) setStarted(true); },
});

 
 

const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newFiles = Array.from(e.target.files || []);
  if (files.length + newFiles.length > 2) {
    alert('Max 2 files (images or videos).');
    return;
  }
  setFiles((prev) => [...prev, ...newFiles]);
  setPreviews((prev) => [
    ...prev,
    ...newFiles.map((f) => URL.createObjectURL(f)),
  ]);
};

 const removeFile = (idx: number) => {
  setFiles((prev) => prev.filter((_, i) => i !== idx));
  setPreviews((prev) => prev.filter((_, i) => i !== idx));
  if (fileRef.current) fileRef.current.value = '';
};

  /* ----------  SUPABASE UPLOAD  ---------- */
 

  /* ----------  SEND MESSAGE  ---------- */
  /* ----------  SEND MESSAGE  ---------- */
  const handleSend = async () => {
    if (!input.trim() && files.length === 0) return;

    let textToSend = input.trim();

    if (files.length > 0) {
      setUploading(true);
      try {
        const uploadedUrls: string[] = [];

        for (const file of files) {
          // optional: same validation as PostCreator
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
          if (!allowedTypes.includes(file.type)) {
            alert(`Unsupported file type: ${file.type}`);
            continue;
          }
          const maxSize = 250 * 1024 * 1024; // 250 MB
          if (file.size > maxSize) {
            alert(`${file.name} is too large (max 250 MB)`);
            continue;
          }

          const res = await socialSharingController.uploadMedia(file, {
            platforms: [],
            title: file.name,
            description: 'Uploaded via IntelliVerse X',
          });

          if (res.success && res.mediaUrl) uploadedUrls.push(res.mediaUrl);
        }

        if (uploadedUrls.length) {
          textToSend = `${input.trim()}\n\n${uploadedUrls.map((u) => `(Uploaded image: ${u})`).join('\n')}`;
        }
      } catch (err: any) {
        console.error('Media upload failed:', err);
        alert('Media upload failed: ' + err.message);
      } finally {
        setUploading(false);
        setFiles([]);
        setPreviews([]);
        if (fileRef.current) fileRef.current.value = '';
      }
    }

    sendMessage({ text: textToSend });
    setInput('');
  };
  /* ----------  MINTING  ---------- */
  

  /* ----------  RENDER TOOL PART  ---------- */
  const renderToolPart = (part: any, i: number, messageId: string) => {
    const key = `${messageId}-${i}`;
    const st = mintingStates[key] ?? { status: 'idle' };

   

        /* ----- YOUTUBE ADS CAMPAIGN ----- */
    if (part.type === 'tool-createYouTubeAdsCampaign') {
      if (part.state === 'input-available')
        return (
          <div className="mt-4 bg-gray-900/60 border border-gray-800/40 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <Video size={16} />
              <span className="text-sm font-medium">Creating YouTube Ads campaign…</span>
            </div>
          </div>
        );

      if (part.state === 'output-available')
        return (
          <div className="mt-4 bg-gray-950/95 border border-gray-800/40 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
            <div className="flex items-center gap-2 text-red-400 mb-3">
              <CheckCircle size={20} />
              <span className="font-semibold">YouTube Campaign Created Successfully!</span>
            </div>

            <div className="space-y-3 text-sm">
              {part.output.campaign && (
                <div className="bg-gray-900/50 p-3 rounded-xl">
                  <div className="font-medium text-gray-300">Campaign</div>
                  <div className="text-gray-400">{part.output.campaign.name}</div>
                  <div className="text-xs text-gray-500 truncate">{part.output.campaign.resourceName}</div>
                </div>
              )}

              {part.output.budget && (
                <div className="bg-gray-900/50 p-3 rounded-xl">
                  <div className="font-medium text-gray-300">Budget</div>
                  <div className="text-xs text-gray-500 truncate">{part.output.budget.resourceName}</div>
                </div>
              )}

              {part.output.adGroup && (
                <div className="bg-gray-900/50 p-3 rounded-xl">
                  <div className="font-medium text-gray-300">Ad Group</div>
                  <div className="text-xs text-gray-500 truncate">{part.output.adGroup.resourceName}</div>
                </div>
              )}

              {part.output.ad && (
                <div className="bg-gray-900/50 p-3 rounded-xl">
                  <div className="font-medium text-gray-300">Ad</div>
                  <div className="text-xs text-gray-500 truncate">{part.output.ad.resourceName}</div>
                </div>
              )}

              {part.output.message && (
                <div className="bg-red-900/30 border border-red-500/20 p-3 rounded-xl">
                  <div className="text-red-400 text-sm">{part.output.message}</div>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <a
                href="https://ads.google.com "
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-4 rounded-xl text-sm font-medium hover:from-red-500 hover:to-red-600 transition-all text-center"
              >
                View in Google Ads
              </a>
            </div>
          </div>
        );

      if (part.state === 'output-error')
        return (
          <div className="mt-4 bg-red-950/30 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} />
              <span className="font-medium">YouTube Campaign Failed</span>
            </div>
            <span>Error: {part.errorText}</span>
          </div>
        );

      return null;
    }

        /* ----- FACEBOOK ADS CAMPAIGN ----- */
    if (part.type === 'tool-createFacebookAdsCampaign') {
      if (part.state === 'input-available')
        return (
          <div className="mt-4 bg-gray-900/60 border border-gray-800/40 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm font-medium">Creating Facebook Ads campaign…</span>
            </div>
          </div>
        );

      if (part.state === 'output-available')
        return (
          <div className="mt-4 bg-gray-950/95 border border-gray-800/40 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
            <div className="flex items-center gap-2 text-blue-400 mb-3">
              <CheckCircle size={20} />
              <span className="font-semibold">Facebook Campaign Created Successfully!</span>
            </div>

            <div className="space-y-3 text-sm">
              {part.output.campaign && (
                <div className="bg-gray-900/50 p-3 rounded-xl">
                  <div className="font-medium text-gray-300">Campaign</div>
                  <div className="text-gray-400">{part.output.campaign.name}</div>
                  <div className="text-xs text-gray-500">ID: {part.output.campaign.id}</div>
                </div>
              )}

              {part.output.adSet && (
                <div className="bg-gray-900/50 p-3 rounded-xl">
                  <div className="font-medium text-gray-300">Ad Set</div>
                  <div className="text-xs text-gray-500">ID: {part.output.adSet.id}</div>
                </div>
              )}

              {part.output.ad && (
                <div className="bg-gray-900/50 p-3 rounded-xl">
                  <div className="font-medium text-gray-300">Ad</div>
                  <div className="text-xs text-gray-500">ID: {part.output.ad.id}</div>
                </div>
              )}

              {part.output.message && (
                <div className="bg-blue-900/30 border border-blue-500/20 p-3 rounded-xl">
                  <div className="text-blue-400 text-sm">{part.output.message}</div>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <a
                href="https://business.facebook.com/adsmanager "
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-xl text-sm font-medium hover:from-blue-500 hover:to-blue-600 transition-all text-center"
              >
                View in Ads Manager
              </a>
            </div>
          </div>
        );

      if (part.state === 'output-error')
        return (
          <div className="mt-4 bg-red-950/30 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} />
              <span className="font-medium">Facebook Campaign Failed</span>
            </div>
            <span>Error: {part.errorText}</span>
          </div>
        );

      return null;
    }

    
    /* ----- GOOGLE ADS CAMPAIGN ----- */
    if (part.type === 'tool-createGoogleAdsCampaign') {
      if (part.state === 'input-available')
        return (
          <div className="mt-4 bg-gray-900/60 border border-gray-800/40 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm font-medium">Creating Google Ads campaign…</span>
            </div>
          </div>
        );
      
      if (part.state === 'output-available')
        return (
          <div className="mt-4 bg-gray-950/95 border border-gray-800/40 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
            <div className="flex items-center gap-2 text-green-400 mb-3">
              <CheckCircle size={20} />
              <span className="font-semibold">Google Ads Campaign Created Successfully!</span>
            </div>
            
            <div className="space-y-3 text-sm">
              {part.output.campaign && (
                <div className="bg-gray-900/50 p-3 rounded-xl">
                  <div className="font-medium text-gray-300">Campaign</div>
                  <div className="text-gray-400">{part.output.campaign.name}</div>
                  <div className="text-xs text-gray-500 truncate">{part.output.campaign.resourceName}</div>
                </div>
              )}
              
              {part.output.budget && (
                <div className="bg-gray-900/50 p-3 rounded-xl">
                  <div className="font-medium text-gray-300">Budget</div>
                  <div className="text-xs text-gray-500 truncate">{part.output.budget.resourceName}</div>
                </div>
              )}
              
              {part.output.adGroup && (
                <div className="bg-gray-900/50 p-3 rounded-xl">
                  <div className="font-medium text-gray-300">Ad Group</div>
                  <div className="text-xs text-gray-500 truncate">{part.output.adGroup.resourceName}</div>
                </div>
              )}
              
              {part.output.message && (
                <div className="bg-blue-900/30 border border-blue-500/20 p-3 rounded-xl">
                  <div className="text-blue-400 text-sm">{part.output.message}</div>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
              <a
                href="https://ads.google.com"
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-xl text-sm font-medium hover:from-blue-500 hover:to-blue-600 transition-all text-center"
              >
                View in Google Ads
              </a>
            </div>
          </div>
        );
      
      if (part.state === 'output-error')
        return (
          <div className="mt-4 bg-red-950/30 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} />
              <span className="font-medium">Google Ads Campaign Failed</span>
            </div>
            <span>Error: {part.errorText}</span>
          </div>
        );
      
      return null;
    }

  


    /* ----- 3D MODEL ----- */
 

    return null;
  };

  /* ----------  MESSAGE BUBBLE  ---------- */
 /* ----------  MESSAGE BUBBLE  ---------- */
const MessageBubble = ({ msg }: { msg: any }) => {
  const isUser = msg.role === 'user';
  const loadingParts = !isUser
    ? msg.parts.filter((p: any) => p.state === 'input-available' && p.type !== 'text')
    : [];

  /* ---- helper: remove tags + collect ALL urls ---- */
  const extractImageUrls = (text: string): { cleanText: string; imageUrls: string[] } => {
    const matches = Array.from(text.matchAll(/\(Uploaded image: (.+?)\)/g));
    const imageUrls = matches.map((m) => m[1]);
    const cleanText = text.replace(/\(Uploaded image: .+?\)/g, '').trim();
    return { cleanText, imageUrls };
  };

  const textParts = msg.parts.filter((p: any) => p.type === 'text');
  const textContent = textParts.map((p: any) => p.text).join('');

  const { cleanText, imageUrls } = isUser
    ? extractImageUrls(textContent)
    : { cleanText: textContent, imageUrls: [] };

  return (
    <div className={`flex items-start gap-4 group ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-gray-600 to-gray-700'
            : 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/30'
        }`}
      >
        {isUser ? (
          <div className="w-6 h-6 rounded-full bg-gray-400" />
        ) : (
          <Sparkles size={18} className="text-gray-300" />
        )}
      </div>

      <div className="max-w-2xl flex flex-col">
        {!isUser &&
          loadingParts.map((part: any, idx: number) => (
            <div key={`load-${idx}`} className="mb-3">
              {renderToolPart(part, idx, msg.id)}
            </div>
          ))}

        {/* ---- text ---- */}
        <div
          className={`rounded-3xl px-6 py-4 shadow-lg ${
            isUser
              ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-100'
              : 'bg-gray-950/95 border border-gray-800/40 text-gray-200 backdrop-blur-xl'
          }`}
        >
          <div className="text-sm leading-relaxed">{cleanText}</div>

          {/* ---- ALL user-uploaded images ---- */}
          {isUser &&
            imageUrls.length > 0 &&
            imageUrls.map((u, i) => (
              <div className="mt-3" key={i}>
                <img
                  src={u}
                  alt={`user-img-${i}`}
                  className="rounded-xl border border-gray-700/30 shadow-lg max-w-xs object-cover"
                  onError={(e) => {
                    console.error('Failed to load image:', u);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ))}
        </div>

        <div className="text-xs text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {new Date(msg.timestamp || Date.now()).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

  /* ----------  START SCREEN  ---------- */
  if (!started)
    return (
      <div className="h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="w-full max-w-2xl px-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-gray-700/20">
              <Sparkles size={32} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-200 mb-2">Create Ads Campaign with AI</h2>
            <p className="text-gray-400">Generate google, youtube , meta ads using AI very easily</p>
          </div>

          {/* file + input */}
          <div className="relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything, request an image, video, 3D model, or music…"
              className="w-full bg-gray-900/60 border border-gray-800/40 focus:border-gray-700/60 rounded-3xl px-6 py-4 pr-28 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-700/30 transition-all backdrop-blur-sm shadow-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && (input.trim() || files.length > 0)) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
<div className="absolute right-20 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {previews.map((p, i) => (
  <div key={i} className="relative">
    {files[i]?.type.startsWith('video/') ? (
      <video
        src={p}
        className="w-10 h-10 object-cover rounded-xl border border-gray-700/30"
        muted
        loop
        autoPlay
        playsInline
      />
    ) : (
      <img
        src={p}
        alt={`preview-${i}`}
        className="w-10 h-10 object-cover rounded-xl border border-gray-700/30"
      />
    )}
    <button
      onClick={() => removeFile(i)}
      className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1"
    >
      <X size={12} />
    </button>
  </div>
))}
  <label className="cursor-pointer">
    <Paperclip size={20} className="text-gray-400 hover:text-gray-200" />
    <input
  ref={fileRef}
  type="file"
  accept="image/*,video/*"   // <-- video/* added
  multiple
  onChange={onFilePick}
  className="hidden"
/>
  </label>
</div>
            <button
              onClick={handleSend}
             disabled={!input.trim() && files.length === 0}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition-all shadow-lg ${
              !input.trim() && files.length === 0
                  ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-100 hover:from-gray-500 hover:to-gray-600 hover:scale-105'
              }`}
            >
              <Send size={20} />
            </button>
          </div>

          {uploading && (
            <div className="flex items-center gap-2 text-gray-400 text-sm mt-3">
              <Loader2 size={16} className="animate-spin" />
              <span>Uploading image…</span>
            </div>
          )}

          <div className="text-center mt-4 text-xs text-gray-500">Powered by advanced AI • Ads Campaign</div>
        </div>
      </div>
    );

  /* ----------  SPLIT VIEW  ---------- */
  return (
    <div className="h-screen bg-gray-950 text-gray-100 flex overflow-hidden">
      {/* LEFT – FINAL TOOL RESULTS */}
      <ScrollArea className="w-1/2 border-r border-gray-800/30">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
  <h3 className="text-lg font-semibold text-gray-300">Results</h3>

</div>
          <div className="space-y-6">
            {messages.map((msg) =>
              msg.parts
                .filter((p: any) => p.type !== 'text' && (p.state === 'output-available' || p.state === 'output-error'))
                .map((part: any, idx: number) => (
                  <div key={`${msg.id}-${idx}`}>{renderToolPart(part, idx, msg.id)}</div>
                ))
            )}
          </div>






        </div>
      </ScrollArea>

      {/* RIGHT – CHAT */}
      <div className="w-1/2 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-6 py-8">
            <div className="space-y-8">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* INPUT BAR */}
        <div className="border-t border-gray-800/30 bg-gray-950/98 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto px-6 py-6">
            <div className="relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Reply…"
                className="w-full bg-gray-900/60 border border-gray-800/40 focus:border-gray-700/60 rounded-3xl px-6 py-4 pr-28 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-700/30 transition-all backdrop-blur-sm shadow-lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && (input.trim() || files)) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <div className="absolute right-20 top-1/2 -translate-y-1/2 flex items-center gap-2">
             {previews.map((p, i) => (
  <div key={i} className="relative">
    {files[i]?.type.startsWith('video/') ? (
      <video
        src={p}
        className="w-10 h-10 object-cover rounded-xl border border-gray-700/30"
        muted
        loop
        autoPlay
        playsInline
      />
    ) : (
      <img
        src={p}
        alt={`preview-${i}`}
        className="w-10 h-10 object-cover rounded-xl border border-gray-700/30"
      />
    )}
    <button
      onClick={() => removeFile(i)}
      className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1"
    >
      <X size={12} />
    </button>
  </div>
))}
                <label className="cursor-pointer">
                  <Paperclip size={20} className="text-gray-400 hover:text-gray-200" />
                 <input
  ref={fileRef}
  type="file"
  accept="image/*,video/*"   // <-- video/* added
  multiple
  onChange={onFilePick}
  className="hidden"
/>
                </label>
              </div>
             <button
              onClick={handleSend}
             disabled={!input.trim() && files.length === 0}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition-all shadow-lg ${
              !input.trim() && files.length === 0
                  ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-100 hover:from-gray-500 hover:to-gray-600 hover:scale-105'
              }`}
            >
                <Send size={20} />
              </button>
            </div>
            {uploading && (
              <div className="flex items-center gap-2 text-gray-400 text-sm mt-3">
                <Loader2 size={16} className="animate-spin" />
                <span>Uploading image…</span>
              </div>
            )}
            <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>AI Services Active</span>
              </div>
              <span>Create Ads Campaign</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}