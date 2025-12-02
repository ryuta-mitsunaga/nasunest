<template>
  <div style="color: #2e5e3e">
    <UiPageTitle title="マイページ" />

    <div class="max-w-3xl mx-auto">
      <!-- 編集ボタン -->
      <div class="mb-4 flex justify-end">
        <UButton
          v-if="!isEditing"
          @click="startEdit"
          style="background-color: #2e5e3e; color: white"
        >
          編集
        </UButton>
      </div>

      <!-- 表示モード -->
      <div v-if="!isEditing" class="mb-6">
        <UiDataTable :rows="userTableRows">
          <template #cell-age="{ value }">
            <span v-if="value">{{ value }}歳</span>
            <span v-else class="text-gray-400">未設定</span>
          </template>
        </UiDataTable>
      </div>

      <!-- 編集モード -->
      <div v-else>
        <div class="mb-4 flex justify-end">
          <UButton
            type="button"
            variant="soft"
            @click="cancelEdit"
            :disabled="saving"
          >
            キャンセル
          </UButton>
          <UButton
            type="button"
            @click="handleSave"
            :loading="saving"
            :disabled="saving"
            style="background-color: #2e5e3e; color: white"
            class="ml-2"
          >
            保存
          </UButton>
        </div>

        <UiDataTable
          :rows="editTableRows"
          :editable="true"
          :model-value="editForm"
          @update="handleFieldUpdate"
        >
          <!-- 性 -->
          <template #edit-cell-name_sei="{ update, value }">
            <UInput
              :model-value="value"
              @update:model-value="update"
              placeholder="山田"
              size="lg"
            />
          </template>

          <!-- 名 -->
          <template #edit-cell-name_mei="{ update, value }">
            <UInput
              :model-value="value"
              @update:model-value="update"
              placeholder="太郎"
              size="lg"
            />
          </template>

          <!-- 表示名 -->
          <template #edit-cell-display_name="{ update, value }">
            <UInput
              :model-value="value"
              @update:model-value="update"
              placeholder="やまだ たろう"
              size="lg"
            />
          </template>

          <!-- 年齢 -->
          <template #edit-cell-age="{ update, value }">
            <UInput
              :model-value="value"
              @update:model-value="val => update(val ? Number(val) : null)"
              type="number"
              placeholder="30"
              size="lg"
              :min="0"
              :max="150"
            />
          </template>

          <!-- 郵便番号 -->
          <template #edit-cell-postal_code="{ update, value }">
            <div class="flex gap-2">
              <UInput
                :model-value="value"
                @update:model-value="update"
                @blur="handlePostalCodeBlur"
                @input="handlePostalCodeInput"
                placeholder="329-3211"
                size="lg"
                class="flex-1"
              />
              <UButton
                type="button"
                size="lg"
                :loading="postalCodeLoading"
                :disabled="!editForm.postal_code || postalCodeLoading"
                @click="searchPostalCode"
                style="background-color: #2e5e3e; color: white"
              >
                検索
              </UButton>
            </div>
          </template>

          <!-- 住所 -->
          <template #edit-cell-address="{ update, value }">
            <UInput
              :model-value="value"
              @update:model-value="update"
              placeholder="栃木県那須町..."
              size="lg"
            />
          </template>

          <!-- パスワード -->
          <template #edit-cell-password="{ update, value }">
            <UInput
              :model-value="value"
              @update:model-value="update"
              type="password"
              placeholder="8文字以上（変更する場合のみ）"
              size="lg"
            />
          </template>
        </UiDataTable>

        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          :title="error"
          class="mt-4"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DataTableColumn } from '~/components/ui/DataTable.vue'
import type { User } from '~/composables/useAuth'

const { user, loading: authLoading, logout, updateUser, fetchUser } = useAuth()
const route = useRoute()

const isEditing = ref(false)
const saving = ref(false)
const error = ref('')
const postalCodeLoading = ref(false)
let postalCodeTimeout: NodeJS.Timeout | null = null

const editForm = reactive({
  name_sei: '',
  name_mei: '',
  display_name: '',
  age: null as number | null,
  postal_code: '',
  address: '',
  password: '',
})

// テーブル行データを生成（表示用）
const userTableRows = computed<DataTableColumn[]>(() => {
  if (!user.value) return []

  return [
    {
      key: 'display_name',
      label: '表示名',
      value: user.value.display_name || null,
    },
    {
      key: 'email',
      label: 'メールアドレス',
      value: user.value.email,
    },
    {
      key: 'name',
      label: '氏名',
      value:
        user.value.name_sei || user.value.name_mei
          ? `${user.value.name_sei || ''} ${user.value.name_mei || ''}`.trim()
          : null,
    },
    {
      key: 'age',
      label: '年齢',
      value: user.value.age || null,
    },
    {
      key: 'postal_code',
      label: '郵便番号',
      value: user.value.postal_code || null,
    },
    {
      key: 'address',
      label: '住所',
      value: user.value.address || null,
    },
  ]
})

