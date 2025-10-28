// 服薬情報提供書作成支援システム - フロントエンドアプリケーション

// グローバル状態管理
const state = {
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
    recommendations: {}
  }
};

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  loadMedicationsCache();
  
  // 初回薬剤入力フォーム追加
  addMedicationForm();
});

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
      <div class="mt-4">
        <strong>検出された相互作用：</strong>
        <ul class="list-disc ml-6 mt-2">${interactionItems}</ul>
      </div>
    `;
  }

  const reportHTML = `
    <style>
      @page { margin: 20mm; }
      .report-title { font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
      .report-section { margin-bottom: 20px; page-break-inside: avoid; }
      .report-section h3 { font-size: 16px; font-weight: bold; background: #f0f0f0; padding: 8px; margin-bottom: 10px; }
      .report-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
      .report-table td { padding: 8px; border: 1px solid #ddd; vertical-align: top; }
      .report-table td:first-child { font-weight: bold; background: #f9f9f9; width: 30%; }
      .medication-table { width: 100%; border-collapse: collapse; font-size: 14px; }
      .medication-table th { background: #e0e0e0; padding: 8px; border: 1px solid #999; }
      .medication-table td { padding: 6px; border: 1px solid #ddd; }
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
            血圧: ${state.formData.clinical.vital_signs?.blood_pressure || '-'} mmHg<br>
            心拍数: ${state.formData.clinical.vital_signs?.heart_rate || '-'} bpm<br>
            体重: ${state.formData.clinical.vital_signs?.weight || '-'} kg<br>
            血糖値: ${state.formData.clinical.vital_signs?.blood_glucose || '-'} mg/dL
            ${state.formData.clinical.vital_signs?.other ? '<br>その他: ' + state.formData.clinical.vital_signs.other : ''}
          </td>
        </tr>
        ${state.formData.adverse.suspected_symptoms ? `
        <tr>
          <td>副作用・有害事象</td>
          <td>
            <strong>疑われる症状：</strong>${state.formData.adverse.suspected_symptoms}<br>
            <strong>発現時期：</strong>${state.formData.adverse.onset_timing || '-'}<br>
            <strong>重症度：</strong>${state.formData.adverse.severity === 'mild' ? '軽度' : state.formData.adverse.severity === 'moderate' ? '中等度' : state.formData.adverse.severity === 'severe' ? '重度' : '-'}<br>
            <strong>因果関係：</strong>${state.formData.adverse.causality || '-'}
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

    <div class="report-section" style="margin-top: 30px; font-size: 12px; color: #666;">
      <p><strong>注意事項：</strong></p>
      <ul style="margin-left: 20px;">
        <li>本情報提供書は薬剤師の専門的見解に基づくものですが、最終的な処方判断は医師が行ってください。</li>
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
