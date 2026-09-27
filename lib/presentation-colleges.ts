export interface PresentationCourse {
  name: string;
  slug: string;
  level: string;
  durationYears: number;
  fees: Array<{ year: string; amount: number }>;
  placements: Array<{ year: string; average: string; highest: string; placementRate: string }>;
  sections: Array<{ title: string; content: string }>;
}

export interface PresentationOffering {
  university: { name: string; slug: string };
  courses: PresentationCourse[];
}

export interface PresentationDepartment {
  name: string;
  slug: string;
  offerings: PresentationOffering[];
}

export interface PresentationBranch {
  name: string;
  displayName?: string;
  slug: string;
  city: string;
  state: string;
  address: string;
  image: string;
  imageCreditUrl: string;
  contactUrl?: string;
  departments: PresentationDepartment[];
}

export interface PresentationCollege {
  slug: string;
  name: string;
  description: string;
  website: string;
  rating: number;
  branches: PresentationBranch[];
}

const sampleCourse = (name: string, slug: string, level: string, durationYears: number): PresentationCourse => ({
  name,
  slug,
  level,
  durationYears,
  fees: [
    { year: "2025–26", amount: 145000 },
    { year: "2024–25", amount: 132000 },
  ],
  placements: [
    { year: "2024–25", average: "₹8.4 LPA", highest: "₹24 LPA", placementRate: "86%" },
    { year: "2023–24", average: "₹7.8 LPA", highest: "₹21 LPA", placementRate: "82%" },
  ],
  sections: [
    { title: "Admission", content: "Review the institution’s current eligibility criteria, entrance requirements, and application dates on its official website." },
    { title: "Scholarship", content: "Scholarship availability and eligibility vary by academic year. Contact the institution for current details." },
    { title: "Syllabus", content: "The curriculum is organized by semester and may be revised by the affiliated university." },
    { title: "Campus life", content: "Contact the institution to learn about facilities, student clubs, and campus services." },
  ],
});

const course = (name: string, slug: string, level: string, durationYears: number) =>
  sampleCourse(name, slug, level, durationYears);

const engineeringCourses = [
  course("B.Tech Computer Science", "b-tech-computer-science", "Undergraduate", 4),
  course("M.Tech Computer Science", "m-tech-computer-science", "Postgraduate", 2),
];

const engineeringDepartment = (name = "Computer Science", slug = "computer-science") => ({
  name,
  slug,
  offerings: [
    { university: { name: "Institute of Technology", slug: "institute-of-technology" }, courses: engineeringCourses },
    { university: { name: "Savitribai Phule Pune University", slug: "savitribai-phule-pune-university" }, courses: [course("BCA", "bca", "Undergraduate", 3), course("MCA", "mca", "Postgraduate", 2)] },
  ],
});

const managementDepartment = {
  name: "Management",
  slug: "management",
  offerings: [
    { university: { name: "University of Mumbai", slug: "university-of-mumbai" }, courses: [course("BBA", "bba", "Undergraduate", 3), course("MBA", "mba", "Postgraduate", 2)] },
    { university: { name: "Savitribai Phule Pune University", slug: "savitribai-phule-pune-university" }, courses: [course("MBA", "mba-sppu", "Postgraduate", 2)] },
  ],
};

const bcaDepartment = {
  name: "Computer Applications",
  slug: "computer-applications",
  offerings: [
    { university: { name: "Savitribai Phule Pune University", slug: "savitribai-phule-pune-university" }, courses: [course("BCA", "bca", "Undergraduate", 3), course("MCA", "mca", "Postgraduate", 2)] },
    { university: { name: "University of Mumbai", slug: "university-of-mumbai" }, courses: [course("BCA", "bca-mumbai", "Undergraduate", 3)] },
  ],
};

