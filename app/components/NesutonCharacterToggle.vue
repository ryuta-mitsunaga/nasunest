<template>
  <div class="nesuton-toggle">
    <!-- 表示時：ねすとん + 閉じるボタン -->
    <Transition name="nesuton-fade">
      <div
        v-if="isVisible"
        class="relative"
      >
        <button
          type="button"
          class="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-md"
          style="border-color: #2e5e3e; color: #2e5e3e"
          aria-label="ねすとんを隠す"
          @click="isVisible = false"
        >
          <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
        </button>
        <NesutonCharacter>
          <slot />
        </NesutonCharacter>
      </div>
    </Transition>

    <!-- 非表示時：表示ボタン -->
    <Transition name="nesuton-fade">
      <button
        v-if="!isVisible"
        type="button"
        class="flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all hover:shadow-md"
        style="border-color: #2e5e3e; color: #2e5e3e; background-color: var(--color-page-bg)"
        @click="isVisible = true"
      >
        <img
          src="/img/nesuton.png"
          alt="ねすとん"
          class="w-10 h-10 object-contain"
        />
        <span
          class="text-sm font-bold"
          style="font-family: 'Kosugi Maru', sans-serif"
        >
          ねすとんを表示
        </span>
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Props {
  defaultVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultVisible: true,
})

const isVisible = ref(props.defaultVisible)

// propsの変更時に同期
watch(
  () => props.defaultVisible,
  (val) => { isVisible.value = val },
)

defineExpose({
  isVisible,
})
</script>

<style scoped>
.nesuton-fade-enter-active,
.nesuton-fade-leave-active {
  transition: opacity 0.2s ease;
}
.nesuton-fade-enter-from,
.nesuton-fade-leave-to {
  opacity: 0;
}
</style>
