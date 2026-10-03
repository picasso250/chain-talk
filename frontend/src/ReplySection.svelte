<script>
  import { postMessage } from "./forum.js";
  import { getNetworkConfig, DEFAULT_CHAIN_ID } from "./constants.js";
  import MarkdownRenderer from "./MarkdownRenderer.svelte";

  let { topicId, account, walletProvider = null, replies = [], onReplyCreated, chainId = DEFAULT_CHAIN_ID } = $props();

  let replyContent = $state("");
  let submitting = $state(false);
  let replyTarget = $state(null);
  let networkConfig = $derived(getNetworkConfig(chainId));

  // Format Unix timestamp to human-readable date
  function formatTime(timestamp) {
    if (!timestamp) return "";
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // 提交回复
  async function submitReply() {
    if (submitting || !replyContent.trim()) return;

    submitting = true;
    try {
      const reply = await postMessage(walletProvider, replyContent, replyTarget ?? topicId, chainId);
      onReplyCreated(reply);
      replyContent = "";
      replyTarget = null;
    } catch (error) {
      console.error("Create reply failed:", error);
      alert("Failed to create reply. See console for details.");
    } finally {
      submitting = false;
    }
  }

</script>

<div class="border-t border-gray-200 bg-gray-50">
  <!-- Replies List -->
  <div class="p-4 space-y-4">
    <div class="flex items-center justify-between">
        <div class="text-sm font-bold text-gray-600">
            Replies
        </div>
        {#if replies.length > 0}
            <div class="text-xs text-gray-500">{replies.length} comments</div>
        {/if}
    </div>

    {#if replies.length === 0}
        <div class="text-gray-500 text-sm italic py-2">No replies yet.</div>
    {/if}

    {#each replies as reply (reply.id)}
        <div id={`post-${reply.id}`} class="pl-4 border-l-2 border-gray-300 hover:border-green-400 transition-colors ml-2">
        <div class="flex items-center gap-3 text-xs text-gray-500 mb-2">
          <span class="text-green-600 font-bold">{formatTime(reply.timestamp)}</span>
          <a href={`https://${networkConfig.etherscanPrefix}/address/${reply.author}`} target="_blank" class="font-mono hover:text-gray-700 hover:underline decoration-gray-300" title={reply.author}>
            {reply.author.slice(0, 6)}...{reply.author.slice(-4)}
          </a>
          <a
            href={`https://${networkConfig.etherscanPrefix}/tx/${reply.transactionHash}`}
            target="_blank"
            class="hover:text-gray-700 hover:underline decoration-gray-300"
          >
            tx/{reply.transactionHash.slice(0, 6)}...{reply.transactionHash.slice(-6)}
          </a>
        </div>
        <div class="prose prose-sm max-w-none">
          <div class="text-xs text-gray-500 mb-2">
            #{reply.id} · {#if reply.replyTo === topicId}Reply to topic{:else}<a class="underline" href={`#post-${reply.replyTo}`}>Reply to #{reply.replyTo}</a>{/if}
          </div>
          <MarkdownRenderer content={reply.content} />
          {#if account}<button class="text-sm text-green-700 mt-2" disabled={submitting} onclick={() => replyTarget = reply.id}>Reply to #{reply.id}</button>{/if}
        </div>
      </div>
    {/each}
  </div>

  <!-- Reply Input -->
  <div class="p-4 pt-0">
    {#if account}
      <div class="relative group mt-2">
        <div class="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded opacity-30 group-hover:opacity-50 transition duration-300 blur"></div>
        <div class="relative bg-white p-4 rounded border border-gray-300 shadow-sm">
          {#if replyTarget}
            <div class="text-sm mb-2">Replying to #{replyTarget}
              <button class="underline ml-2" disabled={submitting} onclick={() => replyTarget = null}>Cancel</button>
            </div>
          {/if}
          <textarea
            bind:value={replyContent}
            placeholder="Write a reply..."
            class="w-full bg-transparent text-sm outline-none resize-none h-20 placeholder-gray-400 leading-relaxed"
          ></textarea>
          <div class="flex justify-end mt-3">
            <button
              onclick={submitReply}
              disabled={!replyContent.trim() || submitting}
              class="bg-green-600 text-white hover:bg-green-700 px-4 py-1 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'REPLYING...' : 'REPLY'}
            </button>
          </div>
        </div>
      </div>
{:else}
      <div class="text-center py-6 border-t border-gray-200">
          <span class="text-gray-500 text-sm">Connect wallet to join the conversation</span>
      </div>
    {/if}
  </div>
</div>
