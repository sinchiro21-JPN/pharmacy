-- 患者指導資料データ - 患者指導に役立つ資料から抽出

-- 高血圧患者指導資料
INSERT OR IGNORE INTO patient_education_materials (disease_id, title, content, category, target_audience, question_type) VALUES
  (1, '高血圧は自覚症状がないのがこわい', '血圧とは、血液が血管の中を流れるときに、血管を押す力のことです。高血圧とは、この押す力が強く「血管にいつも強い力がかかっている状態」です。症状がほとんどないまま血管をじわじわ傷つけていきます（サイレントキラー）。', 'lifestyle', 'patient', 'basic_knowledge'),
  
  (1, '高血圧の原因', '高血圧の原因の90%以上は、日々の生活習慣、加齢、遺伝によるものです。原因は1つだけでなく、毎日の「ちょっとだけなら大丈夫」と思って続けている生活習慣の積み重ねが、血圧を高くする原因になることもあります。', 'lifestyle', 'patient', 'basic_knowledge'),
  
  (1, '高血圧を放置するとどうなるの？', '血管の内側が傷つき、動脈硬化が進み、血流が悪くなり、血管が破れやすくなります。その結果、心筋梗塞（心臓の血管が詰まる）、脳卒中（脳の血管が詰まる・破れる）、心不全（心臓の働きが弱る）、腎臓病（血液をろ過できなくなる）などのリスクが高まります。特に、上の血圧が130を超えると、こうしたリスクが上がることが知られています。', 'monitoring', 'patient', 'risk_explanation'),
  
  (1, '毎日のちょっとした工夫で予防しよう', '【減塩】塩分は1日6g未満を目標に。だし・香辛料・酢で味付けを工夫。【運動】1日30分程度のウォーキング、軽いジョギング。【体重管理】BMI 25未満を目標に。【節酒】適量を守る（ビール500ml、日本酒1合まで）。【禁煙】喫煙は血圧上昇と動脈硬化を促進。【ストレス管理】十分な睡眠と休養。', 'lifestyle', 'patient', 'prevention'),
  
  (1, '家庭血圧の測り方', '朝（起床後1時間以内、排尿後、朝食前、服薬前）と晩（就寝前）に測定。座った状態で1-2分安静にした後、2回測定し平均値を記録。測定値がバラバラな場合は、複数回の平均値を血圧手帳に記入してください。', 'monitoring', 'patient', 'self_care');

-- 糖尿病患者指導資料
INSERT OR IGNORE INTO patient_education_materials (disease_id, title, content, category, target_audience, question_type) VALUES
  (2, '糖尿病の合併症を予防するために', '糖尿病の合併症（網膜症、腎症、神経障害）は血糖コントロールの状態に大きく左右されます。HbA1cを目標値（一般的に7.0%未満）に維持することで、合併症の発症や進行を予防できます。【定期検査】眼科検査（年1回）、尿検査（年2-4回）、神経障害の評価。【足のケア】毎日の観察、清潔保持、適切な靴の選択。', 'monitoring', 'patient', 'prevention'),
  
  (2, '糖尿病の食事療法', '【カロリー管理】適正体重の維持。【栄養バランス】炭水化物50-60%、たんぱく質15-20%、脂質20-25%。【食物繊維】野菜・海藻・きのこを積極的に摂取。【規則正しい食事】1日3食、決まった時間に。【ゆっくり噛む】血糖値の急上昇を防ぐ。', 'diet', 'patient', 'lifestyle_modification');

-- 心不全患者指導資料
INSERT OR IGNORE INTO patient_education_materials (disease_id, title, content, category, target_audience, question_type) VALUES
  (9, '心不全とは', '心不全とは、心臓が悪いために、息切れやむくみが起こり、だんだん悪くなり、生命を縮める病気です。心臓のポンプ機能が低下することで、全身に十分な血液を送れなくなったり（前方不全）、血液が心臓に戻りにくくなって体に溜まったり（後方不全）します。', 'medication', 'patient', 'basic_knowledge'),
  
  (9, '心不全の症状と悪化のサイン', '【主な症状】息切れ、疲れやすい、むくみ（特に足）、体重増加、夜間の咳・息苦しさ。【悪化のサイン】2-3日で2kg以上の急激な体重増加、むくみの悪化、安静時の息切れ、横になると苦しい、食欲低下。これらのサインが出たら、早めに医療機関に連絡してください。', 'monitoring', 'patient', 'warning_signs'),
  
  (9, '心不全の予後改善薬', '【ACE阻害薬/ARB/ARNI】心臓への負担を減らす。【β遮断薬】心臓の働きを適切に調整。【MRA】体内の水分・塩分バランスを整える。【SGLT2阻害薬】心臓を保護し、入院を減らす。これらの薬は症状がなくても、生命予後を改善するために重要です。', 'medication', 'patient', 'medication_education'),
  
  (9, '心不全の日常生活管理', '【体重測定】毎日同じ時間に測定し記録。【水分・塩分制限】医師の指示に従う（通常、塩分6g未満/日）。【適度な運動】医師の許可を得て、無理のない範囲で。【感染予防】インフルエンザ・肺炎球菌ワクチン接種。【禁煙・節酒】心臓への負担を減らす。【ストレス管理】十分な休養と睡眠。', 'lifestyle', 'patient', 'self_care'),
  
  (9, '心不全手帳の活用', '心不全手帳には、日々の体重、血圧、症状、服薬状況を記録します。【記録のポイント】毎日同じ時間に測定、気になる症状をメモ、医療機関受診時に持参。【多職種連携】病院、薬局、訪問看護などで情報共有し、継続的なケアを提供。', 'monitoring', 'patient', 'self_care');

