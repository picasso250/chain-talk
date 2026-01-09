<script>
  let replyContent = $state("");
  let loading = $state(false);

  let { topicId, onCreateReply } = $props();

  async function handleSubmit() {
    if (!replyContent.trim()) return;
    
    loading = true;
    try {
      await onCreateReply(topicId, replyContent);
      replyContent = "";
    } finally {
      loading = false;
    }
  }
</script>

<div class="relative group">
  <div class="absolute -inset-0.5 bg-gradient-to-r from-stone-800 to-stone-900 rounded opacity-20 group-hover:opacity-40 transition duration-300 blur"></div>
  <div class="relative bg-stone-800/50 p-4 rounded border border-stone-700">
    <textarea
      bind:value={replyContent}
      placeholder="Write a reply..."
      class="w-full bg-transparent text-sm outline-none resize-none h-20 placeholder-stone-600"
    ></textarea>
    <div class="flex justify-end mt-3">
      <button 
        onclick={handleSubmit}
        disabled={loading || !replyContent.trim()}
        class="bg-stone-700 text-stone-300 hover:bg-red-600 hover:text-white px-4 py-1 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Replying...' : 'REPLY'}
      </button>
    </div>
  </div>
</div>