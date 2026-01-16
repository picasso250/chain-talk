<script>
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { ethers } from "ethers";
  import { CONTRACT_ADDRESS, CONTRACT_ABI, TARGET_CHAIN_ID } from "./constants";
  import ReplySection from "./ReplySection.svelte";
  import MarkdownRenderer from "./MarkdownRenderer.svelte";


  // EIP-6963 钱包管理
  let detectedWallets = $state([]);
  let selectedWalletInfo = $state(null);

let account = $state(null);
let topicContent = $state("");
let topics = $state([]);
let allReplies = $state([]); // 预加载所有回复
let expandedTopics = $state(new Set());
let loading = $state(false);
let isConnecting = $state(false);
let isPreviewMode = $state(false);
let hasWallet = $state(!!window.ethereum);

  // EIP-6963 钱包检测
  function setupEIP6963() {
    const providers = [];
    
    const handleAnnounceProvider = (event) => {
      const { info, provider } = event.detail;
      
      if (!providers.some(p => p.info.uuid === info.uuid)) {
        providers.push(event.detail);
        console.log('🎯 发现新钱包:', info.name, info.rdns);
        detectedWallets = [...providers];
        
        // 检查是否是当前选中的钱包
        if (window.ethereum === provider) {
          selectedWalletInfo = info;
          console.log('✅ 当前选择的钱包:', info.name, info.rdns);
        }
      }
    };

    // 监听钱包广播
    window.addEventListener('eip6963:announceProvider', handleAnnounceProvider);
    
    // 主动请求钱包广播
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    
    // 返回清理函数
    return () => {
      window.removeEventListener('eip6963:announceProvider', handleAnnounceProvider);
    };
  }

  // 检查并切换网络
  async function checkNetwork() {
    if (!window.ethereum) return;
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (chainId !== TARGET_CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
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
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer,
      );

      const tx = await contract.createTopic(topicContent);
      console.log("Transaction sent:", tx.hash);

      await tx.wait();

      topicContent = "";
      await fetchTopics();
      await fetchAllReplies();
    } catch (error) {
      console.error("Create topic failed:", error);
      alert("Failed to create topic. See console for details.");
    } finally {
      loading = false;
    }
  }

  // 获取标题（第一行，最多100字符）
  function getTitle(content) {
    const firstLine = content.split("\n")[0];
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

  // 从The Graph获取所有回复数据
  async function fetchAllReplies() {
    try {
      const endpoint = "https://api.studio.thegraph.com/query/1723159/chain-talk/version/latest";
      const graphqlQuery = {
        query: `
          query {
            topics(orderBy: timestamp, orderDirection: desc) {
              id
              replies(orderBy: timestamp, orderDirection: asc) {
                id
                author
                content
                timestamp
              }
            }
          }
        `
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(graphqlQuery)
      });

      const data = await response.json();
      
      // 扁平化所有回复到一个数组
      allReplies = [];
      data.data.topics.forEach(topic => {
        topic.replies.forEach(reply => {
            allReplies.push({
            replyId: parseInt(reply.id),
            topicId: parseInt(topic.id),
            author: reply.author,
            timestamp: reply.timestamp,
            content: reply.content,
            transactionHash: reply.id
          });
        });
      });

    } catch (error) {
      console.error("Fetch all replies failed:", error);
      allReplies = [];
    }
  }

  // 获取回复数量（从预加载的数据中计算）
  function getReplyCount(topicId) {
    return allReplies.filter(reply => reply.topicId === topicId).length;
  }

  // 获取特定主题的回复
  function getRepliesForTopic(topicId) {
    return allReplies.filter(reply => reply.topicId === topicId);
  }

  // 从The Graph获取主题数据
  async function fetchTopics() {
    loading = true;
    try {
      const endpoint = "https://api.studio.thegraph.com/query/1723159/chain-talk/version/latest";
      const graphqlQuery = {
        query: `
          query {
            topics(orderBy: timestamp, orderDirection: desc) {
              id
              author
              content
              timestamp
              replies(orderBy: timestamp, orderDirection: asc) {
                id
                author
                content
              }
            }
          }
        `
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(graphqlQuery)
      });

      const data = await response.json();
      
      // 转换数据格式以匹配现有结构
      topics = data.data.topics.map((topic, index) => ({
        topicId: parseInt(topic.id),
        author: topic.author,
        timestamp: topic.timestamp,
        content: topic.content,
        transactionHash: topic.id, // 使用id作为tx hash的替代
        replyCount: topic.replies.length
      }));

    } catch (error) {
      console.error("Fetch topics failed:", error);
      topics = [];
    } finally {
      loading = false;
    }
  }

