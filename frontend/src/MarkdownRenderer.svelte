<script>
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';
  
  let { content = '' } = $props();
  
  // Configure marked to treat single line breaks as <br>
  marked.use({ breaks: true });
  const htmlContent = $derived(DOMPurify.sanitize(marked.parse(content)));
</script>

<div class="prose">
  {@html htmlContent}
</div>