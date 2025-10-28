-- 循環器病エキスパートアドバイザー向けサンプルデータ

-- 疾患データの挿入
INSERT OR IGNORE INTO diseases (code, name, category, description) VALUES 
  ('HTN', '高血圧', 'hypertension', '持続的な血圧上昇を特徴とする疾患'),
  ('DM', '糖尿病', 'diabetes', '慢性的な高血糖状態を特徴とする代謝疾患'),
  ('CKD', '慢性腎臓病', 'ckd', '腎機能の持続的な低下'),
  ('DL', '脂質異常症', 'dyslipidemia', 'LDLコレステロール、中性脂肪の異常'),
  ('OB', '肥満症', 'obesity', 'BMI 25以上の肥満状態'),
  ('CAD', '冠動脈疾患', 'heart_disease', '狭心症・心筋梗塞'),
  ('AF', '心房細動', 'arrhythmia', '心房の不規則な電気活動'),
  ('CVD', '脳卒中', 'stroke', '脳血管障害'),
  ('HF', '心不全', 'heart_failure', '心臓のポンプ機能低下');

-- 薬剤データの挿入（循環器病主要薬剤）
INSERT OR IGNORE INTO medications (generic_name, brand_name, drug_class, category, standard_dose, indications, side_effects, monitoring_points, elderly_caution, renal_adjustment) VALUES 
  -- ARB類
  ('オルメサルタン', 'オルメテック', 'ARB', 'hypertension', '10-20mg 1日1回', '高血圧、糖尿病性腎症', '高カリウム血症、腎機能低下、低血圧', '血圧、腎機能、電解質', 1, 1),
  ('バルサルタン', 'ディオバン', 'ARB', 'hypertension', '40-80mg 1日1回', '高血圧、心不全', '高カリウム血症、めまい、頭痛', '血圧、腎機能、電解質', 1, 1),
  ('テルミサルタン', 'ミカルディス', 'ARB', 'hypertension', '20-40mg 1日1回', '高血圧', '高カリウム血症、腎機能低下', '血圧、腎機能、電解質', 1, 1),
  
  -- ACE阻害薬
  ('エナラプリル', 'レニベース', 'ACE_inhibitor', 'hypertension', '5-10mg 1日1回', '高血圧、心不全', '空咳、高カリウム血症、血管浮腫', '血圧、腎機能、咳の有無', 1, 1),
  ('ペリンドプリル', 'コバシル', 'ACE_inhibitor', 'hypertension', '2-4mg 1日1回', '高血圧', '空咳、めまい、頭痛', '血圧、腎機能、咳の有無', 1, 1),
  
  -- Ca拮抗薬
  ('アムロジピン', 'ノルバスク', 'calcium_blocker', 'hypertension', '2.5-5mg 1日1回', '高血圧、狭心症', '浮腫、顔面紅潮、動悸', '血圧、心拍数、浮腫の有無', 1, 0),
  ('ニフェジピン', 'アダラート', 'calcium_blocker', 'hypertension', '20-40mg 1日2回', '高血圧、狭心症', '動悸、顔面紅潮、浮腫', '血圧、心拍数', 1, 0),
  ('シルニジピン', 'アテレック', 'calcium_blocker', 'hypertension', '10-20mg 1日1回', '高血圧', '浮腫、めまい、頭痛', '血圧、心拍数', 1, 0),
  
  -- 利尿薬
  ('フロセミド', 'ラシックス', 'loop_diuretic', 'heart_failure', '20-40mg 1日1回', '心不全、浮腫', '脱水、電解質異常、低血圧', '体重、尿量、電解質', 1, 1),
  ('トルバプタン', 'サムスカ', 'V2_antagonist', 'heart_failure', '3.75-15mg 1日1回', '心不全による体液貯留', '口渇、多尿、電解質異常', 'Na値、尿量、口渇の程度', 1, 0),
  ('スピロノラクトン', 'アルダクトンA', 'MRA', 'heart_failure', '25-50mg 1日1回', '心不全、高血圧', '高カリウム血症、女性化乳房', '電解質、腎機能', 1, 1),
  
  -- β遮断薬
  ('カルベジロール', 'アーチスト', 'beta_blocker', 'heart_failure', '2.5-10mg 1日2回', '心不全、高血圧', '徐脈、低血圧、倦怠感', '血圧、心拍数、心不全症状', 1, 0),
  ('ビソプロロール', 'メインテート', 'beta_blocker', 'heart_failure', '2.5-5mg 1日1回', '心不全、高血圧、狭心症', '徐脈、低血圧、気管支痙攣', '血圧、心拍数', 1, 1),
  
  -- 抗凝固薬
  ('ワルファリン', 'ワーファリン', 'warfarin', 'arrhythmia', '1-5mg 1日1回', '心房細動、血栓予防', '出血、皮膚壊死', 'PT-INR、出血徴候', 1, 0),
  ('ダビガトラン', 'プラザキサ', 'DOAC', 'arrhythmia', '110-150mg 1日2回', '心房細動、静脈血栓予防', '出血、消化器症状', '腎機能、出血徴候', 1, 1),
  ('リバーロキサバン', 'イグザレルト', 'DOAC', 'arrhythmia', '10-15mg 1日1回', '心房細動、静脈血栓予防', '出血', '腎機能、出血徴候', 1, 1),
  ('アピキサバン', 'エリキュース', 'DOAC', 'arrhythmia', '2.5-5mg 1日2回', '心房細動、静脈血栓予防', '出血', '腎機能、出血徴候', 1, 1),
  
  -- 抗血小板薬
  ('アスピリン', 'バイアスピリン', 'antiplatelet', 'heart_disease', '100mg 1日1回', '冠動脈疾患、脳梗塞予防', '出血、胃腸障害', '出血徴候、消化器症状', 0, 0),
  ('クロピドグレル', 'プラビックス', 'antiplatelet', 'heart_disease', '75mg 1日1回', '冠動脈疾患、脳梗塞予防', '出血', '出血徴候', 0, 0),
  
  -- スタチン類
  ('アトルバスタチン', 'リピトール', 'statin', 'dyslipidemia', '10-20mg 1日1回', '脂質異常症', '筋肉痛、肝機能異常、横紋筋融解症', 'CK、肝機能、筋肉痛', 1, 0),
  ('ロスバスタチン', 'クレストール', 'statin', 'dyslipidemia', '2.5-5mg 1日1回', '脂質異常症', '筋肉痛、肝機能異常', 'CK、肝機能、筋肉痛', 1, 1),
  ('ピタバスタチン', 'リバロ', 'statin', 'dyslipidemia', '1-2mg 1日1回', '脂質異常症', '筋肉痛、肝機能異常', 'CK、肝機能、筋肉痛', 1, 0),
  
  -- SGLT2阻害薬
  ('ダパグリフロジン', 'フォシーガ', 'SGLT2_inhibitor', 'diabetes', '5-10mg 1日1回', '2型糖尿病、心不全', '尿路感染、脱水、ケトアシドーシス', '体重、尿量、血糖値', 1, 1),
  ('エンパグリフロジン', 'ジャディアンス', 'SGLT2_inhibitor', 'diabetes', '10-25mg 1日1回', '2型糖尿病、心不全', '尿路感染、脱水', '体重、尿量、血糖値', 1, 1);

