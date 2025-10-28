import { Hono } from 'hono';
import type { Bindings, Medication, DrugInteraction } from '../types';

const api = new Hono<{ Bindings: Bindings }>();

// 薬剤検索API
api.get('/medications', async (c) => {
  const { DB } = c.env;
  const query = c.req.query('q') || '';
  const category = c.req.query('category');

  try {
    let sql = `
      SELECT * FROM medications 
      WHERE (generic_name LIKE ? OR brand_name LIKE ?)
    `;
    const params: string[] = [`%${query}%`, `%${query}%`];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY generic_name LIMIT 50';

    const result = await DB.prepare(sql).bind(...params).all();
    return c.json(result.results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch medications' }, 500);
  }
});

// 薬剤詳細取得API
api.get('/medications/:id', async (c) => {
  const { DB } = c.env;
  const id = c.req.param('id');

  try {
    const result = await DB.prepare(
      'SELECT * FROM medications WHERE id = ?'
    ).bind(id).first();

    if (!result) {
      return c.json({ error: 'Medication not found' }, 404);
    }

    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Failed to fetch medication' }, 500);
  }
});

// 相互作用チェックAPI
api.post('/check-interactions', async (c) => {
  const { DB } = c.env;
  const { medication_ids } = await c.req.json<{ medication_ids: number[] }>();

  if (!medication_ids || medication_ids.length < 2) {
    return c.json({ interactions: [] });
  }

  try {
    // 全ての薬剤ペアの相互作用をチェック
    const interactions: any[] = [];
    
    for (let i = 0; i < medication_ids.length; i++) {
      for (let j = i + 1; j < medication_ids.length; j++) {
        const idA = medication_ids[i];
        const idB = medication_ids[j];

        const result = await DB.prepare(`
          SELECT 
            di.*,
            m1.generic_name as med_a_name,
            m1.brand_name as med_a_brand,
            m2.generic_name as med_b_name,
            m2.brand_name as med_b_brand
          FROM drug_interactions di
          JOIN medications m1 ON di.medication_a_id = m1.id
          JOIN medications m2 ON di.medication_b_id = m2.id
          WHERE 
            (di.medication_a_id = ? AND di.medication_b_id = ?)
            OR (di.medication_a_id = ? AND di.medication_b_id = ?)
        `).bind(idA, idB, idB, idA).all();

        if (result.results && result.results.length > 0) {
          interactions.push(...result.results);
        }
      }
    }

    // 重症度でソート
    const severityOrder = { major: 0, moderate: 1, minor: 2 };
    interactions.sort((a, b) => {
      return severityOrder[a.severity as keyof typeof severityOrder] - 
             severityOrder[b.severity as keyof typeof severityOrder];
    });

    return c.json({ interactions });
  } catch (error) {
    console.error('Error checking interactions:', error);
    return c.json({ error: 'Failed to check interactions' }, 500);
  }
});

// 疾患一覧取得API
api.get('/diseases', async (c) => {
  const { DB } = c.env;

  try {
    const result = await DB.prepare(
      'SELECT * FROM diseases ORDER BY category, name'
    ).all();
    return c.json(result.results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch diseases' }, 500);
  }
});

// 検査値基準取得API
api.get('/lab-ranges', async (c) => {
  const { DB } = c.env;
  const category = c.req.query('category');

  try {
    let sql = 'SELECT * FROM lab_reference_ranges';
    const params: string[] = [];

    if (category) {
      sql += ' WHERE category = ?';
      params.push(category);
    }

    sql += ' ORDER BY category, test_name';

    const result = await DB.prepare(sql).bind(...params).all();
    return c.json(result.results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch lab ranges' }, 500);
  }
});

// 薬剤カテゴリ一覧取得API
api.get('/categories', async (c) => {
  const { DB } = c.env;

  try {
    const result = await DB.prepare(`
      SELECT DISTINCT category 
      FROM medications 
      ORDER BY category
    `).all();
    return c.json(result.results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

// よくある質問取得API
api.get('/faqs', async (c) => {
  const { DB } = c.env;
  const disease_id = c.req.query('disease_id');
  const medication_id = c.req.query('medication_id');

  try {
    let sql = 'SELECT * FROM faqs WHERE 1=1';
    const params: string[] = [];

    if (disease_id) {
      sql += ' AND disease_id = ?';
      params.push(disease_id);
    }

    if (medication_id) {
      sql += ' AND medication_id = ?';
      params.push(medication_id);
    }

    sql += ' ORDER BY priority DESC, created_at DESC';

    const result = await DB.prepare(sql).bind(...params).all();
    return c.json(result.results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch FAQs' }, 500);
  }
});

export default api;
