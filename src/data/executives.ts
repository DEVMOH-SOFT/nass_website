import presidentImg from "@/assets/executives/president_adegoke.jpg";
import vpImg from "@/assets/executives/vp_sofiyyah.jpg";
import gensecImg from "@/assets/executives/gensec_likinyo.jpg";
import assGensecImg from "@/assets/executives/ass_gensec_quadri.jpg";
import treasurerImg from "@/assets/executives/treasurer_oladepo.jpg";
import proImg from "@/assets/executives/pro_fregene.jpg";
import socialDirectorImg from "@/assets/executives/social_adetunji.jpg";
import sportsDirectorImg from "@/assets/executives/sports_michael.jpg";
import welfare1Img from "@/assets/executives/welfare1_kanu.jpg";
import welfare2Img from "@/assets/executives/welfare2_olatunji.jpg";
import speakerImg from "@/assets/executives/speaker_agboola.jpg";
import clerkImg from "@/assets/executives/clerk_asaolu.jpg";
import honOjelabiImg from "@/assets/executives/hon_ojelabi.jpg";
import honJesuyonImg from "@/assets/executives/hon_jesuyon.png";
import honOdusanyaImg from "@/assets/executives/hon_odusanya.jpg";
import honOlowookereImg from "@/assets/executives/hon_olowookere.jpg";
import honBabalolaImg from "@/assets/executives/hon_babalola.jpg";

export interface Executive {
  name: string;
  post: string;
  department: string;
  level: string;
  description: string;
  image: string;
  matricNumber?: string;
  email?: string;
  arm: "SEC" | "SRC";
  objectPosition?: string;
}

/**
 * 2026/2027 NASS LASUSTECH Leadership
 * Derived directly from the Official NASS Leadership Data Collection Register
 */
