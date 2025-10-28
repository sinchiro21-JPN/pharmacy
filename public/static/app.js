// 服薬情報提供書作成支援システム - フロントエンドアプリケーション

// グローバル状態管理
const state = {
  documentType: null, // 'medication_report', 'heart_failure_followup', 'discharge_summary'
  currentPhase: 1,
  medications: [],
  interactions: [],
  formData: {
    patient: {},
    provider: {},
    pharmacy: {},
    medications: [],
    adherence: {},
    clinical: {},
    adverse: {},
    pharmaceutical: {},
    recommendations: {},
    heartFailureFollowup: {}, // 心不全フォローアップデータ
    dischargeSummary: {} // 退院時サマリーデータ
  }
};

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  initializeDocumentSelection();
  initializeEventListeners();
  loadMedicationsCache();
});

// ドキュメント選択機能の初期化
function initializeDocumentSelection() {
  const selectionScreen = document.getElementById('documentSelection');
  const workspace = document.getElementById('formWorkspace');
  
  // 服薬情報提供書選択
  document.getElementById('selectMedicationReport')?.addEventListener('click', () => {
    state.documentType = 'medication_report';
    showWorkspace();
    // 初回薬剤入力フォーム追加
    addMedicationForm();
  });
  
  // 心不全フォローアップ選択
  document.getElementById('selectHeartFailureFollowup')?.addEventListener('click', () => {
    state.documentType = 'heart_failure_followup';
    showWorkspace();
    setupHeartFailureFollowupForm();
  });
  
  // 退院時薬剤管理サマリー選択
  document.getElementById('selectDischargeSummary')?.addEventListener('click', () => {
    state.documentType = 'discharge_summary';
    showWorkspace();
    setupDischargeSummaryForm();
  });
  
  // 書類選択に戻る
  document.getElementById('backToSelection')?.addEventListener('click', () => {
    if (confirm('入力内容がクリアされますが、よろしいですか？')) {
      location.reload();
    }
  });
  
  function showWorkspace() {
    selectionScreen.classList.add('hidden');
    workspace.classList.remove('hidden');
  }
}

// イベントリスナー初期化
function initializeEventListeners() {
  // フェーズナビゲーション
  document.querySelectorAll('.phase-nav').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const phase = parseInt(e.currentTarget.dataset.phase);
      switchPhase(phase);
    });
  });

  // 次へボタン
  document.querySelectorAll('.next-phase').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const next = parseInt(e.currentTarget.dataset.next);
      if (validateCurrentPhase()) {
        saveCurrentPhaseData();
        switchPhase(next);
      }
    });
  });

  // 前へボタン
  document.querySelectorAll('.prev-phase').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const prev = parseInt(e.currentTarget.dataset.prev);
      saveCurrentPhaseData();
      switchPhase(prev);
    });
  });

  // 薬剤追加ボタン
  document.getElementById('addMedicationBtn').addEventListener('click', addMedicationForm);

  // プレビュー生成ボタン
  document.getElementById('generatePreviewBtn').addEventListener('click', () => {
    saveCurrentPhaseData();
    checkInteractionsAndGeneratePreview();
  });

  // 保存・読込ボタン
  document.getElementById('saveBtn').addEventListener('click', saveToLocalStorage);
  document.getElementById('loadBtn').addEventListener('click', loadFromLocalStorage);
}

// フェーズ切り替え
function switchPhase(phase) {
  // すべてのフェーズコンテンツを非表示
  document.querySelectorAll('.phase-content').forEach(content => {
    content.classList.add('hidden');
  });

  // ナビゲーションの状態更新
  document.querySelectorAll('.phase-nav').forEach(nav => {
    nav.classList.remove('active');
  });

  // 選択されたフェーズを表示
  const phaseContent = document.getElementById(`phase${phase}`);
  if (phaseContent) {
    phaseContent.classList.remove('hidden');
  }

  const phaseNav = document.querySelector(`.phase-nav[data-phase="${phase}"]`);
  if (phaseNav) {
    phaseNav.classList.add('active');
  }

  state.currentPhase = phase;
  
  // Phase 4に入った時に参考資料を読み込む
  if (phase === 4) {
    // FAQと患者指導資料を読み込む
    if (typeof loadFAQs === 'function') {
      loadFAQs();
    }
    if (typeof loadEducationMaterials === 'function') {
      loadEducationMaterials();
    }
  }
  
  // ページトップにスクロール
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 現在のフェーズのバリデーション
function validateCurrentPhase() {
  const phase = state.currentPhase;
  
  if (phase === 1) {
    // Phase 1: 必須項目チェック
    const hospitalName = document.getElementById('hospitalName').value.trim();
    const purpose = document.getElementById('purpose').value;
    const pharmacyName = document.getElementById('pharmacyName').value.trim();
    const pharmacistName = document.getElementById('pharmacistName').value.trim();

    if (!hospitalName || !purpose || !pharmacyName || !pharmacistName) {
      alert('必須項目（*印）を入力してください。');
      return false;
    }
  }

  if (phase === 2) {
    // Phase 2: 少なくとも1つの薬剤が入力されているか
    if (state.medications.length === 0) {
      alert('少なくとも1つの薬剤を入力してください。');
      return false;
    }
  }

  return true;
}

// 現在のフェーズのデータ保存
function saveCurrentPhaseData() {
  const phase = state.currentPhase;

  if (phase === 1) {
    // Phase 1のデータ保存
    state.formData.patient = {
      age: document.getElementById('patientAge').value,
      gender: document.getElementById('patientGender').value,
      allergies: document.getElementById('patientAllergies').value
    };

    state.formData.provider = {
      hospital_name: document.getElementById('hospitalName').value,
      department: document.getElementById('department').value,
      doctor_name: document.getElementById('doctorName').value,
      purpose: document.getElementById('purpose').value
    };

    state.formData.pharmacy = {
      pharmacy_name: document.getElementById('pharmacyName').value,
      pharmacist_name: document.getElementById('pharmacistName').value,
      phone: document.getElementById('pharmacyPhone').value,
      fax: document.getElementById('pharmacyFax').value
    };
  }

  if (phase === 2) {
    // Phase 2のデータ保存
    state.formData.medications = state.medications;
    state.formData.adherence = {
      missed_frequency: document.getElementById('missedFrequency').value,
      self_adjustment: document.getElementById('selfAdjustment').value,
      remaining_medication: document.getElementById('remainingMedication').value
    };
  }

  if (phase === 3) {
    // Phase 3のデータ保存
    state.formData.clinical = {
      symptom_improvement: document.getElementById('symptomImprovement').value,
      patient_subjective: document.getElementById('patientSubjective').value,
      vital_signs: {
        blood_pressure: document.getElementById('bloodPressure').value,
        heart_rate: document.getElementById('heartRate').value,
        weight: document.getElementById('weight').value,
        blood_glucose: document.getElementById('bloodGlucose').value,
        other: document.getElementById('otherVitals').value
      }
    };

    state.formData.adverse = {
      suspected_symptoms: document.getElementById('suspectedSymptoms').value,
      onset_timing: document.getElementById('onsetTiming').value,
      severity: document.getElementById('adverseSeverity').value,
      causality: document.getElementById('causality').value
    };
  }

  if (phase === 4) {
    // Phase 4のデータ保存
    state.formData.pharmaceutical = {
      drug_interactions: state.interactions,
      duplicate_therapy: document.getElementById('duplicateTherapy').value,
      pims_concern: document.getElementById('pimsConcern').value,
      dose_appropriateness: document.getElementById('doseAppropriateness').value
    };

    state.formData.recommendations = {
      prescription_proposal: document.getElementById('prescriptionProposal').value,
      medication_support: document.getElementById('medicationSupport').value,
      follow_up_plan: document.getElementById('followUpPlan').value
    };
  }
}

// 薬剤入力フォーム追加
function addMedicationForm() {
  const medicationList = document.getElementById('medicationList');
  const index = state.medications.length;

  const formHTML = `
    <div class="medication-form border-2 border-gray-200 rounded-lg p-4 bg-gray-50" data-index="${index}">
      <div class="flex justify-between items-center mb-4">
        <h4 class="font-semibold text-gray-700">薬剤 ${index + 1}</h4>
        <button class="remove-medication text-red-600 hover:text-red-800" data-index="${index}">
          <i class="fas fa-trash"></i> 削除
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">薬剤名検索</label>
          <input type="text" class="medication-search w-full px-4 py-2 border border-gray-300 rounded-lg" 
                 placeholder="薬剤名で検索..." data-index="${index}">
          <div class="medication-suggestions mt-2 hidden" data-index="${index}"></div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">一般名</label>
          <input type="text" class="medication-generic-name w-full px-4 py-2 border border-gray-300 rounded-lg" 
                 required data-index="${index}" placeholder="例: オルメサルタン">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">商品名</label>
          <input type="text" class="medication-brand-name w-full px-4 py-2 border border-gray-300 rounded-lg" 
                 data-index="${index}" placeholder="例: オルメテック">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">用量</label>
          <input type="text" class="medication-dose w-full px-4 py-2 border border-gray-300 rounded-lg" 
                 required data-index="${index}" placeholder="例: 20mg">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">用法</label>
          <input type="text" class="medication-frequency w-full px-4 py-2 border border-gray-300 rounded-lg" 
                 required data-index="${index}" placeholder="例: 1日1回 朝食後">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">服用期間</label>
          <input type="text" class="medication-duration w-full px-4 py-2 border border-gray-300 rounded-lg" 
                 data-index="${index}" placeholder="例: 継続中">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">処方医療機関</label>
          <input type="text" class="medication-hospital w-full px-4 py-2 border border-gray-300 rounded-lg" 
                 data-index="${index}" placeholder="例: ○○病院">
        </div>
      </div>
      
      <input type="hidden" class="medication-id" data-index="${index}">
    </div>
  `;

  medicationList.insertAdjacentHTML('beforeend', formHTML);

  // イベントリスナー追加
  const newForm = medicationList.querySelector(`[data-index="${index}"]`);
  
  // 削除ボタン
  newForm.querySelector('.remove-medication').addEventListener('click', (e) => {
    const idx = parseInt(e.currentTarget.dataset.index);
    removeMedicationForm(idx);
  });

  // 薬剤検索
  const searchInput = newForm.querySelector('.medication-search');
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length >= 2) {
      searchTimeout = setTimeout(() => searchMedications(query, index), 300);
    } else {
      hideSuggestions(index);
    }
  });

  // 薬剤追加
  state.medications.push({
    id: null,
    generic_name: '',
    brand_name: '',
    dose: '',
    frequency: '',
    duration: '',
    prescribing_hospital: ''
  });
}

