export type ClassData = {
  id: number;
  title: string;
  instructor: string;
  professorId: number;
  studentId?: number;
  category: string;
  date: string;
  time: string;
  duration: string;
  cost: string;
  status: string; // "REQUESTED" | "NEXT" | "NOTCONFIRMED" | "REJECTED" | "CONFIRMED"
  requestDescription: string;
  professorReview?: { text: string; rating: number };
  studentReview?: { text: string; rating: number };
};

export type TabsProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  classesData: Record<string, ClassData[]>;
};

export type ClassCardProps = {
  classData: ClassData;
  activeTab: string;
  onConfirm: (c: ClassData, action: string) => void;
}; 