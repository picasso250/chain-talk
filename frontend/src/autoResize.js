import { tick } from "svelte";

export function autoResize(textarea) {
  function resize() {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(Math.max(textarea.scrollHeight, 96), 256) + "px";
  }
  // Initial binding is applied during mounting; measure once it has settled.
  void tick().then(() => { if (textarea.isConnected) resize(); });
  return { update: resize };
}