// 薬剤フォーム削除
function removeMedicationForm(index) {
  const form = document.querySelector(`.medication-form[data-index="${index}"]`);
  if (form) {
    form.remove();
    state.medications.splice(index, 1);
    
    // インデックスを再割り当て
    document.querySelectorAll('.medication-form').forEach((form, i) => {
      form.dataset.index = i;
      form.querySelector('h4').textContent = `薬剤 ${i + 1}`;
    });
  }
}

// 薬剤検索
async function searchMedications(query, index) {
  try {
    const response = await axios.get(`/api/medications?q=${encodeURIComponent(query)}`);
    const medications = response.data;
    
    showSuggestions(medications, index);
  } catch (error) {
    console.error('薬剤検索エラー:', error);
  }
}

// 検索候補表示
function showSuggestions(medications, index) {
  const suggestionsDiv = document.querySelector(`.medication-suggestions[data-index="${index}"]`);
  
  if (medications.length === 0) {
    suggestionsDiv.classList.add('hidden');
    return;
  }

  const suggestionsHTML = medications.map(med => `
    <div class="suggestion-item p-2 hover:bg-blue-50 cursor-pointer border-b" data-med-id="${med.id}">
      <div class="font-semibold">${med.generic_name}</div>
      <div class="text-sm text-gray-600">${med.brand_name || ''} - ${med.drug_class}</div>
      <div class="text-xs text-gray-500">${med.indications || ''}</div>
    </div>
  `).join('');

  suggestionsDiv.innerHTML = suggestionsHTML;
  suggestionsDiv.classList.remove('hidden');

  // クリックイベント
  suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', async (e) => {
      const medId = parseInt(e.currentTarget.dataset.medId);
      await selectMedication(medId, index);
      hideSuggestions(index);
    });
  });
}

// 検索候補非表示
function hideSuggestions(index) {
  const suggestionsDiv = document.querySelector(`.medication-suggestions[data-index="${index}"]`);
  suggestionsDiv.classList.add('hidden');
}

// 薬剤選択
async function selectMedication(medId, index) {
  try {
    const response = await axios.get(`/api/medications/${medId}`);
    const medication = response.data;

    // フォームに自動入力
    document.querySelector(`.medication-id[data-index="${index}"]`).value = medication.id;
    document.querySelector(`.medication-generic-name[data-index="${index}"]`).value = medication.generic_name;
    document.querySelector(`.medication-brand-name[data-index="${index}"]`).value = medication.brand_name || '';
    document.querySelector(`.medication-dose[data-index="${index}"]`).value = medication.standard_dose || '';

    // state更新
    state.medications[index] = {
      ...state.medications[index],
      medication_id: medication.id,
      generic_name: medication.generic_name,
      brand_name: medication.brand_name
    };

    // 検索フィールドクリア
    document.querySelector(`.medication-search[data-index="${index}"]`).value = '';
  } catch (error) {
    console.error('薬剤詳細取得エラー:', error);
  }
}

// 薬剤キャッシュ読み込み（初回ロード高速化）
async function loadMedicationsCache() {
  try {
    const response = await axios.get('/api/categories');
    // カテゴリ情報をキャッシュ
    console.log('薬剤カテゴリ読み込み完了', response.data);
  } catch (error) {
    console.error('カテゴリ読み込みエラー:', error);
  }
}

