import presidentCorporateImg from "@/assets/president_corporate.jpg";
import deanImg from "@/assets/dean_orukotan.png";
import hodCscImg from "@/assets/hod_csc_aremu.jpg";
import advisorAjiloreImg from "@/assets/advisor_joshua_ajilore.jpg";

export interface DepartmentInfo {
  id: string;
  name: string;
  code: string;
  headOfDepartment: string;
  hodImage?: string;
  description: string;
  websiteUrl: string;
  established?: string;
  studentBodyCount?: string;
  degreesOffered: string[];
  units?: string[];
  keyDisciplines?: string[];
  contactEmail?: string;
  associationAcronym?: string;
}

export interface AffiliatedAssociation {
  id: string;
  name: string;
  acronym: string;
  description: string;
  servedDepartments: string[];
  studentCount: string;
  established: string;
  badgeColor?: string;
}

export type AffiliatedInstitution = AffiliatedAssociation;

export interface CollegeOverview {
  name: string;
  shortName: string;
  university: string;
  universityAcronym: string;
  dean: string;
  deanTitle: string;
  deanEmail: string;
  deanImage: string;
  deanMessage: string;
  advisorName: string;
  advisorTitle: string;
  advisorRole: string;
  advisorDepartment: string;
  advisorEmail: string;
  advisorImage: string;
  advisorMessage: string;
  presidentName: string;
  presidentTitle: string;
  presidentImage: string;
  presidentSpeech: string;
  establishedYear: number;
  totalStudents: string;
  totalDepartments: number;
  activeLaboratories: number;
}

export const collegeInfo: CollegeOverview = {
  name: "College of Basic Sciences",
  shortName: "CBS",
  university: "Lagos State University of Science and Technology",
  universityAcronym: "LASUSTECH",
  dean: "Professor Abimbola A. Orukotan",
  deanTitle: "Dean, College of Basic Sciences",
  deanEmail: "dean_cbs@lasustech.edu.ng",
  deanImage: deanImg,
  deanMessage: "Welcome to the College of Basic Sciences at LASUSTECH. Our college serves as the bedrock of scientific inquiry, discovery, and innovation across computing, mathematical modeling, molecular sciences, and physical experimentation. We are committed to developing visionary scientists who lead technological advancements in Nigeria and the global arena.",
  advisorName: "Dr. Joshua Ajilore",
  advisorTitle: "College Staff Adviser",
  advisorRole: "College Staff Adviser, College of Basic Sciences",
  advisorDepartment: "College of Basic Sciences, LASUSTECH",
  advisorEmail: "",
  advisorImage: advisorAjiloreImg,
  advisorMessage: "Scientific leadership demands unwavering commitment to academic excellence, innovative thinking, and disciplined inquiry. As College Staff Adviser, our mission is to ensure every science scholar is nurtured, challenged, and empowered to excel academically while upholding the highest ethical principles of modern scientific inquiry.",
  presidentName: "Comrade Adegoke Muhammed Abiola",
  presidentTitle: "President, NASS LASUSTECH Chapter",
  presidentImage: presidentCorporateImg,
  presidentSpeech: "On behalf of the Nigerian Association of Science Students (NASS) Student Executive Council, I warmly welcome every student, faculty member, and partner to our college digital home. NASS represents the unified voice and collective ambition of over 4,500 basic science scholars at LASUSTECH. From groundbreaking hackathons and research symposiums to student advocacy and mentorship, we stand dedicated to academic excellence, brotherhood, and future-ready innovation.",
  establishedYear: 2022,
  totalStudents: "4,500+",
  totalDepartments: 5,
  activeLaboratories: 14,
};

