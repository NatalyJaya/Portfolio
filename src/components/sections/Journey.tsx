"use client";

import { useCallback, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { featured } from "@/content/journey";
import Lightbox, { type LightboxItem } from "./journey/Lightbox";
import Timeline from "./journey/Timeline";

/** Every event photo in timeline order, numbered Fig. 6.1, 6.2 … */
const items: LightboxItem[] = featured.map((it, i) => ({ ...it, fig: `6.${i + 1}` }));

export default function Journey() {
  const [light, setLight] = useState<number | null>(null);
  const closeLight = useCallback(() => setLight(null), []);

  return (
    <section id="journey" aria-labelledby="journey-title" className="page py-24 md:py-32">
      <SectionHeader
        index="06"
        eyebrow="Personal journey"
        id="journey-title"
        title="Can't Catch Me Now"
        lede="Conferences and hackathons where I learned to build with other people, in the order they happened. Open one to see its frames."
      />

      <Timeline onOpenPhoto={setLight} />

      <Lightbox items={items} index={light} onChange={setLight} onClose={closeLight} />
    </section>
  );
}
