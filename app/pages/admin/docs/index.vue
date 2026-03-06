<template>
  <div class="container mx-auto p-6 max-w-4xl">
    <div class="mb-6">
      <h1 class="text-xl font-bold">マニュアル</h1>
    </div>

    <UAccordion
      :items="accordionItems"
      :unmount-on-hide="false"
      :ui="{ trigger: 'text-base py-4', body: 'text-sm pb-4' }"
    >
      <template #events>
        <div class="space-y-10">
          <!-- イベントとフォームの関係図 -->
          <section>
            <h3
              class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"
            >
              <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5" />
              イベントとフォームの関係図
            </h3>
            <p class="text-gray-600 mt-2">
              イベントとフォームの関係性を理解し、参加申し込みの仕組みを把握しましょう。
            </p>
            <div class="overflow-x-auto py-4">
              <div
                class="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 min-w-max"
              >
                <div
                  class="flex flex-col items-center p-6 rounded-xl border-2 border-primary-200 bg-primary-50/50 min-w-[200px]"
                >
                  <UIcon
                    name="i-heroicons-document-text"
                    class="w-12 h-12 text-primary-600 mb-2"
                  />
                  <span class="font-bold text-primary-800">フォーム</span>
                  <span class="text-sm text-gray-600 mt-1"
                    >フォーム管理で作成</span
                  >
                  <span class="text-xs text-gray-500 mt-2">申込項目の定義</span>
                </div>
                <div class="flex flex-col items-center gap-1">
                  <UIcon
                    name="i-heroicons-arrow-right"
                    class="w-8 h-8 text-gray-400 rotate-90 md:rotate-0"
                  />
                  <span class="text-xs text-gray-500">紐付け</span>
                </div>
                <div
                  class="flex flex-col items-center p-6 rounded-xl border-2 border-amber-200 bg-amber-50/50 min-w-[200px]"
                >
                  <UIcon
                    name="i-heroicons-calendar"
                    class="w-12 h-12 text-amber-600 mb-2"
                  />
                  <span class="font-bold text-amber-800">イベント</span>
                  <span class="text-sm text-gray-600 mt-1"
                    >イベント管理で作成</span
                  >
                  <span class="text-xs text-gray-500 mt-2"
                    >申込フォームを選択</span
                  >
                </div>
                <div class="flex flex-col items-center gap-1">
                  <UIcon
                    name="i-heroicons-arrow-right"
                    class="w-8 h-8 text-gray-400 rotate-90 md:rotate-0"
                  />
                  <span class="text-xs text-gray-500">参加申し込み</span>
                </div>
                <div
                  class="flex flex-col items-center p-6 rounded-xl border-2 border-gray-200 bg-gray-50 min-w-[200px]"
                >
                  <UIcon
                    name="i-heroicons-user-group"
                    class="w-12 h-12 text-gray-600 mb-2"
                  />
                  <span class="font-bold text-gray-800">参加者</span>
                  <span class="text-sm text-gray-600 mt-1"
                    >イベント詳細の「参加申し込み」</span
                  >
                  <span class="text-xs text-gray-500 mt-2">フォーム回答</span>
                </div>
              </div>
            </div>
            <div class="mt-6 p-4 bg-gray-50 rounded-lg">
              <p class="text-sm font-medium text-gray-900 mb-2">ポイント</p>
              <ul class="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>1つのフォームは複数のイベントで再利用できます</li>
                <li>
                  1つのイベントには1つのフォーム（または外部リンク）を指定
                </li>
                <li>フォームは先に作成し、イベント作成時に選択します</li>
              </ul>
            </div>
          </section>

          <!-- イベント開催の操作フロー -->
          <section>
            <h3
              class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"
            >
              <UIcon name="i-heroicons-arrow-path" class="w-5 h-5" />
              イベント開催の操作フロー
            </h3>
            <ol class="space-y-4">
              <li class="flex gap-4">
                <span
                  class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm"
                  >1</span
                >
                <div>
                  <p class="font-medium text-gray-900">フォームを作成</p>
                  <p class="text-sm text-gray-600 mt-1">
                    <NuxtLink
                      to="/admin/forms/create"
                      class="text-primary-600 hover:underline"
                      >フォーム管理 → 新規作成</NuxtLink
                    >
                    で、申込項目（名前・メール・連絡先など）を設定します。
                  </p>
                </div>
              </li>
              <li class="flex gap-4">
                <span
                  class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm"
                  >2</span
                >
                <div>
                  <p class="font-medium text-gray-900">
                    イベントを作成し、フォームを紐付け
                  </p>
                  <p class="text-sm text-gray-600 mt-1">
                    <NuxtLink
                      to="/admin/events/create"
                      class="text-primary-600 hover:underline"
                      >イベント管理 → 新規作成</NuxtLink
                    >
                    で、イベント情報を入力し、作成したフォームを選択します。外部フォーム（Googleフォーム等）を使う場合は「外部フォームを使う」をONにし、URLを入力します。
                  </p>
                </div>
              </li>
              <li class="flex gap-4">
                <span
                  class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm"
                  >3</span
                >
                <div>
                  <p class="font-medium text-gray-900">イベントを公開</p>
                  <p class="text-sm text-gray-600 mt-1">
                    「表示する」に設定し、公開期間を設定すると、トップページやイベント一覧に表示されます。
                  </p>
                </div>
              </li>
              <li class="flex gap-4">
                <span
                  class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm"
                  >4</span
                >
                <div>
                  <p class="font-medium text-gray-900">申込を確認・承認</p>
                  <p class="text-sm text-gray-600 mt-1">
                    参加者が「参加申し込み」ボタンからフォームを送信すると、フォームの「回答」画面に記録されます。手動承認の場合は、承認・却下の操作を実施してください。
                  </p>
                </div>
              </li>
            </ol>
          </section>

          <!-- イベント内容（AIによる自動生成） -->
          <section>
            <h3
              class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"
            >
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              イベント内容（AIによる自動生成）
            </h3>
            <div class="space-y-4">
              <p class="text-sm text-gray-600">
                イベント作成・編集画面では、AIを使ってイベント記事（本文）を自動生成できます。イベントの基本情報を入力するだけで、読みやすい記事形式に整形されます。
              </p>
              <div>
                <h4 class="font-medium text-gray-900 mb-2">プロンプト選択</h4>
                <p class="text-sm text-gray-600 mb-2">
                  生成時の文章スタイルは「プロンプト」で制御します。プロンプトを選ぶことで、記事の構成やトーンを変えられます。
                </p>
                <ul
                  class="text-sm text-gray-600 space-y-1 list-disc list-inside"
                >
                  <li>
                    <strong>デフォルトプロンプト</strong
                    >：システムで用意された標準プロンプト（例：標準プロンプト）
                  </li>
                  <li>
                    <strong>カスタムプロンプト</strong
                    >：自分で作成したプロンプト。ワークショップ向け・交流会向けなど、用途別に切り替え可能
                  </li>
                </ul>
                <p class="text-sm text-gray-600 mt-2">
                  「編集」ボタンからプロンプト管理モーダルを開き、カスタムプロンプトの追加・編集・削除ができます。
                </p>
              </div>
              <div>
                <h4 class="font-medium text-gray-900 mb-2">
                  イベント内容の入力方法
                </h4>
                <p class="text-sm text-gray-600 mb-2">
                  テキストエリアに、イベントの情報を自由な形式で入力します。以下のような項目を入れると、より正確な記事が生成されます。
                </p>
                <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p class="text-sm font-medium text-gray-900">入力例</p>
                  <pre
                    class="text-sm text-gray-600 whitespace-pre-wrap font-sans"
                  >
