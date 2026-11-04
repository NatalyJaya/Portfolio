import SectionHeader from "@/components/ui/SectionHeader";
import Connectome from "./Connectome";

export default function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="page py-24 md:py-32">
      <SectionHeader
        index="04"
        eyebrow="Technical skills"
        id="skills-title"
        title="A small connectome"
        lede="The tools I've used, grouped into regions and wired to their neighbours. No self-rated percentages: each skill points to the project, course or role it comes from."
      />
      <div className="mt-12 md:mt-16">
        <Connectome />
      </div>
    </section>
  );
}
