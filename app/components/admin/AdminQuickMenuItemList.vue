<template>
  <div class="space-y-3">
    <AdminQuickMenuItem
      v-for="item in items"
      :key="item.to"
      :label="item.label"
      :card-text="item.cardText"
      :to="item.to"
    />
  </div>
</template>

<script setup lang="ts">
import type { QuickMenuItem } from '~/constants/admin-quick-menu'

interface Props {
  items: QuickMenuItem[]
}

defineProps<Props>()
</script>
