<template>
  <div>
    <div v-if="!readOnly" class="mb-4 space-y-4">
      <!-- イベント内容入力欄 -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <UiLabelWithHelp
            label="イベント内容（AIによる自動生成）"
            help-text="イベントの情報を入力すると、AIが自動的にイベント記事を生成します。フォーマットを使用することで、より自然で正確な記事を生成できます。"
          />
          <button
            type="button"
            @click="copyExampleFormat"
            class="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            自動生成用のフォーマットをコピー
          </button>
        </div>
        <textarea
          v-model="eventContent"
          class="w-full border rounded-lg p-3 text-sm min-h-[150px]"
          placeholder="イベントの内容を入力してください。&#10;例）&#10;イベント名：地域おこしフェスティバル&#10;日時：2024年3月15日 10:00-16:00&#10;場所：市民会館&#10;内容：地域の特産品の販売やワークショップを行います。"
        ></textarea>
        <button
          type="button"
          @click="generateJsonFromContent"
          :disabled="!eventContent.trim() || generating"
          class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
        >
          <span v-if="generating">生成中...</span>
          <span v-else>イベント内容を自動生成</span>
        </button>
        <p v-if="generateError" class="text-red-500 text-sm mt-1">
          {{ generateError }}
        </p>
      </div>
    </div>
    <div
      ref="editorContainer"
      :class="[
        readOnly
          ? 'editorjs-viewer'
          : 'border rounded-lg p-4 min-h-[400px] bg-white',
      ]"
    ></div>

    <!-- プレビューモーダル -->
    <UiPreviewModal
      v-model:open="isPreviewModalOpen"
      title="生成された記事のプレビュー"
      confirm-text="反映する"
      cancel-text="キャンセル"
      @confirm="applyGeneratedContent"
      @cancel="cancelPreview"
    >
      <div class="border rounded-lg p-4 bg-white min-h-[300px]">
        <AdminEditorJsEditor
          v-if="previewData"
          :data="previewData"
          :read-only="true"
        />
        <div v-else class="text-gray-400 text-center py-8">
          プレビューを読み込み中...
        </div>
      </div>
    </UiPreviewModal>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: any
  data?: any // EditorJsViewerとの互換性のため
  readOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  data: null,
  readOnly: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

const editorContainer = ref<HTMLDivElement | null>(null)
let editor: any = null
let updatingModel = false
const jsonInput = ref('')
const jsonError = ref('')
const eventContent = ref('')
const generating = ref(false)
const generateError = ref('')
const isPreviewModalOpen = ref(false)
const previewData = ref<any>(null)
const { success: toastSuccess, error: toastError } = useCustomToast()

// 例のフォーマットをクリップボードにコピー
const copyExampleFormat = async () => {
  const exampleFormat = `イベント名：
日時：
場所：
内容：`

  try {
    await navigator.clipboard.writeText(exampleFormat)

    toastSuccess('自動生成用のフォーマットをコピーしました')
  } catch (error) {
    toastError('自動生成用のフォーマットをコピーに失敗しました')
  }
}

// VueのProxyオブジェクトを通常のオブジェクトに変換
const toPlainObject = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj
  }
  // JSONシリアライズ/デシリアライズでProxyを解除
  return JSON.parse(JSON.stringify(obj))
}

// データを正しい形式に変換（EditorJsViewerとの互換性のため）
const parseEditorData = (data: any): any => {
  if (!data) {
    return { blocks: [] }
  }

  // 文字列の場合はパース
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data)
      // Editor.jsのデータ形式を検証
      if (
        parsed &&
        typeof parsed === 'object' &&
        Array.isArray(parsed.blocks)
      ) {
        return parsed
      }
    } catch (e) {
      console.error('Editor.js data parse error:', e)
      return { blocks: [] }
    }
  }

  // オブジェクトの場合
  if (data && typeof data === 'object') {
    // 既にEditor.jsの形式かチェック
    if (Array.isArray(data.blocks)) {
      return data
    }
  }

  return { blocks: [] }
}

// modelValueまたはdataプロパティから値を取得
const getData = () => {
  return props.modelValue || props.data
}

