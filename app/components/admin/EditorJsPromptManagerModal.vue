<template>
  <UModal v-model:open="isOpen">
    <template #header>
      <h3 class="text-lg font-semibold">プロンプト管理</h3>
    </template>

    <template #body>
      <div class="space-y-6 max-h-[70vh]">
        <!-- デフォルトプロンプトセクション -->
        <div>
          <h4 class="text-md font-semibold mb-3">デフォルトプロンプト</h4>
          <div class="space-y-2">
            <AdminPromptItem
              v-for="prompt in masterPrompts"
              :key="`master_${prompt.id}`"
              :prompt="prompt"
              :is-expanded="expandedPrompts[`master_${prompt.id}`] || false"
              :is-editable="false"
              @toggle="togglePrompt(`master_${prompt.id}`)"
            />
          </div>
        </div>

        <!-- カスタムプロンプトセクション -->
        <div>
          <h4 class="text-md font-semibold mb-3">カスタムプロンプト</h4>
          <div v-if="customPrompts.length === 0 && !editingPromptId" class="text-sm text-gray-500 py-4">
            カスタムプロンプトがありません
          </div>
          <div class="space-y-2">
            <!-- 既存のカスタムプロンプト -->
            <AdminPromptItem
              v-for="prompt in customPrompts"
              :key="`custom_${prompt.id}`"
              :prompt="prompt"
              :is-expanded="expandedPrompts[`custom_${prompt.id}`] || false"
              :is-editable="true"
              :editing-prompt-id="editingPromptId"
              :edit-form="editForm"
              :saving="saving"
              @toggle="togglePrompt(`custom_${prompt.id}`)"
              @edit="startEdit"
              @delete="deletePrompt"
              @cancel-edit="cancelEdit"
              @save="savePrompt"
              @update:edit-form="editForm = $event"
            />
            
            <!-- 新規追加フォーム -->
            <div v-if="editingPromptId === null && showCreateForm" class="border rounded-lg border-gray-300 p-4 space-y-4">
              <UFormField label="プロンプト名" name="newPromptName" required>
                <UInput
                  v-model="editForm.name"
                  placeholder="例：ワークショップ向けプロンプト"
                />
              </UFormField>
              <UFormField label="プロンプト内容" name="newPromptContent" required>
                <UTextarea
                  v-model="editForm.prompt"
                  class="w-full text-sm"
                  :rows="10"
                  placeholder="プロンプト内容を入力してください。"
                ></UTextarea>
              </UFormField>
              <div class="flex justify-end gap-2">
                <UButton variant="soft" @click="cancelCreate">キャンセル</UButton>
                <UButton @click="savePrompt" :loading="saving">追加</UButton>
              </div>
            </div>
          </div>
          
          <!-- 追加ボタン（下に配置） -->
          <div v-if="!showCreateForm && editingPromptId === null" class="mt-4 text-center">
            <UButton
              variant="soft"
              size="sm"
              icon="i-heroicons-plus-circle"
              @click="startCreate"
            >
              カスタムプロンプトを追加
            </UButton>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <UButton variant="soft" @click="isOpen = false">閉じる</UButton>
      </div>
    </template>


  </UModal>
</template>

<script setup lang="ts">
interface Props {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'prompt-updated': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const { success: toastSuccess, error: toastError } = useCustomToast()

const masterPrompts = ref<any[]>([])
const customPrompts = ref<any[]>([])
const expandedPrompts = ref<Record<string, boolean>>({})
const editingPromptId = ref<number | null>(null) // null: 新規作成モード, number: 編集モード
const showCreateForm = ref(false)
const saving = ref(false)
const editForm = ref({
  name: '',
  prompt: '',
})

// プロンプト一覧を取得
const fetchPrompts = async () => {
  try {
    const response = await $fetch<{
      success: boolean
      data: { master: any[]; custom: any[] }
    }>('/api/admin/editorjs-prompts', {
      credentials: 'include',
    })

    if (response.success) {
      masterPrompts.value = response.data.master
      customPrompts.value = response.data.custom
    }
  } catch (error) {
    console.error('プロンプト取得エラー:', error)
    toastError('プロンプトの取得に失敗しました')
  }
}

// プロンプトの展開/折りたたみを切り替え
const togglePrompt = (promptKey: string) => {
  expandedPrompts.value[promptKey] = !expandedPrompts.value[promptKey]
}

// 新規作成を開始
const startCreate = () => {
  editingPromptId.value = null
  showCreateForm.value = true
  editForm.value = {
    name: '',
    prompt: '',
  }
}

// 編集を開始
const startEdit = (prompt: any) => {
  editingPromptId.value = prompt.id
  editForm.value = {
    name: prompt.name,
    prompt: prompt.prompt,
  }
}

// 作成をキャンセル
const cancelCreate = () => {
  showCreateForm.value = false
  editForm.value = {
    name: '',
    prompt: '',
  }
}

// 編集をキャンセル
const cancelEdit = () => {
  editingPromptId.value = null
  editForm.value = {
    name: '',
    prompt: '',
  }
}

// プロンプトを保存
const savePrompt = async () => {
  if (!editForm.value.name.trim() || !editForm.value.prompt.trim()) {
    toastError('プロンプト名と内容を入力してください')
    return
  }

  saving.value = true
  try {
    if (editingPromptId.value !== null) {
      // 更新
      await $fetch(`/api/admin/editorjs-prompts/custom/${editingPromptId.value}`, {
        method: 'PUT',
        body: {
          name: editForm.value.name.trim(),
          prompt: editForm.value.prompt.trim(),
        },
        credentials: 'include',
      })
      toastSuccess('カスタムプロンプトを更新しました')
      editingPromptId.value = null
    } else {
      // 作成
      await $fetch('/api/admin/editorjs-prompts/custom', {
        method: 'POST',
        body: {
          name: editForm.value.name.trim(),
          prompt: editForm.value.prompt.trim(),
        },
        credentials: 'include',
      })
      toastSuccess('カスタムプロンプトを追加しました')
      showCreateForm.value = false
    }
    editForm.value = {
      name: '',
      prompt: '',
    }
    await fetchPrompts()
    emit('prompt-updated')
  } catch (error: any) {
    console.error('プロンプト保存エラー:', error)
    toastError(error.data?.message || 'プロンプトの保存に失敗しました')
  } finally {
    saving.value = false
  }
}

// プロンプトを削除
const deletePrompt = async (id: number) => {
  if (!confirm('このカスタムプロンプトを削除しますか？')) {
    return
  }

  try {
    await $fetch(`/api/admin/editorjs-prompts/custom/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    toastSuccess('カスタムプロンプトを削除しました')
    await fetchPrompts()
    emit('prompt-updated')
  } catch (error: any) {
    console.error('プロンプト削除エラー:', error)
    toastError(error.data?.message || 'プロンプトの削除に失敗しました')
  }
}

// モーダルが開かれたときにプロンプトを取得
watch(isOpen, (open) => {
  if (open) {
    fetchPrompts()
  }
})
</script>

