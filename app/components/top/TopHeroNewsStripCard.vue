<template>
  <div
    class="relative w-[200px] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-[border-color,box-shadow] duration-200 group-hover/news:border-neutral-400 group-hover/news:shadow-md sm:w-[220px]"
  >
    <div class="relative aspect-[4/3] w-full bg-neutral-100">
      <img
        :src="imageSrc"
        alt=""
        class="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <span
        class="absolute left-2 top-2 rounded-lg bg-neutral-900/90 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white backdrop-blur-[2px]"
        :class="kindColor"
      >
        {{ item.label }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface HeroNewsItem {
  id: string
  kind: 'event' | 'report'
  title: string
  to: string
  at: string
  label: string
  thumbnail: string | null
}

const props = defineProps<{
  item: HeroNewsItem
}>()

const FALLBACK_IMG = '/img/chiki-okoshi-Introduction/dummy1.jpg'

const imageSrc = computed(() => props.item.thumbnail || FALLBACK_IMG)

const kindColor = computed(() => {
  switch (props.item.kind) {
    case 'event':
      return 'bg-green-500'
    case 'report':
      return 'bg-blue-500'
  }
})
</script>