// JSON入力欄の値を処理
const handleJsonInput = () => {
  jsonError.value = ''
  if (!jsonInput.value.trim()) {
    emit('update:modelValue', null)
    return
  }

  try {
    const parsed = JSON.parse(jsonInput.value)
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      emit('update:modelValue', parsed)
    } else {
      jsonError.value = '無効なEditorJSデータ形式です。blocks配列が必要です。'
    }
  } catch (e: any) {
    jsonError.value = `JSONパースエラー: ${e.message}`
  }
}

// modelValueをJSON文字列に変換
const updateJsonInput = () => {
  if (props.readOnly) return

  const data = getData()
  if (data) {
    try {
      jsonInput.value = JSON.stringify(data, null, 2)
    } catch (e) {
      jsonInput.value = ''
    }
  } else {
    jsonInput.value = ''
  }
}

// イベント内容からJSONを自動生成
const generateJsonFromContent = async () => {
  if (!eventContent.value.trim()) {
    return
  }

  generating.value = true
  generateError.value = ''

  try {
    const response = await $fetch<{ success: boolean; data: any }>(
      '/api/admin/generate-editorjs',
      {
        method: 'POST',
        body: {
          content: eventContent.value,
        },
        credentials: 'include',
      }
    )

    if (response.success && response.data) {
      // 生成されたJSONをプレビューモーダルに表示
      previewData.value = response.data
      isPreviewModalOpen.value = true
      generateError.value = ''
    } else {
      generateError.value = 'JSONの生成に失敗しました'
    }
  } catch (error: any) {
    console.error('JSON生成エラー:', error)
    generateError.value =
      error.data?.message || error.message || 'JSONの生成に失敗しました'
  } finally {
    generating.value = false
  }
}

// プレビューで「反映する」をクリックしたときの処理
const applyGeneratedContent = () => {
  if (previewData.value) {
    // 生成されたJSONを適用
    emit('update:modelValue', previewData.value)
    // JSON入力欄も更新
    jsonInput.value = JSON.stringify(previewData.value, null, 2)
    toastSuccess('記事を反映しました')
  }
  isPreviewModalOpen.value = false
  previewData.value = null
}

// プレビューで「キャンセル」をクリックしたときの処理
const cancelPreview = () => {
  previewData.value = null
}

onMounted(async () => {
  if (!editorContainer.value || typeof window === 'undefined') return

  // クライアントサイドでのみEditor.jsを動的インポート
  const [
    { default: EditorJS },
    { default: Header },
    { default: List },
    { default: Paragraph },
    { default: Image },
    { default: Quote },
    { default: Code },
  ] = await Promise.all([
    import('@editorjs/editorjs'),
    import('@editorjs/header'),
    import('@editorjs/list'),
    import('@editorjs/paragraph'),
    import('@editorjs/image'),
    import('@editorjs/quote'),
    import('@editorjs/code'),
  ])

  // 初期データを通常のオブジェクトに変換
  const rawData = getData()
  const parsedData = rawData ? parseEditorData(rawData) : { blocks: [] }
  const initialData = toPlainObject(parsedData)

  // JSON入力欄を初期化
  updateJsonInput()

  editor = new EditorJS({
    holder: editorContainer.value,
    readOnly: props.readOnly,
    tools: {
      header: {
        class: Header as any,
        config: {
          placeholder: '見出しを入力',
          levels: [2, 3, 4],
          defaultLevel: 2,
        },
      },
      paragraph: {
        class: Paragraph as any,
        inlineToolbar: true,
      },
      list: {
        class: List as any,
        inlineToolbar: true,
        config: {
          defaultStyle: 'unordered',
        },
      },
      quote: {
        class: Quote as any,
        inlineToolbar: true,
        shortcut: 'CMD+SHIFT+O',
        config: {
          quotePlaceholder: '引用を入力',
          captionPlaceholder: '引用元',
        },
      },
      code: {
        class: Code as any,
        config: {
          placeholder: 'コードを入力',
        },
      },
      image: {
        class: Image as any,
        config: {
          endpoints: {
            byFile: '/api/admin/upload-image',
          },
          captionPlaceholder: '画像の説明',
        },
      },
    },
    data: initialData,
    placeholder: props.readOnly ? undefined : '本文を入力してください...',
    onChange: props.readOnly ? undefined : viewToModel,
  })
})

// view -> model
function viewToModel(api: any, event: any) {
  updatingModel = true
  editor
    .save()
    .then((outputData: any) => {
      console.log(event, 'Saving completed: ', outputData)
      emit('update:modelValue', outputData)
      // JSON入力欄も更新
      updateJsonInput()
    })
    .catch((error: any) => {
      console.log(event, 'Saving failed: ', error)
    })
    .finally(() => {
      updatingModel = false
    })
}

