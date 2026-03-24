<template>
  <div
    class="photo-stack relative flex h-full w-full items-center justify-center"
  >
    <div
      v-for="photo in photos"
      :key="photo.id"
      class="photo-item absolute overflow-hidden rounded-lg opacity-0"
      :style="{
        width: `${photo.size}px`,
        height: `${photo.size * 1.2}px`,
        zIndex: photo.zIndex,
        animationDelay: `${photo.delay}ms`,
        transform: `translate(${photo.translateX * spreadFactor}px, ${
          photo.translateY * spreadFactor
        }px) rotate(${photo.rotation}deg) scale(${0.9 + spreadFactor * 0.15})`,
      }"
    >
      <img
        :src="photo.imageSrc"
        alt=""
        class="h-full w-full object-cover grayscale-[35%] contrast-[1.02]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Event } from '~/components/events/EventCard.vue'

interface Photo {
  id: number
  rotation: number
  translateX: number
  translateY: number
  delay: number
  zIndex: number
  size: number
  imageSrc: string
}

interface Props {
  events?: Event[]
}

const props = withDefaults(defineProps<Props>(), {
  events: () => [],
})

const PHOTO_COUNT = 15

const mobileMinSpread = 0.6
const mobileMaxSpread = 2.5
const desktopMinSpread = 1.2
const desktopMaxSpread = 2.9

const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min

const photos = ref<Photo[]>([])
const imagesLoaded = ref(false)

const emit = defineEmits<{
  'images-loaded': []
  'cards-animation-complete': []
}>()

const CARD_ANIMATION_DURATION = (PHOTO_COUNT - 1) * 200 + 800

const spreadFactor = ref(0.3)

const updateSpread = () => {
  const viewportHeight = window.innerHeight || 1
  const progress = Math.min(window.scrollY / viewportHeight, 1)

  const isMobile = window.innerWidth < 768

  const minSpread = isMobile ? mobileMinSpread : desktopMinSpread
  const maxSpread = isMobile ? mobileMaxSpread : desktopMaxSpread
  spreadFactor.value = minSpread + progress * (maxSpread - minSpread)
}

const generatePhotos = () => {
  if (!process.client) return

  const eventThumbnails = (props.events || [])
    .filter(event => event.thumbnail)
    .map(event => event.thumbnail as string)

  const defaultImage = '/img/chiki-okoshi-Introduction/dummy1.jpg'

  const imageSources: string[] = []
  if (eventThumbnails.length === 0) {
    imageSources.push(...Array(PHOTO_COUNT).fill(defaultImage))
  } else {
    for (let i = 0; i < PHOTO_COUNT; i++) {
      const thumbnail = eventThumbnails[i % eventThumbnails.length]
      imageSources.push(thumbnail || defaultImage)
    }
  }

  photos.value = Array.from({ length: PHOTO_COUNT }).map((_, index) => ({
    id: index,
    rotation: randomBetween(-20, 20),
    translateX: randomBetween(-160, 160),
    translateY: randomBetween(-110, 110),
    delay: index * 200,
    zIndex: index + 1,
    size: randomBetween(90, 150),
    imageSrc: imageSources[index] || defaultImage,
  }))
}

const loadImages = () => {
  if (!process.client) return

  const imagePromises = photos.value.map(photo => {
    return new Promise<void>(resolve => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => resolve()
      img.src = photo.imageSrc
    })
  })

  Promise.all(imagePromises).then(() => {
    imagesLoaded.value = true
    emit('images-loaded')
  })
}

onMounted(() => {
  if (!process.client) return
  generatePhotos()
  updateSpread()
  window.addEventListener('scroll', updateSpread, { passive: true })
  window.addEventListener('resize', updateSpread)

  setTimeout(() => {
    emit('cards-animation-complete')
  }, CARD_ANIMATION_DURATION)

  nextTick(() => {
    loadImages()
  })
})

onBeforeUnmount(() => {
  if (!process.client) return
  window.removeEventListener('scroll', updateSpread)
  window.removeEventListener('resize', updateSpread)
})
</script>

<style scoped>
.photo-item {
  animation: photoStackFade 0.8s ease forwards;
  border: 1px solid rgba(163, 163, 163, 0.6);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

@keyframes photoStackFade {
  from {
    opacity: 0;
    transform: translate(0, 0) scale(0.9);
  }
  to {
    opacity: 1;
  }
}
</style>
