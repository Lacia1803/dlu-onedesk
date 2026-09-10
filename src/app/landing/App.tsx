import { useCallback, useState } from "react";
import { Header, LoginModal } from "./site/Header";
import { Hero, Ticker } from "./site/Hero";
import { Features, Identity, Process, Values } from "./site/Sections";
import { Cta, Faq, Footer } from "./site/Closing";

export default function App() {
  const [loginOpen, setLoginOpen] = useState(false);
  const openLogin = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Header onLogin={openLogin} />
      <main>
        <Hero onLogin={openLogin} />
        <Ticker />
        <Values />
        <Process />
        <Features />
        <Identity />
        <Faq />
        <Cta onLogin={openLogin} />
      </main>
      <Footer />
      <LoginModal open={loginOpen} onClose={closeLogin} />
    </>
  );
}
