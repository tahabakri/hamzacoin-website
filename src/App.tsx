import { useCallback, useEffect } from "react";
import { useWallet } from "./hooks/useWallet";
import { useHmzContract } from "./hooks/useHmzContract";
import { useSettings } from "./hooks/useSettings";
import { useSound } from "./hooks/useSound";
import { useHaptic } from "./hooks/useHaptic";
import { useTotalSupply } from "./hooks/useTotalSupply";
import { useTransferHistory } from "./hooks/useTransferHistory";
import { useTransferEvents } from "./hooks/useTransferEvents";
import { useGhostTransfers } from "./hooks/useGhostTransfers";
import { CONTRACT_ADDRESS } from "./utils/constants";
import { ErrorBoundary } from "./components/ErrorBoundary";
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
import { TransactionMap } from "./components/TransactionMap";
import { NetworkInsights } from "./components/NetworkInsights";
import { AudioVisualizer } from "./components/AudioVisualizer";
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
  const liveTransfers = useTransferEvents(supply.decimals);
  const ghostTransfers = useGhostTransfers(settings.demoMode);

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
        <ErrorBoundary label="NetworkActivity">
          <NetworkActivity
            realEvents={liveTransfers}
            ghostEvents={ghostTransfers}
            demoMode={settings.demoMode}
          />
        </ErrorBoundary>
        <ErrorBoundary label="TransactionMap">
          <TransactionMap
            realEvents={liveTransfers}
            ghostEvents={ghostTransfers}
            reduceMotion={settings.reduceMotion}
            demoMode={settings.demoMode}
            onEnableDemo={() => settings.setDemoMode(true)}
          />
        </ErrorBoundary>
        <ErrorBoundary label="NetworkInsights">
          <NetworkInsights
            account={wallet.account}
            reduceMotion={settings.reduceMotion}
          />
        </ErrorBoundary>
        <Technical />
        <Economy />
        <FAQ />
        <Creator />
        <FinalCTA account={wallet.account} onConnect={wallet.connect} />
      </main>
      <Footer onCopyContract={handleCopyContract} />
      <AudioVisualizer
        enabled={settings.soundEnabled}
        lastPlayedAt={sound.lastPlayedAt}
        getAnalyser={sound.getAnalyser}
      />
    </>
  );
}

export default App;