export const executives: Executive[] = [
  // =========================================================================
  // ARM 1: STUDENT EXECUTIVE COUNCIL (SEC)
  // =========================================================================
  {
    name: "Adegoke Muhammed Abiola",
    post: "President",
    department: "Computer Science",
    level: "400 Level",
    description: "Serves as the primary leader and official collegiate representative of NASS LASUSTECH Chapter, directing college-wide student governance and academic advocacy.",
    image: presidentImg,
    matricNumber: "230303010037",
    email: "adegokemohammed92@gmail.com",
    arm: "SEC",
    objectPosition: "object-top",
  },
  {
    name: "Adedeji Sofiyyah Anike",
    post: "Vice President",
    department: "Biological Sciences (Botany)",
    level: "400 Level",
    description: "Coordinates administrative programs, inter-departmental initiatives, and assists the President in maintaining organizational stability and academic programs.",
    image: vpImg,
    matricNumber: "230301010024",
    email: "adedejisofiyyah20@gmail.com",
    arm: "SEC",
    objectPosition: "object-top",
  },
  {
    name: "Likinyo Ayomipo Ayeo",
    post: "General Secretary",
    department: "Chemical Science (Chemistry)",
    level: "400 Level",
    description: "Custodian of collegiate records, official correspondence, documentation, and coordination of council meetings across the 5 basic science departments.",
    image: gensecImg,
    matricNumber: "230302010026",
    email: "becky07wilson@gmail.com",
    arm: "SEC",
    objectPosition: "object-top",
  },
  {
    name: "Quadri Stella Maris",
    post: "Assistant General Secretary",
    department: "Chemical Science (Biochemistry)",
    level: "300 Level",
    description: "Assists the General Secretary in secretarial management, record maintenance, and seamless collegiate internal communications.",
    image: assGensecImg,
    matricNumber: "250302030024",
    email: "quadristella183@gmail.com",
    arm: "SEC",
    objectPosition: "object-top",
  },
  {
    name: "Oladepo Damilare David",
    post: "Treasurer",
    department: "Computer Science",
    level: "400 Level",
    description: "Administers collegiate funds, financial accountability, and transparent disbursement records for student programs and faculty events.",
    image: treasurerImg,
    matricNumber: "230303010001",
    email: "damilareoladepo3@gmail.com",
    arm: "SEC",
    objectPosition: "object-top",
  },
  {
    name: "Fregene Emmanuel Chukwudi",
    post: "PRO 1 (Head, NASS DCIPR)",
    department: "Computer Science",
    level: "400 Level",
    description: "Leads NASS DCIPR (Directorate of Communication, Information & Public Relations), directing collegiate media broadcasts, institutional communications, branding, and student publicity.",
    image: proImg,
    matricNumber: "230303010124",
    email: "chukwudie771@gmail.com",
    arm: "SEC",
    objectPosition: "object-top",
  },
  {
    name: "Adetunji Adegoke Olaide",
    post: "Social Director 1",
    department: "Mathematical Sciences (Statistics)",
    level: "400 Level",
    description: "Drives student community engagements, cultural events, collegiate social gatherings, and networking programs for science scholars.",
    image: socialDirectorImg,
    matricNumber: "230304030062",
    email: "adetunjiadegoke424@gmail.com",
    arm: "SEC",
    objectPosition: "object-top",
  },
  {
    name: "Michael Abel Armani",
    post: "Sport Director 2",
    department: "Mathematical Sciences (Statistics)",
    level: "300 Level",
    description: "Organizes collegiate sports competitions, inter-departmental soccer championships, and physical wellness programs across the College of Basic Sciences.",
    image: sportsDirectorImg,
    matricNumber: "240304030073",
    email: "Lordnameless2003@gmail.com",
    arm: "SEC",
    objectPosition: "object-top",
  },
  {
    name: "Kanu Eberechi",
    post: "Welfare Director 1",
    department: "Chemical Sciences (Biochemistry)",
    level: "300 Level",
    description: "Oversees student welfare, academic support inquiries, and member living accommodations to maintain an inclusive, caring collegiate environment.",
    image: welfare1Img,
    matricNumber: "240302030009",
    email: "kanueberechi789@gmail.com",
    arm: "SEC",
    objectPosition: "object-top",
  },
  {
    name: "Olatunji Oyindamola Barakat",
    post: "Welfare Director 2",
    department: "Computer Sciences",
    level: "200 Level",
    description: "Co-directs student welfare, student support logistics, and freshman integration into collegiate academic life.",
    image: welfare2Img,
    matricNumber: "250303010015",
    email: "Olatunjidamola02@gmail.com",
    arm: "SEC",
    objectPosition: "object-top",
  },

  // =========================================================================
  // ARM 2: STUDENT REPRESENTATIVE COUNCIL (SRC / PARLIAMENTARY CHAMBER)
  // =========================================================================
  {
    name: "Agboola Victor Abiola",
    post: "Speaker of the House",
    department: "Mathematical Sciences (Statistics)",
    level: "400 Level",
    description: "Presides over the Student Representative Council (SRC), guiding legislative deliberations, constitutional amendments, and budgetary reviews.",
    image: speakerImg,
    matricNumber: "230304030013",
    email: "agboolav66@gmail.com",
    arm: "SRC",
    objectPosition: "object-top",
  },
  {
    name: "Asaolu Dolapo Richard",
    post: "Clerk of the House",
    department: "Physical Sciences (Physics with Electronics)",
    level: "400 Level",
    description: "Chief administrative and recording officer of the legislative chamber, managing bills, legislative proceedings, and official house journals.",
    image: clerkImg,
    matricNumber: "230305010082",
    email: "dolapoasaolurichard@gmail.com",
    arm: "SRC",
    objectPosition: "object-top",
  },
  {
    name: "Ojelabi Opeyemi Oluwapelumi",
    post: "Honorable Member (Computer Sciences)",
    department: "Computer Sciences",
    level: "300 Level",
    description: "Elected parliamentary representative articulating constituent interests, student concerns, and legislative motions for Computer Science scholars.",
    image: honOjelabiImg,
    matricNumber: "240303010030",
    email: "opeyemijelabi890@gmail.com",
    arm: "SRC",
    objectPosition: "object-top",
  },
  {
    name: "Jesuyon Olaoluwa Temidara",
    post: "Honorable Member (Computer Science)",
    department: "Computer Science",
    level: "400 Level",
    description: "Senior parliamentary representative serving on legislative oversight and constitutional adherence committees in the collegiate house.",
    image: honJesuyonImg,
    matricNumber: "230303010148",
    email: "ayoze4099@gmail.com",
    arm: "SRC",
    objectPosition: "object-top",
  },
  {
    name: "Odusanya Fareedah Abimbola",
    post: "Honorable Member (Computer Science)",
    department: "Computer Science",
    level: "200 Level",
    description: "Parliamentary delegate representing the sophomore cohort, championing student academic development and collegiate welfare legislation.",
    image: honOdusanyaImg,
    matricNumber: "250303010065",
    email: "odusanyafareedah535@gmail.com",
    arm: "SRC",
    objectPosition: "object-top",
  },
  {
    name: "Olowookere Yusuf",
    post: "Honorable Member (Chemical Sciences)",
    department: "Chemical Sciences (Biochemistry)",
    level: "300 Level",
    description: "Legislative representative for Chemical Sciences scholars, advocating for laboratory resources, student interests, and faculty synergy.",
    image: honOlowookereImg,
    matricNumber: "240302030048",
    email: "doctoryusuf2001@gmail.com",
    arm: "SRC",
    objectPosition: "object-top",
  },
  {
    name: "Babalola Abdul-Rahman Olamilekan",
    post: "Honorable Member (Mathematical Sciences)",
    department: "Mathematical Sciences (Mathematics)",
    level: "300 Level",
    description: "Parliamentary representative for Mathematics and Statistics scholars, reviewing student bills and departmental welfare policies.",
    image: honBabalolaImg,
    matricNumber: "240303020027",
    email: "abdulrahmanbabalola822@gmail.com",
    arm: "SRC",
    objectPosition: "object-top",
  },
];
