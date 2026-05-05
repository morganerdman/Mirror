// Shared Anthropic request shaping: strip UI opener, prune long transcripts, append context appendix.
// Loaded before conversation.jsx / claude-client.jsx; exposes window.MirrorAnthropic.

(function initMirrorAnthropic() {
  /** Max messages in API payload after opener strip (user+assistant pairs + final user). */
  const MAX_API_MESSAGE_COUNT = 60;

  function stripAssistantOpener(reactMessages) {
    const copy = [...reactMessages];
    let openerText = null;
    if (copy.length && copy[0].role === 'assistant') {
      openerText = copy[0].content;
      copy.shift();
    }
    return { openerText, rest: copy };
  }

  function toAnthropicRoles(rest) {
    return rest.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));
  }

  /** Drop oldest user+assistant pairs while keeping the contract (starts user, ends user). */
  function pruneMessages(msgs) {
    if (msgs.length <= MAX_API_MESSAGE_COUNT) return msgs;
    let out = msgs;
    while (out.length > MAX_API_MESSAGE_COUNT && out.length >= 3) {
      out = out.slice(2);
    }
    return out;
  }

  function buildContextAppendix({ phase, profile, openerText }) {
    let s =
      '\n\n---\nCONTEXT (not tone rules — truth synced from app; complements each turn’s <profile_update>)\n';
    s += `phase: ${phase}\n`;
    s += `sidebar_profile_snapshot: ${JSON.stringify(profile)}\n`;
    if (openerText) {
      s +=
        '\nOpening you already delivered to the user (do not repeat verbatim unless briefly echoing):\n<<<OPENER>>>\n' +
        openerText +
        '\n<<<END_OPENER>>>\n';
    }
    return s;
  }

  /**
   * @param {string} baseSystemPrompt - MIRROR_SYSTEM_PROMPT or MIRROR_SYSTEM_PROMPT_V2 verbatim
   * @param {{ phase:number, profile:object, reactMessages: Array<{role:string,content:string}> }} opts
   * @returns {{ system: string, messages: Array<{role:string,content:string}> }}
   */
  function prepareRequest(baseSystemPrompt, { phase, profile, reactMessages }) {
    const { openerText, rest } = stripAssistantOpener(reactMessages);
    let msgs = toAnthropicRoles(rest);
    msgs = pruneMessages(msgs);
    if (!msgs.length) {
      throw new Error('mirror-anthropic: empty transcript after preprocessing');
    }
    const system = baseSystemPrompt + buildContextAppendix({ phase, profile, openerText });
    return { system, messages: msgs };
  }

  window.MirrorAnthropic = {
    MAX_API_MESSAGE_COUNT,
    stripAssistantOpener,
    pruneMessages,
    prepareRequest,
  };
})();
