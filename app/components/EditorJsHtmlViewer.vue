<template>
  <div
    v-if="html"
    class="editorjs-html-viewer prose prose-sm max-w-none"
    style="color: #2e5e3e"
    v-html="html"
  />
</template>

<script setup lang="ts">
interface Props {
  html: string | null | undefined
}

defineProps<Props>()
</script>

<style scoped>
.editorjs-html-viewer :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}
.editorjs-html-viewer :deep(h3) {
  font-size: 1.25rem;
  font-weight: 700;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}
.editorjs-html-viewer :deep(h4) {
  font-size: 1.125rem;
  font-weight: 700;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}
.editorjs-html-viewer :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.75;
}
.editorjs-html-viewer :deep(ul),
.editorjs-html-viewer :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}
.editorjs-html-viewer :deep(ul) {
  list-style-type: disc;
}
.editorjs-html-viewer :deep(ol) {
  list-style-type: decimal;
}
.editorjs-html-viewer :deep(li) {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
.editorjs-html-viewer :deep(blockquote) {
  border-left: 4px solid #d1d5db;
  padding-left: 1rem;
  font-style: italic;
  margin: 1rem 0;
}
.editorjs-html-viewer :deep(pre),
.editorjs-html-viewer :deep(code) {
  background-color: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875rem;
}
.editorjs-html-viewer :deep(pre) {
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}
.editorjs-html-viewer :deep(pre code) {
  padding: 0;
  background: none;
}
.editorjs-html-viewer :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.25rem;
  margin: 1rem 0;
}
</style>
