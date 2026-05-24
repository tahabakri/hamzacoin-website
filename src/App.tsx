import { useCallback, useEffect } from "react";
import { useWallet } from "./hooks/useWallet";
import { useHmzContract } from "./hooks/useHmzContract";
import { useSettings } from "./hooks/useSettings";
import { useSound } from "./hooks/useSound";
import { useHaptic } from "./hooks/useHaptic";
import { useTotalSupply } from "./hooks/useTotalSupply";
import { useTransferHistory } from "./hooks/useTransferHistory";
import { CONTRACT_ADDRESS } from "./utils/constants";
import { FluidBackground } from "./components/FluidBackground";
import { Header } from "./components/Header";
import { StatusBanner } from "./components/StatusBanner";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Capabilities } from "./components/Capabilities";
import { DemoSection } from "./components/DemoSection";
import { SendForm } from "./components/SendForm";
import { Stats } from "./components/Stats";
import { NetworkActivity } from "./components/NetworkActivity";
import { NetworkInsights } from "./components/NetworkInsights";
import { Technical } from "./components/Technical";
import { Economy } from "./components/Economy";
import { FAQ } from "./components/FAQ";
import { Creator } from "./components/Creator";
import { FinalCTA } from "./components/FinalCTA";
import { Footer } from "./components/Footer";

function App() {
  const wallet = useWallet();
  const hmz = useHmzContract(wallet.provider, wallet.account, wallet.ensureSepolia);
  const settings = useSettings();
  const sound = useSound(settings.soundEnabled, settings.ambientEnabled);
  const haptic = useHaptic();
  const supply = useTotalSupply();
  const history = useTransferHistory();

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle(
      "hmz-motion-reduced",
      settings.reduceMotion,
    );
  }, [settings.reduceMotion]);

  const handleCopyContract = useCallback(() => {
    void navigator.clipboard.writeText(CONTRACT_ADDRESS);
    alert("Contract Address copied to clipboard!");
  }, []);

  const handleSendSuccess = useCallback(() => {
    sound.playDing();
    haptic.vibrateSuccess();
  }, [sound, haptic]);

  const handleSendError = useCallback(() => {
    sound.playError();
    haptic.vibrateError();
  }, [sound, haptic]);

  return (
    <>
      <FluidBackground />
      <Header
        account={wallet.account}
        isConnecting={wallet.isConnecting}
        isCorrectNetwork={wallet.isCorrectNetwork}
        onConnect={wallet.connect}
        onDisconnect={wallet.disconnect}
        settings={settings}
      />
      <StatusBanner
        error={wallet.error}
        showNetworkWarning={!!wallet.account && !wallet.isCorrectNetwork}
        onDismissError={wallet.clearError}
        onSwitchNetwork={() => {
          void wallet.ensureSepolia();
        }}
      />
      <main className="relative z-10">
        <Hero
          account={wallet.account}
          balance={hmz.balance}
          isLoadingBalance={hmz.isLoadingBalance}
          balanceError={hmz.balanceError}
          totalSupply={supply.totalSupply}
          totalSupplyDecimals={supply.decimals}
          holderCount={history.holderCount}
          reduceMotion={settings.reduceMotion}
        />
        <About />
        <Capabilities />
        <DemoSection>
          <SendForm
            account={wallet.account}
            isTxPending={hmz.isTxPending}
            txStatus={hmz.txStatus}
            onConnect={wallet.connect}
            onSend={hmz.sendHmz}
            reduceMotion={settings.reduceMotion}
            onSuccess={handleSendSuccess}
            onError={handleSendError}
          />
          <Stats
            transfers={hmz.recentTransfers}
            onCopyContract={handleCopyContract}
          />
        </DemoSection>
        <NetworkActivity decimals={supply.decimals} />
        <NetworkInsights
          account={wallet.account}
          reduceMotion={settings.reduceMotion}
        />
        <Technical />
        <Economy />
        <FAQ />
        <Creator />
        <FinalCTA account={wallet.account} onConnect={wallet.connect} />
      </main>
      <Footer onCopyContract={handleCopyContract} />
    </>
  );
}

export default App;