イベント名：地域おこしフェスティバル
日時：2024年3月15日 10:00-16:00
場所：市民会館
内容：地域の特産品の販売やワークショップを行います。</pre
                  >
                </div>
                <p class="text-sm text-gray-600 mt-2">
                  「イベント内容を自動生成」ボタンをクリックすると、AIが記事を生成します。プレビューが表示されるので、内容を確認して「反映する」で本文に反映するか、「キャンセル」で破棄できます。反映後も、Editor上で手動で編集できます。
                </p>
              </div>
            </div>
          </section>

          <!-- イベントに紐付けられるフォームの種類 -->
          <section>
            <h3
              class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"
            >
              <UIcon name="i-heroicons-link" class="w-5 h-5" />
              イベントに紐付けられるフォームの種類
            </h3>
            <div class="space-y-4">
              <div
                class="p-4 border-2 border-primary-200 rounded-lg bg-primary-50/30"
              >
                <p class="font-medium text-primary-900">NasuNestフォーム</p>
                <p class="text-sm text-gray-600 mt-1">
                  フォーム管理で作成したフォームを選択します。申込はNasuNest内で管理され、LINE連携で通知を受け取れます。回答はフォーム詳細の「回答」タブで確認できます。
                </p>
              </div>
              <div class="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                <p class="font-medium text-gray-900">外部フォーム</p>
                <p class="text-sm text-gray-600 mt-1">
                  GoogleフォームやTypeformなどのURLを入力します。「参加申し込み」ボタンをクリックすると、指定したURLが別タブで開きます。申込は外部サービスで管理されます。
                </p>
              </div>
              <div class="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                <p class="font-medium text-gray-900">フォームなし</p>
                <p class="text-sm text-gray-600 mt-1">
                  フォームを選択しない場合、参加申し込みボタンは表示されません。イベント情報の閲覧のみの用途に適しています。
                </p>
              </div>
            </div>
          </section>

          <!-- 各画面へのリンク -->
          <section>
            <h3
              class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"
            >
              <UIcon
                name="i-heroicons-arrow-top-right-on-square"
                class="w-5 h-5"
              />
              各画面へのリンク
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NuxtLink
                to="/admin/forms"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
              >
                <UIcon
                  name="i-heroicons-document-text"
                  class="w-8 h-8 text-primary-600"
                />
                <div>
                  <p class="font-medium text-gray-900">フォーム管理</p>
                  <p class="text-sm text-gray-600">
                    フォームの作成・編集・回答確認
                  </p>
                </div>
              </NuxtLink>
              <NuxtLink
                to="/admin/events"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
              >
                <UIcon
                  name="i-heroicons-calendar"
                  class="w-8 h-8 text-primary-600"
                />
                <div>
                  <p class="font-medium text-gray-900">イベント管理</p>
                  <p class="text-sm text-gray-600">
                    イベントの作成・編集・公開設定
                  </p>
                </div>
              </NuxtLink>
              <NuxtLink
                to="/admin/settings"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
              >
                <UIcon
                  name="i-heroicons-cog-6-tooth"
                  class="w-8 h-8 text-primary-600"
                />
                <div>
                  <p class="font-medium text-gray-900">設定</p>
                  <p class="text-sm text-gray-600">
                    LINE連携（申込通知の受け取り）
                  </p>
                </div>
              </NuxtLink>
            </div>
          </section>
        </div>
      </template>
    </UAccordion>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

useHead({
  title: 'イベント・フォーム マニュアル | 管理者画面',
})

const accordionItems = [
  {
    label: 'イベントについて',
    icon: 'i-heroicons-calendar',
    value: 'events',
    slot: 'events' as const,
  },
]
</script>
