export interface CalendarActivity {
  id: string;
  activity: string;
  date: string;
  startDate?: string;
  semester: "First Semester" | "Second Semester" | "Session Wide";
  category: "Registration" | "Lectures" | "Orientation" | "Events & Culture" | "Examinations" | "Break" | "General";
  highlight?: boolean;
  notes?: string;
}

export const academicSession = "2026/2027";
export const semesterTitle = "First & Second Semesters (100L - 400L)";
export const collegeName = "College of Basic Sciences (CBS), LASUSTECH";

export const firstSemesterCalendar: CalendarActivity[] = [
  {
    id: "fresh-registration",
    activity: "Fresh Students Registration and Clearance",
    date: "Monday 19th October to Friday 13th November 2026",
    semester: "First Semester",
    category: "Registration",
    highlight: true,
  },
  {
    id: "returning-registration",
    activity: "Returning Students Registration and Clearance",
    date: "Monday 26th October to Friday 13th November 2026",
    semester: "First Semester",
    category: "Registration",
  },
  {
    id: "first-lectures-begin",
    activity: "First Semester Lectures Begin",
    date: "Monday 2nd November 2026",
    semester: "First Semester",
    category: "Lectures",
    highlight: true,
  },
  {
    id: "science-day",
    activity: "Science Day",
    date: "Tuesday 10th November 2026",
    semester: "First Semester",
    category: "Events & Culture",
    highlight: true,
    notes: "Official Science Day Celebration across all CBS Departments",
  },
  {
    id: "fresh-orientation-week",
    activity: "Orientation Programmes for Fresh Students",
    date: "Monday 16th to Friday 20th November 2026",
    semester: "First Semester",
    category: "Orientation",
  },
  {
    id: "cbs-orientation",
    activity: "CBS Orientation Programme",
    date: "Tuesday 17th November 2026",
    semester: "First Semester",
    category: "Orientation",
    highlight: true,
  },
  {
    id: "dept-orientation",
    activity: "Departmental Orientation Programme",
    date: "Thursday 19th November 2026",
    semester: "First Semester",
    category: "Orientation",
  },
  {
    id: "ecoinnovate-sdg",
    activity: "ECOInnovate CBS: The SDG Challenge",
    date: "Tuesday 24th November 2026",
    semester: "First Semester",
    category: "Events & Culture",
    highlight: true,
    notes: "Sustainable Development Goals Collegiate Challenge & Exhibition",
  },
  {
    id: "matriculation",
    activity: "Matriculation",
    date: "Wednesday 25th November 2026",
    semester: "First Semester",
    category: "Orientation",
    highlight: true,
    notes: "*Date can change per university senate advisory",
  },
  {
    id: "mid-semester-tests-first",
    activity: "Week of Mid-Semester Tests",
    date: "Monday 14th to Friday 18th December 2026",
    semester: "First Semester",
    category: "Examinations",
    highlight: true,
  },
  {
    id: "carol-cultural-day",
    activity: "Carol/Cultural Day",
    date: "Tuesday 15th December 2026",
    semester: "First Semester",
    category: "Events & Culture",
    highlight: true,
  },
  {
    id: "christmas-break",
    activity: "Christmas and New Year Break",
    date: "Monday 21st December 2026 to Sunday 3rd January 2027",
    semester: "First Semester",
    category: "Break",
  },
  {
    id: "convocation-founders",
    activity: "Convocation Ceremonies / Founder's Day",
    date: "Wednesday 27th January to Tuesday 2nd February 2027",
    semester: "First Semester",
    category: "Events & Culture",
    highlight: true,
  },
  {
    id: "first-lectures-end",
    activity: "First Semester Lectures End",
    date: "Friday 5th February 2027",
    semester: "First Semester",
    category: "Lectures",
    highlight: true,
  },
  {
    id: "first-revision",
    activity: "Revision",
    date: "Monday 8th to Friday 12th February 2027",
    semester: "First Semester",
    category: "Examinations",
  },
  {
    id: "first-exams-begin",
    activity: "First Semester Examinations Begin",
    date: "Monday 15th February 2027",
    semester: "First Semester",
    category: "Examinations",
    highlight: true,
  },
];

