document.addEventListener("DOMContentLoaded", () => {
  const questionContainer = document.getElementById("question-container");
  const feedback = document.getElementById("feedback");
  const nextButton = document.getElementById("next-btn");

  const urlParams = new URLSearchParams(window.location.search);
  const topicName = urlParams.get("topic") || "Mouse Practice";
  const year = urlParams.get("class") || "year1";

  const mouseExercises = {
    "year1": [
      { x: 50, y: 50, description: "Move your mouse to the top-left corner and click the circle." },
      { x: 200, y: 80, description: "Click the star emoji ⭐." },
      { x: 100, y: 150, description: "Click the heart ❤️." },
      { x: 250, y: 200, description: "Click the smiley 😎." },
      { x: 150, y: 250, description: "Click the thumbs up 👍." }
    ],
    "year2": [
      { x: 300, y: 50, description: "Click the red square." },
      { x: 150, y: 120, description: "Click the green triangle." },
      { x: 400, y: 180, description: "Click the blue circle." },
      { x: 200, y: 250, description: "Click the purple star." },
      { x: 100, y: 300, description: "Click the orange heart." }
    ],
    "year3": [
      { x: 200, y: 80, description: "Click the moving yellow circle." },
      { x: 250, y: 150, description: "Click the blue square." },
      { x: 300, y: 220, description: "Click the red triangle." },
      { x: 350, y: 280, description: "Click the green star." },
      { x: 400, y: 350, description: "Click the purple emoji 😊." }
    ],
    "year4": [
      { x: 100, y: 50, description: "Drag the red square to the green circle." },
      { x: 150, y: 120, description: "Drag the blue star to the yellow triangle." },
      { x: 200, y: 180, description: "Drag the heart emoji to the circle." },
      { x: 250, y: 250, description: "Drag the smiley to the rectangle." },
      { x: 300, y: 320, description: "Drag the thumbs up to the star." }
    ],
    "year5": [
      { x: 100, y: 80, description: "Double-click the folder icon." },
      { x: 200, y: 120, description: "Double-click the document icon." },
      { x: 250, y: 200, description: "Double-click the emoji icon." },
      { x: 300, y: 250, description: "Double-click the star icon." },
      { x: 350, y: 320, description: "Double-click the triangle icon." }
    ],
    "year6": [
      { x: 100, y: 50, description: "Click on toolbar button 'New File'." },
      { x: 200, y: 120, description: "Click on 'Save' button." },
      { x: 250, y: 180, description: "Click on 'Open Folder' button." },
      { x: 300, y: 250, description: "Click on 'Undo' button." },
      { x: 350, y: 320, description: "Click on 'Redo' button." }
    ],
    "year7": [
      { x: 100, y: 50, description: "Right-click the folder icon to open context menu." },
      { x: 200, y: 120, description: "Right-click the document icon to rename." },
      { x: 250, y: 180, description: "Right-click the emoji icon to delete." },
      { x: 300, y: 250, description: "Right-click the star icon to copy." },
      { x: 350, y: 320, description: "Right-click the triangle icon to paste." }
    ],
    "year8": [
      { x: 100, y: 50, description: "Create a new folder on the desktop." },
      { x: 200, y: 120, description: "Rename the new folder." },
      { x: 250, y: 180, description: "Create a subfolder inside the new folder." },
      { x: 300, y: 250, description: "Move a file into the subfolder." },
      { x: 350, y: 320, description: "Delete a file from the folder." }
    ],
    "year9": [
      { x: 100, y: 50, description: "Create a project folder." },
      { x: 200, y: 120, description: "Add subfolders for documents and images." },
      { x: 250, y: 180, description: "Move files into respective subfolders." },
      { x: 300, y: 250, description: "Rename files appropriately." },
      { x: 350, y: 320, description: "Delete unnecessary files." }
    ],
    "year10": [
      { x: 100, y: 50, description: "Create a thesis folder structure." },
      { x: 200, y: 120, description: "Add subfolders: Chapters, References, Figures." },
      { x: 250, y: 180, description: "Move documents to correct subfolders." },
      { x: 300, y: 250, description: "Rename chapter files." },
      { x: 350, y: 320, description: "Right-click to copy and paste files." }
    ],
    "year11": [
      { x: 100, y: 50, description: "Create research project folder." },
      { x: 200, y: 120, description: "Add subfolders: Drafts, Final, Data." },
      { x: 250, y: 180, description: "Move research files to folders." },
      { x: 300, y: 250, description: "Rename draft files." },
      { x: 350, y: 320, description: "Delete old versions of files." }
    ],
    "year12": [
      { x: 100, y: 50, description: "Create final project folder." },
      { x: 200, y: 120, description: "Add subfolders: Chapters, Resources, Media." },
      { x: 250, y: 180, description: "Move files into subfolders." },
      { x: 300, y: 250, description: "Rename all files properly." },
      { x: 350, y: 320, description: "Delete unnecessary or duplicate files." }
    ]
  };

  let exercises = mouseExercises[year] || [];
  let currentExerciseIndex = 0;

  function showExercise() {
    feedback.textContent = "";
    nextButton.classList.add("hidden");

    if (currentExerciseIndex >= exercises.length) {
      questionContainer.innerHTML = `<h2>🎉 Congratulations! You completed "${topicName}" practice.</h2>`;
      nextButton.textContent = "Restart";
      nextButton.classList.remove("hidden");
      nextButton.onclick = () => {
        currentExerciseIndex = 0;
        showExercise();
      };
      return;
    }

    const exercise = exercises[currentExerciseIndex];

    questionContainer.innerHTML = `
      <h2>${topicName} Exercise ${currentExerciseIndex + 1}/${exercises.length}</h2>
      <p>${exercise.description}</p>
      <div style="width:100%;height:400px;position:relative;border:2px dashed #ccc;margin-top:20px;" id="exercise-area">
        <button id="target-btn" style="
          position:absolute;
          top:${exercise.y}px;
          left:${exercise.x}px;
          padding:10px 15px;
          border-radius:8px;
          cursor:pointer;
        ">Click Me</button>
      </div>
    `;

    const targetBtn = document.getElementById("target-btn");
    targetBtn.addEventListener("click", () => {
      feedback.textContent = "✅ Correct!";
      feedback.style.color = "green";
      currentExerciseIndex++;
      setTimeout(showExercise, 800);
    });
  }

  showExercise();
});
