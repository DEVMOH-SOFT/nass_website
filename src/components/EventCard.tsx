import { Calendar } from "lucide-react";

interface EventCardProps {
  title: string;
  date: string;
  description: string;
  image: string;
  featured?: boolean;
  onClick?: () => void;
  ongoing?: boolean;
  upcoming?: boolean;
  contain?: boolean;
}

const EventCard = ({ title, date, description, image, featured, onClick, ongoing, upcoming, contain }: EventCardProps) => {
  const cardClassName = `group overflow-hidden rounded-xl border border-slate-200/90 bg-white transition-all duration-200 hover:border-[#145a32]/35 hover:shadow-xs ${onClick ? "cursor-pointer" : ""}`;

  if (featured) {
    return (
      <div className={cardClassName} onClick={onClick}>
        <div className="md:grid md:grid-cols-2 h-full">
          <div className={`aspect-video overflow-hidden md:aspect-auto md:h-full ${contain ? "bg-slate-900" : "bg-slate-100"}`}>
            <img 
              src={image} 
              alt={title} 
              loading="lazy" 
              className={`h-full w-full transition-transform duration-500 group-hover:scale-[1.02] ${contain ? "object-contain" : "object-cover"}`} 
            />
          </div>
          <div className="flex flex-col justify-center p-6 md:p-8">
            <div className="flex gap-2">
              {ongoing && (
                <span className="inline-flex w-fit items-center rounded-md bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-[#145a32] border border-emerald-800/15">
                  Ongoing Program
                </span>
              )}
              {upcoming && !ongoing && (
                <span className="inline-flex w-fit items-center rounded-md bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-[#1a4480] border border-blue-500/20">
                  Upcoming
                </span>
              )}
              {!upcoming && !ongoing && (
                <span className="inline-flex w-fit items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                  Past Event
                </span>
              )}
            </div>
            <h3 className="mt-3 font-display text-xl font-bold text-slate-900 md:text-2xl">{title}</h3>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Calendar className="h-3.5 w-3.5 text-[#145a32]" />
              {date}
            </div>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600">{description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClassName} onClick={onClick}>
      <div className={`aspect-video overflow-hidden relative ${contain ? "bg-slate-900" : "bg-slate-100"}`}>
        <img 
          src={image} 
          alt={title} 
          loading="lazy" 
          className={`h-full w-full transition-transform duration-500 group-hover:scale-[1.02] ${contain ? "object-contain" : "object-cover"}`} 
        />
        {ongoing && (
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center rounded-md bg-[#145a32] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              ONGOING
            </span>
          </div>
        )}
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
          <Calendar className="h-3 w-3 text-[#145a32]" />
          {date}
        </div>
        <h3 className="mt-1.5 font-display text-base font-bold text-slate-900 leading-snug">{title}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 line-clamp-2">{description}</p>
      </div>
    </div>
  );
};

export default EventCard;
