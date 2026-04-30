<script setup>
/** Layout trang auth (login, register) — full page centered */
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left panel: decorative -->
    <div class="hidden lg:flex flex-col justify-between w-[480px] shrink-0 bg-sidebar p-10 relative overflow-hidden">
      <!-- Background pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute -top-32 -left-32 w-96 h-96 bg-brand-400 rounded-full" />
        <div class="absolute top-1/2 -right-20 w-64 h-64 bg-accent-400 rounded-full" />
        <div class="absolute -bottom-20 left-20 w-72 h-72 bg-brand-300 rounded-full" />
      </div>

      <!-- Logo -->
      <div class="relative flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
          <span class="text-white font-black text-lg">L</span>
        </div>
        <div>
          <div class="text-white font-bold text-xl">Lexafina</div>
          <div class="text-slate-400 text-xs">IELTS Practice Platform</div>
        </div>
      </div>

      <!-- Hero text -->
      <div class="relative">
        <h2 class="text-white text-3xl font-bold leading-tight mb-4">
          Luyện IELTS<br/>
          thông minh hơn.<br/>
          <span class="text-brand-400">Hiệu quả hơn.</span>
        </h2>
        <p class="text-slate-400 text-sm leading-relaxed">
          Hơn 200+ đề thi Reading, Listening, Writing và Speaking được cập nhật liên tục. Phân tích điểm yếu và đề xuất lộ trình học tập cá nhân.
        </p>
      </div>

      <!-- Stats row -->
      <div class="relative grid grid-cols-3 gap-4">
        <div v-for="stat in [{ v:'200+', l:'Đề thi' }, { v:'9.0', l:'Band tối đa' }, { v:'5K+', l:'Học viên' }]" :key="stat.l" class="text-center">
          <div class="text-white text-2xl font-bold">{{ stat.v }}</div>
          <div class="text-slate-400 text-xs mt-0.5">{{ stat.l }}</div>
        </div>
      </div>
    </div>

    <!-- Right panel: form content -->
    <div class="flex-1 flex flex-col items-center justify-center p-6 bg-surface-muted">
      <!-- Mobile logo -->
      <div class="lg:hidden flex items-center gap-2 mb-8">
        <div class="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <span class="text-white font-black">L</span>
        </div>
        <span class="font-bold text-lg text-slate-800">Lexafina</span>
      </div>

      <div class="w-full max-w-sm">
        <slot />
      </div>
    </div>
  </div>
</template>
