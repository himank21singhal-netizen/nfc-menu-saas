'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { 
  Utensils, 
  Bell, 
  ShoppingBag, 
  Plus, 
  Minus, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  X, 
  ChefHat,
  Globe,
  Loader2,
  Search,
  Sparkles
} from 'lucide-react';

const ALL_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'ur', label: 'اردو (Urdu)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'es', label: 'Español (Spanish)' },
  { code: 'fr', label: 'Français (French)' },
  { code: 'de', label: 'Deutsch (German)' },
  { code: 'ar', label: 'العربية (Arabic)' },
  { code: 'zh', label: '中文 (Chinese)' },
  { code: 'ja', label: '日本語 (Japanese)' },
  { code: 'ko', label: '한국어 (Korean)' },
  { code: 'ru', label: 'Русский (Russian)' },
  { code: 'it', label: 'Italiano (Italian)' },
  { code: 'pt', label: 'Português (Portuguese)' },
  { code: 'tr', label: 'Türkçe (Turkish)' },
  { code: 'nl', label: 'Nederlands (Dutch)' },
  { code: 'th', label: 'ไทย (Thai)' },
  { code: 'vi', label: 'Tiếng Việt (Vietnamese)' },
];

// Intricate Mandala & Hanging Tassel Art Component inspired directly by sketch notebook samples
function TraditionalDecorativeBorders() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Top-Left Half-Mandala with Hanging Tassel & Heart Charms */}
      <div className="absolute -top-10 -left-10 w-[28rem] h-[28rem] text-emerald-400/40 drop-shadow-[0_0_18px_rgba(16,185,129,0.35)]">
        <svg viewBox="0 0 300 300" fill="none" stroke="currentColor">
          {/* Concentric Petal & Scallop Arcs */}
          <circle cx="150" cy="150" r="140" strokeWidth="2.5" />
          <circle cx="150" cy="150" r="130" strokeWidth="1.5" strokeDasharray="3 4" />
          <circle cx="150" cy="150" r="118" strokeWidth="2" />
          <circle cx="150" cy="150" r="102" strokeWidth="1.8" strokeDasharray="6 3" />
          <circle cx="150" cy="150" r="86" strokeWidth="2.2" />
          <circle cx="150" cy="150" r="70" strokeWidth="1.5" strokeDasharray="2 4" />
          <circle cx="150" cy="150" r="54" strokeWidth="2" />
          <circle cx="150" cy="150" r="34" strokeWidth="2.5" fill="currentColor" fillOpacity="0.15" />

          {/* Hanging Charms & Tassels */}
          {/* String 1 */}
          <line x1="40" y1="170" x2="40" y2="250" strokeWidth="1.8" strokeDasharray="4 4" />
          <circle cx="40" cy="200" r="3" fill="currentColor" />
          <polygon points="40,225 36,232 40,239 44,232" fill="currentColor" />
          <path d="M40,250 C37,246 32,246 32,252 C32,257 40,263 40,263 C40,263 48,257 48,252 C48,246 43,246 40,250 Z" fill="currentColor" />

          {/* String 2 */}
          <line x1="90" y1="215" x2="90" y2="290" strokeWidth="1.8" strokeDasharray="4 4" />
          <circle cx="90" cy="240" r="3.5" fill="currentColor" />
          <polygon points="90,265 86,272 90,279 94,272" fill="currentColor" />
          <path d="M90,290 C87,286 82,286 82,292 C82,297 90,303 90,303 C90,303 98,297 98,292 C98,286 93,286 90,290 Z" fill="currentColor" />

          {/* String 3 */}
          <line x1="150" y1="240" x2="150" y2="330" strokeWidth="1.8" strokeDasharray="4 4" />
          <circle cx="150" cy="270" r="4" fill="currentColor" />
          <polygon points="150,295 145,303 150,311 155,303" fill="currentColor" />
          <path d="M150,330 C147,326 141,326 141,332 C141,338 150,344 150,344 C150,344 159,338 159,332 C159,326 153,326 150,330 Z" fill="currentColor" />
        </svg>
      </div>

      {/* Top-Right Decorative Border Fills */}
      <div className="absolute top-0 right-2 w-64 text-amber-400/40 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
        <svg viewBox="0 0 160 260" fill="none" stroke="currentColor">
          <path d="M 0,16 Q 10,6 20,16 T 40,16 T 60,16 T 80,16 T 100,16 T 120,16 T 140,16 T 160,16" strokeWidth="2" />
          <path d="M 0,28 L 10,18 L 20,28 L 30,18 L 40,28 L 50,18 L 60,28 L 70,18 L 80,28 L 90,18 L 100,28 L 110,18 L 120,28 L 130,18 L 140,28 L 150,18 L 160,28" strokeWidth="1.8" />
          <path d="M 0,40 Q 10,30 20,40 T 40,40 T 60,40 T 80,40 T 100,40 T 120,40 T 140,40 T 160,40" strokeWidth="2" strokeDasharray="3 3" />

          <line x1="40" y1="40" x2="40" y2="170" strokeWidth="1.5" strokeDasharray="4 4" />
          <polygon points="40,170 35,178 40,186 45,178" fill="currentColor" />

          <line x1="95" y1="40" x2="95" y2="220" strokeWidth="1.5" strokeDasharray="4 4" />
          <polygon points="95,220 90,228 95,236 100,228" fill="currentColor" />

          <line x1="140" y1="40" x2="140" y2="130" strokeWidth="1.5" strokeDasharray="4 4" />
          <polygon points="140,130 135,138 140,146 145,138" fill="currentColor" />
        </svg>
      </div>

      {/* Bottom-Right Full Sunburst Mandala */}
      <div className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] text-emerald-400/35 drop-shadow-[0_0_22px_rgba(16,185,129,0.3)]">
        <svg viewBox="0 0 300 300" fill="none" stroke="currentColor">
          <circle cx="150" cy="150" r="145" strokeWidth="2.5" />
          <circle cx="150" cy="150" r="132" strokeWidth="1.8" strokeDasharray="5 4" />
          <circle cx="150" cy="150" r="115" strokeWidth="2.2" />
          <circle cx="150" cy="150" r="95" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="150" cy="150" r="75" strokeWidth="2" />
          <circle cx="150" cy="150" r="50" strokeWidth="1.8" strokeDasharray="2 4" />
          <circle cx="150" cy="150" r="25" strokeWidth="2.5" fill="currentColor" fillOpacity="0.1" />
        </svg>
      </div>
    </div>
  );
}

function DinerMenuContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const tableNo = searchParams.get('table') || searchParams.get('tbl') || '1';

  const [restaurant, setRestaurant] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Language Modal & Search States
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedCategories, setTranslatedCategories] = useState<any[]>([]);
  const [translatedMenuItems, setTranslatedMenuItems] = useState<any[]>([]);

  const [cart, setCart] = useState<Record<string, { item: any; quantity: number }>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(false);
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);
  const [waiterCallStatus, setWaiterCallStatus] = useState<string | null>(null);

  useEffect(() => {
    if (slug) verifyAndLoadMenu();
  }, [slug]);

  // Realtime subscription to listen for waiter call status updates from admin dashboard
  useEffect(() => {
    if (!restaurant?.id || !tableNo) return;

    const channel = supabase
      .channel(`customer-waiter-${restaurant.id}-${tableNo}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waiter_calls',
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        (payload: any) => {
          if (payload.new && parseInt(payload.new.table_no, 10) === parseInt(tableNo, 10)) {
            setWaiterCallStatus(payload.new.status);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurant?.id, tableNo]);

  async function verifyAndLoadMenu() {
    setLoading(true);
    setErrorMsg(null);

    const { data: rest, error: restErr } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .single();

    if (restErr || !rest) {
      setErrorMsg('Restaurant venue not found.');
      setLoading(false);
      return;
    }

    setRestaurant(rest);

    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', rest.id)
      .order('display_order', { ascending: true });

    const { data: items } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', rest.id)
      .or('is_available.eq.true,is_available.is.null');

    if (cats) {
      setCategories(cats);
      setTranslatedCategories(cats);
    }
    if (items) {
      setMenuItems(items);
      setTranslatedMenuItems(items);
    }

    setLoading(false);
  }

  async function handleLanguageSelect(langCode: string) {
    setSelectedLanguage(langCode);
    setIsLangModalOpen(false);

    if (langCode === 'en') {
      setTranslatedCategories(categories);
      setTranslatedMenuItems(menuItems);
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: menuItems,
          categories: categories,
          targetLang: langCode,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTranslatedCategories(data.categories);
        setTranslatedMenuItems(data.items);
      }
    } catch (err: any) {
      console.error('Translation failed:', err);
    } finally {
      setIsTranslating(false);
    }
  }

  function handleAddToCart(item: any) {
    setCart((prev) => {
      const existing = prev[item.id];
      if (existing) {
        return {
          ...prev,
          [item.id]: { ...existing, quantity: existing.quantity + 1 },
        };
      }
      return {
        ...prev,
        [item.id]: { item, quantity: 1 },
      };
    });
  }

  function handleRemoveFromCart(itemId: string) {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      if (existing.quantity > 1) {
        return {
          ...prev,
          [itemId]: { ...existing, quantity: existing.quantity - 1 },
        };
      }
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
  }

  const cartItemsArray = Object.values(cart);
  const cartItemCount = cartItemsArray.reduce((sum, c) => sum + c.quantity, 0);
  const cartSubtotal = cartItemsArray.reduce((sum, c) => sum + c.item.price * c.quantity, 0);

  async function handlePlaceOrder() {
    if (!restaurant || cartItemsArray.length === 0) return;

    if (!restaurant.orders_enabled) {
      alert('Online digital ordering is currently disabled for this venue.');
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .insert([{
          restaurant_id: restaurant.id,
          table_no: parseInt(tableNo, 10),
          status: 'pending',
          total_amount: cartSubtotal,
        }])
        .select()
        .single();

      if (orderErr) throw orderErr;

      const orderItemsPayload = cartItemsArray.map((c) => ({
        order_id: orderData.id,
        item_id: c.item.id,
        item_name: c.item.name,
        quantity: c.quantity,
        price: c.item.price,
      }));

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(orderItemsPayload);

      if (itemsErr) throw itemsErr;

      setOrderPlacedSuccess(true);
      setCart({});
      setIsCartOpen(false);
    } catch (err: any) {
      alert(`Failed to place order: ${err.message}`);
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  async function handleCallWaiter() {
    if (!restaurant?.id) {
      alert("Error: Restaurant profile could not be identified.");
      return;
    }
    if (!tableNo) {
      alert("Error: Table number missing from QR URL. Please scan the QR code again.");
      return;
    }

    setIsCallingWaiter(true);

    try {
      console.log(`Sending waiter call -> Restaurant: ${restaurant.id}, Table: ${tableNo}`);

      const { data, error } = await supabase
        .from('waiter_calls')
        .insert([
          { 
            restaurant_id: restaurant.id, 
            table_no: parseInt(tableNo, 10), 
            status: 'pending' 
          }
        ])
        .select();

      if (error) {
        console.error("Supabase Insert Error:", error);
        alert(`Database Error: ${error.message}`);
        return;
      }

      console.log("Successfully created waiter call:", data);
      setWaiterCallStatus('pending');
    } catch (err: any) {
      console.error("Unexpected Error:", err);
      alert(`Failed to call waiter: ${err.message || 'Unknown error'}`);
    } finally {
      setIsCallingWaiter(false);
    }
  }

  const filteredLanguages = ALL_LANGUAGES.filter((lang) =>
    lang.label.toLowerCase().includes(langSearch.toLowerCase())
  );

  const selectedLangLabel = ALL_LANGUAGES.find((l) => l.code === selectedLanguage)?.label || 'English';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center text-xs">
        Loading restaurant venue session...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-sm font-black">Menu Load Error</h2>
          <p className="text-xs text-slate-400">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 font-sans relative">
      <TraditionalDecorativeBorders />

      {/* Live Waiter Dispatch Status Notification Banner */}
      {waiterCallStatus === 'completed' && (
        <div className="fixed top-4 inset-x-4 max-w-md mx-auto z-50 bg-emerald-500 text-slate-950 p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🏃‍♂️</span>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">Waiter On The Way!</h4>
              <p className="text-[11px] font-semibold">Staff has marked your request for Table #{tableNo} as attended.</p>
            </div>
          </div>
          <button 
            onClick={() => setWaiterCallStatus(null)} 
            className="text-slate-950 font-bold px-2 py-1 text-xs hover:bg-emerald-400 rounded-lg"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 p-4 shadow-xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {restaurant.logo_url ? (
              <img 
                src={restaurant.logo_url} 
                alt={restaurant.name} 
                className="w-10 h-10 object-cover rounded-xl border border-slate-800 shrink-0 shadow-md" 
              />
            ) : (
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                <Utensils className="w-5 h-5" />
              </div>
            )}
            <div>
              <h1 className="text-sm font-black tracking-tight">{restaurant.name}</h1>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                <ShieldCheck className="w-3 h-3" /> Table #{tableNo} Verified
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Interactive Globe AI Language Trigger */}
            <button
              onClick={() => setIsLangModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-400 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
              title="Select menu language"
            >
              {isTranslating ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              ) : (
                <Globe className="w-4 h-4 text-emerald-400" />
              )}
              <span className="hidden sm:inline text-[11px] font-bold text-slate-300">{selectedLangLabel.split(' ')[0]}</span>
            </button>

            <button
              onClick={handleCallWaiter}
              disabled={isCallingWaiter}
              className="flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {isCallingWaiter ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              ) : (
                <Bell className="w-3.5 h-3.5" />
              )}
              {isCallingWaiter ? 'Calling...' : 'Call Waiter'}
            </button>
          </div>
        </div>
      </div>

      {orderPlacedSuccess && (
        <div className="max-w-md mx-auto p-4 relative z-10">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-black text-emerald-400">Order Placed Successfully!</h4>
                <p className="text-[11px] text-slate-400">Your kitchen order has been sent to the live KDS.</p>
              </div>
            </div>
            <button onClick={() => setOrderPlacedSuccess(false)} className="text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Menu Render */}
      <main className="max-w-md mx-auto p-4 space-y-6 relative z-10">
        {translatedCategories.length === 0 ? (
          <div className="text-center text-slate-500 py-16 text-xs space-y-2">
            <Sparkles className="w-8 h-8 mx-auto text-slate-700 animate-pulse" />
            <p>No menu categories or dishes published yet for this venue.</p>
          </div>
        ) : (
          translatedCategories.map((cat) => {
            const catItems = translatedMenuItems.filter((item) => item.category_id === cat.id);
            if (catItems.length === 0) return null;

            return (
              <div key={cat.id} className="space-y-3">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {cat.translatedName || cat.name}
                </h2>
                <div className="space-y-3">
                  {catItems.map((item) => {
                    const inCartCount = cart[item.id]?.quantity || 0;

                    return (
                      <div key={item.id} className="bg-slate-900/90 border border-slate-800/80 backdrop-blur-sm p-4 rounded-2xl flex gap-4 items-center shadow-lg hover:border-slate-700 transition-all">
                        {item.image_url && (
                          <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-xl border border-slate-800 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <h3 className="text-xs font-bold text-slate-200 truncate">
                              {item.translatedName || item.name}
                            </h3>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2">
                            {item.translatedDescription || item.description}
                          </p>
                          <div className="text-xs font-black text-emerald-400 font-mono">₹{item.price}</div>
                        </div>

                        <div className="shrink-0">
                          {inCartCount === 0 ? (
                            <button
                              onClick={() => handleAddToCart(item)}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-500/10"
                            >
                              Add
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-1 rounded-xl">
                              <button onClick={() => handleRemoveFromCart(item.id)} className="p-1 hover:text-rose-400">
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-black w-4 text-center">{inCartCount}</span>
                              <button onClick={() => handleAddToCart(item)} className="p-1 hover:text-emerald-400">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Cart Bottom Bar */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 z-40">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold">{cartItemCount} items selected</span>
              <div className="text-sm font-black text-emerald-400 font-mono">₹{cartSubtotal.toFixed(2)}</div>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-xl text-xs font-black shadow-xl shadow-emerald-500/10 transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> View Order Cart
            </button>
          </div>
        </div>
      )}

      {/* Interactive Language Search Modal */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800/80 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl max-h-[80vh] flex flex-col relative overflow-hidden">
            <TraditionalDecorativeBorders />
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/60 relative z-10">
              <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400 animate-pulse" /> Select Menu Language
              </h3>
              <button onClick={() => setIsLangModalOpen(false)} className="text-slate-500 hover:text-slate-300 transition-all p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative z-10">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search language (Hindi, Spanish, French...)..."
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 placeholder-slate-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 relative z-10 no-scrollbar">
              {filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex justify-between items-center ${
                    selectedLanguage === lang.code
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-950/80 border border-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <span>{lang.label}</span>
                  {selectedLanguage === lang.code && <CheckCircle2 className="w-4 h-4" />}
                </button>
              ))}
              {filteredLanguages.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-[11px] font-semibold">No results matched your search.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto relative overflow-hidden">
            <TraditionalDecorativeBorders />
            <div className="flex justify-between items-center pb-3 border-b border-slate-800/60 relative z-10">
              <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" /> Your Table #{tableNo} Order
              </h3>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-500 hover:text-slate-300 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 relative z-10">
              {cartItemsArray.map(({ item, quantity }) => (
                <div key={item.id} className="flex items-center justify-between bg-slate-950/90 p-3 rounded-2xl border border-slate-800/80">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-200 truncate">{item.translatedName || item.name}</h4>
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold">₹{item.price} x {quantity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleRemoveFromCart(item.id)} className="p-1 bg-slate-900 rounded-lg text-slate-400 hover:text-rose-400">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-black w-4 text-center">{quantity}</span>
                    <button onClick={() => handleAddToCart(item)} className="p-1 bg-slate-900 rounded-lg text-slate-400 hover:text-emerald-400">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800/60 space-y-2 relative z-10">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-slate-200">₹{cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-emerald-400">
                <span>Total Amount</span>
                <span className="font-mono">₹{cartSubtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmittingOrder}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-2xl text-xs transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 relative z-10"
            >
              <ChefHat className="w-4 h-4" /> {isSubmittingOrder ? 'Submitting Order...' : 'Confirm & Send to Kitchen (KDS)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DinerMenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center text-xs">Loading menu session...</div>}>
      <DinerMenuContent />
    </Suspense>
  );
}