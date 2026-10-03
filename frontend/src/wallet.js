import { BrowserProvider } from "ethers";
import { NETWORKS, DEFAULT_CHAIN_ID } from "./constants.js";

export function discoverWallets(onWallets, target = window) {
  const wallets = new Map();
  const announce = ({ detail }) => {
    if (wallets.has(detail.info.uuid)) return;
    wallets.set(detail.info.uuid, detail);
    onWallets([...wallets.values()]);
  };
  target.addEventListener("eip6963:announceProvider", announce);
  target.dispatchEvent(new Event("eip6963:requestProvider"));
  return () => target.removeEventListener("eip6963:announceProvider", announce);
}

export async function ensureNetwork(provider, targetChainId = DEFAULT_CHAIN_ID) {
  if (!provider?.request) throw new Error("Wallet not connected");
  const current = await provider.request({ method: "eth_chainId" });
  if (current !== targetChainId) {
    await provider.request({
      method: "wallet_switchEthereumChain", params: [{ chainId: targetChainId }],
    });
  }
}

export async function getCurrentChainId(provider) {
  if (!provider?.request) return DEFAULT_CHAIN_ID;
  return await provider.request({ method: "eth_chainId" });
}

export async function connectProvider(provider) {
  await provider.request({ method: "eth_requestAccounts" });
  return (await new BrowserProvider(provider).getSigner()).getAddress();
}

export function watchAccount(provider, onAccount) {
  const changed = accounts => onAccount(accounts[0] ?? null);
  const disconnected = () => onAccount(null);
  provider.on("accountsChanged", changed);
  provider.on("disconnect", disconnected);
  return () => {
    provider.removeListener("accountsChanged", changed);
    provider.removeListener("disconnect", disconnected);
  };
}

export function watchChain(provider, onChainChanged) {
  const changed = chainId => onChainChanged(chainId);
  provider.on("chainChanged", changed);
  return () => provider.removeListener("chainChanged", changed);
}
