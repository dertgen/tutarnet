<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react-svelte';
  import { cn } from '$lib/utils';

  let { data } = $props();
  let { stats, period, error } = data;

  const COLORS = {
    accent:      "var(--color-admin-accent, #3b82f6)",
    purple:      "var(--color-admin-purple, #8b5cf6)",
    success:     "var(--color-admin-success, #10b981)",
    warning:     "var(--color-admin-warning, #f59e0b)",
  };

  function formatNumber(num: number) {
    return new Intl.NumberFormat('tr-TR').format(num);
  }
</script>

<div class="p-6 max-w-7xl mx-auto" in:fade={{ duration: 400 }}>
  <header class="flex justify-between items-center mb-8">
    <div>
      <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Analitik</h1>
      <p class="text-slate-500 mt-1">Platform performansını SvelteKit hızıyla takip edin</p>
    </div>
    <button class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
      <RefreshCw size={18} />
      <span>Yenile</span>
    </button>
  </header>

  {#if error}
    <div class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl mb-6" in:fly={{ y: 20 }}>
      {error}
    </div>
  {/if}

  {#if stats}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {#each [
        { label: 'Toplam Partner', value: stats.kpis.total_partners, color: COLORS.accent, trend: '+12%' },
        { label: 'Aktif Kullanıcı', value: stats.kpis.total_users, color: COLORS.purple, trend: '+8%' },
        { label: 'Toplam Ürün', value: stats.kpis.total_products, color: COLORS.success, trend: '+15%' },
        { label: 'Açık Rapor', value: stats.kpis.open_reports, color: COLORS.warning, trend: '-5%' }
      ] as kpi, i}
        <div 
          class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          in:fly={{ y: 20, delay: i * 100 }}
        >
          <div class="flex justify-between items-start mb-4">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
            <span class="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
              <ArrowUpRight size={12} /> {kpi.trend}
            </span>
          </div>
          <div class="text-3xl font-black text-slate-900">{formatNumber(kpi.value)}</div>
          <div class="mt-4 h-1 w-full bg-slate-50 rounded-full overflow-hidden">
            <div class="h-full rounded-full" style="width: 70%; background-color: {kpi.color}"></div>
          </div>
        </div>
      {/each}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm" in:fly={{ y: 20, delay: 400 }}>
        <h3 class="text-lg font-bold text-slate-900 mb-6">Partner Dağılımı</h3>
        <div class="space-y-6">
          {#each [
            { label: 'E-Ticaret', value: stats.kpis.ecommerce_partners, color: COLORS.accent },
            { label: 'Hizmet', value: stats.kpis.service_partners, color: COLORS.purple },
            { label: 'Aktif', value: stats.kpis.active_partners, color: COLORS.success },
            { label: 'Bekleyen', value: stats.kpis.pending_partners, color: COLORS.warning }
          ] as item}
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-slate-600 font-medium">{item.label}</span>
                <span class="text-slate-900 font-bold">{formatNumber(item.value)}</span>
              </div>
              <div class="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all duration-1000" 
                  style="width: {(item.value / stats.kpis.total_partners) * 100}%; background-color: {item.color}"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div class="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm" in:fly={{ y: 20, delay: 500 }}>
        <h3 class="text-lg font-bold text-slate-900 mb-6">Platform Özeti</h3>
        <div class="divide-y divide-slate-50">
          {#each [
            { label: 'Aktif Partner', value: stats.kpis.active_partners, color: 'text-emerald-600' },
            { label: 'Toplam Ürün', value: stats.kpis.total_products, color: 'text-blue-600' },
            { label: 'Açık Rapor', value: stats.kpis.open_reports, color: 'text-amber-600' },
            { label: 'Bu Ay Yeni Üye', value: stats.kpis.new_users_this_month, color: 'text-purple-600' }
          ] as item}
            <div class="py-4 flex justify-between items-center">
              <span class="text-slate-600">{item.label}</span>
              <span class={cn("text-xl font-black", item.color)}>{formatNumber(item.value)}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>