-- 脂質異常症患者指導資料
INSERT OR IGNORE INTO patient_education_materials (disease_id, title, content, category, target_audience, question_type) VALUES
  (4, '脂質異常症と動脈硬化', 'LDLコレステロール（悪玉コレステロール）は血管壁に蓄積し、動脈硬化を引き起こします。プラークが形成され、血管が狭くなったり、破れて血栓ができることで、心筋梗塞や脳梗塞のリスクが高まります。【目標値】LDL-C 120mg/dL未満（糖尿病や冠動脈疾患がある場合はさらに低く）。', 'medication', 'patient', 'basic_knowledge'),
  
  (4, '脂質異常症の食事療法', '【飽和脂肪酸を減らす】動物性脂肪（バター、ラード）、肉の脂身を控える。【不飽和脂肪酸を増やす】青魚（EPA・DHA）、植物油（オリーブ油）を積極的に。【食物繊維】野菜、海藻、大豆製品で脂質の吸収を抑える。【コレステロール制限】卵黄、内臓類を控えめに。', 'diet', 'patient', 'lifestyle_modification');

-- 慢性腎臓病患者指導資料
INSERT OR IGNORE INTO patient_education_materials (disease_id, title, content, category, target_audience, question_type) VALUES
  (3, '慢性腎臓病（CKD）とは', 'CKDは腎機能が低下し、尿にタンパク質が出る状態が3か月以上続く病気です。【診断基準】eGFR 60未満、または尿蛋白0.15g/gCr以上。【重症度分類】G1-G5（eGFRで評価）とA1-A3（尿蛋白で評価）の組み合わせで判定。', 'monitoring', 'patient', 'basic_knowledge'),
  
  (3, 'CKDの食事療法', '【減塩】1日6g未満。腎機能が低下すると塩分排泄が困難に。【たんぱく質制限】腎機能に応じて調整（eGFR 60未満で制限開始）。【カリウム制限】eGFR 30未満で制限。生野菜・果物を控え、茹でこぼしを。【リン制限】eGFR 45未満で制限。加工食品、乳製品を控える。', 'diet', 'patient', 'lifestyle_modification');

-- 脳卒中患者指導資料
INSERT OR IGNORE INTO patient_education_materials (disease_id, title, content, category, target_audience, question_type) VALUES
  (8, '脳卒中の前兆（FAST）', '【Face（顔の歪み）】片方の顔が下がる、笑顔が作れない。【Arm（腕の脱力）】片方の腕が上がらない、力が入らない。【Speech（言葉の障害）】ろれつが回らない、言葉が出ない。【Time（時間）】これらの症状が1つでもあれば、すぐに119番通報。時間が勝負です。', 'monitoring', 'patient', 'warning_signs'),
  
  (8, '脳卒中の再発予防', '【血圧管理】目標値 140/90未満（糖尿病合併時は130/80未満）。【抗血栓療法】抗血小板薬または抗凝固薬の継続。【脂質管理】LDL-C 120mg/dL未満。【血糖管理】HbA1c 7.0%未満。【生活習慣】禁煙、節酒、適度な運動、減塩。', 'medication', 'patient', 'prevention');

-- 心房細動患者指導資料
INSERT OR IGNORE INTO patient_education_materials (disease_id, title, content, category, target_audience, question_type) VALUES
  (7, '心房細動と脳梗塞のリスク', '心房細動があると、心房内で血液がよどみ、血栓（血の塊）ができやすくなります。この血栓が脳に飛ぶと脳梗塞を引き起こします。心房細動による脳梗塞は重症化しやすく、死亡率も高いため、予防が重要です。【CHADS2スコア】心不全、高血圧、年齢、糖尿病、脳卒中歴で評価。', 'medication', 'patient', 'basic_knowledge'),
  
  (7, '抗凝固薬の服薬管理', '【ワルファリン】定期的なPT-INR測定が必要。納豆・クロレラは禁止。目標INR 2.0-3.0（70歳以上は1.6-2.6）。【DOAC】定期的な血液検査は不要。食事制限も少ない。ただし、飲み忘れに注意（半減期が短い）。【出血リスク】歯磨き時の出血、鼻血、血尿、黒色便などがあれば速やかに連絡。', 'medication', 'patient', 'medication_education');

-- 運動療法指導資料
INSERT OR IGNORE INTO patient_education_materials (title, content, category, target_audience, question_type) VALUES
  ('心不全患者の運動療法', '運動療法は心不全患者の生存率を改善します（40%→80%）。【効果】心機能の改善、神経体液性因子の正常化、末梢血管機能の改善、骨格筋機能の向上。【推奨運動】ウォーキング、軽い自転車こぎ、ストレッチ。【注意点】医師の許可を得てから開始、体調不良時は中止、無理のない範囲で継続。', 'exercise', 'patient', 'lifestyle_modification'),
  
  ('心不全重症化予防のために', '【血圧・体重管理】毎日記録。【禁煙・節酒・減塩】生活習慣の改善。【適度な運動】医師の指示に従う。【生活習慣病の管理】高血圧、糖尿病、脂質異常症、肥満。【知識習得】心不全について学ぶ。【定期受診】早期発見・早期治療。【感染予防】ワクチン接種。', 'lifestyle', 'patient', 'prevention');
