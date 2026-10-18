import { Phone, Mail, MessageSquare } from "lucide-react";

interface ExecutiveCardProps {
  name: string;
  preferredName?: string;
  post: string;
  level: string;
  department?: string;
  description: string;
  image: string;
  arm?: "SEC" | "SRC";
  objectPosition?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
}

const ExecutiveCard = ({
  name,
  preferredName,
  post,
  level,
  department,
  description,
  image,
  objectPosition = "object-center",
  phone,
  whatsapp,
  email,
}: ExecutiveCardProps) => {
  return (
    <div className="group rounded-xl border border-slate-200/90 bg-white overflow-hidden transition-all duration-200 hover:border-[#145a32]/35 hover:shadow-md flex flex-col h-full">
      <div className="aspect-[4/5] overflow-hidden bg-slate-100 relative shrink-0">
        <img
          src={image}
          alt={name}
          loading="lazy"
          style={
            objectPosition
              ? {
                  objectPosition: objectPosition
                    .replace(/^object-/, "")
                    .replace(/\[|\]/g, "")
                    .replace(/_/g, " "),
                }
              : undefined
          }
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        {preferredName && (
          <span className="absolute bottom-2.5 right-2.5 rounded-md bg-slate-950/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-emerald-300 shadow-sm border border-emerald-500/30">
            "{preferredName}"
          </span>
        )}
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
        <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3">
          {description}
        </p>

        {(phone || email || whatsapp) && (
          <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Direct Contact
            </span>
            <div className="flex items-center gap-1.5">
              {whatsapp && (
                <a
                  href={`https://wa.me/234${whatsapp.replace(/\D/g, "").replace(/^0/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                  title={`Chat with ${name} on WhatsApp`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                </a>
              )}
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white transition-colors"
                  title={`Call ${name} (${phone})`}
                >
                  <Phone className="h-3.5 w-3.5" />
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors"
                  title={`Email ${name}`}
                >
                  <Mail className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutiveCard;
