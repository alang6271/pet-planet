import StarField from "@/components/StarField";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ConceptSection from "@/components/ConceptSection";
import FeatureSection from "@/components/FeatureSection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

/**
 * 首页（产品介绍页）
 */
export default function Home() {
  return (
    <>
      {/* 3D 星空背景 */}
      <StarField />

      {/* 前景内容 */}
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <ConceptSection />
          <FeatureSection />
          <CtaSection />
        </main>
        <Footer />
      </div>
    </>
  );
}
