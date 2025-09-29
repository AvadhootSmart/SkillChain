import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import TransitionLink from "../transitionLink";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { MoveRight } from "lucide-react";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(() => ["borders", "middlemen", "limits"], []);

  const router = useRouter();
  const { openConnectModal } = useConnectModal();
  const { isConnected, address } = useAccount();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  const handleGetStarted = () => {
    if (!isConnected && openConnectModal) {
      openConnectModal();
    } else {
      router.push("/sign-up");
    }
    if (isConnected && address) {
      router.push("/sign-up");
    }
  };

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Button variant="secondary" size="sm" className="gap-4">
              Discover skills on-chain
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-spektr-cyan-50">Work without</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              A decentralized freelance marketplace that connects global talent
              and clients directly—secure, transparent, and fair.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            {/* <TransitionLink href="/sign-up"> */}
            <Button onClick={handleGetStarted} size="lg" className="gap-4">
              Get Started <MoveRight className="w-4 h-4" />
            </Button>
            {/* </TransitionLink> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
