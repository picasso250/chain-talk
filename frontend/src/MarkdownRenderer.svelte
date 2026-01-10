<script>
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';
  
  let { content = '' } = $props();
  const htmlContent = $derived(DOMPurify.sanitize(marked(content)));
</script>

<div class="prose">
  {@html htmlContent}
</div>