// 相互作用チェックとプレビュー生成
async function checkInteractionsAndGeneratePreview() {
  // まず薬剤データを収集
  state.medications = [];
  document.querySelectorAll('.medication-form').forEach((form, index) => {
    const medication = {
      medication_id: parseInt(document.querySelector(`.medication-id[data-index="${index}"]`).value) || null,
      generic_name: document.querySelector(`.medication-generic-name[data-index="${index}"]`).value,
      brand_name: document.querySelector(`.medication-brand-name[data-index="${index}"]`).value,
      dose: document.querySelector(`.medication-dose[data-index="${index}"]`).value,
      frequency: document.querySelector(`.medication-frequency[data-index="${index}"]`).value,
      duration: document.querySelector(`.medication-duration[data-index="${index}"]`).value,
      prescribing_hospital: document.querySelector(`.medication-hospital[data-index="${index}"]`).value
    };
    state.medications.push(medication);
  });

  // 相互作用チェック
  const medicationIds = state.medications
    .filter(med => med.medication_id)
    .map(med => med.medication_id);

  if (medicationIds.length >= 2) {
    try {
      const response = await axios.post('/api/check-interactions', {
        medication_ids: medicationIds
      });
      
      state.interactions = response.data.interactions || [];
      displayInteractions();
    } catch (error) {
      console.error('相互作用チェックエラー:', error);
      state.interactions = [];
    }
  } else {
    state.interactions = [];
    displayInteractions();
  }

  // Phase 5に移動してプレビュー生成
  switchPhase(5);
  generateReportPreview();
}

