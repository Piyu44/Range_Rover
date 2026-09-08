import ScrollFrameAnimation from '../components/ScrollFrameAnimation';
import LuxuryHUD from '../components/LuxuryHUD';
import InteractiveCarParts from '../components/InteractiveCarParts';

export default function Home() {
  return (
    <main className="luxury-experience-container">
      <LuxuryHUD />
      <InteractiveCarParts />
      <ScrollFrameAnimation />
    </main>
  );
}
