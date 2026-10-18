import { Link } from "react-router-dom";
import { ArrowRight, Users, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { DepartmentInfo } from "@/data/college";

interface AssociationCardProps {
  dept: DepartmentInfo;
  index?: number;
}

const AssociationCard = ({ dept, index = 0 }: AssociationCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:border-[#145a32]/35 hover:shadow-sm"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-50 border border-emerald-800/15 px-2.5 py-0.5 text-xs font-bold text-[#145a32]">
              {dept.code}
            </span>
            <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wide">
              Academic Department
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
            <Users className="h-3 w-3 text-slate-400" />
            {dept.studentBodyCount}
          </span>
        </div>

        {/* Title & Info */}
        <div className="mt-4">
          <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#145a32] transition-colors leading-snug">
            {dept.name}
          </h3>
          <p className="mt-1 text-xs font-semibold text-emerald-800">
            HOD: {dept.headOfDepartment}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3">
            {dept.description}
          </p>
        </div>

        {/* Academic Units (Only for departments that have units) */}
        {dept.units && dept.units.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-1.5">
              Academic Units
            </p>
            <div className="flex flex-wrap gap-1.5">
              {dept.units.map((unit) => (
                <span
                  key={unit}
                  className="rounded bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-900"
                >
                  {unit}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        <a
          href={dept.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200/80 px-2.5 py-1 text-[11px] font-bold text-[#1a4480] hover:bg-blue-100/80 hover:text-blue-900 transition-colors shadow-2xs"
          title={`Visit official ${dept.name} website`}
        >
          <span>Department Website</span>
          <ExternalLink className="h-3 w-3" />
        </a>

        <Link
          to={`/associations#${dept.id}`}
          className="inline-flex items-center gap-1 font-semibold text-[#145a32] hover:text-[#0c3e21] transition-colors text-[11px]"
        >
          <span>View Profile</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.div>
  );
};

export default AssociationCard;
