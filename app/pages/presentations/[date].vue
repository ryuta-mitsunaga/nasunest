<template>
  <div>{{ date }}</div>
</template>
<script setup lang="ts">
const route = useRoute()
const date = route.params.date
</script>
