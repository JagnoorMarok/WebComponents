import React, { useState } from "react";
import "./ComponentCodeExplainer.css";
import { COMPONENTS_CODE_DATA } from "@/data/components-code-data";
import {
  IconCode,
  IconCopy,
  IconCheck,
  IconSparkles,
  IconTerminal,
  IconAdjustments,
  IconArrowUp,
} from "@tabler/icons-react";

export default function ComponentCodeExplainer({ componentId }) {
  const [activeTab, setActiveTab] = useState("architecture"); // 'architecture' | 'code' | 'usage' | 'props'
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUsage, setCopiedUsage] = useState(false);

  const data = COMPONENTS_CODE_DATA[componentId] || {
    title: componentId ? componentId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Component",
    category: "Interactive Component",
    badge: "LAB COMPONENT",
    author: "Lab Architecture",
    description: "Interactive component built with modern React, pure CSS, and high-performance physics.",
    howItWorks: [
      {
        title: "1. Component Architecture",
        desc: "Engineered using modular React state, requestAnimationFrame or CSS hardware-accelerated transforms.",
      },
      {
        title: "2. Physics & Motion",
        desc: "Calculates dynamic spatial matrices, dampening curves, and boundary collisions for organic user interaction.",
      },
      {
        title: "3. Styling & Responsive Design",
        desc: "Crafted with pure custom CSS and glassmorphic elevation without rigid framework dependencies.",
      },
    ],
    techStack: ["React", "Pure JSX", "Custom CSS", "Modern Web APIs"],
    dependencies: ["react", "react-dom"],
    usageSnippet: `// Drop-in usage for ${componentId}\nimport Component from "@/components/${componentId}";\n\nexport default function App() {\n  return <Component />;\n}`,
    componentCode: `// Implementation for ${componentId}\n// Check src/components for the full source file`,
    props: [
      { name: "className", type: "string", default: "''", desc: "Custom CSS class name" },
      { name: "style", type: "CSSProperties", default: "{}", desc: "Inline CSS styles" },
    ],
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedUsage(true);
      setTimeout(() => setCopiedUsage(false), 2000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section id="component-code-section" className="cce-container">
      <div className="cce-inner">
        {/* Header */}
        <div className="cce-header">
          <div>
            <div className="cce-meta-badge-row">
              <span className="cce-badge">{data.badge}</span>
            </div>
            <h2 className="cce-title">
              How We Built <span>{data.title}</span>
            </h2>
            <p className="cce-desc">{data.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="cce-header-actions">
            <button
              onClick={() => copyToClipboard(data.componentCode, "code")}
              className="cce-btn cce-btn-primary"
            >
              {copiedCode ? <IconCheck size={15} /> : <IconCopy size={15} />}
              <span>{copiedCode ? "Copied Source!" : "Copy Source"}</span>
            </button>
            <button
              onClick={() => copyToClipboard(data.usageSnippet, "usage")}
              className="cce-btn"
            >
              {copiedUsage ? <IconCheck size={15} /> : <IconTerminal size={15} />}
              <span>{copiedUsage ? "Copied Usage!" : "Copy Usage"}</span>
            </button>
            <button onClick={scrollToTop} className="cce-btn" title="Back to top">
              <IconArrowUp size={15} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="cce-tabs">
          <button
            onClick={() => setActiveTab("architecture")}
            className={`cce-tab ${activeTab === "architecture" ? "active" : ""}`}
          >
            <IconSparkles size={16} />
            <span>How We Made It</span>
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`cce-tab ${activeTab === "code" ? "active" : ""}`}
          >
            <IconCode size={16} />
            <span>Component Source Code</span>
          </button>
          <button
            onClick={() => setActiveTab("usage")}
            className={`cce-tab ${activeTab === "usage" ? "active" : ""}`}
          >
            <IconTerminal size={16} />
            <span>Installation & Usage</span>
          </button>
          <button
            onClick={() => setActiveTab("props")}
            className={`cce-tab ${activeTab === "props" ? "active" : ""}`}
          >
            <IconAdjustments size={16} />
            <span>Props & Parameters</span>
          </button>
        </div>

        {/* Tab 1: How We Made It (Architecture & Key Techniques) */}
        {activeTab === "architecture" && (
          <div>
            <div className="cce-grid">
              {data.howItWorks.map((step, idx) => (
                <div key={idx} className="cce-card">
                  <h3 className="cce-card-title">{step.title}</h3>
                  <p className="cce-card-desc">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* Tech Stack Chips */}
            <div className="cce-tech-row">
              <span style={{ fontSize: "0.8rem", color: "#71717a", alignSelf: "center", marginRight: "0.5rem" }}>
                Technologies & APIs:
              </span>
              {data.techStack.map((tech) => (
                <span key={tech} className="cce-tech-chip">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Full Component Source Code */}
        {activeTab === "code" && (
          <div className="cce-code-box">
            <div className="cce-code-header">
              <span>Source Implementation (JSX)</span>
              <button
                onClick={() => copyToClipboard(data.componentCode, "code")}
                className="cce-btn"
                style={{ padding: "0.3rem 0.7rem", fontSize: "0.75rem" }}
              >
                {copiedCode ? <IconCheck size={13} /> : <IconCopy size={13} />}
                <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>
            <pre className="cce-code-pre">
              <code>{data.componentCode}</code>
            </pre>
          </div>
        )}

        {/* Tab 3: Usage Snippet */}
        {activeTab === "usage" && (
          <div className="cce-code-box">
            <div className="cce-code-header">
              <span>Quick Drop-In Example</span>
              <button
                onClick={() => copyToClipboard(data.usageSnippet, "usage")}
                className="cce-btn"
                style={{ padding: "0.3rem 0.7rem", fontSize: "0.75rem" }}
              >
                {copiedUsage ? <IconCheck size={13} /> : <IconCopy size={13} />}
                <span>{copiedUsage ? "Copied!" : "Copy Snippet"}</span>
              </button>
            </div>
            <pre className="cce-code-pre">
              <code>{data.usageSnippet}</code>
            </pre>
          </div>
        )}

        {/* Tab 4: Props & Parameters Table */}
        {activeTab === "props" && (
          <div className="cce-table-wrapper">
            <table className="cce-table">
              <thead>
                <tr>
                  <th>Prop Name</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {data.props.map((p) => (
                  <tr key={p.name}>
                    <td className="cce-prop-name">{p.name}</td>
                    <td className="cce-prop-type">{p.type}</td>
                    <td className="cce-prop-default">{p.default}</td>
                    <td>{p.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