onMount(async () => {
    // 设置EIP-6963钱包检测
    const cleanup = setupEIP6963();
    
    // 直接从The Graph获取数据，无需钱包
    await fetchTopics();
    await fetchAllReplies();
    
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          account = accounts[0];
        } else {
          account = null;
        }
      });
    }
    
    // 清理事件监听器
    return cleanup;
  });
</script>

<main
  class="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-green-100 selection:text-green-800 leading-relaxed"
>
<!--Navbar -->
  <nav
    class="border-b border-gray-200 p-4 sticky top-0 bg-white/95 backdrop-blur z-10"
  >
<div class="px-4 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center sm:gap-0">
      <h1 class="text-xl font-bold text-green-600">
        Chain Talk
        <span class="text-xs text-gray-500 font-normal block sm:inline sm:ml-2">
          // Eternal Conversations
        </span>
      </h1>

      <div class="flex items-center justify-between sm:justify-end gap-3">
        <!-- Arbitrum Network Badge -->
        <div
          class="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-medium text-blue-700"
        >
          <!-- Arbitrum Logo SVG -->
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" fill="#28A0F0" />
            <path
              d="M8 12L11 15L16 9"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Arbitrum
        </div>

        <button
          onclick={connectWallet}
          class="text-sm px-3 py-1.5 border border-gray-300 hover:border-green-500 hover:text-green-600 transition-colors duration-300 disabled:opacity-50"
          disabled={isConnecting}
        >
          {#if account}
            {account.slice(0, 6)}...{account.slice(-4)}
          {:else}
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          {/if}
        </button>
      </div>
    </div>
  </nav>

  <div class="max-w-3xl mx-auto p-4 pt-8">
    <!-- New Topic -->
    <section class="mb-12">
      <div class="relative group">
        <div
          class="absolute -inset-0.5 bg-gradient-to-r from-green-100 to-gray-200 rounded opacity-50 group-hover:opacity-70 transition duration-500 blur"
        ></div>
        <div
          class="relative bg-white p-6 rounded border border-gray-200 shadow-sm"
        >
           <!-- Toggle Buttons -->
           <div class="flex gap-2 mb-3">
             <button
               class="px-3 py-1 text-sm font-medium transition-colors rounded-md"
               class:bg-green-100={!isPreviewMode}
               class:text-green-700={!isPreviewMode}
               class:bg-gray-100={isPreviewMode}
               class:text-gray-600={isPreviewMode}
               onclick={() => isPreviewMode = false}
             >
               Edit
             </button>
             <button
               class="px-3 py-1 text-sm font-medium transition-colors rounded-md"
               class:bg-green-100={isPreviewMode}
               class:text-green-700={isPreviewMode}
               class:bg-gray-100={!isPreviewMode}
               class:text-gray-600={!isPreviewMode}
               onclick={() => isPreviewMode = true}
             >
               Preview
             </button>
           </div>

           {#if isPreviewMode}
             <!-- Preview Mode -->
             <div class="min-h-24 max-h-64 overflow-y-auto p-3 bg-gray-50 rounded border border-gray-200">
               {#if topicContent.trim()}
                 <MarkdownRenderer content={topicContent} />
               {:else}
                 <p class="text-gray-400 italic">Nothing to preview...</p>
               {/if}
             </div>
           {:else}
             <!-- Edit Mode -->
             <textarea
               bind:value={topicContent}
               placeholder="Start a conversation. First line becomes the title..."
               class="w-full bg-transparent text-base outline-none resize-none min-h-24 max-h-64 placeholder-gray-400 leading-relaxed"
               style="height: auto; min-height: 96px; max-height: 256px;"
               oninput={(e) => {
                 e.target.style.height = 'auto';
                 e.target.style.height = Math.min(Math.max(e.target.scrollHeight, 96), 256) + 'px';
               }}
             ></textarea>
           {/if}
          <div
            class="flex justify-between items-center mt-4 border-t border-stone-900 pt-4"
          >
            <span class="text-xs text-gray-500">
              Immutable • Permanent • Anonymous
            </span>
            <button
              onclick={createTopic}
              disabled={loading || !topicContent.trim()}
              class="bg-green-600 text-white hover:bg-green-700 px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Posting..." : "POST TOPIC"}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Topics -->
    <section class="space-y-6">
      <div class="flex items-center gap-4">
        <h2 class="text-2xl font-bold text-gray-800">Topics</h2>
        <div class="h-px bg-gray-200 flex-1"></div>
      </div>

{#if loading}
        <div class="text-center py-12 text-gray-500 italic">
          Loading topics...
        </div>
      {:else if topics.length === 0}
        <div class="text-center py-12 text-gray-500 italic">
            No topics yet. Start the first conversation.
        </div>
      {/if}

      {#each topics as topic (topic.transactionHash)}
        <article
          class="border border-gray-200 rounded-lg overflow-hidden hover:border-green-400 transition-colors duration-300 bg-white shadow-sm"
        >
          <!-- Topic Header (Always Visible) -->
          <button
            type="button"
            class="w-full p-4 cursor-pointer hover:bg-gray-50 transition-colors text-left"
            onclick={() => toggleTopic(topic.topicId)}
            onkeydown={(e) => e.key === "Enter" && toggleTopic(topic.topicId)}
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="text-base font-medium text-gray-800">
                    {getTitle(topic.content)}
                  </h3>
                  {#if topic.replyCount > 0}
                    <span
                      class="text-xs bg-green-100 text-green-600 px-2 py-1 rounded"
                    >
                      {topic.replyCount}
                      {topic.replyCount === 1 ? "reply" : "replies"}
                    </span>
                  {/if}
                </div>
                <div class="flex items-center gap-3 text-xs text-gray-500">
                  <span class="text-green-600 font-medium"
                    >{topic.timestamp}</span
                  >
                  <a
                    href="https://arbiscan.io/address/{topic.author}"
                    target="_blank"
                    class="font-mono text-xs hover:text-gray-700 hover:underline decoration-gray-300"
                  >
                    {topic.author.slice(0, 6)}...{topic.author.slice(-4)}
                  </a>
                  <a
                    href="https://arbiscan.io/tx/{topic.hash}"
                    target="_blank"
                    class="hover:text-gray-700 hover:underline decoration-gray-300"
                    onclick={(e) => e.stopPropagation()}
                  >
                    tx/{topic.transactionHash.slice(0, 6)}...{topic.transactionHash.slice(-6)}
                  </a>
                </div>
              </div>
              <div class="text-gray-400 ml-4">
                {expandedTopics.has(topic.topicId) ? "▼" : "▶"}
              </div>
            </div>
          </button>

          <!-- Expanded Content -->
          {#if expandedTopics.has(topic.topicId)}
            <div
              class="border-t border-gray-200"
              transition:slide={{ duration: 300 }}
            >
              <!-- Topic Content -->
              <div class="p-4 bg-gray-50">
                <MarkdownRenderer content={topic.content} />
              </div>

              <ReplySection topicId={topic.topicId} {account} replies={getRepliesForTopic(topic.topicId)} />
            </div>
          {/if}
        </article>
      {/each}
    </section>
  </div>
</main>