export const departments: DepartmentInfo[] = [
  {
    id: "computer-science",
    name: "Department of Computer Science",
    code: "CSC",
    headOfDepartment: "Dr. Idris Aremu",
    hodImage: hodCscImg,
    description: "Pioneering computational theory, software engineering, intelligent systems, and cybersecurity to empower technological problem solvers.",
    websiteUrl: "https://lasustech.edu.ng/department-of-computer-science",
    established: "2022",
    studentBodyCount: "1,200+ Scholars",
    degreesOffered: ["B.Sc. Computer Science", "B.Sc. Software Engineering", "B.Sc. Cyber Security"],
    units: ["Computer Science", "Software Engineering", "Cybersecurity"],
    contactEmail: "aremu.ia@lasustech.edu.ng",
  },
  {
    id: "mathematical-sciences",
    name: "Department of Mathematical Sciences",
    code: "MTS",
    headOfDepartment: "Dr. Arowolo",
    description: "Developing advanced analytical, computational, and statistical methodologies underpinning algorithmic trade, data modeling, and quantitative decision science.",
    websiteUrl: "https://lasustech.edu.ng/department-of-mathematics",
    established: "2022",
    studentBodyCount: "1,000+ Scholars",
    degreesOffered: ["B.Sc. Mathematics", "B.Sc. Industrial Mathematics", "B.Sc. Statistics"],
    units: ["Mathematics", "Industrial Mathematics", "Statistics"],
    contactEmail: "mathematics@lasustech.edu.ng",
  },
  {
    id: "chemical-sciences",
    name: "Department of Chemical Sciences",
    code: "CHS",
    headOfDepartment: "Dr. Jimoh Mormoh",
    description: "Investigating molecular synthesis, industrial formulation, cellular chemistry, enzymatic kinetics, and material sciences driving industrial transformations.",
    websiteUrl: "https://lasustech.edu.ng/department-of-chemistry",
    established: "2022",
    studentBodyCount: "1,030+ Scholars",
    degreesOffered: ["B.Sc. Pure Chemistry", "B.Sc. Industrial Chemistry"],
    units: ["Pure Chemistry", "Industrial Chemistry"],
    contactEmail: "chemistry@lasustech.edu.ng",
  },
  {
    id: "biological-sciences",
    name: "Department of Biological Sciences",
    code: "BLS",
    headOfDepartment: "Dr. Olatunji",
    description: "Specializing in microbial genetics, agricultural biotechnology, phytomedicine, parasitology, immunology, and environmental bio-conservation.",
    websiteUrl: "https://lasustech.edu.ng/department-of-microbiology",
    established: "2022",
    studentBodyCount: "1,250+ Scholars",
    degreesOffered: ["B.Sc. Botany", "B.Sc. Zoology", "B.Sc. Microbiology"],
    units: ["Botany", "Zoology", "Microbiology"],
    contactEmail: "microbiology@lasustech.edu.ng",
  },
  {
    id: "physical-sciences",
    name: "Department of Physics",
    code: "PHS",
    headOfDepartment: "Dr. Atilade",
    description: "Delivering foundational and experimental education in electronics, thermodynamics, renewable energy, geophysics, and laboratory instrumentation.",
    websiteUrl: "https://lasustech.edu.ng/department-of-physics",
    established: "2022",
    studentBodyCount: "420+ Scholars",
    degreesOffered: ["B.Sc. Physics with Electronics", "B.Sc. Science Laboratory Technology"],
    contactEmail: "physics@lasustech.edu.ng",
  },
];

export const affiliatedAssociations: AffiliatedAssociation[] = [
  {
    id: "nacos",
    name: "National Association of Computing Students",
    acronym: "NACOS",
    description: "Apex student body representing computing scholars, driving software innovation, competitive hackathons, and technological empowerment across LASUSTECH.",
    servedDepartments: ["Department of Computer Science", "Software Engineering", "Cyber Security"],
    studentCount: "1,200+ Members",
    established: "2022",
    badgeColor: "bg-blue-50 text-[#1a4480] border-blue-200",
  },
  {
    id: "namssn",
    name: "National Association of Mathematical Science Students",
    acronym: "NAMSSN",
    description: "Uniting scholars across theoretical, applied, and quantitative disciplines to foster advanced mathematical modeling, statistical analysis, and algorithmic research.",
    servedDepartments: ["Department of Mathematical Sciences", "Mathematics"],
    studentCount: "1,000+ Members",
    established: "2022",
    badgeColor: "bg-emerald-50 text-[#145a32] border-emerald-200",
  },
  {
    id: "asson",
    name: "Association of Statistics Students of Nigeria",
    acronym: "ASSON",
    description: "Advancing statistical science, data analytics, stochastic modeling, quantitative inference, and actuarial analysis under the Department of Mathematical Sciences.",
    servedDepartments: ["Department of Mathematical Sciences", "Statistics"],
    studentCount: "480+ Members",
    established: "2022",
    badgeColor: "bg-purple-50 text-purple-900 border-purple-200",
  },
  {
    id: "scsn",
    name: "Student Chemical Society Nigeria",
    acronym: "SCSN",
    description: "Promoting scientific discovery across chemical synthesis, industrial formulation, molecular toxicology, and clinical biochemistry.",
    servedDepartments: ["Department of Chemical Sciences"],
    studentCount: "1,030+ Members",
    established: "2022",
    badgeColor: "bg-amber-50 text-amber-900 border-amber-200",
  },
  {
    id: "nams",
    name: "National Association of Microbiology Students",
    acronym: "NAMS",
    description: "Representing scholars across the life sciences, microbiology, plant biotechnology, genetics, environmental biology, and ecological conservation.",
    servedDepartments: ["Department of Biological Sciences"],
    studentCount: "1,250+ Members",
    established: "2022",
    badgeColor: "bg-teal-50 text-teal-900 border-teal-200",
  },
  {
    id: "naps",
    name: "National Association of Physics Students",
    acronym: "NAPS",
    description: "Advancing hands-on laboratory experimentation, applied physics, solid-state electronics, and instrumentation technology.",
    servedDepartments: ["Department of Physics"],
    studentCount: "420+ Members",
    established: "2022",
    badgeColor: "bg-indigo-50 text-indigo-900 border-indigo-200",
  },
];

export const affiliatedInstitutions = affiliatedAssociations;
