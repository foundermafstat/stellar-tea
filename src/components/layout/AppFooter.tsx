const AppFooter = () => {
  return (
    <footer className="w-full border-t border-border/40 bg-card/70">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-3 px-6 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <span>
          © {new Date().getFullYear()} Stellar Tea. All rights reserved.
        </span>
        <span className="text-xs uppercase tracking-[0.3em]">
          Play · Craft · Share
        </span>
      </div>
    </footer>
  );
};

export default AppFooter;