// 相互作用結果表示
function displayInteractions() {
  const interactionList = document.getElementById('interactionList');

  if (state.interactions.length === 0) {
    interactionList.innerHTML = `
      <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
        <i class="fas fa-check-circle mr-2"></i>
        重大な相互作用は検出されませんでした。
      </div>
    `;
    return;
  }

  const interactionsHTML = state.interactions.map(interaction => {
    const severityClass = {
      major: 'bg-red-50 border-red-300 text-red-900',
      moderate: 'bg-yellow-50 border-yellow-300 text-yellow-900',
      minor: 'bg-blue-50 border-blue-300 text-blue-900'
    }[interaction.severity];

    const severityIcon = {
      major: 'fas fa-exclamation-triangle text-red-600',
      moderate: 'fas fa-exclamation-circle text-yellow-600',
      minor: 'fas fa-info-circle text-blue-600'
    }[interaction.severity];

    return `
      <div class="border-2 rounded-lg p-4 ${severityClass}">
        <div class="flex items-start">
          <i class="${severityIcon} mt-1 mr-3"></i>
          <div class="flex-1">
            <div class="font-bold mb-2">
              ${interaction.med_a_name} × ${interaction.med_b_name}
              <span class="ml-2 text-sm px-2 py-1 rounded bg-white bg-opacity-50">
                ${interaction.severity === 'major' ? '重大' : interaction.severity === 'moderate' ? '中等度' : '軽度'}
              </span>
            </div>
            <div class="text-sm mb-2">
              <strong>臨床的影響：</strong>${interaction.clinical_effects || '情報なし'}
            </div>
            <div class="text-sm">
              <strong>対応方法：</strong>${interaction.management || '専門家に相談してください'}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  interactionList.innerHTML = interactionsHTML;
}

// 提供書プレビュー生成
function generateReportPreview() {
  const preview = document.getElementById('reportPreview');
  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 相互作用セクション
  let interactionSection = '';
  if (state.interactions.length > 0) {
    const interactionItems = state.interactions.map(int => 
      `<li><strong>${int.med_a_name} × ${int.med_b_name}</strong> (${int.severity === 'major' ? '重大' : int.severity === 'moderate' ? '中等度' : '軽度'}): ${int.clinical_effects || ''}</li>`
    ).join('');
    interactionSection = `
      <strong>検出された相互作用：</strong>
      <ul style="margin: 2px 0 0 12px; padding: 0; font-size: 9px;">${interactionItems}</ul>
    `;
  }

  const reportHTML = `
    <style>
      @page { margin: 15mm; size: A4; }
      body { font-size: 10px; line-height: 1.4; }
      .report-title { font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 6px; }
      .report-section { margin-bottom: 12px; page-break-inside: avoid; }
      .report-section h3 { font-size: 12px; font-weight: bold; background: #f0f0f0; padding: 4px 6px; margin-bottom: 6px; }
      .report-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 10px; }
      .report-table td { padding: 4px 6px; border: 1px solid #ddd; vertical-align: top; line-height: 1.4; }
      .report-table td:first-child { font-weight: bold; background: #f9f9f9; width: 28%; }
      .medication-table { width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 6px; }
      .medication-table th { background: #e0e0e0; padding: 4px; border: 1px solid #999; font-weight: bold; }
      .medication-table td { padding: 3px 4px; border: 1px solid #ddd; line-height: 1.3; }
      .medication-table small { font-size: 8px; }
      ul { margin: 4px 0; padding-left: 16px; }
      ul li { margin-bottom: 2px; line-height: 1.3; }
    </style>

    <div class="report-title">服薬情報提供書</div>

    <div class="report-section">
      <h3>提供日時・提供先</h3>
      <table class="report-table">
        <tr>
          <td>提供日</td>
          <td>${today}</td>
        </tr>
        <tr>
          <td>提供先</td>
          <td>${state.formData.provider.hospital_name || ''} ${state.formData.provider.department || ''}<br>
              ${state.formData.provider.doctor_name ? state.formData.provider.doctor_name + ' 先生' : ''}</td>
        </tr>
        <tr>
          <td>提供目的</td>
          <td>${state.formData.provider.purpose || ''}</td>
        </tr>
        <tr>
          <td>薬局・薬剤師</td>
          <td>${state.formData.pharmacy.pharmacy_name || ''}<br>
              薬剤師: ${state.formData.pharmacy.pharmacist_name || ''}<br>
              ${state.formData.pharmacy.phone ? 'TEL: ' + state.formData.pharmacy.phone : ''}
              ${state.formData.pharmacy.fax ? ' / FAX: ' + state.formData.pharmacy.fax : ''}</td>
        </tr>
      </table>
    </div>

    <div class="report-section">
      <h3>患者情報</h3>
      <table class="report-table">
        <tr>
          <td>年齢・性別</td>
          <td>${state.formData.patient.age ? state.formData.patient.age + '歳' : ''}
              ${state.formData.patient.gender === 'male' ? '男性' : state.formData.patient.gender === 'female' ? '女性' : ''}</td>
        </tr>
        <tr>
          <td>アレルギー歴・副作用歴</td>
          <td>${state.formData.patient.allergies || 'なし'}</td>
        </tr>
      </table>
    </div>

    <div class="report-section">
      <h3>現在の服薬状況</h3>
      <table class="medication-table">
        <thead>
          <tr>
            <th>薬剤名</th>
            <th>用量</th>
            <th>用法</th>
            <th>服用期間</th>
            <th>処方医療機関</th>
          </tr>
        </thead>
        <tbody>
          ${state.medications.map(med => `
            <tr>
              <td>${med.generic_name}${med.brand_name ? '<br><small>(' + med.brand_name + ')</small>' : ''}</td>
              <td>${med.dose}</td>
              <td>${med.frequency}</td>
              <td>${med.duration || '-'}</td>
              <td>${med.prescribing_hospital || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="report-section">
      <h3>服薬アドヒアランス評価</h3>
      <table class="report-table">
        <tr>
          <td>飲み忘れの頻度</td>
          <td>${state.formData.adherence.missed_frequency || 'データなし'}</td>
        </tr>
        <tr>
          <td>自己調整の有無</td>
          <td>${state.formData.adherence.self_adjustment || 'なし'}</td>
        </tr>
        <tr>
          <td>残薬状況</td>
          <td>${state.formData.adherence.remaining_medication || 'データなし'}</td>
        </tr>
      </table>
    </div>

    <div class="report-section">
      <h3>薬効・副作用評価</h3>
      <table class="report-table">
        <tr>
          <td>症状改善の程度</td>
          <td>${state.formData.clinical.symptom_improvement || 'データなし'}</td>
        </tr>
        <tr>
          <td>患者の主観的評価</td>
          <td>${state.formData.clinical.patient_subjective || 'データなし'}</td>
        </tr>
        <tr>
          <td>バイタルサイン</td>
          <td>
            血圧:${state.formData.clinical.vital_signs?.blood_pressure || '-'}mmHg / 
            心拍数:${state.formData.clinical.vital_signs?.heart_rate || '-'}bpm / 
            体重:${state.formData.clinical.vital_signs?.weight || '-'}kg / 
            血糖値:${state.formData.clinical.vital_signs?.blood_glucose || '-'}mg/dL
            ${state.formData.clinical.vital_signs?.other ? ' / その他: ' + state.formData.clinical.vital_signs.other : ''}
          </td>
        </tr>
        ${state.formData.adverse.suspected_symptoms ? `
        <tr>
          <td>副作用・有害事象</td>
          <td>
            症状:${state.formData.adverse.suspected_symptoms} / 
            発現:${state.formData.adverse.onset_timing || '-'} / 
            重症度:${state.formData.adverse.severity === 'mild' ? '軽度' : state.formData.adverse.severity === 'moderate' ? '中等度' : state.formData.adverse.severity === 'severe' ? '重度' : '-'} / 
            因果関係:${state.formData.adverse.causality || '-'}
          </td>
        </tr>
        ` : ''}
      </table>
    </div>

    <div class="report-section">
      <h3>薬学的問題点</h3>
      <table class="report-table">
        ${interactionSection ? `<tr><td>相互作用</td><td>${interactionSection}</td></tr>` : ''}
        <tr>
          <td>重複投薬</td>
          <td>${state.formData.pharmaceutical.duplicate_therapy || '該当なし'}</td>
        </tr>
        <tr>
          <td>PIMs（高齢者不適切薬剤）</td>
          <td>${state.formData.pharmaceutical.pims_concern || '該当なし'}</td>
        </tr>
        <tr>
          <td>用量の適切性</td>
          <td>${state.formData.pharmaceutical.dose_appropriateness || 'データなし'}</td>
        </tr>
      </table>
    </div>

    <div class="report-section">
      <h3>薬剤師所見・提案事項</h3>
      <table class="report-table">
        ${state.formData.recommendations.prescription_proposal ? `
        <tr>
          <td>処方変更の提案</td>
          <td>${state.formData.recommendations.prescription_proposal}</td>
        </tr>
        ` : ''}
        ${state.formData.recommendations.medication_support ? `
        <tr>
          <td>服薬支援の方策</td>
          <td>${state.formData.recommendations.medication_support}</td>
        </tr>
        ` : ''}
        ${state.formData.recommendations.follow_up_plan ? `
        <tr>
          <td>フォローアップ計画</td>
          <td>${state.formData.recommendations.follow_up_plan}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <div class="report-section" style="margin-top: 10px; font-size: 8px; color: #666;">
      <p style="margin: 0 0 4px 0;"><strong>注意事項：</strong></p>
      <ul style="margin: 0; padding-left: 16px;">
        <li style="margin-bottom: 2px;">本情報提供書は薬剤師の専門的見解に基づくものですが、最終的な処方判断は医師が行ってください。</li>
        <li>ご不明な点がございましたら、上記連絡先までお問い合わせください。</li>
      </ul>
    </div>
  `;

  preview.innerHTML = reportHTML;
}

// LocalStorageに保存
function saveToLocalStorage() {
  saveCurrentPhaseData();
  
  const saveData = {
    formData: state.formData,
    medications: state.medications,
    savedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem('medicationReport', JSON.stringify(saveData));
    alert('データを一時保存しました。');
  } catch (error) {
    console.error('保存エラー:', error);
    alert('データの保存に失敗しました。');
  }
}

// LocalStorageから読み込み
function loadFromLocalStorage() {
  try {
    const savedData = localStorage.getItem('medicationReport');
    if (!savedData) {
      alert('保存されたデータがありません。');
      return;
    }

    const data = JSON.parse(savedData);
    
    if (confirm(`保存日時: ${new Date(data.savedAt).toLocaleString('ja-JP')}\n\nこのデータを読み込みますか？`)) {
      state.formData = data.formData;
      state.medications = data.medications || [];
      
      restoreFormData();
      alert('データを読み込みました。');
    }
  } catch (error) {
    console.error('読み込みエラー:', error);
    alert('データの読み込みに失敗しました。');
  }
}

// フォームデータ復元
function restoreFormData() {
  // Phase 1
  if (state.formData.patient) {
    document.getElementById('patientAge').value = state.formData.patient.age || '';
    document.getElementById('patientGender').value = state.formData.patient.gender || '';
    document.getElementById('patientAllergies').value = state.formData.patient.allergies || '';
  }

  if (state.formData.provider) {
    document.getElementById('hospitalName').value = state.formData.provider.hospital_name || '';
    document.getElementById('department').value = state.formData.provider.department || '';
    document.getElementById('doctorName').value = state.formData.provider.doctor_name || '';
    document.getElementById('purpose').value = state.formData.provider.purpose || '';
  }

  if (state.formData.pharmacy) {
    document.getElementById('pharmacyName').value = state.formData.pharmacy.pharmacy_name || '';
    document.getElementById('pharmacistName').value = state.formData.pharmacy.pharmacist_name || '';
    document.getElementById('pharmacyPhone').value = state.formData.pharmacy.phone || '';
    document.getElementById('pharmacyFax').value = state.formData.pharmacy.fax || '';
  }

  // Phase 2 - 薬剤リスト再構築
  const medicationList = document.getElementById('medicationList');
  medicationList.innerHTML = '';
  state.medications = [];
  
  if (data.medications && data.medications.length > 0) {
    data.medications.forEach(() => addMedicationForm());
    
    setTimeout(() => {
      data.medications.forEach((med, index) => {
        if (med.medication_id) {
          document.querySelector(`.medication-id[data-index="${index}"]`).value = med.medication_id;
        }
        document.querySelector(`.medication-generic-name[data-index="${index}"]`).value = med.generic_name || '';
        document.querySelector(`.medication-brand-name[data-index="${index}"]`).value = med.brand_name || '';
        document.querySelector(`.medication-dose[data-index="${index}"]`).value = med.dose || '';
        document.querySelector(`.medication-frequency[data-index="${index}"]`).value = med.frequency || '';
        document.querySelector(`.medication-duration[data-index="${index}"]`).value = med.duration || '';
        document.querySelector(`.medication-hospital[data-index="${index}"]`).value = med.prescribing_hospital || '';
      });
    }, 100);
  } else {
    addMedicationForm();
  }

  if (state.formData.adherence) {
    document.getElementById('missedFrequency').value = state.formData.adherence.missed_frequency || '';
    document.getElementById('selfAdjustment').value = state.formData.adherence.self_adjustment || '';
    document.getElementById('remainingMedication').value = state.formData.adherence.remaining_medication || '';
  }

  // Phase 3
  if (state.formData.clinical) {
    document.getElementById('symptomImprovement').value = state.formData.clinical.symptom_improvement || '';
    document.getElementById('patientSubjective').value = state.formData.clinical.patient_subjective || '';
    
    if (state.formData.clinical.vital_signs) {
      document.getElementById('bloodPressure').value = state.formData.clinical.vital_signs.blood_pressure || '';
      document.getElementById('heartRate').value = state.formData.clinical.vital_signs.heart_rate || '';
      document.getElementById('weight').value = state.formData.clinical.vital_signs.weight || '';
      document.getElementById('bloodGlucose').value = state.formData.clinical.vital_signs.blood_glucose || '';
      document.getElementById('otherVitals').value = state.formData.clinical.vital_signs.other || '';
    }
  }

  if (state.formData.adverse) {
    document.getElementById('suspectedSymptoms').value = state.formData.adverse.suspected_symptoms || '';
    document.getElementById('onsetTiming').value = state.formData.adverse.onset_timing || '';
    document.getElementById('adverseSeverity').value = state.formData.adverse.severity || '';
    document.getElementById('causality').value = state.formData.adverse.causality || '';
  }

  // Phase 4
  if (state.formData.pharmaceutical) {
    document.getElementById('duplicateTherapy').value = state.formData.pharmaceutical.duplicate_therapy || '';
    document.getElementById('pimsConcern').value = state.formData.pharmaceutical.pims_concern || '';
    document.getElementById('doseAppropriateness').value = state.formData.pharmaceutical.dose_appropriateness || '';
  }

  if (state.formData.recommendations) {
    document.getElementById('prescriptionProposal').value = state.formData.recommendations.prescription_proposal || '';
    document.getElementById('medicationSupport').value = state.formData.recommendations.medication_support || '';
    document.getElementById('followUpPlan').value = state.formData.recommendations.follow_up_plan || '';
  }
}

// ============================================
// 参考資料機能
// ============================================

// 参考資料タブの初期化
document.addEventListener('DOMContentLoaded', () => {
  // タブ切り替え
  const faqTabBtn = document.getElementById('faqTabBtn');
  const educationTabBtn = document.getElementById('educationTabBtn');
  
  if (faqTabBtn) {
    faqTabBtn.addEventListener('click', () => switchReferenceTab('faq'));
  }
  
  if (educationTabBtn) {
    educationTabBtn.addEventListener('click', () => switchReferenceTab('education'));
  }

  // FAQカテゴリフィルター
  const faqCategoryFilter = document.getElementById('faqCategoryFilter');
  if (faqCategoryFilter) {
    faqCategoryFilter.addEventListener('change', loadFAQs);
  }

  // 患者指導資料フィルター
  const educationDiseaseFilter = document.getElementById('educationDiseaseFilter');
  const educationCategoryFilter = document.getElementById('educationCategoryFilter');
  const educationQuestionTypeFilter = document.getElementById('educationQuestionTypeFilter');
  
  if (educationDiseaseFilter) {
    educationDiseaseFilter.addEventListener('change', loadEducationMaterials);
  }
  if (educationCategoryFilter) {
    educationCategoryFilter.addEventListener('change', loadEducationMaterials);
  }
  if (educationQuestionTypeFilter) {
    educationQuestionTypeFilter.addEventListener('change', loadEducationMaterials);
  }

  // 初回データロード
  loadFAQs();
  loadEducationMaterials();
});

// 参考資料タブ切り替え
function switchReferenceTab(tab) {
  const faqTabBtn = document.getElementById('faqTabBtn');
  const educationTabBtn = document.getElementById('educationTabBtn');
  const faqContent = document.getElementById('faqContent');
  const educationContent = document.getElementById('educationContent');

  if (tab === 'faq') {
    // FAQタブをアクティブに
    faqTabBtn.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
    faqTabBtn.classList.remove('text-gray-600');
    educationTabBtn.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
    educationTabBtn.classList.add('text-gray-600');
    
    faqContent.classList.remove('hidden');
    educationContent.classList.add('hidden');
  } else {
    // 患者指導資料タブをアクティブに
    educationTabBtn.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
    educationTabBtn.classList.remove('text-gray-600');
    faqTabBtn.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
    faqTabBtn.classList.add('text-gray-600');
    
    educationContent.classList.remove('hidden');
    faqContent.classList.add('hidden');
  }
}

// FAQを読み込んで表示
async function loadFAQs() {
  const faqList = document.getElementById('faqList');
  const category = document.getElementById('faqCategoryFilter').value;
  
  faqList.innerHTML = '<div class="text-center text-gray-500 py-8"><i class="fas fa-spinner fa-spin text-2xl mb-2"></i><p>読み込み中...</p></div>';

  try {
    let url = '/api/faqs';
    if (category) {
      url += `?category=${encodeURIComponent(category)}`;
    }

    const response = await axios.get(url);
    const faqs = response.data;

    if (faqs.length === 0) {
      faqList.innerHTML = '<div class="text-center text-gray-500 py-8"><i class="fas fa-info-circle text-2xl mb-2"></i><p>該当するFAQが見つかりませんでした。</p></div>';
      return;
    }

    faqList.innerHTML = faqs.map(faq => `
      <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
        <div class="flex items-start justify-between mb-2">
          <h4 class="font-semibold text-gray-800 flex-1">
            <i class="fas fa-question-circle text-blue-500 mr-2"></i>
            ${escapeHtml(faq.question)}
          </h4>
          <span class="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">${getCategoryLabel(faq.category)}</span>
        </div>
        <div class="text-sm text-gray-700 mt-2 pl-6">
          <i class="fas fa-arrow-right text-green-500 mr-2"></i>
          ${escapeHtml(faq.answer)}
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('FAQ読み込みエラー:', error);
    faqList.innerHTML = '<div class="text-center text-red-500 py-8"><i class="fas fa-exclamation-triangle text-2xl mb-2"></i><p>FAQの読み込みに失敗しました。</p></div>';
  }
}

// 患者指導資料を読み込んで表示
async function loadEducationMaterials() {
  const educationList = document.getElementById('educationList');
  const diseaseId = document.getElementById('educationDiseaseFilter').value;
  const category = document.getElementById('educationCategoryFilter').value;
  const questionType = document.getElementById('educationQuestionTypeFilter').value;
  
  educationList.innerHTML = '<div class="text-center text-gray-500 py-8"><i class="fas fa-spinner fa-spin text-2xl mb-2"></i><p>読み込み中...</p></div>';

  try {
    let url = '/api/education-materials?';
    const params = [];
    if (diseaseId) params.push(`disease_id=${diseaseId}`);
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (questionType) params.push(`question_type=${encodeURIComponent(questionType)}`);
    url += params.join('&');

    const response = await axios.get(url);
    const materials = response.data;

    if (materials.length === 0) {
      educationList.innerHTML = '<div class="text-center text-gray-500 py-8"><i class="fas fa-info-circle text-2xl mb-2"></i><p>該当する患者指導資料が見つかりませんでした。</p></div>';
      return;
    }

    educationList.innerHTML = materials.map(material => `
      <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
        <div class="flex items-start justify-between mb-2">
          <h4 class="font-semibold text-gray-800 flex-1">
            <i class="fas fa-graduation-cap text-green-500 mr-2"></i>
            ${escapeHtml(material.title)}
          </h4>
          <div class="ml-2 flex gap-1">
            ${material.category ? `<span class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">${getEducationCategoryLabel(material.category)}</span>` : ''}
            ${material.question_type ? `<span class="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">${getQuestionTypeLabel(material.question_type)}</span>` : ''}
          </div>
        </div>
        <div class="text-sm text-gray-700 mt-2 pl-6 whitespace-pre-line">
          ${escapeHtml(material.content)}
        </div>
        ${material.answer_summary ? `
          <div class="text-xs text-gray-600 mt-3 pl-6 bg-gray-50 p-2 rounded italic">
            💡 ポイント: ${escapeHtml(material.answer_summary)}
          </div>
        ` : ''}
      </div>
    `).join('');

  } catch (error) {
    console.error('患者指導資料読み込みエラー:', error);
    educationList.innerHTML = '<div class="text-center text-red-500 py-8"><i class="fas fa-exclamation-triangle text-2xl mb-2"></i><p>患者指導資料の読み込みに失敗しました。</p></div>';
  }
}

// カテゴリラベル変換
function getCategoryLabel(category) {
  const labels = {
    'hypertension_general': '高血圧-一般',
    'hypertension_medication': '高血圧-服薬',
    'diabetes_general': '糖尿病-一般',
    'diabetes_lifestyle': '糖尿病-生活',
    'heart_failure_general': '心不全-一般',
    'heart_failure_lifestyle': '心不全-生活',
    'dyslipidemia_general': '脂質異常症-一般',
    'ckd_general': 'CKD-一般',
    'arrhythmia_general': '不整脈-一般'
  };
  return labels[category] || category;
}

function getEducationCategoryLabel(category) {
  const labels = {
    'lifestyle': '生活習慣',
    'monitoring': 'モニタリング',
    'medication': '服薬',
    'diet': '食事',
    'exercise': '運動'
  };
  return labels[category] || category;
}

function getQuestionTypeLabel(type) {
  const labels = {
    'basic_knowledge': '基礎知識',
    'patient_concern': '患者の懸念',
    'lifestyle_guidance': '生活指導'
  };
  return labels[type] || type;
}

// HTMLエスケープ（XSS対策）
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// 心不全フォローアップシート機能
// ============================================

function setupHeartFailureFollowupForm() {
  const phase1 = document.getElementById('phase1');
  
  phase1.innerHTML = `
    <h2 class="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
      <i class="fas fa-heart-pulse mr-2 text-green-600"></i>
      心不全フォローアップシート
    </h2>

    <!-- 基本情報 -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">基本情報</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">確認方法 *</label>
          <select id="hfConfirmationMethod" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">選択してください</option>
            <option value="来局">来局</option>
            <option value="電話">電話</option>
            <option value="訪問">訪問</option>
            <option value="オンライン">オンライン</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">薬局名 *</label>
          <input type="text" id="hfPharmacyName" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="例: ○○調剤薬局">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">担当薬剤師 *</label>
          <input type="text" id="hfPharmacistName" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="例: 山田太郎">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">確認日</label>
          <input type="date" id="hfFollowupDate" class="w-full px-4 py-2 border border-gray-300 rounded-lg" value="${new Date().toISOString().split('T')[0]}">
        </div>
      </div>
    </div>

    <!-- 治療上の問題点 -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">治療上の問題点</h3>
      <textarea id="hfTherapyIssues" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="例: アドヒアランス良好、副作用なし"></textarea>
    </div>

    <!-- 心不全症状チェック -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">心不全症状の確認</h3>
      <div class="space-y-4">
        <!-- 残薬 -->
        <div class="flex items-center space-x-4">
          <label class="flex items-center">
            <input type="checkbox" id="hfHasRemainingMeds" class="mr-2">
            <span class="font-medium">残薬あり</span>
          </label>
        </div>
        
        <!-- 浮腫 -->
        <div>
          <label class="flex items-center mb-2">
            <input type="checkbox" id="hfHasEdema" class="mr-2">
            <span class="font-medium">浮腫あり</span>
          </label>
          <input type="text" id="hfEdemaLocation" class="ml-6 w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg" placeholder="浮腫の部位（例: 両下肢）">
        </div>
        
        <!-- 呼吸困難 -->
        <div class="flex items-center space-x-4">
          <label class="flex items-center">
            <input type="checkbox" id="hfHasDyspnea" class="mr-2">
            <span class="font-medium">呼吸困難あり</span>
          </label>
        </div>
        
        <!-- 食欲不振 -->
        <div class="flex items-center space-x-4">
          <label class="flex items-center">
            <input type="checkbox" id="hfHasAppetiteLoss" class="mr-2">
            <span class="font-medium">食欲不振あり</span>
          </label>
        </div>
        
        <!-- ストレス -->
        <div class="flex items-center space-x-4">
          <label class="flex items-center">
            <input type="checkbox" id="hfHasStress" class="mr-2">
            <span class="font-medium">ストレスあり</span>
          </label>
        </div>
        
        <!-- 他院からの処方 -->
        <div class="flex items-center space-x-4">
          <label class="flex items-center">
            <input type="checkbox" id="hfHasOtherHospitalMeds" class="mr-2">
            <span class="font-medium">他院からの処方薬あり</span>
          </label>
        </div>
      </div>
    </div>

    <!-- バイタルサイン -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">バイタルサイン</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">血圧 (mmHg)</label>
          <input type="text" id="hfBloodPressure" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="例: 120/80">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">体重 (kg)</label>
          <input type="number" step="0.1" id="hfBodyWeight" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="例: 65.5">
        </div>
      </div>
    </div>

    <!-- 薬剤師評価 -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">薬剤師評価</h3>
      <textarea id="hfAssessment" rows="4" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="例: 心不全増悪の兆候なし。予後改善薬の導入継続中。"></textarea>
    </div>

    <!-- 介入内容 -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">介入内容</h3>
      <textarea id="hfIntervention" rows="4" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="例: 塩分制限の重要性を再度説明。体重増加時の受診勧奨を指導。"></textarea>
    </div>

    <div class="flex justify-end">
      <button id="hfGeneratePreviewBtn" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
        プレビュー生成 <i class="fas fa-eye ml-2"></i>
      </button>
    </div>
  `;
  
  // プレビュー生成ボタン
  document.getElementById('hfGeneratePreviewBtn').addEventListener('click', generateHeartFailureFollowupPreview);
  
  // Phase 2-4を非表示
  document.getElementById('phase2').classList.add('hidden');
  document.getElementById('phase3').classList.add('hidden');
  document.getElementById('phase4').classList.add('hidden');
  
  // ナビゲーション調整
  document.querySelectorAll('.phase-nav[data-phase="2"], .phase-nav[data-phase="3"], .phase-nav[data-phase="4"]').forEach(nav => {
    nav.style.display = 'none';
  });
}

function generateHeartFailureFollowupPreview() {
  // データ収集
  state.formData.heartFailureFollowup = {
    confirmationMethod: document.getElementById('hfConfirmationMethod').value,
    pharmacyName: document.getElementById('hfPharmacyName').value,
    pharmacistName: document.getElementById('hfPharmacistName').value,
    followupDate: document.getElementById('hfFollowupDate').value,
    therapyIssues: document.getElementById('hfTherapyIssues').value,
    hasRemainingMeds: document.getElementById('hfHasRemainingMeds').checked,
    hasEdema: document.getElementById('hfHasEdema').checked,
    edemaLocation: document.getElementById('hfEdemaLocation').value,
    hasDyspnea: document.getElementById('hfHasDyspnea').checked,
    hasAppetiteLoss: document.getElementById('hfHasAppetiteLoss').checked,
    hasStress: document.getElementById('hfHasStress').checked,
    hasOtherHospitalMeds: document.getElementById('hfHasOtherHospitalMeds').checked,
    bloodPressure: document.getElementById('hfBloodPressure').value,
    bodyWeight: document.getElementById('hfBodyWeight').value,
    assessment: document.getElementById('hfAssessment').value,
    intervention: document.getElementById('hfIntervention').value
  };
  
  // Phase 5に切り替え
  switchPhase(5);
  
  // プレビュー生成
  const preview = document.getElementById('reportPreview');
  const data = state.formData.heartFailureFollowup;
  
  preview.innerHTML = `
    <style>
      @page { margin: 15mm; size: A4; }
      body { font-size: 10px; line-height: 1.4; }
      .report-title { font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 6px; }
      .report-section { margin-bottom: 12px; page-break-inside: avoid; }
      .report-section h3 { font-size: 12px; font-weight: bold; background: #f0f0f0; padding: 4px 6px; margin-bottom: 6px; }
      .report-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 10px; }
      .report-table td { padding: 4px 6px; border: 1px solid #ddd; vertical-align: top; line-height: 1.4; }
      .report-table td:first-child { font-weight: bold; background: #f9f9f9; width: 28%; }
      .checkbox-list { margin: 4px 0; }
      .checkbox-item { display: inline-block; margin-right: 16px; }
    </style>

    <div class="report-title">心不全患者フォローアップシート</div>

    <div class="report-section">
      <h3>基本情報</h3>
      <table class="report-table">
        <tr>
          <td>確認日</td>
          <td>${data.followupDate || '-'}</td>
        </tr>
        <tr>
          <td>確認方法</td>
          <td>${data.confirmationMethod || '-'}</td>
        </tr>
        <tr>
          <td>薬局・薬剤師</td>
          <td>${data.pharmacyName || '-'} / ${data.pharmacistName || '-'}</td>
        </tr>
      </table>
    </div>

    <div class="report-section">
      <h3>治療上の問題点</h3>
      <table class="report-table">
        <tr>
          <td>問題点</td>
          <td>${data.therapyIssues || 'なし'}</td>
        </tr>
      </table>
    </div>

    <div class="report-section">
      <h3>心不全症状の確認</h3>
      <table class="report-table">
        <tr>
          <td>症状チェック</td>
          <td>
            <div class="checkbox-list">
              <span class="checkbox-item">${data.hasRemainingMeds ? '☑' : '☐'} 残薬あり</span>
              <span class="checkbox-item">${data.hasEdema ? '☑' : '☐'} 浮腫あり${data.edemaLocation ? ' (' + data.edemaLocation + ')' : ''}</span>
              <span class="checkbox-item">${data.hasDyspnea ? '☑' : '☐'} 呼吸困難あり</span>
              <span class="checkbox-item">${data.hasAppetiteLoss ? '☑' : '☐'} 食欲不振あり</span>
              <span class="checkbox-item">${data.hasStress ? '☑' : '☐'} ストレスあり</span>
              <span class="checkbox-item">${data.hasOtherHospitalMeds ? '☑' : '☐'} 他院処方あり</span>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <div class="report-section">
      <h3>バイタルサイン</h3>
      <table class="report-table">
        <tr>
          <td>血圧・体重</td>
          <td>血圧: ${data.bloodPressure || '-'} mmHg / 体重: ${data.bodyWeight || '-'} kg</td>
        </tr>
      </table>
    </div>

    <div class="report-section">
      <h3>薬剤師評価</h3>
      <table class="report-table">
        <tr>
          <td>評価</td>
          <td>${data.assessment || '-'}</td>
        </tr>
      </table>
    </div>

    <div class="report-section">
      <h3>介入内容</h3>
      <table class="report-table">
        <tr>
          <td>介入</td>
          <td>${data.intervention || '-'}</td>
        </tr>
      </table>
    </div>

    <div class="report-section" style="margin-top: 10px; font-size: 8px; color: #666;">
      <p style="margin: 0;"><strong>注意事項：</strong> 本シートは薬剤師による心不全患者のフォローアップ記録です。</p>
    </div>
  `;
}

// ============================================
// 退院時薬剤管理サマリー機能
// ============================================

function setupDischargeSummaryForm() {
  const phase1 = document.getElementById('phase1');
  
  phase1.innerHTML = `
    <h2 class="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
      <i class="fas fa-hospital-user mr-2 text-purple-600"></i>
      退院時薬剤管理サマリー
    </h2>

    <!-- 基本情報 -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">基本情報</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">医療機関名 *</label>
          <input type="text" id="dsHospitalName" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="例: ○○病院">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">退院日</label>
          <input type="date" id="dsDischargeDate" class="w-full px-4 py-2 border border-gray-300 rounded-lg" value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">薬局名 *</label>
          <input type="text" id="dsPharmacyName" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="例: ○○調剤薬局">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">担当薬剤師 *</label>
          <input type="text" id="dsPharmacistName" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="例: 山田太郎">
        </div>
      </div>
    </div>

    <!-- 服薬管理 -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">服薬管理</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">服薬管理者</label>
          <select id="dsMedicationManager" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">選択してください</option>
            <option value="患者本人">患者本人</option>
            <option value="配偶者">配偶者</option>
            <option value="子">子</option>
            <option value="その他家族">その他家族</option>
            <option value="介護者">介護者</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">推奨する調剤方法</label>
          <textarea id="dsRecommendedDispensing" rows="2" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="例: 一包化調剤、日付印字"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">服薬管理方法</label>
          <textarea id="dsMedicationManagement" rows="2" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="例: お薬カレンダー使用、家族による声かけ"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">服薬アドヒアランス</label>
          <textarea id="dsMedicationAdherence" rows="2" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="例: 良好、飲み忘れ週1回程度"></textarea>
        </div>
      </div>
    </div>

    <!-- 心不全予後改善薬の導入状況 -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">心不全予後改善薬の導入状況</h3>
      <div id="prognosticDrugsList" class="space-y-3">
        <div class="text-center text-gray-500 py-4">
          <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
          <p>読み込み中...</p>
        </div>
      </div>
    </div>

    <!-- 心不全管理 -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">心不全管理情報</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">心不全ステージ</label>
          <select id="dsHeartFailureStage" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">選択してください</option>
            <option value="Stage A">Stage A (危険因子あり)</option>
            <option value="Stage B">Stage B (器質的心疾患あり)</option>
            <option value="Stage C">Stage C (心不全症状あり)</option>
            <option value="Stage D">Stage D (治療抵抗性心不全)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">LVEF (%)</label>
          <input type="number" step="0.1" id="dsLVEF" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="例: 35.0">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">水分制限</label>
          <input type="text" id="dsFluidRestriction" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="例: 1500mL/日">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">増悪因子</label>
          <input type="text" id="dsExacerbationFactors" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="例: 感染、不整脈、塩分過多">
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <button id="dsGeneratePreviewBtn" class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition">
        プレビュー生成 <i class="fas fa-eye ml-2"></i>
      </button>
    </div>
  `;
  
  // 予後改善薬リスト読み込み
  loadPrognosticDrugs();
  
  // プレビュー生成ボタン
  document.getElementById('dsGeneratePreviewBtn').addEventListener('click', generateDischargeSummaryPreview);
  
  // Phase 2-4を非表示
  document.getElementById('phase2').classList.add('hidden');
  document.getElementById('phase3').classList.add('hidden');
  document.getElementById('phase4').classList.add('hidden');
  
  // ナビゲーション調整
  document.querySelectorAll('.phase-nav[data-phase="2"], .phase-nav[data-phase="3"], .phase-nav[data-phase="4"]').forEach(nav => {
    nav.style.display = 'none';
  });
}

async function loadPrognosticDrugs() {
  const container = document.getElementById('prognosticDrugsList');
  
  try {
    const response = await axios.get('/api/hf-prognostic-drugs');
    const drugs = response.data;
    
    container.innerHTML = drugs.map(drug => `
      <div class="border border-gray-300 rounded-lg p-4 bg-gray-50">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h4 class="font-semibold text-gray-800">${drug.drug_class_ja}</h4>
            <p class="text-sm text-gray-600 mt-1">${drug.description || ''}</p>
          </div>
          <div class="ml-4">
            <select id="ds_drug_${drug.id}" class="px-3 py-1 border border-gray-300 rounded">
              <option value="">未選択</option>
              <option value="導入済み">導入済み</option>
              <option value="導入予定">導入予定</option>
              <option value="禁忌・不耐">禁忌・不耐</option>
              <option value="検討中">検討中</option>
            </select>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('予後改善薬読み込みエラー:', error);
    container.innerHTML = '<div class="text-center text-red-500 py-4"><p>データの読み込みに失敗しました。</p></div>';
  }
}

function generateDischargeSummaryPreview() {
  // データ収集
  const prognosticDrugs = {};
  document.querySelectorAll('[id^="ds_drug_"]').forEach(select => {
    const drugName = select.closest('.border').querySelector('h4').textContent;
    if (select.value) {
      prognosticDrugs[drugName] = select.value;
    }
  });
  
  state.formData.dischargeSummary = {
    hospitalName: document.getElementById('dsHospitalName').value,
    dischargeDate: document.getElementById('dsDischargeDate').value,
    pharmacyName: document.getElementById('dsPharmacyName').value,
    pharmacistName: document.getElementById('dsPharmacistName').value,
    medicationManager: document.getElementById('dsMedicationManager').value,
    recommendedDispensing: document.getElementById('dsRecommendedDispensing').value,
    medicationManagement: document.getElementById('dsMedicationManagement').value,
    medicationAdherence: document.getElementById('dsMedicationAdherence').value,
    prognosticDrugs: prognosticDrugs,
    heartFailureStage: document.getElementById('dsHeartFailureStage').value,
    lvef: document.getElementById('dsLVEF').value,
    fluidRestriction: document.getElementById('dsFluidRestriction').value,
    exacerbationFactors: document.getElementById('dsExacerbationFactors').value
  };
  
  // Phase 5に切り替え
  switchPhase(5);
  
  // プレビュー生成
  const preview = document.getElementById('reportPreview');
  const data = state.formData.dischargeSummary;
  
  const prognosticDrugsHtml = Object.keys(data.prognosticDrugs).length > 0 
    ? Object.entries(data.prognosticDrugs).map(([drug, status]) => 
        `<div style="margin-bottom: 4px;"><strong>${drug}:</strong> ${status}</div>`
      ).join('')
    : '-';
  
  preview.innerHTML = `
    <style>
      @page { margin: 15mm; size: A4; }
      body { font-size: 10px; line-height: 1.4; }
      .report-title { font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 6px; }
      .report-section { margin-bottom: 12px; page-break-inside: avoid; }
      .report-section h3 { font-size: 12px; font-weight: bold; background: #f0f0f0; padding: 4px 6px; margin-bottom: 6px; }
      .report-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 10px; }
      .report-table td { padding: 4px 6px; border: 1px solid #ddd; vertical-align: top; line-height: 1.4; }
      .report-table td:first-child { font-weight: bold; background: #f9f9f9; width: 28%; }
    </style>

    <div class="report-title">退院時薬剤管理サマリー</div>

    <div class="report-section">
      <h3>基本情報</h3>
      <table class="report-table">
        <tr>
          <td>退院日</td>
          <td>${data.dischargeDate || '-'}</td>
        </tr>
        <tr>
          <td>退院元医療機関</td>
          <td>${data.hospitalName || '-'}</td>
        </tr>
        <tr>
          <td>薬局・薬剤師</td>
          <td>${data.pharmacyName || '-'} / ${data.pharmacistName || '-'}</td>
        </tr>
      </table>
    </div>

    <div class="report-section">
      <h3>服薬管理</h3>
      <table class="report-table">
        <tr>
          <td>服薬管理者</td>
          <td>${data.medicationManager || '-'}</td>
        </tr>
        <tr>
          <td>推奨調剤方法</td>
          <td>${data.recommendedDispensing || '-'}</td>
        </tr>
        <tr>
          <td>服薬管理方法</td>
          <td>${data.medicationManagement || '-'}</td>
        </tr>
        <tr>
          <td>服薬アドヒアランス</td>
          <td>${data.medicationAdherence || '-'}</td>
        </tr>
      </table>
    </div>

    <div class="report-section">
      <h3>心不全予後改善薬の導入状況</h3>
      <table class="report-table">
        <tr>
          <td>導入状況</td>
          <td>${prognosticDrugsHtml}</td>
        </tr>
      </table>
    </div>

    <div class="report-section">
      <h3>心不全管理情報</h3>
      <table class="report-table">
        <tr>
          <td>心不全ステージ</td>
          <td>${data.heartFailureStage || '-'}</td>
        </tr>
        <tr>
          <td>LVEF</td>
          <td>${data.lvef ? data.lvef + '%' : '-'}</td>
        </tr>
        <tr>
          <td>水分制限</td>
          <td>${data.fluidRestriction || '-'}</td>
        </tr>
        <tr>
          <td>増悪因子</td>
          <td>${data.exacerbationFactors || '-'}</td>
        </tr>
      </table>
    </div>

    <div class="report-section" style="margin-top: 10px; font-size: 8px; color: #666;">
      <p style="margin: 0;"><strong>注意事項：</strong> 本サマリーは退院時の薬剤管理状況をまとめたものです。継続的なフォローアップをお願いいたします。</p>
    </div>
  `;
}
