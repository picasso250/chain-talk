<script>
  import { onMount } from "svelte";
  import { ethers } from "ethers";
  import { CONTRACT_ADDRESS, CONTRACT_ABI, TARGET_CHAIN_ID } from "./lib/constants";

  let account = $state(null);
  let topicContent = $state("");
  let topics = $state([]);
  let replies = $state([]);
  let expandedTopics = $state(new Set());
  let loading = $state(false);
  let isConnecting = $state(false);

  // 检查并切换网络
  async function checkNetwork() {
    if (!window.ethereum) return;
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== TARGET_CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: TARGET_CHAIN_ID }],
        });
        return true;
      } catch (switchError) {
        console.error("Failed to switch network:", switchError);
        alert("Please switch your wallet to Arbitrum One network.");
        return false;
      }
    }
    return true;
  }

  // 连接钱包
  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    isConnecting = true;
    try {
      const isCorrectNetwork = await checkNetwork();
      if (!isCorrectNetwork) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      account = await signer.getAddress();
      
      await fetchTopics();
      await fetchReplies();
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      isConnecting = false;
    }
  }

  // 创建主题
  async function createTopic() {
    if (!topicContent.trim()) return;
    if (!account) {
      await connectWallet();
      if (!account) return;
    }

    loading = true;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.createTopic(topicContent);
      console.log("Transaction sent:", tx.hash);
      
      await tx.wait();
      
      topicContent = "";
      await fetchTopics();
    } catch (error) {
      console.error("Create topic failed:", error);
      alert("Failed to create topic. See console for details.");
    } finally {
      loading = false;
    }
  }

  // 创建回复
  async function createReply(topicId, replyContent) {
    if (!replyContent.trim()) return;
    if (!account) {
      await connectWallet();
      if (!account) return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.createReply(topicId, replyContent);
      console.log("Transaction sent:", tx.hash);
      
      await tx.wait();
      
      await fetchReplies();
    } catch (error) {
      console.error("Create reply failed:", error);
      alert("Failed to create reply. See console for details.");
    }
  }

  // 获取标题（第一行，最多100字符）
  function getTitle(content) {
    const firstLine = content.split('\n')[0];
    return firstLine.length > 100 ? firstLine.slice(0, 100) + "..." : firstLine;
  }

  // 展开/收起主题
  function toggleTopic(topicId) {
    if (expandedTopics.has(topicId)) {
      expandedTopics.delete(topicId);
    } else {
      expandedTopics.add(topicId);
    }
    expandedTopics = new Set(expandedTopics);
  }

  // 获取主题的回复
  function getTopicReplies(topicId) {
    return replies.filter(reply => reply.topicId === topicId);
  }

  // 读取主题
  async function fetchTopics() {
    try {
      let provider;
      if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        return;
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const filter = contract.filters.TopicCreated();
      const logs = await contract.queryFilter(filter);

      const parsedLogs = logs.map(log => {
        return {
          topicId: log.args[0],
          author: log.args[1],
          timestamp: new Date(Number(log.args[2]) * 1000).toLocaleString(),
          content: log.args[3],
          blockNumber: log.blockNumber,
          hash: log.transactionHash
        };
      });

      topics = parsedLogs.reverse();
    } catch (error) {
      console.error("Fetch topics failed:", error);
    }
  }

  // 读取回复
  async function fetchReplies() {
    try {
      let provider;
      if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        return;
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const filter = contract.filters.ReplyCreated();
      const logs = await contract.queryFilter(filter);

      const parsedLogs = logs.map(log => {
        return {
          replyId: log.args[0],
          topicId: log.args[1],
          author: log.args[2],
          timestamp: new Date(Number(log.args[3]) * 1000).toLocaleString(),
          content: log.args[4],
          blockNumber: log.blockNumber,
          hash: log.transactionHash
        };
      });

      replies = parsedLogs.reverse();
    } catch (error) {
      console.error("Fetch replies failed:", error);
    }
  }

  onMount(() => {
    if (window.ethereum) {
       window.ethereum.on('accountsChanged', (accounts) => {
         if (accounts.length > 0) {
           account = accounts[0];
         } else {
           account = null;
         }
       });
       fetchTopics();
       fetchReplies();
    }
  });
</script>

