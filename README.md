# 服薬情報提供書作成支援システム

循環器病エキスパートアドバイザー向けの対話型服薬情報提供書作成支援Webアプリケーションです。

## 🎯 プロジェクト概要

**目的**: 薬局薬剤師が医療機関へ提出する服薬情報提供書の作成を効率化し、薬学的問題点の抽出と処方提案を支援します。

**対象疾患**: 循環器病領域（高血圧、心不全、心房細動、糖尿病、脂質異常症、慢性腎臓病など）

**開発コンセプト**:
- 段階的な対話型入力で必要情報を漏れなく収集
- データベース連携による薬剤相互作用の自動チェック
- 標準フォーマットでの提供書生成と印刷機能
- 個人情報非保持の安全設計

## 📋 主な機能

### ✅ 現在実装済み機能

1. **Phase 1: 基本情報入力**
   - 患者情報（年齢、性別、アレルギー歴）
   - 提出先医療機関情報
   - 薬局・薬剤師情報

2. **Phase 2: 服薬状況聴取**
   - 薬剤名のインクリメンタル検索機能
   - 複数薬剤の一括管理
   - 服薬アドヒアランス評価
   - 残薬状況の記録

3. **Phase 3: 臨床的評価**
   - 薬効評価（症状改善度）
   - バイタルサイン・検査値入力
   - 副作用・有害事象の記録
   - 因果関係の薬剤師判断

4. **Phase 4: 薬剤師の専門的見解**
   - 薬剤相互作用の自動チェック
   - 重症度別の相互作用表示（重大/中等度/軽度）
   - PIMs（高齢者不適切薬剤）評価
   - 処方変更提案
   - 服薬支援方策の立案

5. **Phase 5: プレビュー・印刷**
   - 標準フォーマット提供書の自動生成
   - 印刷最適化レイアウト
   - ブラウザ印刷機能

6. **データ管理**
   - LocalStorageによる一時保存機能
   - セッション内データの保持

## 🗄️ データベース構造

### 循環器病薬剤データベース (D1 SQLite)

**薬剤マスタテーブル (medications)**
- 一般名、商品名、薬効分類
- 適応症、禁忌、副作用情報
- 標準用量、最大用量
- 高齢者注意、腎機能調整フラグ

**薬剤相互作用テーブル (drug_interactions)**
- 薬剤ペアの組み合わせ
- 重症度（major/moderate/minor）
- 相互作用機序、臨床的影響
- 対応方法の推奨

**疾患マスタテーブル (diseases)**
- 循環器病分類（高血圧、心不全、心房細動など）
- 疾患概要、ガイドライン情報

**検査値基準テーブル (lab_reference_ranges)**
- 血圧、脂質、血糖、腎機能、心機能マーカー
- 正常範囲、目標範囲、危機的範囲

### サンプルデータ

**収録薬剤数**: 24種類（循環器病主要薬剤）
- ARB: 3剤（オルメサルタン、バルサルタン、テルミサルタン）
- ACE阻害薬: 2剤
- Ca拮抗薬: 3剤
- 利尿薬: 3剤
- β遮断薬: 2剤
- 抗凝固薬: 4剤（ワルファリン、DOAC 3種）
- 抗血小板薬: 2剤
- スタチン: 3剤
- SGLT2阻害薬: 2剤

**相互作用データ**: 7件の主要相互作用を収録

## 🚀 デプロイ情報

### 開発環境URL
**Sandbox**: https://3000-i9ong9cuif0k3aq0sb4dk-583b4d74.sandbox.novita.ai

### 技術スタック
- **フロントエンド**: HTML5, TailwindCSS, Vanilla JavaScript
- **バックエンド**: Hono (Cloudflare Workers)
- **データベース**: Cloudflare D1 (SQLite)
- **デプロイ**: Cloudflare Pages
- **開発ツール**: Vite, Wrangler, PM2

### システム要件
- Node.js 18.x以上
- npm 10.x以上

## 💻 ローカル開発環境セットアップ

```bash
# リポジトリクローン
git clone <repository-url>
cd webapp

# 依存関係インストール
npm install

# データベースマイグレーション実行
npm run db:migrate:local

# サンプルデータ投入
npm run db:seed

# ビルド
npm run build

# 開発サーバー起動（Sandbox環境）
npm run dev:sandbox

# または PM2で起動
pm2 start ecosystem.config.cjs
```

### データベース管理コマンド

```bash
# ローカルデータベースのリセット
npm run db:reset

# SQLクエリ実行
npm run db:console:local

# マイグレーション適用（本番）
npm run db:migrate:prod
```

## 📊 データモデル

### MedicationReport (服薬情報提供書)

