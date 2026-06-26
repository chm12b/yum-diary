import BunnyHero from "@/components/home/BunnyHero";
import HomeEntryList from "@/components/home/HomeEntryList";
import HomeGreeting from "@/components/home/HomeGreeting";
import HomeSearchSection from "@/components/home/HomeSearchSection";
import TopBar from "@/components/layout/TopBar";

export default function Home() {
  return (
    <>
      <TopBar />
      <HomeGreeting />
      <BunnyHero />
      <HomeEntryList />
      <HomeSearchSection />
    </>
  );
}
