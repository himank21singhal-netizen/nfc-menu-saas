'use client';

import React from 'react';
import { Bell, Clock, CheckCircle, ChefHat } from 'lucide-react';

interface AdminKDSProps {
  waiterCalls: any[];
  liveOrders: any[];
  onResolveWaiterCall: (id: string) => void;
  onUpdateOrderStatus: (id: string, status: string) => void;
}

export default function AdminKDS({
  waiterCalls,
  liveOrders,
  onResolveWaiterCall,
  onUpdateOrderStatus,
}: AdminKDSProps) {
  return (
    <div className="space-y-6">
      {/* Active Waiter Calls Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-xs font-black text-slate-100 flex items-center gap-2 uppercase tracking-wider">
            <Bell className="w-4 h-4 text-amber-400" /> Active Waiter Calls
          </h2>
          <span className="bg-amber-500/20 text-amber-400 font-mono text-[10px] px-2.5 py-1 rounded-full font-bold">
            {waiterCalls.length} Pending
          </span>
        </div>

        {waiterCalls.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs font-semibold">
            No pending waiter assistance calls.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {waiterCalls.map((call) => (
              <div 
                key={call.id} 
                className="bg-slate-950 border border-amber-500/30 p-4 rounded-2xl space-y-3 relative overflow-hidden shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Assistance Request</span>
                    <h3 className="text-sm font-black text-slate-100">Table #{call.table_no}</h3>
                  </div>
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                </div>

                <div className="text-[10px] text-slate-400 font-mono">
                  {new Date(call.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                <button
                  onClick={() => onResolveWaiterCall(call.id)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Mark Attended
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Kitchen Orders Stream */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <h2 className="text-xs font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <ChefHat className="w-4 h-4 text-emerald-400" /> Live Kitchen Display System (KDS)
        </h2>

        {liveOrders.length === 0 ? (
          <div className="bg-slate-950/60 border border-slate-800 p-8 rounded-2xl text-center text-xs text-slate-400">
            No active kitchen orders placed yet.
          </div>
        ) : (
          <div className="space-y-4">
            {liveOrders.map((order) => (
              <div key={order.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-400">Table #{order.table_no}</span>
                    <span className="text-[10px] font-mono text-slate-500">Order #{order.id.substring(0, 8)}</span>
                  </div>
                  <div className="text-xs text-slate-300 font-semibold mt-1">
                    {order.order_items?.map((item: any) => `${item.quantity}x ${item.item_name}`).join(', ')}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-200">₹{order.total_amount}</span>
                  <button
                    onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black transition-all"
                  >
                    Complete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}