const commonsImage = (path: string) => `https://upload.wikimedia.org/wikipedia/commons/${path}`;
const commonsCredit = (file: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file).replace(/%20/g, "_")}`;

export const presentationColleges: PresentationCollege[] = [
  {
    slug: "iit-bombay",
    name: "IIT Bombay",
    description: "The Indian Institute of Technology Bombay is a public technical university in Powai, Mumbai.",
    website: "https://www.iitb.ac.in/",
    rating: 4.9,
    branches: [{
      name: "Powai Campus",
      displayName: "IIT Bombay",
      slug: "powai-campus",
      city: "Mumbai",
      state: "Maharashtra",
      address: "Powai, Mumbai, Maharashtra",
      image: commonsImage("e/eb/IITCampusPano.JPG"),
      imageCreditUrl: commonsCredit("IITCampusPano.JPG"),
      contactUrl: "https://www.iitb.ac.in/",
      departments: [
        { ...engineeringDepartment(), offerings: [{ university: { name: "Indian Institute of Technology Bombay", slug: "iit-bombay" }, courses: engineeringCourses }] },
        { name: "Mechanical Engineering", slug: "mechanical-engineering", offerings: [{ university: { name: "Indian Institute of Technology Bombay", slug: "iit-bombay" }, courses: [course("B.Tech Mechanical Engineering", "b-tech-mechanical-engineering", "Undergraduate", 4), course("M.Tech Mechanical Engineering", "m-tech-mechanical-engineering", "Postgraduate", 2)] }] },
      ],
    }],
  },
  {
    slug: "iit-delhi",
    name: "IIT Delhi",
    description: "The Indian Institute of Technology Delhi is a public technical university in Hauz Khas, New Delhi.",
    website: "https://home.iitd.ac.in/",
    rating: 4.8,
    branches: [{
      name: "Hauz Khas Campus",
      displayName: "IIT Delhi",
      slug: "hauz-khas-campus",
      city: "New Delhi",
      state: "Delhi",
      address: "Hauz Khas, New Delhi",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/IIT_Delhi_campus_wide_view.jpg/960px-IIT_Delhi_campus_wide_view.jpg",
      imageCreditUrl: commonsCredit("IIT Delhi campus wide view.jpg"),
      contactUrl: "https://home.iitd.ac.in/",
      departments: [
        { ...engineeringDepartment(), offerings: [{ university: { name: "Indian Institute of Technology Delhi", slug: "iit-delhi" }, courses: engineeringCourses }] },
        { name: "Civil Engineering", slug: "civil-engineering", offerings: [{ university: { name: "Indian Institute of Technology Delhi", slug: "iit-delhi" }, courses: [course("B.Tech Civil Engineering", "b-tech-civil-engineering", "Undergraduate", 4), course("M.Tech Civil Engineering", "m-tech-civil-engineering", "Postgraduate", 2)] }] },
      ],
    }],
  },
  {
    slug: "bits-pilani",
    name: "BITS Pilani",
    description: "Birla Institute of Technology and Science, Pilani has campuses in Pilani and Goa.",
    website: "https://www.bits-pilani.ac.in/",
    rating: 4.7,
    branches: [
      {
        name: "Pilani Campus",
        displayName: "BITS Pilani",
        slug: "pilani-campus",
        city: "Pilani",
        state: "Rajasthan",
        address: "Vidya Vihar, Pilani, Rajasthan",
        image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/BITS-Pilani_campus_aerial_view.jpg/960px-BITS-Pilani_campus_aerial_view.jpg",
        imageCreditUrl: commonsCredit("BITS-Pilani campus aerial view.jpg"),
        contactUrl: "https://www.bits-pilani.ac.in/pilani/",
        departments: [
          { ...engineeringDepartment(), offerings: [{ university: { name: "Birla Institute of Technology and Science", slug: "birla-institute-of-technology-and-science" }, courses: [course("B.E. Computer Science", "be-computer-science", "Undergraduate", 4), course("M.E. Computer Science", "me-computer-science", "Postgraduate", 2)] }] },
          managementDepartment,
        ],
      },
      {
        name: "Goa Campus",
        displayName: "BITS Goa",
        slug: "goa-campus",
        city: "Zuarinagar",
        state: "Goa",
        address: "NH 17B, Zuarinagar, Goa",
        image: commonsImage("6/6e/BITS_GOA_main_building.jpg"),
        imageCreditUrl: commonsCredit("BITS GOA main building.jpg"),
        contactUrl: "https://www.bits-pilani.ac.in/goa/",
        departments: [
          { ...engineeringDepartment(), offerings: [{ university: { name: "Birla Institute of Technology and Science", slug: "birla-institute-of-technology-and-science" }, courses: [course("B.E. Computer Science", "be-computer-science", "Undergraduate", 4), course("M.E. Computer Science", "me-computer-science", "Postgraduate", 2)] }] },
          { name: "Electronics", slug: "electronics", offerings: [{ university: { name: "Birla Institute of Technology and Science", slug: "birla-institute-of-technology-and-science" }, courses: [course("B.E. Electronics", "be-electronics", "Undergraduate", 4), course("M.E. Electronics", "me-electronics", "Postgraduate", 2)] }] },
        ],
      },
    ],
  },
  {
    slug: "met-college-adgaon",
    name: "MET College",
    description: "Mumbai Educational Trust operates educational institutions in Nashik and Mumbai.",
    website: "https://www.met.edu/",
    rating: 4.3,
    branches: [
      {
        name: "MET Bhujbal Knowledge City",
        displayName: "MET College Adgaon",
        slug: "bhujbal-knowledge-city",
        city: "Adgaon",
        state: "Maharashtra",
        address: "Adgaon, Nashik, Maharashtra",
        image: "https://www.met.edu/uploadfile/met-campus/Adgaon_Campus%2C_Nashik1.jpg",
        imageCreditUrl: "https://www.met.edu/",
        contactUrl: "https://www.met.edu/",
        departments: [bcaDepartment, managementDepartment],
      },
      {
        name: "MET Mumbai",
        slug: "mumbai-campus",
        city: "Mumbai",
        state: "Maharashtra",
        address: "Bandra Reclamation, Mumbai, Maharashtra",
        image: "https://www.met.edu/uploadfile/met-campus/MET_Mumbai.jpg",
        imageCreditUrl: "https://www.met.edu/",
        contactUrl: "https://www.met.edu/",
        departments: [bcaDepartment, managementDepartment],
      },
    ],
  },
  {
    slug: "jnu",
    name: "Jawaharlal Nehru University",
    description: "Jawaharlal Nehru University is a public research university in New Delhi.",
    website: "https://www.jnu.ac.in/",
    rating: 4.5,
    branches: [{
      name: "Delhi Campus",
      slug: "delhi-campus",
      city: "New Delhi",
      state: "Delhi",
      address: "New Mehrauli Road, New Delhi",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/Jitendra_Singh_reviewing_progress_of_the_Hostel_building_for_North_Eastern_students%2C_at_Jawaharlal_Nehru_University_%28JNU%29_campus%2C_in_New_Delhi.JPG/960px-Jitendra_Singh_reviewing_progress_of_the_Hostel_building_for_North_Eastern_students%2C_at_Jawaharlal_Nehru_University_%28JNU%29_campus%2C_in_New_Delhi.JPG",
      imageCreditUrl: commonsCredit("Jitendra Singh reviewing progress of the Hostel building for North Eastern students, at Jawaharlal Nehru University (JNU) campus, in New Delhi.JPG"),
      contactUrl: "https://www.jnu.ac.in/",
      departments: [
        { name: "Physics", slug: "physics", offerings: [{ university: { name: "Jawaharlal Nehru University", slug: "jnu" }, courses: [course("M.Sc. Physics", "msc-physics", "Postgraduate", 2), course("PhD Physics", "phd-physics", "Doctoral", 5)] }] },
        { name: "Chemistry", slug: "chemistry", offerings: [{ university: { name: "Jawaharlal Nehru University", slug: "jnu" }, courses: [course("M.Sc. Chemistry", "msc-chemistry", "Postgraduate", 2), course("PhD Chemistry", "phd-chemistry", "Doctoral", 5)] }] },
      ],
    }],
  },
  {
    slug: "manipal-university",
    name: "Manipal University",
    description: "Manipal Academy of Higher Education is a private deemed university in Manipal, Karnataka.",
    website: "https://www.manipal.edu/",
    rating: 4.4,
    branches: [{
      name: "Manipal Campus",
      slug: "manipal-campus",
      city: "Manipal",
      state: "Karnataka",
      address: "Madhav Nagar, Manipal, Karnataka",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f4/Manipal_Institute_of_Technology_Academic_Building%2C_Manipal_University%2C_Manipal_Campus%2C_India_%28Ank_Kumar%2C_Infosys_Limited_%29_01.jpg/960px-Manipal_Institute_of_Technology_Academic_Building%2C_Manipal_University%2C_Manipal_Campus%2C_India_%28Ank_Kumar%2C_Infosys_Limited_%29_01.jpg",
      imageCreditUrl: commonsCredit("Manipal Institute of Technology Academic Building, Manipal University, Manipal Campus, India (Ank Kumar, Infosys Limited ) 01.jpg"),
      contactUrl: "https://www.manipal.edu/",
      departments: [
        { ...engineeringDepartment(), offerings: [{ university: { name: "Manipal Academy of Higher Education", slug: "manipal-academy-higher-education" }, courses: engineeringCourses }] },
        { name: "Medicine", slug: "medicine", offerings: [{ university: { name: "Manipal Academy of Higher Education", slug: "manipal-academy-higher-education" }, courses: [course("MBBS", "mbbs", "Undergraduate", 5)] }] },
      ],
    }],
  },
  {
    slug: "vit",
    name: "Vellore Institute of Technology",
    description: "Vellore Institute of Technology is a private university in Vellore, Tamil Nadu.",
    website: "https://vit.ac.in/",
    rating: 4.2,
    branches: [{
      name: "Vellore Campus",
      slug: "vellore-campus",
      city: "Vellore",
      state: "Tamil Nadu",
      address: "VIT Road, Vellore, Tamil Nadu",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/S-MH_and_T-MH_VIT%2C_Vellore_Campus.jpg/960px-S-MH_and_T-MH_VIT%2C_Vellore_Campus.jpg",
      imageCreditUrl: commonsCredit("S-MH and T-MH VIT, Vellore Campus.jpg"),
      contactUrl: "https://vit.ac.in/",
      departments: [
        { ...engineeringDepartment(), offerings: [{ university: { name: "Vellore Institute of Technology", slug: "vellore-institute-of-technology" }, courses: engineeringCourses }] },
        { name: "Civil Engineering", slug: "civil-engineering", offerings: [{ university: { name: "Vellore Institute of Technology", slug: "vellore-institute-of-technology" }, courses: [course("B.Tech Civil Engineering", "b-tech-civil-engineering", "Undergraduate", 4), course("M.Tech Civil Engineering", "m-tech-civil-engineering", "Postgraduate", 2)] }] },
      ],
    }],
  },
  {
    slug: "symbiosis",
    name: "Symbiosis International University",
    description: "Symbiosis International is a multi-disciplinary university headquartered in Pune.",
    website: "https://www.siu.edu.in/",
    rating: 4.4,
    branches: [{
      name: "Pune Campus",
      slug: "pune-campus",
      city: "Pune",
      state: "Maharashtra",
      address: "Lavale, Pune, Maharashtra",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/Scenic_Views_from_the_SIBM_Pune_campus.jpg/960px-Scenic_Views_from_the_SIBM_Pune_campus.jpg",
      imageCreditUrl: commonsCredit("Scenic Views from the SIBM Pune campus.jpg"),
      contactUrl: "https://www.siu.edu.in/",
      departments: [
        { ...engineeringDepartment(), offerings: [{ university: { name: "Symbiosis International University", slug: "symbiosis-international-university" }, courses: [course("BCA", "bca-symbiosis", "Undergraduate", 3), course("MCA", "mca-symbiosis", "Postgraduate", 2)] }] },
        managementDepartment,
      ],
    }],
  },
];

export interface PresentationCampus {
  id: string;
  name: string;
  college: PresentationCollege;
  branch: PresentationBranch;
  departments: string[];
  courses: PresentationCourse[];
}

export const presentationCampuses: PresentationCampus[] = presentationColleges.flatMap((college) =>
  college.branches.map((branch) => ({
    id: `${college.slug}-${branch.slug}`,
    name: branch.displayName ?? college.name,
    college,
    branch,
    departments: branch.departments.map((department) => department.name),
    courses: branch.departments.flatMap((department) => department.offerings.flatMap((offering) => offering.courses)),
  })),
);

export function findPresentationCollege(slug: string) {
  return presentationColleges.find((college) => college.slug === slug);
}

export function findPresentationBranch(collegeSlug: string, branchSlug: string) {
  return findPresentationCollege(collegeSlug)?.branches.find((branch) => branch.slug === branchSlug);
}

export function findPresentationDepartment(collegeSlug: string, branchSlug: string, departmentSlug: string) {
  return findPresentationBranch(collegeSlug, branchSlug)?.departments.find((department) => department.slug === departmentSlug);
}

export function findPresentationOffering(collegeSlug: string, branchSlug: string, departmentSlug: string, universitySlug: string) {
  return findPresentationDepartment(collegeSlug, branchSlug, departmentSlug)?.offerings.find((offering) => offering.university.slug === universitySlug);
}

export function findPresentationCourse(collegeSlug: string, branchSlug: string, departmentSlug: string, universitySlug: string, courseSlug: string) {
  return findPresentationOffering(collegeSlug, branchSlug, departmentSlug, universitySlug)?.courses.find((item) => item.slug === courseSlug);
}

export function countBranchCourses(branch: PresentationBranch) {
  return branch.departments.reduce((count, department) => count + department.offerings.reduce((offerCount, offering) => offerCount + offering.courses.length, 0), 0);
}

export function countCollegeCourses(college: PresentationCollege) {
  return college.branches.reduce((count, branch) => count + countBranchCourses(branch), 0);
}

export function countCollegeDepartments(college: PresentationCollege) {
  return college.branches.reduce((count, branch) => count + branch.departments.length, 0);
}
