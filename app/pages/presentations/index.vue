<template>
  <div class="flex flex-col gap-8 p-8">
    <PresentationsPresentationGrid
      :images="images['20251118']"
      title="2025/11/18 報告会"
      to="/presentations/20251118"
    />
    <PresentationsPresentationGrid
      :images="images['20251118']"
      title="2025/11/18 報告会"
      to="/presentations/20251118"
    />
  </div>
</template>
<script setup lang="ts">
import PresentationsImage1 from '~/public/img/presentations.png'
import PresentationsImage2 from '~/public/img/presentations.png'
import PresentationsImage3 from '~/public/img/presentations.png'
import PresentationsImage4 from '~/public/img/presentations.png'
import PresentationsImage5 from '~/public/img/presentations.png'

const images = {
  '20251118': [
    PresentationsImage1,
    PresentationsImage2,
    PresentationsImage3,
    PresentationsImage4,
    PresentationsImage5,
  ],
}
</script>
