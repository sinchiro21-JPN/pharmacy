// データベース型定義

export interface Disease {
  id: number;
  code: string;
  name: string;
  category: string;
  description?: string;
  guidelines?: string;
  created_at: string;
}

export interface Medication {
  id: number;
  generic_name: string;
  brand_name?: string;
  drug_class: string;
  category: string;
  standard_dose?: string;
  max_dose?: string;
  indications?: string;
  contraindications?: string;
  side_effects?: string;
  monitoring_points?: string;
  elderly_caution: number;
  renal_adjustment: number;
  created_at: string;
}

export interface DrugInteraction {
  id: number;
  medication_a_id: number;
  medication_b_id: number;
  severity: 'major' | 'moderate' | 'minor';
  mechanism?: string;
  clinical_effects?: string;
  management?: string;
  reference_info?: string;
  created_at: string;
}

export interface LabReferenceRange {
  id: number;
  test_name: string;
  category: string;
  unit: string;
  normal_min?: number;
  normal_max?: number;
  target_min?: number;
  target_max?: number;
  critical_min?: number;
  critical_max?: number;
  notes?: string;
}

// 服薬情報提供書フォームデータ

export interface PatientInfo {
  age?: number;
  gender?: 'male' | 'female';
  allergies?: string;
  adverse_reactions?: string;
}

export interface ProviderInfo {
  hospital_name: string;
  department?: string;
  doctor_name?: string;
  purpose: string;
}

export interface PharmacyInfo {
  pharmacy_name: string;
  pharmacist_name: string;
  phone?: string;
  fax?: string;
}

export interface PrescribedMedication {
  medication_id: number;
  generic_name: string;
  brand_name?: string;
  dose: string;
  frequency: string;
  duration?: string;
  prescribing_hospital?: string;
}

export interface MedicationAdherence {
  missed_frequency?: string;
  self_adjustment?: string;
  remaining_medication?: string;
  notes?: string;
}

export interface ClinicalEvaluation {
  symptom_improvement?: string;
  patient_subjective?: string;
  vital_signs?: {
    blood_pressure?: string;
    heart_rate?: string;
    blood_glucose?: string;
    weight?: string;
    [key: string]: string | undefined;
  };
}

export interface AdverseEvent {
  suspected_symptoms?: string;
  onset_timing?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  causality?: string;
}

export interface PharmaceuticalIssue {
  drug_interactions: Array<{
    medications: string[];
    severity: string;
    description: string;
  }>;
  duplicate_therapy?: string;
  pims_concern?: string;
  dose_appropriateness?: string;
}

export interface PharmacistRecommendation {
  prescription_proposal?: string;
  medication_support?: string;
  follow_up_plan?: string;
  notes?: string;
}

export interface MedicationReport {
  patient_info: PatientInfo;
  provider_info: ProviderInfo;
  pharmacy_info: PharmacyInfo;
  prescribed_medications: PrescribedMedication[];
  adherence: MedicationAdherence;
  clinical_evaluation: ClinicalEvaluation;
  adverse_events?: AdverseEvent;
  pharmaceutical_issues: PharmaceuticalIssue;
  recommendations: PharmacistRecommendation;
  created_at?: string;
}

// Cloudflare Bindings
export interface Bindings {
  DB: D1Database;
}
