'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import BillManagement from './components/BillManagement';
import { 
  Utensils, 
  QrCode, 
  Layers, 
  TrendingUp, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Bell, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  LogOut, 
  Sparkles, 
  DollarSign, 
  BarChart3, 
  CreditCard,
  ChefHat,
  Receipt,
  ImageIcon,
  Eye,
  EyeOff,
  Upload,
  Loader2,
  Wand2
} from 'lucide-react';

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantSlug, setRestaurantSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [ordersEnabled, setOrdersEnabled] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState('starter');
  const [subscriptionDuration, setSubscriptionDuration] = useState('1m');

  const [activeTab, setActiveTab] = useState('menu');

  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState('');
  
  // Dish Form State
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_veg: true,
    image_url: '',
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingDishImage, setUploadingDishImage] = useState(false);
  const [generatingAiImage, setGeneratingAiImage] = useState(false);

  const [tableCount, setTableCount] = useState(5);
  const [tableUrls, setTableUrls] = useState<any[]>([]);

  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [waiterCalls, setWaiterCalls] = useState<any[]>([]);

  const [auditPeriod, setAuditPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    totalOrdersCount: 0,
    averageTicketSize: 0,
    topSellingItem: 'N/A'
  });

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchOrCreateRestaurant(session.user.id);
      else setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchOrCreateRestaurant(session.user.id);
      else {
        setRestaurantId(null);
        setLoadingAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchOrCreateRestaurant(userId: string) {
    setLoadingAuth(true);
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', userId)
      .single();

    if (data) {
      setRestaurantId(data.id);
      setRestaurantName(data.name);
      setRestaurantSlug(data.slug);
      setLogoUrl(data.logo_url || '');
      setOrdersEnabled(data.orders_enabled);
      setSubscriptionTier(data.subscription_tier || 'starter');
      setSubscriptionDuration(data.subscription_duration || '1m');
      loadVenueData(data.id);
    } else {
      const defaultName = 'My Awesome Restaurant';
      const defaultSlug = 'my-awesome-restaurant-' + Math.floor(Math.random() * 1000);
      const { data: newRest } = await supabase
        .from('restaurants')
        .insert([{ owner_id: userId, name: defaultName, slug: defaultSlug, orders_enabled: false }])
        .select()
        .single();

      if (newRest) {
        setRestaurantId(newRest.id);
        setRestaurantName(newRest.name);
        setRestaurantSlug(newRest.slug);
        setLogoUrl('');
        setOrdersEnabled(newRest.orders_enabled);
        loadVenueData(newRest.id);
      }
    }
    setLoadingAuth(false);
  }

  function loadVenueData(restId: string) {
    fetchCategories(restId);
    fetchMenuItems(restId);
    fetchLiveOrders(restId);
    fetchWaiterCalls(restId);
    computeAnalytics(restId);

    // Clean up any existing channels safely
    supabase.removeAllChannels();

    const ordersSub = supabase
      .channel(`orders-${restId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restId}` },
        () => {
          fetchLiveOrders(restId);
          computeAnalytics(restId);
        }
      )
      .subscribe();

    const waiterSub = supabase
      .channel(`waiter-${restId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'waiter_calls', filter: `restaurant_id=eq.${restId}` },
        () => {
          fetchWaiterCalls(restId);
        }
      )
      .subscribe();

    // REMOVED the 5-second setInterval polling loop entirely to stop the card flickering.

    return () => {
      supabase.removeChannel(ordersSub);
      supabase.removeChannel(waiterSub);
    };
  }

  async function fetchCategories(restId: string) {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', restId)
      .order('display_order');
    if (data) setCategories(data);
  }

  async function fetchMenuItems(restId: string) {
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restId);
    if (data) setMenuItems(data);
  }

  async function fetchLiveOrders(restId: string) {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('restaurant_id', restId)
      .order('created_at', { ascending: false });
    if (data) setLiveOrders(data);
  }

  async function fetchWaiterCalls(restId: string) {
    const { data, error } = await supabase
      .from('waiter_calls')
      .select('*')
      .eq('restaurant_id', restId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching waiter calls:', error);
      return;
    }

    if (data) {
      // Keep only calls that have NOT been completed or resolved
      const activeCalls = data.filter(
        (call) => !call.status || (call.status.toLowerCase() !== 'completed' && call.status.toLowerCase() !== 'resolved')
      );
      setWaiterCalls(activeCalls);
    }
  }

  async function computeAnalytics(restId: string) {
    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount, created_at, order_items(item_name, quantity)')
      .eq('restaurant_id', restId);

    if (!orders || orders.length === 0) {
      setAnalyticsData({ totalRevenue: 0, totalOrdersCount: 0, averageTicketSize: 0, topSellingItem: 'N/A' });
      return;
    }

    const totalRev = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalCount = orders.length;
    const avgTicket = totalCount > 0 ? totalRev / totalCount : 0;

    const itemCounts: Record<string, number> = {};
    orders.forEach((o: any) => {
      o.order_items?.forEach((oi: any) => {
        itemCounts[oi.item_name] = (itemCounts[oi.item_name] || 0) + oi.quantity;
      });
    });

    let topItem = 'N/A';
    let maxQty = -1;
    for (const [name, qty] of Object.entries(itemCounts)) {
      if (qty > maxQty) {
        maxQty = qty;
        topItem = name;
      }
    }

    setAnalyticsData({
      totalRevenue: totalRev,
      totalOrdersCount: totalCount,
      averageTicketSize: avgTicket,
      topSellingItem: topItem,
    });
  }

  async function uploadFileToStorage(file: File, folder: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

      const { error: uploadErr } = await supabase.storage
        .from('restaurant-assets')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: publicUrlData } = supabase.storage
        .from('restaurant-assets')
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (err: any) {
      alert(`File upload failed: ${err.message}`);
      return null;
    }
  }

  async function handleLogoFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !restaurantId) return;

    setUploadingLogo(true);
    const uploadedUrl = await uploadFileToStorage(file, 'logos');

    if (uploadedUrl) {
      const { error } = await supabase
        .from('restaurants')
        .update({ logo_url: uploadedUrl })
        .eq('id', restaurantId);

      if (!error) {
        setLogoUrl(uploadedUrl);
        alert('Restaurant logo updated successfully!');
      } else {
        alert(`Failed to save logo to database: ${error.message}`);
      }
    }
    setUploadingLogo(false);
  }

  async function handleDishImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDishImage(true);
    const uploadedUrl = await uploadFileToStorage(file, 'dishes');

    if (uploadedUrl) {
      setNewItem((prev) => ({ ...prev, image_url: uploadedUrl }));
    }
    setUploadingDishImage(false);
  }

  async function handleMagicAiFill() {
    if (!newItem.name.trim()) {
      alert('Please enter a Dish Name first so AI can generate/fetch an image for it!');
      return;
    }

    setGeneratingAiImage(true);
    try {
      const res = await fetch('/api/ai-dish-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishName: newItem.name,
          tier: subscriptionTier,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setNewItem((prev) => ({ ...prev, image_url: data.imageUrl }));
      } else {
        alert(data.error || 'Failed to auto-generate image.');
      }
    } catch (err: any) {
      alert(`AI Fill Error: ${err.message}`);
    } finally {
      setGeneratingAiImage(false);
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
      if (error) alert(error.message);
      else alert('Sign up successful! Please check your email or log in.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
      if (error) alert(error.message);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim() || !restaurantId) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ 
          restaurant_id: restaurantId, 
          name: newCatName.trim(), 
          display_order: categories.length + 1 
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setCategories((prev) => [...prev, data]);
        setNewCatName('');
      }
    } catch (err: any) {
      alert(`Failed to add category: ${err.message}`);
    }
  }

  async function handleDeleteCategory(catId: string) {
    if (!confirm('Are you sure you want to delete this category? All dishes inside it will also be deleted.')) {
      return;
    }

    try {
      const { error: itemsErr } = await supabase
        .from('menu_items')
        .delete()
        .eq('category_id', catId);

      if (itemsErr) console.warn('Item cleanup warning:', itemsErr.message);

      const { error: catErr } = await supabase
        .from('categories')
        .delete()
        .eq('id', catId);

      if (catErr) throw catErr;

      setCategories((prev) => prev.filter((c) => c.id !== catId));
      setMenuItems((prev) => prev.filter((item) => item.category_id !== catId));
    } catch (err: any) {
      alert(`Failed to delete category: ${err.message}`);
    }
  }

  async function handleAddMenuItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.name || !newItem.price || !newItem.category_id || !restaurantId) return;

    try {
      const { data, error } = await supabase.from('menu_items').insert([{
        restaurant_id: restaurantId,
        name: newItem.name.trim(),
        description: newItem.description.trim(),
        price: parseFloat(newItem.price),
        category_id: newItem.category_id,
        is_veg: newItem.is_veg,
        image_url: newItem.image_url || null,
        is_available: true,
      }]).select().single();

      if (error) throw error;

      if (data) {
        setMenuItems((prev) => [...prev, data]);
        setNewItem({ name: '', description: '', price: '', category_id: '', is_veg: true, image_url: '' });
      }
    } catch (err: any) {
      alert(`Failed to add menu item: ${err.message}`);
    }
  }

  async function handleDeleteMenuItem(itemId: string) {
    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', itemId);
      if (error) throw error;
      setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err: any) {
      alert(`Failed to delete menu item: ${err.message}`);
    }
  }

  async function handleToggleItemAvailability(itemId: string, currentStatus: boolean) {
    try {
      const newStatus = !currentStatus;
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: newStatus })
        .eq('id', itemId);

      if (error) throw error;

      setMenuItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, is_available: newStatus } : item))
      );
    } catch (err: any) {
      alert(`Failed to toggle availability: ${err.message}`);
    }
  }

  function generateTableLinks() {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const links = [];
    for (let i = 1; i <= tableCount; i++) {
      links.push({
        tableNo: i,
        url: `${baseUrl}/m/${restaurantSlug}?table=${i}&sig=hmac_verified_${restaurantId}_${i}`,
      });
    }
    setTableUrls(links);
  }

  async function updateOrderStatus(orderId: string, status: string) {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    if (restaurantId) fetchLiveOrders(restaurantId);
  }

  async function resolveWaiterCall(callId: string) {
    await supabase.from('waiter_calls').update({ status: 'completed' }).eq('id', callId);
    if (restaurantId) fetchWaiterCalls(restaurantId);
  }

  async function handleStripeCheckout(selectedTier: string, duration: string) {
    if (!restaurantId) return;

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier,
          duration,
          restaurantId,
          restaurantName,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start Stripe checkout session.');
      }
    } catch (err: any) {
      alert(`Checkout error: ${err.message}`);
    }
  }

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center text-xs">
        Authenticating venue session...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto">
              <Utensils className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-black tracking-tight">RestoQR SaaS Admin</h1>
            <p className="text-xs text-slate-400">Sign in to manage your restaurant venue & KDS</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
                placeholder="owner@restaurant.com"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/10"
            >
              {isSignUp ? 'Create Account' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-slate-400 hover:text-emerald-400 font-semibold transition-all"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={restaurantName} className="w-9 h-9 object-cover rounded-xl border border-slate-800 shrink-0" />
          ) : (
            <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
              <Utensils className="w-5 h-5" />
            </div>
          )}
          <div>
            <h1 className="text-sm font-black text-slate-100 flex items-center gap-2">
              {restaurantName}
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider">
                {subscriptionTier} tier
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">/m/{restaurantSlug}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-black shadow-lg shadow-amber-500/20 hover:opacity-90 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Upgrade Plan
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-6 gap-6">
        <aside className="w-full md:w-64 space-y-2 shrink-0">
          <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl space-y-1">
            <button
              onClick={() => setActiveTab('menu')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'menu' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              Menu & Categories
            </button>

            <button
              onClick={() => setActiveTab('nfc')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'nfc' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <QrCode className="w-4 h-4" />
              NFC & Table Studio
            </button>

            <button
              onClick={() => setActiveTab('kds')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'kds' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ChefHat className="w-4 h-4" />
                Live KDS & Alerts
              </div>
              {(waiterCalls.length > 0 || liveOrders.filter(o => o.status === 'pending').length > 0) && (
                <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
                  {waiterCalls.length + liveOrders.filter(o => o.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('billing')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'billing' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Receipt className="w-4 h-4" />
              Table Billing & Checkout
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Subscription & Audits
            </button>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          {activeTab === 'menu' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <h2 className="text-sm font-black text-slate-100 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-400" /> Venue Branding & Logo
                </h2>
                <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                  {logoUrl ? (
                    <img src={logoUrl} alt={restaurantName} className="w-14 h-14 object-cover rounded-2xl border border-slate-800 shrink-0" />
                  ) : (
                    <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0">
                      <Utensils className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-slate-200">Upload Venue Logo</h4>
                    <p className="text-[11px] text-slate-400">Select an image from your device/phone storage.</p>
                  </div>
                  <label className="cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0">
                    {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploadingLogo ? 'Uploading...' : 'Upload Image'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleLogoFileUpload}
                      disabled={uploadingLogo}
                    />
                  </label>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <h2 className="text-sm font-black text-slate-100">Categories</h2>
                <form onSubmit={handleAddCategory} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="New category name (e.g. Starters, Beverages)..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                  <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black transition-all">
                    Add Category
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 pt-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-200">{cat.name}</span>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="text-slate-500 hover:text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <h2 className="text-sm font-black text-slate-100">Menu Items</h2>
                <form onSubmit={handleAddMenuItem} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Dish Name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                  <select
                    value={newItem.category_id}
                    onChange={(e) => setNewItem({ ...newItem, category_id: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl">
                      {newItem.image_url ? (
                        <img src={newItem.image_url} alt="Preview" className="w-6 h-6 object-cover rounded shrink-0 border border-slate-800" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <label className="flex-1 cursor-pointer text-xs font-semibold text-slate-400 hover:text-emerald-400 truncate">
                        {uploadingDishImage ? 'Uploading...' : newItem.image_url ? 'Change Image' : 'Choose Local Image'}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleDishImageUpload}
                          disabled={uploadingDishImage}
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={handleMagicAiFill}
                      disabled={generatingAiImage}
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 text-white px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 shadow-md shadow-purple-500/10"
                    >
                      {generatingAiImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 text-purple-200" />}
                      {generatingAiImage ? 'AI Fill...' : 'Magic AI Fill'}
                    </button>
                  </div>

                  <textarea
                    placeholder="Description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    rows={2}
                  />

                  <div className="sm:col-span-2 flex items-center justify-between bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
                    <span className="text-xs font-bold text-slate-300">Dietary Type</span>
                    <button
                      type="button"
                      onClick={() => setNewItem({ ...newItem, is_veg: !newItem.is_veg })}
                      className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
                        newItem.is_veg
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${newItem.is_veg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {newItem.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}
                    </button>
                  </div>

                  <button type="submit" className="sm:col-span-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs transition-all">
                    Add Dish to Menu
                  </button>
                </form>

                <div className="space-y-2 pt-4">
                  {menuItems.map((item) => (
                    <div key={item.id} className={`bg-slate-950 border p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all ${
                      item.is_available ? 'border-slate-800' : 'border-rose-950 opacity-60'
                    }`}>
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name} className="w-10 h-10 object-cover rounded-xl border border-slate-800 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <h4 className="text-xs font-bold text-slate-200 truncate">{item.name}</h4>
                          <span className="text-xs font-black text-emerald-400 font-mono">₹{item.price}</span>
                          {!item.is_available && (
                            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                              Unavailable
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleToggleItemAvailability(item.id, item.is_available ?? true)}
                          className={`p-2 rounded-xl transition-all ${
                            item.is_available
                              ? 'text-emerald-400 hover:bg-emerald-500/10'
                              : 'text-slate-600 hover:bg-slate-800'
                          }`}
                        >
                          {item.is_available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        <button onClick={() => handleDeleteMenuItem(item.id)} className="text-slate-500 hover:text-rose-400 p-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nfc' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
              <div>
                <h2 className="text-sm font-black text-slate-100">NFC & Table QR Studio</h2>
                <p className="text-xs text-slate-400">Generate secure table tags with cryptographic HMAC signatures.</p>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Number of Tables</label>
                  <input
                    type="number"
                    value={tableCount}
                    onChange={(e) => setTableCount(parseInt(e.target.value) || 1)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 w-32"
                  />
                </div>
                <button
                  onClick={generateTableLinks}
                  className="mt-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black transition-all"
                >
                  Generate Table Links
                </button>
              </div>

              <div className="space-y-3 pt-2">
                {tableUrls.map((t) => (
                  <div key={t.tableNo} className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Table #{t.tableNo}</h4>
                      <p className="text-[10px] text-slate-500 font-mono truncate max-w-sm">{t.url}</p>
                    </div>
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 px-3 py-2 rounded-xl text-xs font-bold border border-slate-800 transition-all"
                    >
                      Test Menu <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'kds' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h2 className="text-sm font-black text-slate-100 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" /> Active Waiter Calls
                  </h2>
                  <span className="bg-amber-500/20 text-amber-400 font-mono text-[10px] px-2.5 py-1 rounded-full font-bold">
                    {waiterCalls.length} Pending
                  </span>
                </div>

                {waiterCalls.length === 0 ? (
                  <div className="text-center text-slate-500 py-8 text-xs font-semibold">
                    No pending waiter assistance calls.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {waiterCalls.map((call) => (
                      <div key={call.id} className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex flex-col justify-between gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Assistance Request</span>
                            <h4 className="text-sm font-black text-slate-100">Table #{call.table_no}</h4>
                          </div>
                          <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>{new Date(call.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <button
                            onClick={() => resolveWaiterCall(call.id)}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black transition-all"
                          >
                            Mark Attended
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <h2 className="text-sm font-black text-slate-100 flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-emerald-400" /> Live Kitchen Display System (KDS)
                </h2>
                {!ordersEnabled && (
                  <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-rose-400 text-xs font-bold">
                    Digital ordering is currently inactive on your plan. Upgrade to Pro to enable live ordering.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {liveOrders.map((order) => (
                    <div key={order.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                        <span className="text-xs font-black text-emerald-400">Table #{order.table_no}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          order.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          order.status === 'preparing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-xs">
                            <span className="text-slate-300">{item.quantity}x {item.item_name}</span>
                            <span className="text-slate-500 font-mono">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-900">
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="flex-1 bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-800 py-1.5 rounded-xl text-[11px] font-bold"
                        >
                          Prepare
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-1.5 rounded-xl text-[11px] font-black"
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && restaurantId && (
            <BillManagement restaurantId={restaurantId} />
          )}

          {activeTab === 'analytics' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-black text-slate-100">Subscription & Scaled Audits</h2>
                  <p className="text-xs text-slate-400">Review your subscription plan and financial performance metrics.</p>
                </div>
                <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-xl">
                  {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setAuditPeriod(period)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all ${
                        auditPeriod === period ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Total Revenue ({auditPeriod})</span>
                  <h3 className="text-lg font-black text-emerald-400">₹{analyticsData.totalRevenue.toFixed(2)}</h3>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Total Orders</span>
                  <h3 className="text-lg font-black text-slate-200">{analyticsData.totalOrdersCount}</h3>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Avg. Ticket Size</span>
                  <h3 className="text-lg font-black text-slate-200">₹{analyticsData.averageTicketSize.toFixed(2)}</h3>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Top Selling Item</span>
                  <h3 className="text-base font-black text-amber-400 truncate">{analyticsData.topSellingItem}</h3>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-200 uppercase">{subscriptionTier} Plan</span>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold">
                      {subscriptionDuration} billing
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {ordersEnabled ? 'Digital KDS ordering is fully enabled.' : 'Starter tier: QR menu & waiter calls active.'}
                  </p>
                </div>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black px-5 py-3 rounded-xl text-xs shadow-lg shadow-amber-500/20"
                >
                  Change Plan / Duration
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" /> Choose Your Subscription Plan
              </h3>
              <button onClick={() => setShowUpgradeModal(false)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div>
                  <h4 className="text-sm font-black text-slate-100">Starter Plan</h4>
                  <p className="text-[11px] text-slate-400">QR Menu & Waiter Calls</p>
                </div>
                <div className="space-y-2">
                  <button onClick={() => handleStripeCheckout('starter', '1m')} className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 py-2 rounded-xl text-xs font-bold">1 Month ($12)</button>
                  <button onClick={() => handleStripeCheckout('starter', '3m')} className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 py-2 rounded-xl text-xs font-bold">3 Months ($32)</button>
                  <button onClick={() => handleStripeCheckout('starter', '6m')} className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 py-2 rounded-xl text-xs font-bold">6 Months ($59)</button>
                  <button onClick={() => handleStripeCheckout('starter', '1y')} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2 rounded-xl text-xs font-black">1 Year ($99) - Save 30%</button>
                </div>
              </div>

              <div className="bg-slate-950 border border-amber-500/30 p-5 rounded-2xl space-y-4 relative overflow-hidden">
                <span className="absolute top-3 right-3 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                  Recommended
                </span>
                <div>
                  <h4 className="text-sm font-black text-amber-400">Pro Plan</h4>
                  <p className="text-[11px] text-slate-400">Live KDS & Online Ordering</p>
                </div>
                <div className="space-y-2">
                  <button onClick={() => handleStripeCheckout('pro', '1m')} className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 py-2 rounded-xl text-xs font-bold">1 Month ($29)</button>
                  <button onClick={() => handleStripeCheckout('pro', '3m')} className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 py-2 rounded-xl text-xs font-bold">3 Months ($79)</button>
                  <button onClick={() => handleStripeCheckout('pro', '6m')} className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 py-2 rounded-xl text-xs font-bold">6 Months ($149)</button>
                  <button onClick={() => handleStripeCheckout('pro', '1y')} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 py-2 rounded-xl text-xs font-black shadow-lg shadow-amber-500/20">1 Year ($269) - Best Value</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}