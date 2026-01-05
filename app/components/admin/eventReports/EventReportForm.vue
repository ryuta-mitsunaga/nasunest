<template>
  <UForm :state="formState" @submit="$emit('submit')" class="space-y-6 p-6">
    <UFormField label="タイトル" name="title" required>
      <UInput
        v-model="form.title"
        placeholder="イベントレポートのタイトル"
        class="w-full"
      />
    </UFormField>

    <UFormField label="対象のイベント" name="event_id" required>
      <USelect
        v-model="form.event_id"
        :items="eventOptions"
        placeholder="イベントを選択"
        class="w-full"
      />
    </UFormField>

    <UFormField label="内容" name="body">
      <AdminEditorJsEditor
        v-model="form.body"
        :use-ai="false"
        @uploading="$emit('uploading', $event)"
      />
    </UFormField>

    <UFormField label="サムネイル" name="thumbnail">
      <div class="space-y-2">
        <div v-if="form.thumbnail && !thumbnailPreview" class="mb-2">
          <img
            :src="form.thumbnail"
            alt="現在のサムネイル"
            class="max-w-xs h-auto rounded"
          />
        </div>
        <input
          type="file"
          accept="image/*"
          @change="handleThumbnailUpload"
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
        />
        <div v-if="thumbnailPreview" class="mt-2">
          <img
            :src="thumbnailPreview"
            alt="サムネイルプレビュー"
            class="max-w-xs h-auto rounded"
          />
        </div>
        <UButton
          v-if="form.thumbnail"
          variant="soft"
          color="error"
          size="sm"
          class="mt-2"
          @click="handleClearThumbnail"
        >
          サムネイルを削除
        </UButton>
      </div>
    </UFormField>

    <slot />
  </UForm>
</template>

<script setup lang="ts">
interface Props {
  form: {
    title: string
    event_id: number | undefined
    body: any
    thumbnail: string | undefined
  }
  events: Array<{
    id: number
    title: string
    start_date: string
  }>
  thumbnailPreview?: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: []
  'thumbnail-upload': [event: globalThis.Event]
  'clear-thumbnail': []
  uploading: [isUploading: boolean]
}>()

const formState = computed(() => ({
  title: props.form.title,
  event_id: props.form.event_id,
}))

const eventOptions = computed(() => {
  return props.events.map(event => ({
    label: `${event.title} (${formatDate(event.start_date)})`,
    value: event.id,
  }))
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const handleThumbnailUpload = (event: globalThis.Event) => {
  emit('thumbnail-upload', event)
}

const handleClearThumbnail = () => {
  emit('clear-thumbnail')
}
</script>
