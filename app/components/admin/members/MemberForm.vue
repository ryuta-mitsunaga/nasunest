<template>
  <UForm :state="formState" @submit="handleSubmit" class="space-y-4">
    <UFormField label="姓" name="name_sei" required>
      <UInput v-model="form.name_sei" />
    </UFormField>

    <UFormField label="名" name="name_mei" required>
      <UInput v-model="form.name_mei" />
    </UFormField>

    <UFormField label="開始日" name="start_date" required>
      <UInput v-model="form.start_date" type="date" />
    </UFormField>

    <UFormField label="終了日" name="end_date">
      <UInput v-model="form.end_date" type="date" />
    </UFormField>

    <UFormField label="ミッション" name="mission" required>
      <UInput v-model="form.mission" />
    </UFormField>

    <UFormField label="説明" name="description" required>
      <UTextarea v-model="form.description" />
    </UFormField>

    <UFormField label="アイコン" name="icon">
      <div class="space-y-4">
        <div v-if="iconPreview" class="flex items-center gap-4">
          <div class="w-24 h-24 border rounded overflow-hidden">
            <img
              :src="iconPreview"
              alt="プレビュー"
              class="w-full h-full object-cover"
            />
          </div>
          <UButton
            color="error"
            variant="soft"
            size="sm"
            @click="$emit('clear-icon')"
          >
            削除
          </UButton>
        </div>
        <UInput
          type="file"
          accept="image/*"
          @change="$emit('icon-upload', $event)"
        />
      </div>
    </UFormField>

    <UFormField label="X URL" name="x_url">
      <UInput v-model="form.x_url" placeholder="https://x.com/..." />
    </UFormField>

    <UFormField label="Instagram URL" name="instagram_url">
      <UInput
        v-model="form.instagram_url"
        placeholder="https://www.instagram.com/..."
      />
    </UFormField>

    <UFormField label="Facebook URL" name="facebook_url">
      <UInput
        v-model="form.facebook_url"
        placeholder="https://www.facebook.com/..."
      />
    </UFormField>

    <slot />
  </UForm>
</template>

<script setup lang="ts">
export interface MemberFormData {
  name_sei: string
  name_mei: string
  start_date: string
  end_date: string
  mission: string
  description: string
  icon: string | null
  x_url: string
  instagram_url: string
  facebook_url: string
}

const props = defineProps<{
  form: MemberFormData
  iconPreview: string | null
}>()

const emit = defineEmits<{
  submit: []
  'clear-icon': []
  'icon-upload': [event: globalThis.Event]
}>()

const formState = computed(() => props.form)

// バリデーションルール
const validationRules = [
  { field: 'name_sei', required: true },
  { field: 'name_mei', required: true },
  { field: 'start_date', required: true },
  { field: 'mission', required: true },
  { field: 'description', required: true },
]

const { validateAndScroll } = useFormValidation(props.form, validationRules)

const handleSubmit = () => {
  // バリデーションを実行
  if (validateAndScroll()) {
    emit('submit')
  }
}
</script>