export const secondSemesterCalendar: CalendarActivity[] = [
  {
    id: "second-registration",
    activity: "Students Registration for the Semester",
    date: "Monday 22nd March to Friday 9th April 2027",
    semester: "Second Semester",
    category: "Registration",
    highlight: true,
  },
  {
    id: "second-lectures-begin",
    activity: "Lectures Begin",
    date: "Monday 22nd March 2027",
    semester: "Second Semester",
    category: "Lectures",
    highlight: true,
  },
  {
    id: "mid-semester-tests-second",
    activity: "Week of Mid-Semester Tests",
    date: "Monday 5th to Friday 9th April 2027",
    semester: "Second Semester",
    category: "Examinations",
    highlight: true,
  },
  {
    id: "cbs-got-talent",
    activity: "CBS GOT TALENT",
    date: "Monday 12th April 2027",
    semester: "Second Semester",
    category: "Events & Culture",
    highlight: true,
    notes: "Collegiate talent exhibition, music, creative showcase & arts",
  },
  {
    id: "lasustech-wave",
    activity: "LASUSTECH Wave",
    date: "Thursday 29th April 2027",
    semester: "Second Semester",
    category: "Events & Culture",
    highlight: true,
  },
  {
    id: "students-union-week",
    activity: "Students' Union Week",
    date: "Monday 10th to Friday 14th May 2027",
    semester: "Second Semester",
    category: "Events & Culture",
    highlight: true,
  },
  {
    id: "cbs-build-with-ai",
    activity: "CBS Build with AI",
    date: "Wednesday 19th May 2027",
    semester: "Second Semester",
    category: "Events & Culture",
    highlight: true,
    notes: "Hands-on tech hackathon, AI model building & developer summit",
  },
  {
    id: "second-lectures-end",
    activity: "Lectures End",
    date: "Friday 11th June 2027",
    semester: "Second Semester",
    category: "Lectures",
    highlight: true,
  },
  {
    id: "second-revision",
    activity: "Revision",
    date: "Monday 14th to Friday 18th June 2027",
    semester: "Second Semester",
    category: "Examinations",
  },
  {
    id: "second-exams-begin",
    activity: "Semester Examinations Begin",
    date: "Monday 21st June 2027",
    semester: "Second Semester",
    category: "Examinations",
    highlight: true,
  },
  {
    id: "second-exams-end",
    activity: "Semester Examinations End / End of Session",
    date: "Friday 9th July 2027",
    semester: "Second Semester",
    category: "Examinations",
    highlight: true,
  },
];

export const academicCalendar: CalendarActivity[] = [
  ...firstSemesterCalendar,
  ...secondSemesterCalendar,
];

export const sessionKeyMilestones = {
  throughoutSession: "Sports, academic tutorials and welfare initiatives will run throughout the session.",
  flexibleDatesNotice: "*MATRICULATION, EID-EL-FITR AND EID-EL-KABIR - The dates can change.",
  longVacation: "Monday 12th July to Friday 8th October 2027",
  lasustechFoundersDay: "Tuesday 2nd February 2027",
};

export const generalElections2027 = [
  {
    title: "Presidential & National Assembly Elections",
    date: "Saturday 16th January, 2027",
  },
  {
    title: "Governorship and State Houses of Assembly Elections",
    date: "Saturday 6th February, 2027",
  },
];

export const publicHolidays = [
  { name: "Christmas Day", date: "Friday 25th December 2026" },
  { name: "Eid-el-Fitr", date: "Wednesday 10th & Thursday 11th March 2027" },
  { name: "Good Friday & Easter Monday", date: "Friday 26th & Monday 29th March 2027" },
  { name: "Eid-el-Kabir", date: "Monday 17th & Tuesday 18th May 2027" },
  { name: "Workers' Day", date: "Monday 3rd May 2027" },
  { name: "Democracy Day", date: "Saturday 12th June 2027" },
];