// model -> view
async function modelToView() {
  if (!editor) {
    return
  }

  const rawData = getData()
  if (!rawData) {
    return
  }

  // データをパースしてから通常のオブジェクトに変換
  const parsedData = parseEditorData(rawData)
  const plainData = toPlainObject(parsedData)

  try {
    await editor.render(plainData)
  } catch (error) {
    console.error('Editor.js render error:', error)
  }
}

onBeforeUnmount(() => {
  if (editor) {
    editor.destroy()
    editor = null
  }
})

watch(
  () => [props.modelValue, props.data],
  async () => {
    if (!updatingModel && editor) {
      await modelToView()
    }
    // JSON入力欄も更新（EditorJSからの更新時を除く）
    if (!updatingModel) {
      updateJsonInput()
    }
  },
  { deep: true }
)
</script>

<style scoped>
:deep(.ce-block__content) {
  max-width: 100%;
}

:deep(.ce-toolbar__content) {
  max-width: 100%;
}

:deep(.codex-editor__redactor) {
  padding-bottom: 0 !important;
}

/* EditorJSが生成するコンテンツにTailwindスタイルを適用 */
:deep(.editorjs-viewer .ce-header),
:deep(.codex-editor .ce-header) {
  font-weight: 700;
}

:deep(.editorjs-viewer h2),
:deep(.codex-editor h2) {
  font-size: 1.5rem !important;
}

:deep(.editorjs-viewer h3),
:deep(.codex-editor h3) {
  font-size: 1.25rem !important;
}

:deep(.editorjs-viewer h4),
:deep(.codex-editor h4) {
  font-size: 1.125rem !important;
}

:deep(.editorjs-viewer .ce-paragraph),
:deep(.codex-editor .ce-paragraph) {
  margin-bottom: 1rem;
}

:deep(.editorjs-viewer .ce-paragraph p),
:deep(.codex-editor .ce-paragraph p) {
  line-height: 1.75;
}

:deep(.editorjs-viewer .ce-list),
:deep(.codex-editor .ce-list) {
  margin-bottom: 1rem;
}

:deep(.editorjs-viewer .ce-list ul),
:deep(.editorjs-viewer .ce-list ol),
:deep(.codex-editor .ce-list ul),
:deep(.codex-editor .ce-list ol) {
  list-style-type: disc;
  list-style-position: inside;
  margin-left: 1rem;
}

:deep(.editorjs-viewer .ce-list ul li),
:deep(.editorjs-viewer .ce-list ol li),
:deep(.codex-editor .ce-list ul li),
:deep(.codex-editor .ce-list ol li) {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

:deep(.editorjs-viewer .ce-list ol),
:deep(.codex-editor .ce-list ol) {
  list-style-type: decimal;
}

:deep(.editorjs-viewer .ce-quote),
:deep(.codex-editor .ce-quote) {
  border-left: 4px solid #d1d5db;
  padding-left: 1rem;
  font-style: italic;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

:deep(.editorjs-viewer .ce-code),
:deep(.codex-editor .ce-code) {
  background-color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.25rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.25rem;
  overflow-x: auto;
}

:deep(.editorjs-viewer .ce-code code),
:deep(.codex-editor .ce-code code) {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

:deep(.editorjs-viewer .ce-image),
:deep(.codex-editor .ce-image) {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

:deep(.editorjs-viewer .ce-image img),
:deep(.codex-editor .ce-image img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.25rem;
}

:deep(.editorjs-viewer .ce-image__caption),
:deep(.codex-editor .ce-image__caption) {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #4b5563;
  margin-top: 0.5rem;
  text-align: center;
}

/* readOnlyモード用のスタイル */
.editorjs-viewer :deep(.ce-block__content) {
  max-width: 100%;
}

.editorjs-viewer :deep(.ce-toolbar__content) {
  max-width: 100%;
}

.editorjs-viewer :deep(.codex-editor__redactor) {
  padding-bottom: 0 !important;
}

.editorjs-viewer :deep(.codex-editor) {
  border: none;
}

.editorjs-viewer :deep(.codex-editor__redactor) {
  padding: 0;
}
</style>
