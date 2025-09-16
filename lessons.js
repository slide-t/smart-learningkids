
import { saveProgress } from "./indexedDB-helper.js";

document.getElementById("saveBtn").addEventListener("click", () => {
  const subject = document.getElementById("subject").value;
  const session = document.getElementById("session").value;
  const term = document.getElementById("term").value;

  // For now, mock student data
  const record = {
    studentId: 1,
    fullName: "Amina Yusuf",
    class: "Year 4",
    subject,
    session,
    term,
    schoolName: "Sunshine Primary",
    score: Math.floor(Math.random() * 100), // demo score
    timestamp: Date.now()
  };

  saveProgress(record).then(() => {
    alert("Progress saved successfully!");
  });
});
