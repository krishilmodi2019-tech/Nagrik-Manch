let userData = {};
let petitions = [];
let petitionCounter = 1;

// Welcome form validation
document.getElementById("welcomeForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const gender = document.getElementById("gender").value;
  const locality = document.getElementById("locality").value;
  const aadhaar = document.getElementById("aadhaar").value;

  if (aadhaar.length === 12 && /^\d+$/.test(aadhaar)) {
    userData = { name, gender, locality, aadhaar };
    document.getElementById("welcomePage").classList.add("hidden");
    document.getElementById("homePage").classList.remove("hidden");
    document.getElementById("welcomeUser").innerText = 
      `Hello ${name} (${gender}), from ${locality}`;
    
    loadAreaPetitions(locality);
  } else {
    alert("Please enter a valid 12-digit Aadhaar number.");
  }
});

// Show section
function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(sectionId).classList.remove("hidden");
}

// Petition submission
document.getElementById("petitionForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const text = document.getElementById("petitionText").value;
  const photoInput = document.getElementById("issuePhoto");
  const petitionId = "PET" + petitionCounter++;

  let photoURL = "";
  if (photoInput.files[0]) {
    photoURL = URL.createObjectURL(photoInput.files[0]);
  }

  const petition = {
    id: petitionId,
    text,
    photo: photoURL,
    user: userData.name,
    locality: userData.locality
  };

  petitions.push(petition);

  document.getElementById("petitionId").innerText = petitionId;
  document.getElementById("successMsg").classList.remove("hidden");
  document.getElementById("petitionForm").reset();
  document.getElementById("previewContainer").classList.add("hidden");

  renderUserPetitions();
  loadAreaPetitions(userData.locality);
});

// Preview image upload
document.getElementById("issuePhoto").addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const previewImage = document.getElementById("previewImage");
      previewImage.src = e.target.result;
      document.getElementById("previewContainer").classList.remove("hidden");
    }
    reader.readAsDataURL(file);
  }
});

// Render user's petitions
function renderUserPetitions() {
  const list = document.getElementById("userPetitionsList");
  list.innerHTML = "";
  const userPetitions = petitions.filter(p => p.user === userData.name);
  
  if (userPetitions.length === 0) {
    list.innerHTML = "<li>No petitions created yet.</li>";
  } else {
    userPetitions.forEach(p => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${p.id}:</strong> ${p.text}`;
      list.appendChild(li);
    });
  }
}

// Load area petitions
function loadAreaPetitions(locality) {
  const list = document.getElementById("areaPetitionsList");
  list.innerHTML = "";
  const areaPetitions = petitions.filter(p => p.locality === locality);

  if (areaPetitions.length === 0) {
    list.innerHTML = "<li>No petitions in your area yet.</li>";
  } else {
    areaPetitions.slice(0, 3).forEach(p => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${p.id}:</strong> ${p.text}`;
      list.appendChild(li);
    });
  }
}

// Search petition
document.getElementById("searchForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const searchId = document.getElementById("searchId").value.trim();
  const result = petitions.find(p => p.id === searchId);
  const resultDiv = document.getElementById("searchResult");

  if (result) {
    resultDiv.innerHTML = `<p><strong>${result.id}</strong><br>${result.text}<br><em>By ${result.user} (${result.locality})</em></p>`;
    if (result.photo) {
      resultDiv.innerHTML += `<img src="${result.photo}" style="max-width:100%;border-radius:8px;margin-top:10px;">`;
    }
  } else {
    resultDiv.innerHTML = "<p>No petition found with this ID.</p>";
  }
});
