<script>
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { ethers } from "ethers";
  import { CONTRACT_ADDRESS, CONTRACT_ABI, TARGET_CHAIN_ID } from "./constants";
  import ReplySection from "./ReplySection.svelte";
  import MarkdownRenderer from "./MarkdownRenderer.svelte";

  let account = $state(null);
  let topicContent = $state("");
  let topics = $state([]);
  let expandedTopics = $state(new Set());
  let loading = $state(false);
  let isConnecting = $state(false);

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

  // 读取主题
  async function fetchTopics() {
    try {
      let provider;
      if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        return;
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider,
      );

      const filter = contract.filters.TopicCreated();
      const logs = await contract.queryFilter(filter);

      const parsedLogs = logs.map((log) => {
        return {
          topicId: log.args[0],
          author: log.args[1],
          timestamp: new Date(Number(log.args[2]) * 1000).toLocaleString(),
          content: log.args[3],
          blockNumber: log.blockNumber,
          hash: log.transactionHash,
          replyCount: 0, // 初始化为0，稍后获取
        };
      });

      // 为每个主题获取回复数量
      for (let topic of parsedLogs) {
        try {
          topic.replyCount = await contract.getReplyCount(topic.topicId);
        } catch (error) {
          console.warn(
            `Failed to get reply count for topic ${topic.topicId}:`,
            error,
          );
          topic.replyCount = 0;
        }
      }

      topics = parsedLogs.reverse();
    } catch (error) {
      console.error("Fetch topics failed:", error);
    }
  }

  onMount(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          account = accounts[0];
        } else {
          account = null;
        }
      });
      fetchTopics();
    }
  });
</script>

<main
  class="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-green-100 selection:text-green-800 leading-relaxed"
>
  <!--Navbar -->
  <nav
    class="border-b border-gray-200 p-4 sticky top-0 bg-white/95 backdrop-blur z-10"
  >
    <div class="max-w-3xl mx-auto flex justify-between items-center">
      <h1 class="text-xl font-bold text-green-600">
        Chain Talk
        <span class="text-xs text-gray-500 font-normal block sm:inline sm:ml-2">
          // Eternal Conversations
        </span>
      </h1>

      <div class="flex items-center gap-3">
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
          <textarea
            bind:value={topicContent}
            placeholder="Start a conversation. First line becomes the title..."
            class="w-full bg-transparent text-base outline-none resize-none h-24 placeholder-gray-400 leading-relaxed"
          ></textarea>
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

      {#if topics.length === 0}
        <div class="text-center py-12 text-gray-500 italic">
          No topics yet. Start the first conversation.
        </div>
      {/if}

      {#each topics as topic (topic.hash)}
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
                    tx/{topic.hash.slice(0, 6)}...{topic.hash.slice(-6)}
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

              <ReplySection topicId={topic.topicId} {account} />
            </div>
          {/if}
        </article>
      {/each}
    </section>
  </div>
</main>
