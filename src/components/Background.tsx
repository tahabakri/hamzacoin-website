export function Background() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="hmz-bg-blob-one absolute top-[-12%] left-[-12%] w-[52vw] h-[52vw] rounded-full bg-amber-100/40 blur-[7.5rem] will-change-transform"></div>
      <div className="hmz-bg-blob-two absolute bottom-[-18%] right-[-10%] w-[62vw] h-[62vw] rounded-full bg-orange-100/20 blur-[8.75rem] will-change-transform"></div>
      <div className="hmz-bg-blob-three absolute top-[36%] left-[36%] w-[30vw] h-[30vw] rounded-full bg-white/50 blur-[5rem] will-change-transform"></div>
      <div
        className="hmz-bg-dots absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(67,48,36,0.09) 1px, transparent 0)",
          backgroundSize: "2rem 2rem",
        }}
      ></div>
    </div>
  );
}
