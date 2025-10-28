-- 循環器病エキスパートアドバイザー向け服薬情報提供書作成支援システム
-- データベーススキーマ初期設計

-- 1. 疾患マスタテーブル
CREATE TABLE IF NOT EXISTS diseases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  guidelines TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 薬剤マスタテーブル
CREATE TABLE IF NOT EXISTS medications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  generic_name TEXT NOT NULL,
  brand_name TEXT,
  drug_class TEXT NOT NULL,
  category TEXT NOT NULL,
  standard_dose TEXT,
  max_dose TEXT,
  indications TEXT,
  contraindications TEXT,
  side_effects TEXT,
  monitoring_points TEXT,
  elderly_caution INTEGER DEFAULT 0,
  renal_adjustment INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 薬剤相互作用テーブル
CREATE TABLE IF NOT EXISTS drug_interactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  medication_a_id INTEGER NOT NULL,
  medication_b_id INTEGER NOT NULL,
  severity TEXT NOT NULL,
  mechanism TEXT,
  clinical_effects TEXT,
  management TEXT,
  reference_info TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. 疾患-薬剤関連テーブル
CREATE TABLE IF NOT EXISTS disease_medications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  disease_id INTEGER NOT NULL,
  medication_id INTEGER NOT NULL,
  recommendation_level TEXT,
  evidence_level TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. 検査値基準テーブル
CREATE TABLE IF NOT EXISTS lab_reference_ranges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  test_name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  normal_min REAL,
  normal_max REAL,
  target_min REAL,
  target_max REAL,
  critical_min REAL,
  critical_max REAL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. 患者指導資料マスタ
CREATE TABLE IF NOT EXISTS patient_education_materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  disease_id INTEGER,
  medication_id INTEGER,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  target_audience TEXT,
  file_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. よくある質問テーブル
CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  disease_id INTEGER,
  medication_id INTEGER,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  priority INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_medications_drug_class ON medications(drug_class);
CREATE INDEX IF NOT EXISTS idx_medications_category ON medications(category);
CREATE INDEX IF NOT EXISTS idx_drug_interactions_medications ON drug_interactions(medication_a_id, medication_b_id);
CREATE INDEX IF NOT EXISTS idx_disease_medications_disease ON disease_medications(disease_id);
CREATE INDEX IF NOT EXISTS idx_disease_medications_medication ON disease_medications(medication_id);
CREATE INDEX IF NOT EXISTS idx_faqs_disease ON faqs(disease_id);
CREATE INDEX IF NOT EXISTS idx_faqs_medication ON faqs(medication_id);
