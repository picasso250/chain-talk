import { BrowserProvider } from "ethers";

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
