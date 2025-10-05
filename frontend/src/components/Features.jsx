const features = [
  {
    title: "AI-Driven Processing",
    description:
      "Automatically extract, classify, and index documents with advanced machine learning.",
  },
  {
    title: "Compliance & Security",
    description:
      "Ensure enterprise-scale compliance and secure document handling at every step.",
  },
  {
    title: "Workflow Orchestration",
    description:
      "Seamless BPMN-powered workflow automation for end-to-end document lifecycle management.",
  },
];

const Features = () => (
  <section id="features" className="py-16 bg-white">
    <h2 className="text-2xl font-bold text-center text-blue-800 mb-8">
      Key Features
    </h2>
    <div className="flex flex-col md:flex-row gap-8 max-w-4xl mx-auto">
      {features.map((f, i) => (
        <div
          key={i}
          className="flex-1 bg-blue-50 rounded-lg p-6 shadow hover:shadow-lg transition"
        >
          <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
          <p className="text-gray-700">{f.description}</p>
        </div>
      ))}
    </div>
  </section>
);

export default Features;
