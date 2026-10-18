interface ExecutiveCardProps {
  name: string;
  post: string;
  level: string;
  department?: string;
  description: string;
  image: string;
  arm?: "SEC" | "SRC";
  objectPosition?: string;
}

const ExecutiveCard = ({ name, post, level, department, description, image, objectPosition = "object-center" }: ExecutiveCardProps) => {
  return (
    <div className="group rounded-xl border border-slate-200/90 bg-white overflow-hidden transition-all duration-200 hover:border-[#145a32]/35 hover:shadow-xs flex flex-col h-full">
      <div className="aspect-[4/5] overflow-hidden bg-slate-100 relative shrink-0">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className={`h-full w-full object-cover ${objectPosition} transition-transform duration-500 group-hover:scale-[1.02]`}
        />
      </div>
      <div className="p-4 flex flex-col grow">
        <span className="inline-block self-start rounded-md bg-emerald-50 border border-emerald-800/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#145a32]">
          {post}
        </span>
        <h3 className="mt-2 font-display text-sm sm:text-base font-bold text-slate-900 leading-snug">
          {name}
        </h3>
        <p className="mt-0.5 text-[11px] font-medium text-slate-500">
          {department ? `${department} • ${level}` : level}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3 mt-auto">
          {description}
        </p>
      </div>
    </div>
  );
};

export default ExecutiveCard;
