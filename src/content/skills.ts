/**
 * Skills, each tied to where it was actually used. No proficiency scores:
 * a tag's size in the sphere reflects how many places it appears in
 * (`evidence.length`), not a self-rating.
 *
 * - "applied"  → used in a project, resource or role listed on this site / CV
 * - "learning" → coursework-level so far (certificates, exercises)
 */

export type SkillCategory = "languages" | "web" | "data" | "infra";

export type Skill = {
  name: string;
  category: SkillCategory;
  level: "applied" | "learning";
  evidence: string[];
};

export const skillCategories: { id: SkillCategory; label: string; color: string }[] = [
  { id: "languages", label: "Languages", color: "var(--violet)" },
  { id: "web", label: "Web & Backend", color: "var(--blue)" },
  { id: "data", label: "AI & Data", color: "var(--cyan)" },
  { id: "infra", label: "Infrastructure & Tools", color: "var(--amber)" },
];

export const skills: Skill[] = [
  // Languages
  { name: "Python", category: "languages", level: "applied", evidence: ["StreamSync", "Translator UABTheHack", "Data Preprocessing Sample", "Multi-Agent System Demo"] },
  { name: "Kotlin", category: "languages", level: "applied", evidence: ["JetFlow"] },
  { name: "JavaScript", category: "languages", level: "applied", evidence: ["StreamSync", "LleidaHack website"] },
  { name: "TypeScript", category: "languages", level: "applied", evidence: ["This portfolio"] },
  { name: "Java", category: "languages", level: "applied", evidence: ["University coursework"] },
  { name: "C++", category: "languages", level: "applied", evidence: ["University coursework"] },
  { name: "C#", category: "languages", level: "applied", evidence: ["LauzHack 2024 (Unity)"] },
  { name: "SQL", category: "languages", level: "applied", evidence: ["University coursework"] },
  { name: "Bash", category: "languages", level: "applied", evidence: ["University coursework"] },

  // Web & Backend
  { name: "Django", category: "web", level: "applied", evidence: ["StreamSync"] },
  { name: "HTML & CSS", category: "web", level: "applied", evidence: ["StreamSync", "LleidaHack website", "This portfolio"] },
  { name: "Tailwind CSS", category: "web", level: "applied", evidence: ["StreamSync", "This portfolio"] },
  { name: "React", category: "web", level: "applied", evidence: ["This portfolio"] },
  { name: "Next.js", category: "web", level: "applied", evidence: ["This portfolio"] },
  { name: "REST APIs", category: "web", level: "applied", evidence: ["JetFlow (Render, GitHub)", "StreamSync (catalog API)"] },

  // AI & Data
  { name: "pandas", category: "data", level: "applied", evidence: ["Data Preprocessing Sample", "UdL scientific Python course"] },
  { name: "NumPy", category: "data", level: "applied", evidence: ["Data Preprocessing Sample", "UdL scientific Python course"] },
  { name: "scikit-learn", category: "data", level: "applied", evidence: ["Data Preprocessing Sample"] },
  { name: "Matplotlib & Seaborn", category: "data", level: "applied", evidence: ["Data Preprocessing Sample", "UdL scientific Python course"] },
  { name: "Jupyter", category: "data", level: "applied", evidence: ["Data Preprocessing Sample", "Multi-Agent System Demo"] },
  { name: "LangGraph", category: "data", level: "applied", evidence: ["Multi-Agent System Demo"] },
  { name: "SciPy", category: "data", level: "learning", evidence: ["UdL scientific Python course"] },
  { name: "Machine learning", category: "data", level: "learning", evidence: ["Stanford Online — ML for Healthcare", "Kaggle — Intro to ML"] },
  { name: "Deep learning", category: "data", level: "learning", evidence: ["Kaggle — Intro to Deep Learning"] },

  // Infrastructure & Tools
  { name: "Git & GitHub", category: "infra", level: "applied", evidence: ["Every project here"] },
  { name: "GitHub Actions", category: "infra", level: "applied", evidence: ["StreamSync quality gates", "This portfolio's CI/CD"] },
  { name: "Docker", category: "infra", level: "applied", evidence: ["StreamSync"] },
  { name: "Render", category: "infra", level: "applied", evidence: ["JetFlow", "StreamSync"] },
  { name: "IntelliJ Platform SDK", category: "infra", level: "applied", evidence: ["JetFlow"] },
  { name: "Gradle", category: "infra", level: "applied", evidence: ["JetFlow"] },
  { name: "Cloudinary", category: "infra", level: "applied", evidence: ["StreamSync"] },
  { name: "Unity", category: "infra", level: "applied", evidence: ["LauzHack 2024", "LAN Party Lleida"] },
  { name: "Linux", category: "infra", level: "applied", evidence: ["Development environment (CV)"] },
  { name: "Jira", category: "infra", level: "applied", evidence: ["LleidaHack"] },
  { name: "Figma", category: "infra", level: "applied", evidence: ["LleidaHack"] },
  { name: "LaTeX", category: "infra", level: "applied", evidence: ["Reports & CV"] },
];
