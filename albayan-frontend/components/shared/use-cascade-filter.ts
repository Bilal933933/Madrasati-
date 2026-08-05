"use client";

import { useState } from "react";
import type { Stage } from "@/features/stages/types/stage.types";
import type { Grade } from "@/features/grades/types/grade.types";
import type { Semester } from "@/features/semesters/types/semester.types";
import type { Subject } from "@/features/subjects/types/subject.types";
import type { Course } from "@/features/courses/types/course.types";
import type { Lesson } from "@/features/lessons/types/lesson.types";

export type CascadeLevel = "stage" | "grade" | "semester" | "subject" | "course";

export type CascadeValues = Partial<Record<CascadeLevel, string>>;

export interface CascadeOptions {
  stage: Stage[];
  grade: Grade[];
  semester: Semester[];
  subject: Subject[];
  course: Course[];
}

export interface CascadeFilterData {
  stages?: Stage[];
  grades?: Grade[];
  semesters?: Semester[];
  subjects?: Subject[];
  courses?: Course[];
}

export interface CascadeFilterState {
  values: CascadeValues;
  options: CascadeOptions;
  setValue: (level: CascadeLevel, value: string) => void;
  reset: () => void;
}

const LEVEL_ORDER: CascadeLevel[] = ["stage", "grade", "semester", "subject", "course"];

export function activeId(value: string | undefined): number | undefined {
  if (value && value !== "all") return Number(value);
  return undefined;
}

export function filterGrades(grades: Grade[], values: CascadeValues): Grade[] {
  const stage = activeId(values.stage);
  return stage ? grades.filter((g) => g.stage_id === stage) : grades;
}

export function filterSemesters(semesters: Semester[], values: CascadeValues): Semester[] {
  const grade = activeId(values.grade);
  return grade ? semesters.filter((s) => s.grade_id === grade) : semesters;
}

export function filterSubjects(subjects: Subject[], values: CascadeValues): Subject[] {
  const grade = activeId(values.grade);
  const semester = activeId(values.semester);

  return subjects.filter((s) => {
    if (grade && s.grade_id !== grade) return false;
    if (semester && s.semester_id !== semester) return false;
    return true;
  });
}

export function filterCourses(courses: Course[], values: CascadeValues): Course[] {
  const subject = activeId(values.subject);
  return subject ? courses.filter((c) => c.subject_id === subject) : courses;
}

export function filterLessons(lessons: Lesson[], values: CascadeValues): Lesson[] {
  const course = activeId(values.course);
  return course ? lessons.filter((l) => l.course_id === course) : lessons;
}

export function useCascadeFilter(data: CascadeFilterData): CascadeFilterState {
  const [values, setValues] = useState<CascadeValues>({});

  const grades = data.grades ?? [];
  const semesters = data.semesters ?? [];
  const subjects = data.subjects ?? [];
  const courses = data.courses ?? [];

  const stage = activeId(values.stage);
  const grade = activeId(values.grade);
  const subject = activeId(values.subject);

  const options: CascadeOptions = {
    stage: data.stages ?? [],
    grade: stage ? grades.filter((g) => g.stage_id === stage) : grades,
    semester: grade ? semesters.filter((s) => s.grade_id === grade) : semesters,
    subject: filterSubjects(subjects, values),
    course: subject ? courses.filter((c) => c.subject_id === subject) : courses,
  };

  function setValue(level: CascadeLevel, value: string) {
    setValues((prev) => {
      const next: CascadeValues = { ...prev, [level]: value };
      const index = LEVEL_ORDER.indexOf(level);
      for (let i = index + 1; i < LEVEL_ORDER.length; i++) {
        delete next[LEVEL_ORDER[i]];
      }
      return next;
    });
  }

  function reset() {
    setValues({});
  }

  return { values, options, setValue, reset };
}
