import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import type { Bindings } from './types';
import api from './routes/api';

const app = new Hono<{ Bindings: Bindings }>();

// CORS設定
app.use('/api/*', cors());

// 静的ファイル配信
app.use('/static/*', serveStatic({ root: './public' }));

// APIルート
app.route('/api', api);

// メインページ
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>服薬情報提供書作成支援システム | 循環器病エキスパートアドバイザー</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
      @media print {
        .no-print { display: none !important; }
        .print-only { display: block !important; }
        body { background: white; }
      }
      .print-only { display: none; }
      .phase { border-left: 4px solid #3b82f6; }
      .phase.active { background: #eff6ff; border-left-color: #2563eb; }
      .phase.completed { border-left-color: #10b981; }
    </style>
</head>
<body class="bg-gray-50">
    <!-- ヘッダー -->
    <header class="no-print bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div class="container mx-auto px-4 py-6">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold flex items-center">
                        <i class="fas fa-heartbeat mr-3"></i>
                        服薬情報提供書作成支援システム
                    </h1>
                    <p class="text-blue-100 mt-2">循環器病エキスパートアドバイザー向け</p>
                </div>
                <div class="text-right">
                    <button id="saveBtn" class="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition mr-2">
                        <i class="fas fa-save mr-2"></i>一時保存
                    </button>
                    <button id="loadBtn" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400 transition">
                        <i class="fas fa-folder-open mr-2"></i>読込
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- メインコンテンツ -->
    <main class="container mx-auto px-4 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <!-- サイドバー：フェーズナビゲーション -->
            <aside class="no-print lg:col-span-1">
                <div class="bg-white rounded-lg shadow-md p-6 sticky top-4">
                    <h2 class="text-lg font-bold mb-4 text-gray-800">
                        <i class="fas fa-list-check mr-2"></i>入力フェーズ
                    </h2>
                    <nav>
                        <button class="phase-nav w-full text-left p-3 mb-2 rounded hover:bg-gray-50 transition phase active" data-phase="1">
                            <span class="font-semibold">Phase 1</span><br>
                            <span class="text-sm text-gray-600">基本情報</span>
                        </button>
                        <button class="phase-nav w-full text-left p-3 mb-2 rounded hover:bg-gray-50 transition phase" data-phase="2">
                            <span class="font-semibold">Phase 2</span><br>
                            <span class="text-sm text-gray-600">服薬状況</span>
                        </button>
                        <button class="phase-nav w-full text-left p-3 mb-2 rounded hover:bg-gray-50 transition phase" data-phase="3">
                            <span class="font-semibold">Phase 3</span><br>
                            <span class="text-sm text-gray-600">臨床評価</span>
                        </button>
                        <button class="phase-nav w-full text-left p-3 mb-2 rounded hover:bg-gray-50 transition phase" data-phase="4">
                            <span class="font-semibold">Phase 4</span><br>
                            <span class="text-sm text-gray-600">薬剤師見解</span>
                        </button>
                        <button class="phase-nav w-full text-left p-3 mb-2 rounded hover:bg-gray-50 transition phase" data-phase="5">
                            <span class="font-semibold">Preview</span><br>
                            <span class="text-sm text-gray-600">確認・印刷</span>
                        </button>
                    </nav>
                </div>
            </aside>

            <!-- メインフォームエリア -->
            <div class="lg:col-span-3">
                <div id="formContainer" class="bg-white rounded-lg shadow-md p-8">
                    <!-- Phase 1: 基本情報 -->
                    <div id="phase1" class="phase-content">
                        <h2 class="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
                            <i class="fas fa-user-circle mr-2 text-blue-600"></i>
                            Phase 1: 基本情報の確認
                        </h2>

                        <!-- 患者情報 -->
                        <div class="mb-8">
                            <h3 class="text-xl font-semibold mb-4 text-gray-700">患者情報</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">年齢</label>
                                    <input type="number" id="patientAge" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: 65">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">性別</label>
                                    <select id="patientGender" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="">選択してください</option>
                                        <option value="male">男性</option>
                                        <option value="female">女性</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mt-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">アレルギー歴・副作用歴</label>
                                <textarea id="patientAllergies" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: ペニシリン系抗生物質でアナフィラキシー"></textarea>
                            </div>
                        </div>

                        <!-- 提出先情報 -->
                        <div class="mb-8">
                            <h3 class="text-xl font-semibold mb-4 text-gray-700">提出先情報</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">医療機関名 <span class="text-red-500">*</span></label>
                                    <input type="text" id="hospitalName" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: ○○総合病院">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">診療科</label>
                                    <input type="text" id="department" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: 循環器内科">
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">担当医師名</label>
                                    <input type="text" id="doctorName" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: ○○先生">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">提供目的 <span class="text-red-500">*</span></label>
                                    <select id="purpose" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="">選択してください</option>
                                        <option value="入院時情報提供">入院時情報提供</option>
                                        <option value="処方提案">処方提案</option>
                                        <option value="副作用報告">副作用報告</option>
                                        <option value="トレーシングレポート">トレーシングレポート</option>
                                        <option value="その他">その他</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- 薬局情報 -->
                        <div class="mb-8">
                            <h3 class="text-xl font-semibold mb-4 text-gray-700">薬局・薬剤師情報</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">薬局名 <span class="text-red-500">*</span></label>
                                    <input type="text" id="pharmacyName" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: ○○薬局">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">薬剤師名 <span class="text-red-500">*</span></label>
                                    <input type="text" id="pharmacistName" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: 薬剤師 ○○">
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">電話番号</label>
                                    <input type="tel" id="pharmacyPhone" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: 03-1234-5678">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">FAX番号</label>
                                    <input type="tel" id="pharmacyFax" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: 03-1234-5679">
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end">
                            <button class="next-phase bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition" data-next="2">
                                次へ：服薬状況の聴取 <i class="fas fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Phase 2: 服薬状況 -->
                    <div id="phase2" class="phase-content hidden">
                        <h2 class="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
                            <i class="fas fa-pills mr-2 text-blue-600"></i>
                            Phase 2: 服薬状況の詳細聴取
                        </h2>

                        <!-- 処方内容 -->
                        <div class="mb-8">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-xl font-semibold text-gray-700">現在の処方内容</h3>
                                <button id="addMedicationBtn" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                                    <i class="fas fa-plus mr-2"></i>薬剤を追加
                                </button>
                            </div>
                            <div id="medicationList" class="space-y-4">
                                <!-- 薬剤入力フォームが動的に追加される -->
                            </div>
                        </div>

                        <!-- 服薬アドヒアランス -->
                        <div class="mb-8">
                            <h3 class="text-xl font-semibold mb-4 text-gray-700">服薬アドヒアランス評価</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">飲み忘れの頻度・パターン</label>
                                    <select id="missedFrequency" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="">選択してください</option>
                                        <option value="なし">なし（毎日確実に服用）</option>
                                        <option value="まれ（月1-2回）">まれ（月1-2回）</option>
                                        <option value="時々（週1-2回）">時々（週1-2回）</option>
                                        <option value="頻繁（週3回以上）">頻繁（週3回以上）</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">自己調整の有無</label>
                                    <textarea id="selfAdjustment" rows="2" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: 血圧が下がりすぎると感じた時は自己判断で半錠に減量"></textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">残薬状況</label>
                                    <textarea id="remainingMedication" rows="2" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: 約14日分の残薬あり"></textarea>
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-between">
                            <button class="prev-phase bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition" data-prev="1">
                                <i class="fas fa-arrow-left mr-2"></i>前へ
                            </button>
                            <button class="next-phase bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition" data-next="3">
                                次へ：臨床的評価 <i class="fas fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Phase 3: 臨床評価 -->
                    <div id="phase3" class="phase-content hidden">
                        <h2 class="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
                            <i class="fas fa-chart-line mr-2 text-blue-600"></i>
                            Phase 3: 臨床的評価
                        </h2>

                        <!-- 薬効評価 -->
                        <div class="mb-8">
                            <h3 class="text-xl font-semibold mb-4 text-gray-700">薬効評価</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">症状改善の程度</label>
                                    <textarea id="symptomImprovement" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: 息切れ症状が軽減し、日常生活動作が改善"></textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">患者の主観的評価</label>
                                    <textarea id="patientSubjective" rows="2" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: 以前より体調が良い、足のむくみが減った"></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- バイタルデータ -->
                        <div class="mb-8">
                            <h3 class="text-xl font-semibold mb-4 text-gray-700">バイタルデータ・検査値</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">血圧（mmHg）</label>
                                    <input type="text" id="bloodPressure" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: 132/78">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">心拍数（bpm）</label>
                                    <input type="text" id="heartRate" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: 68">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">体重（kg）</label>
                                    <input type="text" id="weight" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: 65.2">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">血糖値（mg/dL）</label>
                                    <input type="text" id="bloodGlucose" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: 124">
                                </div>
                            </div>
                            <div class="mt-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">その他の検査値・メモ</label>
                                <textarea id="otherVitals" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: eGFR 58 mL/min/1.73m², BNP 145 pg/mL"></textarea>
                            </div>
                        </div>

                        <!-- 副作用・有害事象 -->
                        <div class="mb-8">
                            <h3 class="text-xl font-semibold mb-4 text-gray-700">副作用・有害事象</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">疑われる症状の詳細</label>
                                    <textarea id="suspectedSymptoms" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: 服用後に空咳が出現、夜間に増悪"></textarea>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">発現時期</label>
                                        <input type="text" id="onsetTiming" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: 服用開始2週間後">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">重症度</label>
                                        <select id="adverseSeverity" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                            <option value="">選択してください</option>
                                            <option value="mild">軽度</option>
                                            <option value="moderate">中等度</option>
                                            <option value="severe">重度</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">因果関係の薬剤師判断</label>
                                    <textarea id="causality" rows="2" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: ACE阻害薬による空咳の可能性が高い（時間的関係、既知の副作用）"></textarea>
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-between">
                            <button class="prev-phase bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition" data-prev="2">
                                <i class="fas fa-arrow-left mr-2"></i>前へ
                            </button>
                            <button class="next-phase bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition" data-next="4">
                                次へ：薬剤師見解 <i class="fas fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Phase 4: 薬剤師の専門的見解 -->
                    <div id="phase4" class="phase-content hidden">
                        <h2 class="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
                            <i class="fas fa-user-md mr-2 text-blue-600"></i>
                            Phase 4: 薬剤師の専門的見解
                        </h2>

                        <!-- 相互作用チェック結果 -->
                        <div id="interactionResults" class="mb-8">
                            <h3 class="text-xl font-semibold mb-4 text-gray-700">
                                <i class="fas fa-exclamation-triangle mr-2 text-yellow-500"></i>
                                薬剤相互作用チェック
                            </h3>
                            <div id="interactionList" class="space-y-3">
                                <!-- 相互作用チェック結果が動的に表示される -->
                            </div>
                        </div>

                        <!-- 薬学的問題点 -->
                        <div class="mb-8">
                            <h3 class="text-xl font-semibold mb-4 text-gray-700">薬学的問題点の抽出</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">重複投薬の有無</label>
                                    <textarea id="duplicateTherapy" rows="2" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: 同効薬の重複なし"></textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">PIMs（高齢者に不適切な薬剤）の該当</label>
                                    <textarea id="pimsConcern" rows="2" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: 該当なし / ベンゾジアゼピン系睡眠薬の長期使用"></textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">用量の適切性</label>
                                    <textarea id="doseAppropriateness" rows="2" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: 腎機能（eGFR 58）を考慮すると適切な用量範囲"></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- 提案事項 -->
                        <div class="mb-8">
                            <h3 class="text-xl font-semibold mb-4 text-gray-700">提案事項</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">処方変更の提案</label>
                                    <textarea id="prescriptionProposal" rows="4" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: ACE阻害薬による空咳が疑われるため、ARBへの変更を提案"></textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">服薬支援の方策</label>
                                    <textarea id="medicationSupport" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: 一包化調剤、お薬カレンダーの活用"></textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">フォローアップ計画</label>
                                    <textarea id="followUpPlan" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: 2週間後に電話で症状確認、1ヶ月後に薬局来局時に再評価"></textarea>
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-between">
                            <button class="prev-phase bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition" data-prev="3">
                                <i class="fas fa-arrow-left mr-2"></i>前へ
                            </button>
                            <button id="generatePreviewBtn" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
                                プレビュー生成 <i class="fas fa-eye ml-2"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Phase 5: プレビュー・印刷 -->
                    <div id="phase5" class="phase-content hidden">
                        <div class="no-print mb-6 flex justify-between items-center">
                            <h2 class="text-2xl font-bold text-gray-800">
                                <i class="fas fa-file-alt mr-2 text-blue-600"></i>
                                服薬情報提供書プレビュー
                            </h2>
                            <div>
                                <button class="prev-phase bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition mr-2" data-prev="4">
                                    <i class="fas fa-arrow-left mr-2"></i>編集に戻る
                                </button>
                                <button onclick="window.print()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                                    <i class="fas fa-print mr-2"></i>印刷
                                </button>
                            </div>
                        </div>
                        
                        <div id="reportPreview" class="bg-white border-2 border-gray-300 p-8">
                            <!-- 生成された提供書がここに表示される -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- フッター -->
    <footer class="no-print bg-gray-800 text-white py-6 mt-12">
        <div class="container mx-auto px-4 text-center">
            <p>&copy; 2025 循環器病エキスパートアドバイザー向け服薬情報提供書作成支援システム</p>
            <p class="text-sm text-gray-400 mt-2">このシステムは薬剤師の業務を支援するものであり、最終的な判断は専門家が行ってください。</p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="/static/app.js"></script>
</body>
</html>
  `);
});

export default app;
