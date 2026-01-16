<script>
  import { onMount } from "svelte";
  import { ethers } from "ethers";
  import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./constants";
  import MarkdownRenderer from "./MarkdownRenderer.svelte";

  let { topicId, account } = $props();

  let replies = $state([]);
  let replyContent = $state("");
  let loading = $state(false);
  let submitting = $state(false);

// 获取回复
  async function fetchReplies() {
    loading = true;
    try {
      let cachedReplies = [];
      // 1. 尝试从本地缓存读取
      try {
        const response = await fetch('/data/replies.json');
        if (response.ok) {
          const allCachedReplies = await response.json();
          // 过滤当前topic的回复
          cachedReplies = allCachedReplies.filter(reply => reply.topicId === topicId);
          if (cachedReplies.length > 0) {
            console.log('=== CACHED REPLIES STRUCTURE ===');
            console.log('Sample cached reply:', cachedReplies[0]);
            console.log('All keys:', Object.keys(cachedReplies[0]));
          }
          console.log(`Loaded cached replies for topic ${topicId}:`, cachedReplies.length);
        }
      } catch (cacheError) {
        console.warn('Failed to load cached replies:', cacheError);
      }

      // 2. 总是尝试从钱包获取最新数据（如果有钱包）
      let walletReplies = [];
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        // 过滤特定 topicId 的回复
        // ReplyCreated(uint256 indexed replyId, uint256 indexed topicId, ...)
        // arg0: replyId (skip), arg1: topicId (match)
        const filter = contract.filters.ReplyCreated(null, topicId);
        
        // 兼容Phantom钱包：限制查询范围到10000区块内
        const latestBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, latestBlock - 9000); // 留1000区块余量
        
        console.log(`Querying replies for topic ${topicId} from block ${fromBlock} to ${latestBlock}`);
        const logs = await contract.queryFilter(filter, fromBlock, "latest");

        const parsedLogs = logs.map((log, index) => {
          const reply = {
            replyId: Number(log.args[0]),
            topicId: Number(log.args[1]),
            author: log.args[2],
            timestamp: String(log.args[3]),
            content: log.args[4],
            blockNumber: String(log.blockNumber),
            transactionHash: log.transactionHash
          };
          if (index === 0) {
            console.log('=== WALLET REPLIES STRUCTURE ===');
            console.log('Sample wallet reply:', reply);
            console.log('All keys:', Object.keys(reply));
          }
          return reply;
        });

        walletReplies = parsedLogs.sort((a, b) => a.replyId - b.replyId);
        console.log(`Using wallet RPC replies for topic ${topicId}:`, walletReplies.length);
      }

      // 3. 合并缓存数据和钱包数据（通过transactionHash去重）
      const mergedReplies = [...cachedReplies, ...walletReplies];
      const uniqueReplies = mergedReplies.filter((reply, index, self) => 
        index === self.findIndex(r => r.transactionHash === reply.transactionHash)
      );
      
      // 按 replyId 顺序排序（最早在前，类似 v2ex）
      replies = uniqueReplies.sort((a, b) => a.replyId - b.replyId);
      console.log('Merged replies - Total:', uniqueReplies.length, 'Cached:', cachedReplies.length, 'New:', walletReplies.length);
    } catch (error) {
      console.error("Fetch replies failed:", error);
      replies = [];
    } finally {
      loading = false;
    }
  }

  // 提交回复
  async function submitReply() {
    if (!replyContent.trim()) return;
    
    submitting = true;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.createReply(topicId, replyContent);
      console.log("Reply transaction sent:", tx.hash);
      
      await tx.wait();
      
      replyContent = "";
      await fetchReplies(); // 刷新列表
    } catch (error) {
      console.error("Create reply failed:", error);
      alert("Failed to create reply. See console for details.");
    } finally {
      submitting = false;
    }
  }

  onMount(() => {
    fetchReplies();
  });
</script>

<div class="border-t border-gray-200 bg-gray-50">
  <!-- Replies List -->
  <div class="p-4 space-y-4">
    <div class="flex items-center justify-between">
        <div class="text-sm font-bold text-gray-600">
            Replies {#if loading}<span class="text-xs font-normal opacity-50 ml-2">loading...</span>{/if}
        </div>
        {#if replies.length > 0}
            <div class="text-xs text-gray-500">{replies.length} comments</div>
        {/if}
    </div>
    
    {#if replies.length === 0 && !loading}
        <div class="text-gray-500 text-sm italic py-2">No replies yet.</div>
    {/if}

    {#each replies as reply (reply.transactionHash)}
        <div class="pl-4 border-l-2 border-gray-300 hover:border-green-400 transition-colors ml-2">
        <div class="flex items-center gap-3 text-xs text-gray-500 mb-2">
          <span class="text-green-600 font-bold">{reply.timestamp}</span>
          <a href={`https://arbiscan.io/address/${reply.author}`} target="_blank" class="font-mono hover:text-gray-700 hover:underline decoration-gray-300" title={reply.author}>
            {reply.author.slice(0, 6)}...{reply.author.slice(-4)}
          </a>
          <a 
            href={`https://arbiscan.io/tx/${reply.transactionHash}`} 
            target="_blank" 
            class="hover:text-gray-700 hover:underline decoration-gray-300"
          >
            tx/{reply.transactionHash.slice(0, 6)}...{reply.transactionHash.slice(-6)}
          </a>
        </div>
        <div class="prose prose-sm max-w-none">
          <MarkdownRenderer content={reply.content} />
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
