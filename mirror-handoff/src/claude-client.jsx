// Browser client: POST structured { system, messages } to Mirror dev server /api/claude.

(function initClaudeClient() {
  /**
   * Resolves API base URL. Same-origin when served by mirror-dev-server; override for custom hosting:
   *   window.MIRROR_CLAUDE_API_BASE = 'http://127.0.0.1:8788'
   */
  function apiEndpoint() {
    const base =
      typeof window !== 'undefined' && window.MIRROR_CLAUDE_API_BASE
        ? String(window.MIRROR_CLAUDE_API_BASE).replace(/\/$/, '')
        : '';
    return `${base}/api/claude`;
  }

  window.claude = {
    /**
     * @param {{ system: string, messages: Array<{role:string,content:string}> }} opts
     * @returns {Promise<string>} assistant plain text (with <profile_update> block)
     */
    async complete(opts) {
      const { system, messages } = opts || {};
      if (typeof system !== 'string' || !Array.isArray(messages)) {
        throw new Error('claude.complete({ system, messages }) — invalid arguments');
      }
      const r = await fetch(apiEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system, messages }),
      });
      const raw = await r.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(raw || r.statusText || 'Claude proxy error');
      }
      if (!r.ok) {
        throw new Error(data.error || raw || r.statusText);
      }
      if (typeof data.text !== 'string') {
        throw new Error('Invalid proxy response: missing text');
      }
      return data.text;
    },
  };
})();
