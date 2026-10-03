<script>
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { discoverWallets, connectProvider, watchAccount } from "./wallet.js";
  import { loadPosts, postMessage, mergePosts, discussionTopics } from "./forum.js";
  import ReplySection from "./ReplySection.svelte";
  import MarkdownRenderer from "./MarkdownRenderer.svelte";

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

  // Measure after Svelte has applied the bound value, including programmatic changes.
  function autoResize(textarea) {
    $effect(() => {
      topicContent;
      textarea.style.height = "auto";
      textarea.style.height = Math.min(Math.max(textarea.scrollHeight, 96), 256) + "px";
    });
  }

  // EIP-6963 钱包管理
  let detectedWallets = $state([]);
  let walletProvider = $state.raw(null);
  let showWalletPicker = $state(false);
  let walletPickerElement;
  let removeWalletListeners = () => {};

  let account = $state(null);
  let topicContent = $state("");
  let posts = $state([]);
  let topics = $derived(discussionTopics(posts));
  let expandedTopics = $state(new Set());
  let loadingTopics = $state(false);
  let posting = $state(false);
  let loadError = $state("");
  let isConnecting = $state(false);
  let isPreviewMode = $state(false);

  // 用指定 provider 连接
  async function connectWithProvider(provider) {
    if (isConnecting) return;
    isConnecting = true;
    try {
      const address = await connectProvider(provider);
      removeWalletListeners();
      walletProvider = provider;
      account = address;
      removeWalletListeners = watchAccount(provider, address => {
        if (walletProvider !== provider) return;
        if (address === null) disconnectWallet();
        else account = address;
      });

      showWalletPicker = false;
      void fetchTopics();

    } catch (error) {
      console.error("Connection failed:", error);
      alert(error.message || "Connection failed.");
    } finally {
      isConnecting = false;
    }
  }

  // 连接钱包
  async function connectWallet() {
    // 已连接时不做任何事
    if (account || isConnecting) return;
    // 如果检测到多个钱包，显示选择器
    if (detectedWallets.length > 1) {
      showWalletPicker = !showWalletPicker;
      return;
    }
    if (detectedWallets.length === 1) {
      await selectWallet(detectedWallets[0]);
      return;
    }
    // 未收到钱包广播时使用默认 provider
    if (window.ethereum) {
      await connectWithProvider(window.ethereum);
      return;
    }
    alert("No wallet detected. Please install MetaMask, Rabby, or any EIP-1193 compatible wallet.");
  }

  // 点击外部关闭钱包选择器
  function closeWalletPicker(event) {
    if (!walletPickerElement?.contains(event.target)) showWalletPicker = false;
  }

  // 从选择器中选择特定钱包
  async function selectWallet(walletDetail) {
    await connectWithProvider(walletDetail.provider);
  }

  // 断开钱包
  function disconnectWallet() {
    removeWalletListeners();
    removeWalletListeners = () => {};
    account = null;
    walletProvider = null;
  }

  // 创建主题
  async function createTopic() {
    if (posting || !topicContent.trim()) return;
    if (!account) {
      await connectWallet();
      if (!account) return;
    }

    posting = true;
    try {
      const topic = await postMessage(walletProvider, topicContent);
      posts = [topic, ...posts.filter(item => item.id !== topic.id)];

      topicContent = "";
      void fetchTopics();

    } catch (error) {
      console.error("Create topic failed:", error);
      alert("Failed to create topic. See console for details.");
    } finally {
      posting = false;
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

  async function fetchTopics() {
    if (loadingTopics) return;
    loadingTopics = true;
    loadError = "";
    try {
      const indexedPosts = await loadPosts();
      posts = mergePosts(indexedPosts, posts);
    } catch (error) {
      console.error("Fetch topics failed:", error);
      loadError = "Unable to load discussions. Please retry.";
    } finally {
      loadingTopics = false;
    }
  }

  function onReplyCreated(reply) {
    posts = [reply, ...posts.filter(item => item.id !== reply.id)];
    void fetchTopics();
  }

  onMount(() => {
    // 设置EIP-6963钱包检测
    const cleanup = discoverWallets(wallets => { detectedWallets = wallets; });
    
    // 直接从The Graph获取数据，无需钱包
    void fetchTopics();
    
    // 清理事件监听器
    return () => {
      cleanup();
      removeWalletListeners();
    };
  });
</script>

<svelte:window
  onpointerdown={closeWalletPicker}
  onkeydown={(event) => { if (event.key === "Escape") showWalletPicker = false; }}
/>

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
        <!-- Ethereum mainnet -->
        <div
          class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
          style="background-color: #627eea15; border: 1px solid #627eea40; color: #627eea;"
        >
          <!-- Ethereum Logo SVG -->
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2L6 12L12 15.5L18 12L12 2Z" fill="#627eea" />
            <path d="M6 13.5L12 17L18 13.5L12 22L6 13.5Z" fill="#627eea" opacity="0.7" />
          </svg>
          Ethereum
        </div>

        <div class="relative" bind:this={walletPickerElement}>
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

          <!-- 钱包选择器下拉菜单 -->
          {#if showWalletPicker && !account}
            <div
              class="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden"
            >
              <div class="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
                Select a wallet
              </div>
              {#each detectedWallets as w (w.info.uuid)}
                <button
                  onclick={() => selectWallet(w)}
                  disabled={isConnecting}
                  class="w-full px-3 py-2.5 text-left text-sm hover:bg-green-50 hover:text-green-700 transition-colors flex items-center gap-2"
                >
                  {#if w.info.icon}
                    <img src={w.info.icon} alt="" class="w-5 h-5 rounded" />
                  {/if}
                  <span>{w.info.name}</span>
                </button>
              {/each}
              {#if window.ethereum && !detectedWallets.some(w => w.provider === window.ethereum)}
                <button
                  onclick={() => connectWithProvider(window.ethereum)}
                  disabled={isConnecting}
                  class="w-full px-3 py-2.5 text-left text-sm hover:bg-green-50 hover:text-green-700 transition-colors border-t border-gray-100"
                >
                  Default Wallet (window.ethereum)
                </button>
              {/if}
            </div>
          {/if}
        </div>
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
              use:autoResize
              bind:value={topicContent}
              placeholder="Start a conversation. First line becomes the title..."
              class="w-full bg-transparent text-base outline-none resize-none min-h-24 max-h-64 placeholder-gray-400 leading-relaxed"
              style="min-height: 96px; max-height: 256px;"
            ></textarea>
          {/if}
          <div
            class="flex justify-between items-center mt-4 border-t border-stone-900 pt-4"
          >
            <span class="text-xs text-gray-500">
              Immutable • Permanent • Censorship-resistant
            </span>
            <div class="flex items-center gap-2">
              <button
                onclick={() => isPreviewMode = !isPreviewMode}
                class="text-sm px-3 py-2 border border-gray-300 hover:border-green-500 hover:text-green-600 transition-colors duration-300"
              >
                {isPreviewMode ? "← Back to edit" : "Preview"}
              </button>
              <button
                onclick={createTopic}
                disabled={posting || !topicContent.trim()}
                class="bg-green-600 text-white hover:bg-green-700 px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {posting ? "Posting..." : "POST TOPIC"}
              </button>
            </div>
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

{#if loadError}
        <div role="alert" class="text-center py-4 text-red-700">
          {loadError}
          <button onclick={fetchTopics} disabled={loadingTopics} class="underline ml-2">Retry</button>
        </div>
      {:else if loadingTopics}
        <div class="text-center py-12 text-gray-500 italic">
          Loading topics...
        </div>
      {:else if topics.length === 0}
        <div class="text-center py-12 text-gray-500 italic">
            No topics yet. Start the first conversation.
        </div>
      {/if}

      {#each topics as topic (topic.id)}
        <article
          class="border border-gray-200 rounded-lg overflow-hidden hover:border-green-400 transition-colors duration-300 bg-white shadow-sm"
        >
          <!-- Topic Header (Always Visible) -->
          <button
            type="button"
            class="w-full p-4 cursor-pointer hover:bg-gray-50 transition-colors text-left"
            onclick={() => toggleTopic(topic.id)}
            onkeydown={(e) => e.key === "Enter" && toggleTopic(topic.id)}
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="text-base font-medium text-gray-800">
                    {getTitle(topic.content)}
                  </h3>
                  {#if topic.replies.length > 0}
                    <span
                      class="text-xs bg-green-100 text-green-600 px-2 py-1 rounded"
                    >
                      {topic.replies.length}
                      {topic.replies.length === 1 ? "reply" : "replies"}
                    </span>
                  {/if}
                </div>
                <div class="flex items-center gap-3 text-xs text-gray-500">
                  <span class="text-green-600 font-medium"
                    >{formatTime(topic.timestamp)}</span
                  >
                  <a
                    href="https://etherscan.io/address/{topic.author}"
                    target="_blank"
                    class="font-mono text-xs hover:text-gray-700 hover:underline decoration-gray-300"
                  >
                    {topic.author.slice(0, 6)}...{topic.author.slice(-4)}
                  </a>
                  <a
                    href="https://etherscan.io/tx/{topic.transactionHash}"
                    target="_blank"
                    class="hover:text-gray-700 hover:underline decoration-gray-300"
                    onclick={(e) => e.stopPropagation()}
                  >
                    tx/{topic.transactionHash.slice(0, 6)}...{topic.transactionHash.slice(-6)}
                  </a>
                </div>
              </div>
              <div class="text-gray-400 ml-4">
                {expandedTopics.has(topic.id) ? "▼" : "▶"}
              </div>
            </div>
          </button>

          <!-- Expanded Content -->
          {#if expandedTopics.has(topic.id)}
            <div
              class="border-t border-gray-200"
              transition:slide={{ duration: 300 }}
            >
              <!-- Topic Content -->
              <div class="p-4 bg-gray-50">
                <MarkdownRenderer content={topic.content} />
              </div>

              <ReplySection topicId={topic.id} {account} {walletProvider} replies={topic.replies} {onReplyCreated} />
            </div>
          {/if}
        </article>
      {/each}
    </section>
  </div>
</main>
