-- 循環器病エキスパートアドバイザー向けスキーマ拡張
-- 心不全フォローアップ、患者指導資料、FAQ強化

-- 8. 心不全フォローアップデータテーブル
CREATE TABLE IF NOT EXISTS heart_failure_followups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  confirmation_method TEXT,
  therapy_issues TEXT,
  has_remaining_meds INTEGER DEFAULT 0,
  has_edema INTEGER DEFAULT 0,
  edema_location TEXT,
  has_dyspnea INTEGER DEFAULT 0,
  blood_pressure TEXT,
  body_weight REAL,
  has_appetite_loss INTEGER DEFAULT 0,
  has_stress INTEGER DEFAULT 0,
  has_other_hospital_meds INTEGER DEFAULT 0,
  assessment TEXT,
  intervention TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. 退院時薬剤管理サマリーテンプレート
CREATE TABLE IF NOT EXISTS discharge_summary_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  medication_manager TEXT,
  recommended_dispensing TEXT,
  medication_management_method TEXT,
  medication_adherence TEXT,
  ace_inhibitor_status TEXT,
  arb_status TEXT,
  arni_status TEXT,
  beta_blocker_status TEXT,
  mra_status TEXT,
  sglt2_inhibitor_status TEXT,
  heart_failure_stage TEXT,
  exacerbation_factors TEXT,
  fluid_restriction TEXT,
  lvef REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. 患者指導資料の拡張
ALTER TABLE patient_education_materials ADD COLUMN question_type TEXT;
ALTER TABLE patient_education_materials ADD COLUMN answer_summary TEXT;

-- 11. 心不全予後改善薬マスタ
CREATE TABLE IF NOT EXISTS hf_prognostic_drugs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  drug_class TEXT NOT NULL,
  drug_class_ja TEXT NOT NULL,
  is_guideline_recommended INTEGER DEFAULT 1,
  evidence_level TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 心不全予後改善薬の挿入
INSERT OR IGNORE INTO hf_prognostic_drugs (drug_class, drug_class_ja, evidence_level, description) VALUES
  ('ACE_inhibitor', 'ACE阻害薬', 'A', '心不全の予後改善薬。レニン-アンジオテンシン系を抑制'),
  ('ARB', 'アンジオテンシンII受容体拮抗薬', 'A', 'ACE阻害薬不耐の場合の代替薬'),
  ('ARNI', 'アンジオテンシン受容体ネプリライシン阻害薬', 'A', 'ACE阻害薬/ARBより優れた予後改善効果'),
  ('beta_blocker', 'β遮断薬', 'A', '心不全の予後改善薬。交感神経系を抑制'),
  ('MRA', 'ミネラルコルチコイド受容体拮抗薬', 'A', 'アルドステロン拮抗作用による予後改善'),
  ('SGLT2_inhibitor', 'SGLT2阻害薬', 'A', '心不全の新しい標準治療薬。HFrEF/HFpEF両方に有効');

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_heart_failure_followups_created ON heart_failure_followups(created_at);
CREATE INDEX IF NOT EXISTS idx_discharge_summary_created ON discharge_summary_templates(created_at);
CREATE INDEX IF NOT EXISTS idx_patient_education_question_type ON patient_education_materials(question_type);
