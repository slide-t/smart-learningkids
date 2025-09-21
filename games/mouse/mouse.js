document.addEventListener("DOMContentLoaded", () => {
  const questionContainer = document.getElementById("question-container");
  const feedback = document.getElementById("feedback");
  const nextButton = document.getElementById("next-btn");

  // Read URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const topicName = urlParams.get("topic") || "Mouse Practice";

  // Mouse exercises by topic/year
  const mouseExercises = {
    "Pointing": [
      { x: 50, y: 50, description: "Move your mouse to the top-left corner and click. 🖱️" },
      { x: 300, y: 100, description: "Point to the star ⭐ and click." },
      { x: 200, y: 250, description: "Move the cursor to the circle ⚪ and click." },
      { x: 400, y: 300, description: "Point to the triangle ▲ and click." },
      { x: 150, y: 400, description: "Move to the heart ❤️ and click." }
    ],
    "Single Click": [
      { x: 100, y: 50, description: "Click on the star ⭐" },
      { x: 300, y: 150, description: "Click the square ◼️" },
      { x: 200, y: 250, description: "Click the circle ⚪" },
      { x: 400, y: 300, description: "Click the triangle ▲" },
      { x: 150, y: 400, description: "Click the emoji 😊" }
    ],
    "Double Click": [
      { x: 100, y: 50, description: "Double-click the star ⭐" },
      { x: 300, y: 150, description: "Double-click the square ◼️" },
      { x: 200, y: 250, description: "Double-click the circle ⚪" },
      { x: 400, y: 300, description: "Double-click the triangle ▲" },
      { x: 150, y: 400, description: "Double-click the emoji 😎" }
    ],
    "Right Click": [
      { x: 100, y: 50, description: "Right-click the star ⭐" },
      { x: 300, y: 150, description: "Right-click the square ◼️" },
      { x: 200, y: 250, description: "Right-click the circle ⚪" },
      { x: 400, y: 300, description: "Right-click the triangle ▲" },
      { x: 150, y: 400, description: "Right-click the emoji 😊" }
    ],
    "Drag and Drop": [
      { x: 50, y: 50, targetX: 300, targetY: 150, description: "Drag the star ⭐ to the box" },
      { x: 200, y: 100, targetX: 350, targetY: 300, description: "Drag the circle ⚪ to the triangle ▲" }
    ],
    "Create Folder": [
      { x: 50, y: 50, description: "Right-click on desktop and create a new folder 📁" },
      { x: 100, y: 150, description: "Rename the folder ✏️" }
    ],
    "Advanced Desktop Management": [
      { x: 50, y: 50, description: "Create a folder 📁, create a subfolder inside, and drag files into it" },
      { x: 150, y: 150, description: "Delete a file 🗑️ and undo" }
    ]
  };

  let exercises = mouseExercises[topicName] || [];
  let currentExerciseIndex = 0;

  function showExercise() {
    feedback.textContent = "";
    nextButton.classList.add("hidden");

    if (currentExerciseIndex >= exercises.length) {
      questionContainer.innerHTML = `
        <h2>🎉 Congratulations! You completed the "${topicName}" practice.</h2>
        <div style="margin-top:15px;">
          <button id="restart-btn">Restart</button>
          <button id="classes-btn">Back To Classes</button>
          <button id="home-btn">Home</button>
        </div>
      `;

      document.getElementById("restart-btn").onclick = () => {
        currentExerciseIndex = 0;
        showExercise();
      };
      document.getElementById("classes-btn").onclick = () => {
        window.location.href = "../classes.html";
      };
      document.getElementById("home-btn").onclick = () => {
        window.location.href = "../index.html";
      };

      return;
    }

    const exercise = exercises[currentExerciseIndex];

    // Drag & Drop
    if (exercise.targetX !== undefined && exercise.targetY !== undefined) {
      questionContainer.innerHTML = `
        <h2>${topicName} Exercise ${currentExerciseIndex + 1}/${exercises.length}</h2>
        <p>${exercise.description}</p>
        <div id="exercise-area" style="position:relative;width:100%;height:400px;border:2px dashed #ccc;margin-top:20px;">
          <div id="drag-item" style="
            position:absolute; top:${exercise.y}px; left:${exercise.x}px;
            padding:10px; cursor:grab; background:#fffa; border-radius:8px;">⭐</div>
          <div id="drop-area" style="
            position:absolute; top:${exercise.targetY}px; left:${exercise.targetX}px;
            width:60px; height:60px; border:2px dashed #888; border-radius:8px;"></div>
        </div>
      `;

      const dragItem = document.getElementById("drag-item");
      const dropArea = document.getElementById("drop-area");

      dragItem.onmousedown = function(e) {
        let shiftX = e.clientX - dragItem.getBoundingClientRect().left;
        let shiftY = e.clientY - dragItem.getBoundingClientRect().top;

        dragItem.style.position = 'absolute';
        dragItem.style.zIndex = 1000;
        document.body.append(dragItem);

        function moveAt(pageX, pageY) {
          dragItem.style.left = pageX - shiftX + 'px';
          dragItem.style.top = pageY - shiftY + 'px';
        }

        moveAt(e.pageX, e.pageY);

        function onMouseMove(event) {
          moveAt(event.pageX, event.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);

        dragItem.onmouseup = function() {
          document.removeEventListener('mousemove', onMouseMove);
          if (dragItem.getBoundingClientRect().top >= dropArea.getBoundingClientRect().top &&
              dragItem.getBoundingClientRect().left >= dropArea.getBoundingClientRect().left &&
              dragItem.getBoundingClientRect().right <= dropArea.getBoundingClientRect().right &&
              dragItem.getBoundingClientRect().bottom <= dropArea.getBoundingClientRect().bottom) {
            feedback.textContent = "✅ Correct!";
            feedback.style.color = "green";
            currentExerciseIndex++;
            setTimeout(showExercise, 800);
          } else {
            feedback.textContent = "❌ Try again!";
            feedback.style.color = "red";
            dragItem.style.left = exercise.x + "px";
            dragItem.style.top = exercise.y + "px";
          }
          dragItem.onmouseup = null;
        };
      };
      dragItem.ondragstart = () => false;
    } else { // Single / Double / Right Click or Emoji Click
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
  }

  showExercise();
});
