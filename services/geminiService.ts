
import { GoogleGenAI } from "@google/genai";
import { Student, Subject } from "../types.ts";

export async function generateStudentAcademicAdvice(student: Student, subjects: Subject[]) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analiza la situación académica del alumno ${student.firstName} ${student.lastName} en el nivel ${student.level}. 
    Está inscripto en: ${student.careerIds.length > 0 ? 'carreras IDs: ' + student.careerIds.join(', ') : 'curriculum general'}.
    Materias aprobadas: ${student.passedSubjectIds.length}.
    Las materias disponibles son: ${subjects.map(s => s.name).join(', ')}.
    Proporciona un resumen profesional corto (en español) sobre su camino potencial y consejos para la próxima inscripción a finales, considerando correlatividades.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error al generar asesoramiento académico.";
  }
}
