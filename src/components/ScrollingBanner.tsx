interface ScrollingBannerProps {
  text: string;
}

export const ScrollingBanner = ({ text }: ScrollingBannerProps) => {
  return (
    <div className="relative w-full overflow-hidden bg-black border-y border-primary py-1.5">
      <div className="flex animate-scroll-infinite-fast">
        {/* Repetir o texto múltiplas vezes para criar efeito infinito */}
        {[...Array(20)].map((_, i) => (
          <div key={i} className="flex items-center whitespace-nowrap px-4">
            <span className="text-base md:text-lg font-astro font-bold text-primary">
              {text}
            </span>
            <span className="mx-4 text-primary text-lg">•</span>
          </div>
        ))}
      </div>
    </div>
  );
};
