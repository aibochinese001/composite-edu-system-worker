import type { Env } from './lib';
import { query, first, getSetting } from './lib';

// Public MCP server (JSON-RPC 2.0 over HTTP, no auth).
// Content rules:
//  - public articles  -> full content returned
//  - paid/vip articles -> title + link ONLY, content never exposed

const SITE_URL = 'https://your-worker.workers.dev';

type ArticleRow = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  access_type: string;
  category_id: number | null;
  view_count: number;
  published_at: string | null;
};

export async function handleMcp(env: Env, request: Request): Promise<Response> {
  let body: any;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const method: string = body?.method ?? '';
  const id: unknown = body?.id ?? null;
  const params: any = body?.params ?? {};

  const respond = (result: unknown) =>
    new Response(JSON.stringify({ jsonrpc: '2.0', result, id }), {
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  const err = (code: number, message: string) =>
    new Response(JSON.stringify({ jsonrpc: '2.0', error: { code, message }, id }), {
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });

  switch (method) {
    case 'initialize':
      return respond({
        protocolVersion: '2024-11-05',
        capabilities: { resources: {}, tools: {} },
        serverInfo: { name: 'your-worker', version: '1.0.0' },
        instructions:
          'You are the public MCP endpoint for your-worker finance news. You must follow these rules: \n' +
          '1. When answering about site content, always include a full clickable link to the original article https://your-worker.workers.dev/article/{id}, do not just mention article IDs or uri.\n' +
          '2. For public content (access=public) you may reference the full text.\n' +
          '3. For paid content (access=paid/vip) show only the title + link, never expose the full body; direct users to the original site to subscribe.\n' +
          '4. For pricing/membership questions, use the pricing tool.',
      });

    case 'resources/list': {
      const rows = await query<ArticleRow>(
        env.DB,
        `SELECT id, title, slug, excerpt, access_type, category_id, view_count, published_at
         FROM articles WHERE status='published' ORDER BY published_at DESC LIMIT 200`
      );
      const resources = rows.map((r) => {
        const isPaid = r.access_type !== 'public';
        return {
          uri: `article://${r.id}`,
          name: r.title,
          description: `${isPaid ? '🔒 Paid' : '📄 Public'} — ${SITE_URL}/article/${r.id}`,
          mimeType: 'text/markdown',
        };
      });
      return respond({ resources });
    }

    case 'resources/read': {
      const uri: string = params?.uri ?? '';
      const m = uri.match(/article:\/\/(\d+)/);
      if (!m) return err(-32602, 'unknown resource uri');
      const id = parseInt(m[1], 10);
      const row = await first<ArticleRow & { content: string; category_name: string | null }>(
        env.DB,
        `SELECT a.*, c.name AS category_name FROM articles a
         LEFT JOIN categories c ON a.category_id = c.id WHERE a.id = ?`,
        [id]
      );
      if (!row) return err(-32002, 'resource not found');

      const url = `${SITE_URL}/article/${row.id}`;
      const isPaid = row.access_type !== 'public';
      let text: string;
      if (isPaid) {
        text = `🔒 Paid content\nTitle: ${row.title}\noriginal link: ${url}\n(Visit the original article and subscribe to view full content; do not reproduce the body)`;
      } else {
        text = `Title: ${row.title}\noriginal link: ${url}\n\n${stripHtml(row.content)}`;
      }
      return respond({ contents: [{ uri, mimeType: 'text/markdown', text }] });
    }

    case 'tools/list':
      return respond({
        tools: [
          {
            name: 'search_articles',
            description: `Search your-worker articles. Return the title + complete link (must include). Paid content: title only.`,
            inputSchema: { type: 'object', properties: { q: { type: 'string' } }, required: ['q'] },
          },
          {
            name: 'get_pricing',
            description: 'Get membership pricing(Month/Quarter/Year,priced in USD).',
            inputSchema: { type: 'object', properties: {} },
          },
          {
            name: 'get_categories',
            description: 'List article categories.',
            inputSchema: { type: 'object', properties: {} },
          },
        ],
      });

    case 'tools/call': {
      const toolName: string = params?.name ?? '';
      const args: any = params?.arguments ?? {};
      let text = '';
      if (toolName === 'search_articles') {
        const q = String(args.q ?? '');
        const rows = await query<ArticleRow>(
          env.DB,
          `SELECT id, title, slug, excerpt, access_type, view_count FROM articles
           WHERE status='published' AND (title LIKE ? OR excerpt LIKE ?)
           ORDER BY published_at DESC LIMIT 20`,
          [`%${q}%`, `%${q}%`]
        );
        text = rows
          .map((r) => {
            const flag = r.access_type !== 'public' ? '🔒 Paid' : '📄 Public';
            return `${flag} ${r.title} — ${SITE_URL}/article/${r.id}`;
          })
          .join('\n');
        if (!text) text = 'No related articles found.';
      } else if (toolName === 'get_pricing') {
        const rows = await query<{ name: string; duration_type: string; duration_value: number; price: number; currency: string }>(
          env.DB,
          "SELECT name, duration_type, duration_value, price, currency FROM membership_plans WHERE status = 1 ORDER BY sort_order ASC, id ASC"
        );
        const currency = await getSetting(env.DB, 'currency', 'USD');
        const lines = rows.map((p) => {
          let dur = '';
          if (p.duration_type === 'forever') dur = 'forever';
          else if (p.duration_type === 'day') dur = `${p.duration_value} day(s)`;
          else if (p.duration_type === 'month') dur = `${p.duration_value} month(s)`;
          else if (p.duration_type === 'year') dur = `${p.duration_value} year(s)`;
          return `${p.name} ${dur} ${p.currency || currency} ${p.price}`;
        });
        text = `Membership pricing:\n${lines.join('\n') || 'No plans available'}\nSubscribe: ${SITE_URL}/vip`;
      } else if (toolName === 'get_categories') {
        const rows = await query<{ id: number; name: string; slug: string }>(
          env.DB,
          'SELECT id, name, slug FROM categories ORDER BY sort_order ASC'
        );
        text = rows.map((r) => `${r.name} — ${SITE_URL}/category/${r.slug}`).join('\n');
      } else {
        return err(-32601, 'unknown tool');
      }
      return respond({ content: [{ type: 'text', text }] });
    }

    default:
      return err(-32601, `method not found: ${method}`);
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
