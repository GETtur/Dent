export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, '');
  const method = request.method;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const db = env.DB; // Связь с базой Cloudflare D1

  try {
    // Авторизация
    if (path === '/auth/login' && method === 'POST') {
      const { username, password } = await request.json();
      const user = await db.prepare('SELECT id, username, name, course FROM users WHERE username = ? AND password = ?')
        .bind(username, password)
        .first();

      if (!user) {
        return new Response(JSON.stringify({ error: 'Неверный логин или пароль' }), { status: 401, headers: corsHeaders });
      }
      return new Response(JSON.stringify(user), { headers: corsHeaders });
    }

    // Получение прогресса и статистики
    if (path.startsWith('/progress') || path.startsWith('/study-state')) {
      const userId = url.searchParams.get('userId') || 1;
      const stats = await db.prepare(`
        SELECT 
          u.name, u.course,
          COALESCE(p.tests_total, 0) as tests_total,
          COALESCE(p.tests_correct, 0) as tests_correct,
          COALESCE(p.cards_learned, 0) as cards_learned,
          COALESCE(p.streak, 1) as streak
        FROM users u
        LEFT JOIN user_stats p ON u.id = p.user_id
        WHERE u.id = ?
      `).bind(userId).first();

      const data = stats || { name: 'Ангелина', course: 3, tests_total: 0, tests_correct: 0, cards_learned: 0, streak: 1 };
      return new Response(JSON.stringify({
        ...data,
        accuracy: data.tests_total ? Math.round((data.tests_correct / data.tests_total) * 100) : 0,
        review_test_ids: [],
        review_card_ids: []
      }), { headers: corsHeaders });
    }

    // Тесты, карточки, препараты и заметки
    if (path === '/tests' && method === 'GET') {
      const { results } = await db.prepare('SELECT * FROM tests').all();
      const formatted = (results || []).map(r => ({ ...r, options: JSON.parse(r.options) }));
      return new Response(JSON.stringify(formatted), { headers: corsHeaders });
    }

    if (path === '/flashcards' && method === 'GET') {
      const { results } = await db.prepare('SELECT * FROM flashcards').all();
      return new Response(JSON.stringify(results || []), { headers: corsHeaders });
    }

    if (path === '/drugs' && method === 'GET') {
      const { results } = await db.prepare('SELECT * FROM drugs').all();
      return new Response(JSON.stringify(results || []), { headers: corsHeaders });
    }

    if (path.startsWith('/notes')) {
      const userId = url.searchParams.get('userId') || 1;
      if (method === 'GET') {
        const { results } = await db.prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY id DESC').bind(userId).all();
        return new Response(JSON.stringify(results || []), { headers: corsHeaders });
      }
      if (method === 'POST') {
        const { title, content, tags } = await request.json();
        const res = await db.prepare('INSERT INTO notes (user_id, title, content, tags) VALUES (?, ?, ?, ?)')
          .bind(userId, title, content, tags).run();
        return new Response(JSON.stringify({ id: res.meta.last_row_id, title, content, tags }), { headers: corsHeaders });
      }
      if (method === 'DELETE') {
        const id = path.split('/')[2];
        await db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').bind(id, userId).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
    }

    return new Response(JSON.stringify({ error: 'Route not found' }), { status: 404, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}