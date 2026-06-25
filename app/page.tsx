import BunnyHero from "@/components/home/BunnyHero";
import HomeGreeting from "@/components/home/HomeGreeting";
import HomeSearchSection from "@/components/home/HomeSearchSection";
import MenuList from "@/components/home/MenuList";
import TopBar from "@/components/layout/TopBar";

export default function Home() {
  return (
    <>
      <TopBar />
      <HomeGreeting />
      <BunnyHero />
      <MenuList />
      <HomeSearchSection />
    </>
  );
}
