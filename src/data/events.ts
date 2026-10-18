import symposiumStageFlyer from "@/assets/nass_symposium_stage.jpg";
import academicAwardsFlyer from "@/assets/academic_excellence_awards.jpg";
import pioneersAwardsFlyer from "@/assets/pioneers_awards_president.png";
import auditoriumFlyer from "@/assets/behind_academic_wall_auditorium.jpg";
import bootcampFlyer from "@/assets/Events/PHOTO-2026-04-28-12-14-22.jpg";
import ladiesInTechFlyer from "@/assets/Events/PHOTO-2026-04-29-09-06-01.jpg";
import hodCupFlyer from "@/assets/Events/PHOTO-2026-04-24-17-16-18.jpg";
import finalFixtureFlyer from "@/assets/Events/final_fixture.jpg";

export interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  image: string;
  category?: string;
  venue?: string;
  upcoming?: boolean;
  ongoing?: boolean;
  contain?: boolean;
}

export const events: Event[] = [
  {
    id: "cbs-science-day-2026",
    title: "SCIENCE DAY 2026",
    date: "Nov 10, 2026",
    description: "The grand annual celebration of empirical science, research, and innovation across all constituent departments of the College of Basic Sciences, LASUSTECH. Featuring departmental exhibitions, keynote lectures, and project showcases.",
    image: symposiumStageFlyer,
    category: "Academic & Celebration",
    venue: "CBS Main Auditorium & Quadrangle",
    upcoming: true,
    contain: false,
  },
  {
    id: "cbs-orientation-programme",
    title: "CBS ORIENTATION PROGRAMME",
    date: "Nov 17, 2026",
    description: "Official collegiate induction and orientation for all newly admitted 100L scholars into the College of Basic Sciences. Meet college deans, department heads, faculty advisors, and executive leaders.",
    image: auditoriumFlyer,
    category: "Orientation",
    venue: "College Complex / University Hall",
    upcoming: true,
    contain: false,
  },
  {
    id: "cbs-ecoinnovate-sdg",
    title: "ECOINNOVATE CBS: THE SDG CHALLENGE",
    date: "Nov 24, 2026",
    description: "Empowering science scholars to design real-world empirical solutions aligned with the United Nations Sustainable Development Goals (SDGs). Featuring student innovation pitches, sustainable science prototypes, and jury awards.",
    image: auditoriumFlyer,
    category: "Innovation & Global Goals",
    venue: "College Auditorium",
    upcoming: true,
    contain: false,
  },
  {
    id: "cbs-matriculation-ceremony",
    title: "MATRICULATION CEREMONY 2026",
    date: "Nov 25, 2026",
    description: "The official university matriculation ceremony formally matriculating all fresh students into Lagos State University of Science and Technology. (*Notice: Proposed date can change per University Senate advisory).",
    image: pioneersAwardsFlyer,
    category: "Academic Milestone",
    venue: "LASUSTECH Convocation Ground",
    upcoming: true,
    contain: false,
  },
  {
    id: "cbs-carol-cultural-day",
    title: "CAROL / CULTURAL DAY 2026",
    date: "Dec 15, 2026",
    description: "Year-end collegiate festive celebration featuring vibrant cultural displays, Christmas carols, departmental musical performances, traditional attire showcases, and executive honors.",
    image: pioneersAwardsFlyer,
    category: "Cultural & Celebration",
    venue: "LASUSTECH Amphitheatre",
    upcoming: true,
    contain: false,
  },
  {
    id: "cbs-founders-day",
    title: "CONVOCATION CEREMONIES & FOUNDER'S DAY",
    date: "Jan 27 - Feb 2, 2027",
    description: "LASUSTECH university-wide convocation ceremonies celebrating graduating scholars, followed by university Founder's Day commemorative lectures and college exhibitions.",
    image: academicAwardsFlyer,
    category: "Academic Milestone",
    venue: "University Ceremonial Grounds",
    upcoming: true,
    contain: false,
  },
  {
    id: "cbs-got-talent",
    title: "CBS GOT TALENT",
    date: "Apr 12, 2027",
    description: "The premier collegiate creative and talent discovery show. Science scholars take the stage for music, spoken word, comedy, creative arts, and dramatic performance championships.",
    image: symposiumStageFlyer,
    category: "Creative & Entertainment",
    venue: "CBS Main Auditorium",
    upcoming: true,
    contain: false,
  },
  {
    id: "lasustech-wave",
    title: "LASUSTECH WAVE",
    date: "Apr 29, 2027",
    description: "The signature college-wide cultural festival and youth renaissance fair featuring musical performances, brand pop-ups, lifestyle showcases, and inter-faculty bonding.",
    image: academicAwardsFlyer,
    category: "Social & Festival",
    venue: "LASUSTECH Sports Complex Arena",
    upcoming: true,
    contain: false,
  },
  {
    id: "students-union-week",
    title: "STUDENTS' UNION WEEK",
    date: "May 10 - 14, 2027",
    description: "A week of dynamic collegiate solidarity, carnival rallies, mental health forums, talent shows, and sports competitions led by the university student body.",
    image: auditoriumFlyer,
    category: "Collegiate Solidarity",
    venue: "Campus Wide",
    upcoming: true,
    contain: false,
  },
  {
    id: "cbs-build-with-ai",
    title: "CBS BUILD WITH AI",
    date: "May 19, 2027",
    description: "Hands-on tech hackathon and AI summit where science scholars build functional machine learning models, intelligent algorithms, and software solutions addressing real societal challenges.",
    image: bootcampFlyer,
    category: "Technology & AI",
    venue: "CBS Tech Hub & Computer Laboratory",
    upcoming: true,
    contain: false,
  },
  {
    id: "hod-cup-finale",
    title: "HOD'S CUP: THE GRAND FINALE",
    date: "May 7, 2026",
    description: "The ultimate glory! 3rd Place Match (100L vs 200L) and the Final Match (300L vs 400L) with awards presentation at LASUSTECH Main Field.",
    image: finalFixtureFlyer,
    category: "Sports",
    venue: "LASUSTECH Main Field",
    upcoming: false,
    contain: true,
  },
  {
    id: "ladies-in-tech",
    title: "LADIES IN TECH EVENT",
    date: "May 1, 2026",
    description: "Theme: Overcoming fear and imposter syndrome. Featuring guest speakers Agape Oluwa, Mujisatullahi Bakare, and Naheemat Akinyemi A. Hosted by Owolabi Grace (Lady Vice).",
    image: ladiesInTechFlyer,
    category: "Empowerment",
    venue: "Virtual (Google Meet)",
    upcoming: false,
    contain: true,
  },
  {
    id: "hod-cup",
    title: "HOD'S CUP TOURNAMENT",
    date: "Apr 22 - May 7, 2026",
    description: "The annual collegiate cup tournament featuring Football, Chess, and Scrabble across all academic departments.",
    image: hodCupFlyer,
    category: "Sports",
    venue: "LASUSTECH Sports Arena",
    ongoing: false,
    upcoming: false,
    contain: true,
  },
];
