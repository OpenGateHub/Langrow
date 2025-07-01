"use client";

import React, { useState } from "react";
import { useProfileContext } from "@/context/ProfileContext";
import { useClassManagement } from "@/hooks/useClassManagement";
import { ClassCard } from "../components/ClassCard";
import { ClassTabs } from "../components/ClassTabs";
import ReviewModal from "../components/ModalReview";
import WeeklyAgendaModal from "../components/ModalClassRequest";
import RescheduleModal from "../components/RescheduleModal";
import MessageModal from "../components/Modal";
import BlockUi from "../components/BlockUi";

const MisClases: React.FC = () => {
  const { clerkUser, role } = useProfileContext();
  const [activeTab, setActiveTab] = useState<string>("Clasificar");

  const {
    classesData,
    loading,
    error,
    selectedClass,
    isReviewModalOpen,
    isScheduleModalOpen,
    isMessageModalOpen,
    modalMessage,
    modalType,
    openModal,
    closeModal,
    handleReviewSubmit,
    handleScheduleSubmit,
    setMessageModalOpen
  } = useClassManagement(clerkUser?.id || "");

  // Adaptador para el tipo de onSubmit del ReviewModal
  const handleReviewSubmitAdapter = (text: string, rating: number) => {
    if (!clerkUser) return;
    handleReviewSubmit(text, rating, Number(clerkUser.id));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 bg-gray-100 py-6 my-6 rounded-xl min-h-screen">
      <BlockUi isActive={loading} />
      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        type={modalType}
        message={modalMessage}
      />

      <ClassTabs activeTab={activeTab} setActiveTab={setActiveTab} classesData={classesData} />

      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
      <div className="mt-6">
          {classesData[activeTab]?.length ? (
            classesData[activeTab].map(c => (
              <ClassCard key={c.id} classData={c} activeTab={activeTab} onConfirm={openModal} />
          ))
        ) : (
          <p className="text-gray-500 text-center">No hay clases en esta categoría.</p>
        )}
      </div>
      )}

      <ReviewModal isOpen={isReviewModalOpen} onClose={closeModal} onSubmit={handleReviewSubmitAdapter} />

      {isScheduleModalOpen && selectedClass && role === "org:alumno" && (
        <WeeklyAgendaModal
          isOpen
          onClose={closeModal}
          requiredClasses={1}
          professorId={selectedClass.professorId}
          professor={selectedClass.instructor}
          onSubmit={handleScheduleSubmit}
        />
      )}
      {isScheduleModalOpen && selectedClass && role === "org:profesor" && (
            <RescheduleModal
          isOpen
              onClose={closeModal}
          onConfirm={() =>
            handleScheduleSubmit([{ date: new Date(), dayName: selectedClass.category, time: selectedClass.time }])
          }
            />
      )}
    </div>
  );
};

export default MisClases;
