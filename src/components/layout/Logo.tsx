import type { MouseEventHandler } from "react";

/**
 * NJS monogram as a tiny neuron.
 *
 * The dot is the soma. Every few seconds it fires an action potential that
 * travels along the initials (N → J → S). On hover/focus it fires immediately
 * and the initials unfold into the full name, like dendrites reaching out.
 * All motion is CSS (see `.njs-*` in globals.css) and is flattened by the
 * global prefers-reduced-motion rule.
 */
const parts = [
  { initial: "N", rest: "ataly" },
  { initial: "J", rest: "aya" },
  { initial: "S", rest: "alazar" },
] as const;

export default function Logo({ onClick }: { onClick?: MouseEventHandler<HTMLAnchorElement> }) {
  return (
    <a href="#top" className="njs-logo" onClick={onClick}>
      <span aria-hidden="true" className="njs-logo__inner">
        <span className="njs-soma">
          <span className="njs-ring" />
          <span className="njs-core" />
        </span>
        {parts.map(({ initial, rest }, i) => (
          <span key={initial} className="njs-part" style={{ ["--i" as string]: i }}>
            <span className="njs-initial">{initial}</span>
            <span className="njs-rest">
              <span>{rest}</span>
            </span>
          </span>
        ))}
      </span>
      <span className="sr-only">Nataly Jaya Salazar — back to top</span>
    </a>
  );
}
