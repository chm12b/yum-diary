import BunnyHero from "@/components/home/BunnyHero";
import HomeGreeting from "@/components/home/HomeGreeting";
import MenuList from "@/components/home/MenuList";
import SearchBar from "@/components/home/SearchBar";
import TopBar from "@/components/layout/TopBar";

export default function Home() {
  return (
    <>
      <TopBar />
      <HomeGreeting />
      <BunnyHero />
      <MenuList />
      <SearchBar />
    </>
  );
}
