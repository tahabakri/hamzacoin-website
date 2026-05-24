import { useCallback } from "react";
import { useWallet } from "./hooks/useWallet";
import { useHmzContract } from "./hooks/useHmzContract";
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
import { Technical } from "./components/Technical";
import { Economy } from "./components/Economy";
import { FAQ } from "./components/FAQ";
import { Creator } from "./components/Creator";
import { FinalCTA } from "./components/FinalCTA";
import { Footer } from "./components/Footer";

function App() {
  const wallet = useWallet();
  const hmz = useHmzContract(wallet.provider, wallet.account, wallet.ensureSepolia);

  const handleCopyContract = useCallback(() => {
    void navigator.clipboard.writeText(CONTRACT_ADDRESS);
    alert("Contract Address copied to clipboard!");
  }, []);

  return (
    <>
      <FluidBackground />
      <Header
        account={wallet.account}
        isConnecting={wallet.isConnecting}
        isCorrectNetwork={wallet.isCorrectNetwork}
        onConnect={wallet.connect}
        onDisconnect={wallet.disconnect}
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
          />
          <Stats
            transfers={hmz.recentTransfers}
            onCopyContract={handleCopyContract}
          />
        </DemoSection>
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
