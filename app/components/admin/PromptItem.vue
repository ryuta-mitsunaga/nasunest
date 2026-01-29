<template>
  <div class="border rounded-lg border-gray-300 overflow-hidden">
      <!-- 編集モード（カスタムプロンプトのみ） -->
    <div v-if="isEditable && editingPromptId === prompt.id" class="p-4 space-y-4">
      <UFormField label="プロンプト名" name="promptName" required>
        <UInput
          v-model="localEditForm.name"
          placeholder="例：ワークショップ向けプロンプト"
        />
      </UFormField>
      <UFormField label="プロンプト内容" name="promptContent" required>
        <UTextarea
          v-model="localEditForm.prompt"
          class="w-full text-sm"
          :rows="10"
          placeholder="プロンプト内容を入力してください。"
        ></UTextarea>
      </UFormField>
      <div class="flex justify-end gap-2">
        <UButton variant="soft" @click="$emit('cancel-edit')">キャンセル</UButton>
        <UButton @click="$emit('save', localEditForm)" :loading="saving">保存</UButton>
      </div>
    </div>
    
    <!-- 表示モード -->
    <div v-else>
      <!-- ヘッダー部分（クリック可能） -->
      <button
        class="w-full p-4 hover:bg-gray-50 text-left flex items-start justify-between gap-2"
        @click="$emit('toggle')"
      >
        <div class="flex-1">
          <div class="font-medium mb-2">{{ prompt.name }}</div>
        </div>
        <UIcon
          :name="isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
          class="w-5 h-5 text-gray-400 flex-shrink-0 mt-1 transition-transform duration-200"
          :class="isExpanded ? 'rotate-180' : ''"
        />
      </button>
      
      <!-- プロンプト内容（アコーディオン） -->
      <div
        class="px-4 pb-4 text-sm text-gray-600 accordion-content"
        :class="isExpanded ? 'expanded' : 'collapsed'"
      >
        <pre class="whitespace-pre-wrap font-sans">{{ prompt.prompt }}</pre>
      </div>
      
      <!-- 編集・削除ボタン（カスタムプロンプトのみ） -->
      <div v-if="isEditable" class="px-4 pb-4 flex gap-2 border-t border-gray-100">
        <UButton
          variant="soft"
          size="sm"
          @click.stop="$emit('edit', prompt)"
        >
          編集
        </UButton>
        <UButton
          variant="soft"
          color="error"
          size="sm"
          @click.stop="$emit('delete', prompt.id)"
        >
          削除
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  prompt: {
    id: number
    name: string
    prompt: string
  }
  isExpanded: boolean
  isEditable?: boolean
  editingPromptId?: number | null
  editForm?: {
    name: string
    prompt: string
  }
  saving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEditable: false,
  editingPromptId: null,
  editForm: () => ({ name: '', prompt: '' }),
  saving: false,
})

const emit = defineEmits<{
  toggle: []
  edit: [prompt: any]
  delete: [id: number]
  'cancel-edit': []
  save: [form: { name: string; prompt: string }]
  'update:edit-form': [form: { name: string; prompt: string }]
}>()

const localEditForm = computed({
  get: () => props.editForm,
  set: (value) => emit('update:edit-form', value),
})
</script>

<style scoped>
.accordion-content {
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1.5;
}

.accordion-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.accordion-content.collapsed {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  max-height: calc(1.5em * 3);
}

.accordion-content.collapsed pre {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.accordion-content.expanded {
  display: block;
  max-height: 2000px;
}

.accordion-content.expanded pre {
  display: block;
}
</style>
