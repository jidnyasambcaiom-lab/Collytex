"use client";

import Link from "next/link";
import { useState } from "react";
import { presentationCampuses } from "@/lib/presentation-colleges";

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  const locations = [...new Set(presentationCampuses.map(({ branch }) => branch.city))].sort();
  const colleges = [...new Map(presentationCampuses.map(({ college }) => [college.slug, college])).values()].sort((a, b) => a.name.localeCompare(b.name));
  const departments = [...new Set(presentationCampuses.flatMap(({ departments }) => departments))].sort();
  const courses = [...new Set(presentationCampuses.flatMap(({ courses }) => courses.map(({ name }) => name)))].sort();

  const query = searchQuery.trim().toLocaleLowerCase();
  const filtered = presentationCampuses.filter(({ college, branch, departments: campusDepartments, courses: campusCourses }) => {
    const matchesSearch =
      !query ||
      [college.name, branch.displayName, branch.name, branch.city, branch.state, ...campusDepartments, ...campusCourses.map(({ name }) => name)]
        .some((value) => value?.toLocaleLowerCase().includes(query));
    const matchesLocation = !locationFilter || branch.city === locationFilter;
    const matchesCollege = !collegeFilter || college.slug === collegeFilter;
    const matchesDepartment = !departmentFilter || campusDepartments.some((name) => name.toLocaleLowerCase() === departmentFilter.toLocaleLowerCase());
    const matchesCourse = !courseFilter || campusCourses.some(({ name }) => name.toLocaleLowerCase() === courseFilter.toLocaleLowerCase());
    return matchesSearch && matchesLocation && matchesCollege && matchesDepartment && matchesCourse;
  });

  function clearFilters() {
    setSearchQuery("");
    setLocationFilter("");
    setCollegeFilter("");
    setDepartmentFilter("");
    setCourseFilter("");
  }

  return (
    <main className="directory-page">
      <div className="directory-content">
        <div className="eyebrow">THE COLLYTEX DIRECTORY</div>
        <h1>Explore colleges</h1>
        <p className="directory-intro">Find campuses, explore their departments, and compare courses.</p>

        <div className="filter-panel-wrapper">
          <div className="filter-panel">
            <label className="filter-search">
              <span>Search</span>
              <input type="search" placeholder="College, course, department or city" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
            </label>
            <label className="filter-select">
              <span>Location</span>
              <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
                <option value="">All locations</option>
                {locations.map((location) => <option key={location} value={location}>{location}</option>)}
              </select>
            </label>
            <label className="filter-select">
              <span>College</span>
              <select value={collegeFilter} onChange={(event) => setCollegeFilter(event.target.value)}>
                <option value="">All colleges</option>
                {colleges.map((college) => <option key={college.slug} value={college.slug}>{college.name}</option>)}
              </select>
            </label>
            <label className="filter-select">
              <span>Department</span>
              <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
                <option value="">All departments</option>
                {departments.map((department) => <option key={department} value={department}>{department}</option>)}
              </select>
            </label>
            <label className="filter-select">
              <span>Course</span>
              <select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}>
                <option value="">All courses</option>
                {courses.map((course) => <option key={course} value={course}>{course}</option>)}
              </select>
            </label>
            <button className="button button-dark filter-reset" type="button" onClick={clearFilters}>Clear filters</button>
          </div>
        </div>

        <div className="result-count" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "campus" : "campuses"}
          {searchQuery.trim() && <> matching <b>“{searchQuery.trim()}”</b></>}
        </div>

        {filtered.length ? (
          <div className="college-results-grid">
            {filtered.map(({ id, name, college, branch, departments: campusDepartments, courses: campusCourses }) => (
              <article key={id} className="explore-college-card">
                <div className="college-image-wrap">
                  <img src={branch.image} alt={`${name} campus`} className="college-image" loading="lazy" />
                  <a className="image-credit" href={branch.imageCreditUrl} target="_blank" rel="noreferrer">Image source ↗</a>
                </div>
                <div className="college-card-body">
                  <h2>{name}</h2>
                  <div className="college-meta"><span className="location-dot" aria-hidden="true">●</span>{branch.city}, {branch.state}</div>
                  <div className="rating-row" aria-label={`Illustrative rating ${college.rating} out of 5`}>
                    {[...Array(5)].map((_, index) => <span key={index} className={index < Math.round(college.rating) ? "star active" : "star"}>★</span>)}
                    <span className="rating-number">{college.rating.toFixed(1)}/5</span>
                  </div>
                  <div className="college-details">
                    <div className="detail-section"><strong>Departments</strong><div className="detail-items">{campusDepartments.join(", ")}</div></div>
                    <div className="detail-section"><strong>Courses</strong><div className="detail-items">{[...new Set(campusCourses.map(({ name: courseName }) => courseName))].join(", ")}</div></div>
                  </div>
                  <Link href={`/colleges/${college.slug}`} className="explore-link">View details ↗</Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-mark">i</span>
            <div><strong>No campuses match these filters.</strong><p>Try removing a filter or searching with a different term.</p></div>
            <button className="button button-dark" type="button" onClick={clearFilters}>Clear filters →</button>
          </div>
        )}

        <p className="directory-data-note">Campus pathways and ratings on this page are illustrative. Confirm current admissions, fees, and course details with each institution.</p>
      </div>

      <footer className="site-footer">
        <Link className="brand" href="/"><span className="brand-mark">c</span><span>collytex</span></Link>
        <span>Clear information. Better next steps.</span>
        <small>© {new Date().getFullYear()} Collytex</small>
      </footer>
    </main>
  );
}
