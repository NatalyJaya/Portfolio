/**
 * Open notebooks — learning resources, deliberately secondary to the
 * selected work. Descriptions match each repository's README and notebooks.
 */

export type Resource = {
  id: string;
  title: string;
  concept: string;
  purpose: string;
  covers: string[];
  status?: string;
  href: string;
  /** Which mini-schematic to draw next to the entry. */
  glyph: "pipeline" | "tree";
};

export const resources: Resource[] = [
  {
    id: "data-preprocessing",
    title: "Data Preprocessing Sample",
    concept: "Turning raw health data into a model-ready dataset",
    purpose:
      "A step-by-step notebook on the Life Expectancy (WHO) dataset, written so a beginner can follow every decision before any model is trained. The repo also collects my exercises from the Universitat de Lleida course on Python for mathematical, physical and chemical problems.",
    covers: [
      "Sanity checks & EDA",
      "Median + KNN imputation",
      "IQR outlier capping",
      "One-hot encoding",
      "pandas · seaborn · scikit-learn",
    ],
    href: "https://github.com/NatalyJaya/Data-Preprocessing-Sample",
    glyph: "pipeline",
  },
  {
    id: "multi-agent",
    title: "Multi-Agent System Demo",
    concept: "Hierarchical LLM agents with LangGraph",
    purpose:
      "A small, readable demo of the \"supervisor of supervisors\" pattern. A top-level supervisor routes work between a research team (web search, scraping) and a writing team (outlining, drafting, charts), each with its own supervisor.",
    covers: ["LangGraph StateGraph", "Structured-output routing", "Tool-using agents", "Groq · Tavily"],
    status: "Work in progress — critic, teacher, Obsidian and LaTeX agents are planned",
    href: "https://github.com/NatalyJaya/Personal-Demo-Multi-Agent-System",
    glyph: "tree",
  },
];