```typescript
interface MedicationReport {
  patient_info: {
    age?: number;
    gender?: 'male' | 'female';
    allergies?: string;
  };
  provider_info: {
    hospital_name: string;
    department?: string;
    doctor_name?: string;
    purpose: string; // '入院時情報提供' | '処方提案' | '副作用報告' | etc.
  };
  pharmacy_info: {
    pharmacy_name: string;
    pharmacist_name: string;
    phone?: string;
    fax?: string;
  };
  prescribed_medications: Array<{
    medication_id: number;
    generic_name: string;
    brand_name?: string;
    dose: string;
    frequency: string;
    duration?: string;
    prescribing_hospital?: string;
  }>;
  adherence: {
    missed_frequency?: string;
    self_adjustment?: string;
    remaining_medication?: string;
  };
  clinical_evaluation: {
    symptom_improvement?: string;
    patient_subjective?: string;
    vital_signs?: object;
  };
  adverse_events?: {
    suspected_symptoms?: string;
    onset_timing?: string;
    severity?: 'mild' | 'moderate' | 'severe';
    causality?: string;
  };
  pharmaceutical_issues: {
    drug_interactions: Array;
    duplicate_therapy?: string;
    pims_concern?: string;
    dose_appropriateness?: string;
  };
  recommendations: {
    prescription_proposal?: string;
    medication_support?: string;
    follow_up_plan?: string;
  };
}
```

## 🔐 セキュリティとプライバシー

### 個人情報保護方針

✅ **実装済み**:
- 患者氏名、IDは一切入力不要
- LocalStorageによるローカル保存のみ
- サーバー側にデータを保存しない設計

⚠️ **注意事項**:
- 検査値などの医療情報は手動入力
- ブラウザキャッシュクリア時にデータ消失
- 本番運用前に個人情報取扱規程の確認必須

## 📱 使用方法

### 基本ワークフロー

1. **Phase 1で基本情報を入力**
   - 必須項目: 医療機関名、提供目的、薬局名、薬剤師名

2. **Phase 2で服薬状況を記録**
   - 薬剤名検索から選択（データベース連携）
   - 用量・用法を入力
   - アドヒアランス評価

3. **Phase 3で臨床評価を実施**
   - 症状改善度の記録
   - バイタルサイン・検査値入力
   - 副作用の有無確認

4. **Phase 4で薬学的問題を抽出**
   - 自動相互作用チェック
   - PIMs評価
   - 処方提案の作成

5. **Phase 5でプレビュー確認・印刷**
   - 標準フォーマット提供書を確認
   - ブラウザ印刷機能で出力

### 一時保存・読込機能

- **保存**: ヘッダーの「一時保存」ボタンで現在の入力内容をLocalStorageに保存
- **読込**: 「読込」ボタンで保存したデータを復元
- **注意**: ブラウザを閉じても保存されますが、キャッシュクリアで消失します

## 🎨 画面設計

### レスポンシブデザイン
- デスクトップ: サイドバーナビゲーション + メインフォーム
- タブレット/モバイル: フルスクリーンフォーム

### カラースキーム
- プライマリ: Blue (#3b82f6) - 医療・信頼性
- セカンダリ: Green (#10b981) - 安全性
- アラート: Red (#ef4444) - 重大な相互作用
- 警告: Yellow (#f59e0b) - 中等度の相互作用

### アイコン
- FontAwesome 6.4.0を使用
- 直感的な視覚表現

## 🔄 今後の拡張予定

### 機能追加候補

1. **PDFエクスポート機能**
   - ブラウザ印刷に加え、PDF直接生成
   - 電子署名対応

2. **薬剤データベース拡充**
   - 循環器病以外の領域への拡大
   - 最新ガイドライン情報の定期更新
   - FAQデータの充実

3. **トレーシングレポート機能**
   - 継続的なフォローアップ記録
   - 経時的変化の可視化

4. **多職種連携機能**
   - 医師からのフィードバック記録
   - 心不全手帳との連動

5. **患者指導資料の自動生成**
   - 疾患・薬剤別の患者向け説明資料
   - 生活指導ポイントの提示

6. **音声入力対応**
   - Web Speech APIの活用
   - ハンズフリー入力

### データベース拡充計画

- [ ] 循環器病全薬剤の網羅（目標200剤以上）
- [ ] 相互作用データの拡充（目標500件以上）
- [ ] 患者指導資料の統合
- [ ] よくある質問データの追加

## 📚 参考資料・エビデンス

本システムは以下のガイドライン・資料に基づいています:

- 日本循環器学会「循環器病エキスパートアドバイザー」養成プログラム
- 高血圧治療ガイドライン
- 心不全診療ガイドライン
- 心房細動治療ガイドライン
- 糖尿病診療ガイドライン
- 脂質異常症診療ガイドライン
- CKD診療ガイドライン

## 🤝 貢献・フィードバック

### 貢献方法
1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

### バグ報告・機能要望
GitHubのIssuesでご報告ください。

## ⚖️ 免責事項

**重要**: 本システムは薬剤師の業務支援ツールです。

- 最終的な薬学的判断は必ず薬剤師が行ってください
- 医師への処方提案は薬剤師の責任のもと実施してください
- 本システムの情報に基づく判断による結果について、開発者は責任を負いません
- 本番運用前に所属組織の規定・ガイドラインを確認してください

## 📄 ライセンス

MIT License

## 👤 作成者

循環器病エキスパートアドバイザー向けシステム開発チーム

---

**最終更新**: 2025年10月28日  
**バージョン**: 1.0.0  
**ステータス**: ✅ 開発環境動作確認済み