-- 薬剤相互作用データの挿入（主要な相互作用）
INSERT OR IGNORE INTO drug_interactions (medication_a_id, medication_b_id, severity, mechanism, clinical_effects, management) VALUES 
  (1, 11, 'major', 'レニン-アンジオテンシン系とアルドステロン拮抗薬の併用', '高カリウム血症のリスク増大', 'カリウム値の定期的なモニタリング。高カリウム血症の徴候に注意'),
  (4, 11, 'major', 'ACE阻害薬とアルドステロン拮抗薬の併用', '高カリウム血症のリスク増大', 'カリウム値の定期的なモニタリング'),
  (14, 18, 'major', 'ワルファリンと抗血小板薬の併用', '出血リスクの増大', '出血徴候の注意深いモニタリング。PT-INRの頻回測定'),
  (14, 19, 'major', 'ワルファリンと抗血小板薬の併用', '出血リスクの増大', '出血徴候の注意深いモニタリング'),
  (15, 18, 'moderate', 'DOACと抗血小板薬の併用', '出血リスクの増加', '出血徴候のモニタリング'),
  (6, 12, 'moderate', 'Ca拮抗薬とβ遮断薬の併用', '徐脈、房室ブロックのリスク', '心拍数、血圧の定期的なモニタリング'),
  (20, 23, 'moderate', 'スタチンとSGLT2阻害薬', '筋肉痛のリスク（脱水経由）', '十分な水分摂取の指導。筋肉痛の有無確認');

-- 検査値基準データ
INSERT OR IGNORE INTO lab_reference_ranges (test_name, category, unit, normal_min, normal_max, target_min, target_max, critical_min, critical_max) VALUES 
  ('収縮期血圧', 'blood_pressure', 'mmHg', 120, 129, 120, 130, 90, 180),
  ('拡張期血圧', 'blood_pressure', 'mmHg', 70, 84, 70, 80, 50, 110),
  ('LDLコレステロール', 'lipid', 'mg/dL', 70, 139, 70, 120, NULL, 190),
  ('HDLコレステロール', 'lipid', 'mg/dL', 40, NULL, 40, NULL, NULL, NULL),
  ('中性脂肪', 'lipid', 'mg/dL', 30, 149, 30, 150, NULL, 500),
  ('HbA1c', 'glucose', '%', 4.6, 6.2, 6.0, 7.0, NULL, 10.0),
  ('空腹時血糖', 'glucose', 'mg/dL', 70, 109, 70, 130, 50, 300),
  ('eGFR', 'renal', 'mL/min/1.73m²', 60, NULL, 60, NULL, NULL, 15),
  ('血清クレアチニン', 'renal', 'mg/dL', 0.6, 1.2, 0.6, 1.2, NULL, 5.0),
  ('カリウム', 'renal', 'mEq/L', 3.5, 5.0, 3.5, 5.0, 2.5, 6.5),
  ('BNP', 'cardiac', 'pg/mL', 0, 18.4, 0, 100, NULL, 500),
  ('NT-proBNP', 'cardiac', 'pg/mL', 0, 125, 0, 400, NULL, 2000);
