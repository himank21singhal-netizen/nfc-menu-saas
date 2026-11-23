'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Receipt, CheckCircle2, DollarSign, Clock, Users, Printer } from 'lucide-react';

export default function BillManagement({ restaurantId }: { restaurantId: string }) {
  const [activeBills, setActiveBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceFeePercent, setServiceFeePercent] = useState(5); // Default 5% service fee
  const [taxPercent, setTaxPercent] = useState(18); // Default 18% GST/VAT

  useEffect(() => {
    if (restaurantId) fetchActiveBills();

    // Realtime listener for orders to update bills instantly
    const channel = supabase
      .channel('public:billing_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurantId}` }, () => {
        fetchActiveBills();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  async function fetchActiveBills() {
    setLoading(true);
    // Fetch pending or preparing orders grouped by table
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('restaurant_id', restaurantId)
      .neq('status', 'paid')
      .order('created_at', { ascending: false });

    if (data) {
      // Group orders by table number
      const groupedByTable: Record<string, any> = {};
      data.forEach((order) => {
        const table = order.table_no;
        if (!groupedByTable[table]) {
          groupedByTable[table] = {
            tableNo: table,
            orders: [],
            subtotal: 0,
            status: order.status,
          };
        }
        groupedByTable[table].orders.push(order);
        groupedByTable[table].subtotal += order.total_amount || 0;
      });

      setActiveBills(Object.values(groupedByTable));
    }
    setLoading(false);
  }

  async function handleSettleBill(tableNo: string, orders: any[]) {
    if (!confirm(`Settle bill and clear Table #${tableNo}?`)) return;

    const orderIds = orders.map((o) => o.id);

    // Mark all orders for this table as 'paid' (or completed/archived)
    const { error } = await supabase
      .from('orders')
      .update({ status: 'paid' })
      .in('id', orderIds);

    if (!error) {
      alert(`Table #${tableNo} bill settled successfully!`);
      fetchActiveBills();
    } else {
      alert(`Failed to settle bill: ${error.message}`);
    }
  }

  if (loading) {
    return <div className="text-xs text-slate-400 py-8 text-center">Loading active table bills...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-100 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" /> Table Bill Generation & Checkout
            </h2>
            <p className="text-xs text-slate-400">View running table tabs, calculate service fees, and settle payments.</p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-2 rounded-2xl">
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase">Service Fee %</label>
              <input
                type="number"
                value={serviceFeePercent}
                onChange={(e) => setServiceFeePercent(parseFloat(e.target.value) || 0)}
                className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-100 font-mono text-center focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase">Tax / GST %</label>
              <input
                type="number"
                value={taxPercent}
                onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-100 font-mono text-center focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {activeBills.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200">All Tables Are Clear</h3>
          <p className="text-xs text-slate-400">No active running bills or unpaid table tabs right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeBills.map((bill) => {
            const serviceFee = (bill.subtotal * serviceFeePercent) / 100;
            const taxAmount = (bill.subtotal * taxPercent) / 100;
            const grandTotal = bill.subtotal + serviceFee + taxAmount;

            return (
              <div key={bill.tableNo} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-black text-xs">
                        #{bill.tableNo}
                      </span>
                      <h3 className="text-xs font-bold text-slate-100">Table #{bill.tableNo} Tab</h3>
                    </div>
                    <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full font-bold uppercase">
                      Running Tab
                    </span>
                  </div>

                  {/* Order Items Breakdown */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {bill.orders.map((ord: any) => (
                      <div key={ord.id} className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800/60">
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>Order ID: {ord.id.slice(0, 6)}</span>
                          <span>{new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {ord.order_items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-xs">
                            <span className="text-slate-300">{item.quantity}x {item.item_name}</span>
                            <span className="text-slate-400 font-mono">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Bill Calculations */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal</span>
                      <span className="font-mono text-slate-200">₹{bill.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Service Fee ({serviceFeePercent}%)</span>
                      <span className="font-mono text-slate-200">₹{serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Tax / GST ({taxPercent}%)</span>
                      <span className="font-mono text-slate-200">₹{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-emerald-400 pt-2 border-t border-slate-800/80">
                      <span>Grand Total</span>
                      <span className="font-mono">₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleSettleBill(bill.tableNo, bill.orders)}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" /> Settle Bill & Clear Table
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}