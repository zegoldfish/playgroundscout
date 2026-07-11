import PlaygroundScoutBanner from "@/app/components/PlaygroundScoutBanner";
import NearbyPlaygrounds from "@/app/components/NearbyPlaygrounds";
import styles from "@/app/page.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <PlaygroundScoutBanner />
        <p className={styles.heroTagline}>Discover and Explore the Best Playgrounds Near You</p>
      </div>
      <section className={styles.playgroundsSection}>
        <h2 className={styles.sectionTitle}>Nearby Playgrounds</h2>
        <NearbyPlaygrounds />
      </section>
    </div>
  );
}
