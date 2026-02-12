import useScrollAnimation from "../hooks/useScrollAnimation";

export default function FeatureCard({ icon, title, desc }) {
  const [ref, visible] = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`
        bg-white/60 dark:bg-gray-900/60
        backdrop-blur-md border border-white/20
        p-6 rounded-xl shadow
        transition-all duration-700
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
      `}
    >
      <div className="mb-4">{icon}</div>
      <h4 className="font-semibold mb-3 text-gray-800 dark:text-white">
        {title}
      </h4>
      <p className="text-gray-600 dark:text-gray-400 text-sm">
        {desc}
      </p>
    </div>
  );
}
