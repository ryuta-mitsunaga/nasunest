<template>
  <div
    v-if="loading || items.length > 0"
    class="hero-news-strip w-full max-w-[100vw] shrink-0 overflow-hidden bg-transparent py-3"
    role="presentation"
  >
    <div
      v-if="loading"
      class="flex justify-center gap-3 overflow-hidden px-2"
      aria-busy="true"
    >
      <div
        v-for="n in 5"
        :key="n"
        class="h-[140px] w-[200px] flex-shrink-0 animate-pulse rounded-xl bg-neutral-200 sm:h-[160px] sm:w-[220px]"
      />
    </div>

    <div
      v-else
      class="hidden flex-wrap justify-center gap-3 px-2 motion-reduce:flex"
    >
      <NuxtLink
        v-for="item in items"
        :key="item.id"
        :to="item.to"
        class="group/news block shrink-0 cursor-pointer rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        :aria-label="ariaFor(item)"
      >
        <TopHeroNewsStripCard :item="item" />
      </NuxtLink>
    </div>

    <div
      v-if="!loading && items.length > 0"
      class="marquee-outer overflow-hidden motion-reduce:hidden"
    >
      <div
        class="marquee-track flex w-max gap-3 px-2"
        :style="{ '--marquee-duration': `${marqueeDurationSec}s` }"
      >
        <template
          v-for="pass in 2"
          :key="pass"
        >
          <NuxtLink
            v-for="item in items"
            :key="`${pass}-${item.id}`"
            :to="item.to"
            class="group/news block shrink-0 cursor-pointer rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            :tabindex="pass === 2 ? -1 : undefined"
            :aria-hidden="pass === 2 ? true : undefined"
            :aria-label="pass === 1 ? ariaFor(item) : undefined"
          >
            <TopHeroNewsStripCard :item="item" />
          </NuxtLink>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HeroNewsItem } from './TopHeroNewsStripCard.vue'

const props = withDefaults(
  defineProps<{
    items: HeroNewsItem[]
    loading?: boolean
  }>(),
  { loading: false }
)

const ariaFor = (item: HeroNewsItem) =>
  `${item.label}、${item.title}`

const marqueeDurationSec = computed(() => {
  const n = props.items.length
  if (n <= 0) return 50
  return Math.min(90, Math.max(36, n * 7))
})
</script>

<script lang="ts">
export type { HeroNewsItem } from './TopHeroNewsStripCard.vue'
</script>

<style scoped>
.marquee-track {
  animation: marquee-flow var(--marquee-duration, 55s) linear infinite;
}

.marquee-outer:hover .marquee-track {
  animation-play-state: paused;
}

@keyframes marquee-flow {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none;
  }
}
</style>