// テーブル行データを生成（編集用）
const editTableRows = computed<DataTableColumn[]>(() => {
  return [
    {
      key: 'name_sei',
      label: '性',
      value: editForm.name_sei || null,
      required: true,
    },
    {
      key: 'name_mei',
      label: '名',
      value: editForm.name_mei || null,
      required: true,
    },
    {
      key: 'display_name',
      label: '表示名',
      value: editForm.display_name || null,
      required: true,
    },
    {
      key: 'age',
      label: '年齢',
      value: editForm.age || null,
      type: 'number',
    },
    {
      key: 'postal_code',
      label: '郵便番号',
      value: editForm.postal_code || null,
    },
    {
      key: 'address',
      label: '住所',
      value: editForm.address || null,
    },
    {
      key: 'password',
      label: 'パスワード（変更する場合のみ）',
      value: editForm.password || null,
      type: 'password',
    },
  ]
})

// フィールド更新ハンドラー
const handleFieldUpdate = (key: string, value: any) => {
  ;(editForm as any)[key] = value
}

// 編集開始
const startEdit = () => {
  if (!user.value) return

  editForm.name_sei = user.value.name_sei || ''
  editForm.name_mei = user.value.name_mei || ''
  editForm.display_name = user.value.display_name || ''
  editForm.age = user.value.age || null
  editForm.postal_code = user.value.postal_code || ''
  editForm.address = user.value.address || ''
  editForm.password = ''
  error.value = ''
  isEditing.value = true
}

// 編集キャンセル
const cancelEdit = () => {
  isEditing.value = false
  error.value = ''
  editForm.password = ''
}

// 保存
const handleSave = async () => {
  // バリデーション
  if (!editForm.name_sei || !editForm.name_mei || !editForm.display_name) {
    error.value = '性、名、表示名は必須です'
    return
  }

  saving.value = true
  error.value = ''

  try {
    const updateData: {
      name_sei?: string
      name_mei?: string
      display_name?: string
      age?: number | null
      postal_code?: string | null
      address?: string | null
      password?: string
    } = {
      name_sei: editForm.name_sei || undefined,
      name_mei: editForm.name_mei || undefined,
      display_name: editForm.display_name || undefined,
      age: editForm.age || null,
      postal_code: editForm.postal_code || null,
      address: editForm.address || null,
    }

    // パスワードが入力されている場合のみ追加
    if (editForm.password) {
      if (editForm.password.length < 8) {
        error.value = 'パスワードは8文字以上で入力してください'
        saving.value = false
        return
      }
      updateData.password = editForm.password
    }

    const result = await updateUser(updateData)

    if (result.success) {
      isEditing.value = false
      editForm.password = ''
    } else {
      error.value = result.error || 'ユーザー情報の更新に失敗しました'
    }
  } catch (err: any) {
    error.value =
      err.data?.message || err.message || 'ユーザー情報の更新に失敗しました'
  } finally {
    saving.value = false
  }
}

// 郵便番号をハイフンなしの7桁に正規化
const normalizePostalCode = (code: string): string => {
  return code.replace(/-/g, '').replace(/\s/g, '')
}

// 郵便番号検索
const searchPostalCode = async () => {
  if (!editForm.postal_code) return

  postalCodeLoading.value = true
  try {
    const normalizedCode = normalizePostalCode(editForm.postal_code)
    if (normalizedCode.length !== 7) {
      error.value = '郵便番号は7桁で入力してください'
      postalCodeLoading.value = false
      return
    }

    const response = await $fetch<{
      success: boolean
      data: {
        postal_code: string
        prefecture: string
        city: string
        town: string
        address: string
      }
    }>(`/api/public/postal-code/${normalizedCode}`)

    if (response.success && response.data) {
      editForm.address = response.data.address
      // 郵便番号をハイフン付きにフォーマット（例: 329-3211）
      if (normalizedCode.length === 7) {
        editForm.postal_code = `${normalizedCode.slice(0, 3)}-${normalizedCode.slice(3)}`
      }
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || '住所の検索に失敗しました'
  } finally {
    postalCodeLoading.value = false
  }
}

// 郵便番号入力時の処理（7桁入力されたら自動検索）
const handlePostalCodeInput = () => {
  // 既存のタイマーをクリア
  if (postalCodeTimeout) {
    clearTimeout(postalCodeTimeout)
  }

  const normalizedCode = normalizePostalCode(editForm.postal_code)
  if (normalizedCode.length === 7) {
    // デバウンス処理（500ms後に検索）
    postalCodeTimeout = setTimeout(() => {
      if (normalizePostalCode(editForm.postal_code).length === 7) {
        searchPostalCode()
      }
    }, 500)
  }
}

// 郵便番号からフォーカスが外れた時の処理
const handlePostalCodeBlur = () => {
  const normalizedCode = normalizePostalCode(editForm.postal_code)
  if (normalizedCode.length === 7) {
    searchPostalCode()
  }
}

// クリーンアップ
onBeforeUnmount(() => {
  if (postalCodeTimeout) {
    clearTimeout(postalCodeTimeout)
  }
})
</script>

<style scoped>
/* カスタムスタイルは必要に応じて追加 */
</style>
