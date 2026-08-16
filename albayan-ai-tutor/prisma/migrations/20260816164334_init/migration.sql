-- CreateTable
CREATE TABLE "knowledge_chunks" (
    "id" BIGSERIAL NOT NULL,
    "docKey" VARCHAR(64) NOT NULL,
    "docPath" VARCHAR(512) NOT NULL,
    "docType" VARCHAR(32) NOT NULL,
    "subjectId" BIGINT,
    "gradeId" BIGINT,
    "lessonId" BIGINT,
    "heading" VARCHAR(255),
    "ordinal" INTEGER,
    "text" TEXT NOT NULL,
    "pageStart" INTEGER,
    "pageEnd" INTEGER,
    "wordCount" INTEGER,
    "embedding" halfvec(768),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_chunks_doc_key_unique" ON "knowledge_chunks"("docKey");

-- CreateIndex
CREATE INDEX "knowledge_chunks_subject_grade_idx" ON "knowledge_chunks"("subjectId", "gradeId");

-- CreateIndex
CREATE INDEX "knowledge_chunks_doc_type_idx" ON "knowledge_chunks"("docType");

-- CreateIndex
CREATE INDEX "knowledge_chunks_lesson_id_idx" ON "knowledge_chunks"("lessonId");
