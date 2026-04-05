import { ProjectType } from "@/modules/projects/types/projects";

export default function useProjects() {
  return {
    projects: fakeProjects,
    projectsAreLoading: false,
    projectsError: false,
  };
}

const fakeProjects: ProjectType[] = [
  {
    id: "1",
    slug: "parastore-blog-system",
    name: "Parastore Blog System",
    description: "Blog system with SEO-friendly URLs and admin dashboard.",
    repositoryUrl: "https://github.com/tawer-tn/parastore-blog",
    liveUrl: "https://parastore.tn/blog",
    projectColor: "sky",
    startTime: new Date("2024-06-01"),
    endTime: new Date("2024-07-15"),
    createdAt: new Date("2024-05-25"),
    updatedAt: new Date("2024-07-16"),
  },
  {
    id: "2",
    slug: "smart-garden-monitoring",
    name: "Smart Garden Monitoring",
    description: "IoT system for monitoring soil humidity and plant health.",
    repositoryUrl: "https://github.com/tawer-tn/smart-garden",
    projectColor: "emerald",
    startTime: new Date("2024-09-01"),
    endTime: new Date("2024-12-10"),
    createdAt: new Date("2024-08-20"),
    updatedAt: new Date("2024-12-11"),
  },
  {
    id: "3",
    slug: "tawer-board-dashboard",
    name: "Tawer Board Dashboard",
    description: "Content management dashboard for e-commerce and analytics.",
    repositoryUrl: "https://github.com/tawer-tn/tawer-board",
    liveUrl: "https://board.tawer.tn",
    projectColor: "violet",
    startTime: new Date("2025-01-10"),
    endTime: new Date("2025-03-30"),
    createdAt: new Date("2025-01-05"),
    updatedAt: new Date("2025-04-01"),
  },
  {
    id: "4",
    slug: "association-events-app",
    name: "Association Events App",
    description: "Mobile app for managing association events and rankings.",
    projectColor: "rose",
    startTime: new Date("2025-04-01"),
    endTime: new Date("2025-06-15"),
    createdAt: new Date("2025-03-20"),
    updatedAt: new Date("2025-06-16"),
  },
  {
    id: "5",
    slug: "ai-exam-generator",
    name: "AI Exam Generator",
    description: "AI system to help professors generate and correct exams.",
    repositoryUrl: "https://github.com/tawer-tn/ai-exam-generator",
    projectColor: "amber",
    startTime: new Date("2025-07-01"),
    endTime: new Date("2025-09-30"),
    createdAt: new Date("2025-06-15"),
    updatedAt: new Date("2025-10-01"),
  },
];