<main class="min-h-screen bg-stone-900 text-stone-200 font-mono selection:bg-red-900 selection:text-white">
  <!-- Navbar -->
  <nav class="border-b border-stone-800 p-4 sticky top-0 bg-stone-900/95 backdrop-blur z-10">
    <div class="max-w-3xl mx-auto flex justify-between items-center">
      <h1 class="text-xl font-bold tracking-tighter text-red-500 uppercase">
        Chain Talk
        <span class="text-xs text-stone-500 font-normal normal-case block sm:inline sm:ml-2">
          // Eternal Conversations
        </span>
      </h1>
      
      <button 
        onclick={connectWallet}
        class="text-sm px-4 py-2 border border-stone-700 hover:border-red-500 hover:text-red-500 transition-colors duration-300 disabled:opacity-50"
        disabled={isConnecting}
      >
        {#if account}
          {account.slice(0, 6)}...{account.slice(-4)}
        {:else}
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        {/if}
      </button>
    </div>
  </nav>

  <div class="max-w-3xl mx-auto p-4 pt-8">
    
    <!-- New Topic -->
    <section class="mb-12">
      <div class="relative group">
        <div class="absolute -inset-0.5 bg-gradient-to-r from-red-900 to-stone-800 rounded opacity-30 group-hover:opacity-70 transition duration-500 blur"></div>
        <div class="relative bg-stone-950 p-6 rounded border border-stone-800">
          <textarea
            bind:value={topicContent}
            placeholder="Start a conversation. First line becomes the title..."
            class="w-full bg-transparent text-lg outline-none resize-none h-24 placeholder-stone-600"
          ></textarea>
          <div class="flex justify-between items-center mt-4 border-t border-stone-900 pt-4">
            <span class="text-xs text-stone-500">
              Immutable • Permanent • Anonymous
            </span>
            <button 
              onclick={createTopic}
              disabled={loading || !topicContent.trim()}
              class="bg-stone-100 text-stone-900 hover:bg-red-600 hover:text-white px-6 py-2 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Posting...' : 'POST TOPIC'}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Topics -->
    <section class="space-y-6">
      <div class="flex items-center gap-4">
        <h2 class="text-2xl font-bold text-stone-100">Topics</h2>
        <div class="h-px bg-stone-800 flex-1"></div>
      </div>

      {#if topics.length === 0}
        <div class="text-center py-12 text-stone-600 italic">
          No topics yet. Start the first conversation.
        </div>
      {/if}

      {#each topics as topic (topic.hash)}
        <article class="border border-stone-800 rounded overflow-hidden hover:border-red-900 transition-colors duration-300">
          <!-- Topic Header (Always Visible) -->
          <div 
            class="p-4 cursor-pointer hover:bg-stone-800/50 transition-colors"
            onclick={() => toggleTopic(topic.topicId)}
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="text-lg font-bold text-stone-100 mb-2">
                  {getTitle(topic.content)}
                </h3>
                <div class="flex items-center gap-4 text-xs text-stone-500">
                  <span class="text-red-400 font-bold">{topic.timestamp}</span>
                  <span class="font-mono">{topic.author.slice(0, 8)}</span>
                  <span>{getTopicReplies(topic.topicId).length} replies</span>
                  <a 
                    href={`https://arbiscan.io/tx/${topic.hash}`} 
                    target="_blank" 
                    class="hover:text-stone-300 hover:underline decoration-stone-700"
                    onclick={(e) => e.stopPropagation()}
                  >
                    #{topic.blockNumber}
                  </a>
                </div>
              </div>
              <div class="text-stone-400 ml-4">
                {expandedTopics.has(topic.topicId) ? '▼' : '▶'}
              </div>
            </div>
          </div>

          <!-- Expanded Content -->
          {#if expandedTopics.has(topic.topicId)}
            <div class="border-t border-stone-800">
              <!-- Topic Content -->
              <div class="p-4 bg-stone-900/50">
                <div class="prose prose-invert prose-stone max-w-none">
                  <p class="whitespace-pre-wrap leading-relaxed text-stone-300">
                    {topic.content}
                  </p>
                </div>
              </div>

              <!-- Replies -->
              <div class="p-4 space-y-4">
                <div class="text-sm font-bold text-stone-400 mb-3">Replies</div>
                
                {#each getTopicReplies(topic.topicId) as reply (reply.hash)}
                  <div class="pl-4 border-l-2 border-stone-700">
                    <div class="flex items-center gap-3 text-xs text-stone-500 mb-2">
                      <span class="text-red-400 font-bold">{reply.timestamp}</span>
                      <span class="font-mono">{reply.author.slice(0, 8)}</span>
                      <a 
                        href={`https://arbiscan.io/tx/${reply.hash}`} 
                        target="_blank" 
                        class="hover:text-stone-300 hover:underline decoration-stone-700"
                      >
                        #{reply.blockNumber}
                      </a>
                    </div>
                    <div class="prose prose-invert prose-stone max-w-none">
                      <p class="whitespace-pre-wrap leading-relaxed text-stone-300">
                        {reply.content}
                      </p>
                    </div>
                  </div>
                {/each}

                <!-- Reply Form -->
                {#if account}
                  <ReplyForm 
                    topicId={topic.topicId} 
                    onCreateReply={createReply} 
                  />
                {:else}
                  <div class="text-center py-4 text-stone-500 text-sm">
                    Connect wallet to reply
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </article>
      {/each}
    </section>
  </div>
</main>