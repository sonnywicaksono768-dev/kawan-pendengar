"use client";

import { useState } from "react";

type ExerciseId = "five-senses" | "box-breathing";

const EXERCISES: Record<
  ExerciseId,
  { title: string; intro: string; steps: Array<{ title: string; body: string }> }
> = {
  "five-senses": {
    title: "Grounding 5-4-3-2-1",
    intro:
      "Latihan ini mengembalikan perhatian ke ruang saat ini. Kamu bisa berhenti kapan saja kalau sudah merasa lebih tenang.",
    steps: [
      { title: "Lima hal yang terlihat", body: "Pandangi sekitarmu pelan-pelan. Sebutkan lima benda yang tampak." },
      { title: "Empat hal yang tersentuh", body: "Sentuh empat permukaan di dekatmu. Perhatikan suhunya." },
      { title: "Tiga suara", body: "Dengarkan tiga suara, yang dekat maupun yang jauh." },
      { title: "Dua bau", body: "Cari dua bau di sekitarmu, atau ingat satu bau yang menenangkan." },
      { title: "Satu rasa", body: "Perhatikan rasa di mulutmu, lalu tarik dan buang napas perlahan." },
    ],
  },
  "box-breathing": {
    title: "Pernapasan kotak 4-4-4-4",
    intro:
      "Kalau menahan napas terasa tidak nyaman, cukup tarik dan buang napas perlahan tanpa menahan.",
    steps: [
      { title: "Tarik napas", body: "Hitung sampai empat dengan tenang." },
      { title: "Tahan", body: "Hitung sampai empat, tanpa mengencangkan bahu." },
      { title: "Buang napas", body: "Hitung sampai empat, lebih pelan dari tarikan." },
      { title: "Tahan", body: "Hitung sampai empat, lalu siap mengulang." },
      { title: "Ulangi", body: "Lakukan empat putaran, lalu berhenti kalau sudah cukup." },
    ],
  },
};

type GroundingExerciseProps = {
  onBack: () => void;
};

export function GroundingExercise({ onBack }: GroundingExerciseProps) {
  const [exercise, setExercise] = useState<ExerciseId>("five-senses");
  const [step, setStep] = useState(0);
  const current = EXERCISES[exercise];
  const steps = current.steps;
  const last = steps.length - 1;

  function choose(next: ExerciseId) {
    setExercise(next);
    setStep(0);
  }

  return (
    <div className="panel">
      <h2>{current.title}</h2>
      <p>{current.intro}</p>

      <div className="mode-tabs" role="tablist" aria-label="Pilih latihan">
        <button
          type="button"
          role="tab"
          aria-selected={exercise === "five-senses"}
          className="mode-tab"
          onClick={() => choose("five-senses")}
        >
          Grounding 5-4-3-2-1
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={exercise === "box-breathing"}
          className="mode-tab"
          onClick={() => choose("box-breathing")}
        >
          Pernapasan kotak
        </button>
      </div>

      <ol className="exercise-steps">
        {steps.map((item, index) => (
          <li
            className="exercise-step"
            key={`${exercise}-${index}`}
            data-current={index === step}
          >
            <span className="step-count" aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="field-hint" role="status">
        Langkah {step + 1} dari {steps.length}
      </p>

      <div className="exercise-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setStep((value) => Math.max(0, value - 1))}
          disabled={step === 0}
        >
          Kembali
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setStep((value) => Math.min(last, value + 1))}
          disabled={step === last}
        >
          Lanjut
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>
          Mulai dari awal
        </button>
      </div>

      <div className="summary-actions">
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          Kembali ke obrolan
        </button>
      </div>
    </div>
  );
}
