<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse">
      <tbody>
        <tr
          v-for="(row, index) in rows"
          :key="index"
          class="border-b border-gray-200 last:border-b-0"
        >
          <!-- ラベルセル -->
          <td
            class="px-6 py-4 text-sm font-bold w-1/3"
            style="color: #2e5e3e; font-family: 'Kosugi Maru', sans-serif"
          >
            <slot :name="`label-${row.key}`" :row="row">
              {{ row.label }}
            </slot>
          </td>

          <!-- 値セル -->
          <td class="px-6 py-4 text-sm text-gray-900">
            <!-- 編集モード -->
            <slot
              v-if="editable"
              :name="`edit-cell-${row.key}`"
              :row="row"
              :value="row.value"
              :update="(newValue: any) => handleUpdate(row.key, newValue)"
            >
              <!-- デフォルトの編集セル（カスタムスロットがない場合） -->
              <UInput
                :model-value="row.value"
                @update:model-value="val => handleUpdate(row.key, val)"
                size="sm"
              />
            </slot>

            <!-- 表示モード -->
            <slot
              v-else
              :name="`cell-${row.key}`"
              :row="row"
              :value="row.value"
            >
              <span v-if="row.value">{{ row.value }}</span>
              <span v-else class="text-gray-400">未設定</span>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
export interface DataTableColumn {
  key: string
  label: string
  value?: string | number | null
  required?: boolean
  type?: 'text' | 'number' | 'email' | 'password' | 'date'
  placeholder?: string
  min?: number
  max?: number
}

interface Props {
  rows: DataTableColumn[]
  editable?: boolean
  modelValue?: Record<string, any>
}

interface Emits {
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'update', key: string, value: any): void
}

const props = withDefaults(defineProps<Props>(), {
  editable: false,
  modelValue: () => ({}),
})

const emit = defineEmits<Emits>()

const handleUpdate = (key: string, value: any) => {
  emit('update', key, value)
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  })
}
</script>

<style scoped>
/* テーブルスタイル */
td {
  vertical-align: middle;
}
</style>
