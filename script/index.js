let allIssues = [];

  const dropdownBtn = document.getElementById('dropdownBtn');
  const dropdownMenu = document.getElementById('dropdownMenu');

  function toggleDropdown() {
    dropdownMenu.classList.toggle('hidden');
  }

  // Toggle dropdown on button click
  dropdownBtn.addEventListener('click', toggleDropdown);

  // Close dropdown if clicked outside
  window.addEventListener('click', function(e) {
    if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.classList.add('hidden');
    }
  });

// ======= LOGIN ======================
function handleLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === "admin" && password === "admin123") {
    document.getElementById("login-page").classList.add("hidden");
    document.getElementById("main-page").classList.remove("hidden");
    loadAllIssues();
  } else {
    alert("Wrong credentials!\n\nUse:\nUsername: admin\nPassword: admin123");
  }
}

// ================== LOAD ALL ISSUES ==================
async function loadAllIssues() {
  showSpinner(true);
  try {
    const res = await fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues");
    const json = await res.json();
    
    console.log("Full API response:", json);        
    allIssues = json.data || json;                    
    
    document.getElementById("issue-count").textContent = allIssues.length;
    displayIssues(allIssues);
  } catch (err) {
    console.error(err);
    alert("Failed to load issues. Check console (F12)");
  }
  showSpinner(false);
}

// ================ DISPLAY CARDS =======================
function displayIssues(issues) {
  const grid = document.getElementById("issues-grid");
  grid.innerHTML = "";

  if (issues.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-20">
        <p class="text-2xl text-base-content/50">No issues found</p>
      </div>`;
    return;
  }

  issues.forEach(issue => {
    const isOpen = issue.status.toLowerCase() === "open";

    // ── Status image paths ──
    // Change these paths to match your actual folder structure
    const statusImgSrc = isOpen 
      ? "assets/Open-Status.png"      
      : "assets/Closed-Status.png"; 

    const borderColor = isOpen ? "border-green-500" : "border-purple-600";


    let priorityStyle = "";
    const prio = issue.priority.toUpperCase();

    if (prio === "HIGH") {
      priorityStyle = "bg-yellow-100 text-yellow-700 border-yellow-300 font-semibold";
    } else if (prio === "MEDIUM") {
      priorityStyle = "bg-yellow-100 text-yellow-700 border-yellow-300 font-semibold";
    } else if (prio === "LOW") {
      priorityStyle = "bg-yellow-100 text-yellow-700 border-yellow-300 font-semibold";
    } else {
      priorityStyle = "bg-gray-100 text-black-700 border-black-300";
    }

 
    // Labels ─
const labelHTML = Array.isArray(issue.labels)
  ? issue.labels
      .map(label => {
        // Convert label to uppercase and clean it
        const lblUpper = label.trim().toUpperCase();

        let bgClass = "bg-gray-100 text-gray-700 border border-gray-300";
        let icon = "🏷️"; // default

        if (lblUpper === "BUG") {
          bgClass = "bg-red-100 text-red-800 border-red-300 font-medium";
          icon = "🐞";
        } 
        else if (lblUpper.includes("HELP WANTED") || lblUpper.includes("HELPWANTED")) {
          bgClass = "bg-amber-100 text-amber-800 border-amber-300 font-medium";
          icon = "🛟"; 
        } 
        else if (lblUpper === "ENHANCEMENT" || lblUpper === "FEATURE") {
          bgClass = "bg-emerald-100 text-emerald-800 border-emerald-300 font-medium";
          icon = "✨";
        }

        // Show the uppercase version in the UI
        const displayLabel = lblUpper;

        return `
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${bgClass}">
            <span class="text-base leading-none">${icon}</span>
            ${displayLabel}
          </span>
        `;
      })
      .join("\n")
  : 
  "";

const footerHTML = `
  <div class="mt-auto pt-4 border-t border-gray-200">
    <div class="text-xs text-gray-600">
      #${issue.id} by ${issue.author}
    </div>
    <div class="text-xs text-gray-500 mt-1">
      ${new Date(issue.createdAt).toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric"
      })}
    </div>
  </div>
`;

    const cardHTML = `
      <div 
        onclick="showIssueModal(${issue.id})" 
        class="bg-white rounded-lg shadow-md hover:shadow-xl cursor-pointer border-t-4 ${borderColor} overflow-hidden transition-all duration-200 h-full flex flex-col"
      >
        <div class="p-5 flex flex-col flex-1">
          <!-- Header: status image + priority pill -->
          <div class="flex items-center justify-between mb-3.5">
            <div class="flex items-center gap-2.5">
              <img 
                src="${statusImgSrc}" 
                alt="${issue.status}" 
                class="w-4 h-4 object-contain"
              >
               
            </div>

            <span class="px-3 py-1 rounded-full text-xs border ${priorityStyle}">
              ${prio}
            </span>
          </div>

          <!-- Title -->
          <h3 class="text-[17px] font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
            ${issue.title}
          </h3>

          <!-- Description -->
          <p class="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
            ${issue.description}
          </p>

          <!-- Labels -->
          <div class="flex flex-wrap gap-2 mb-5">
            ${labelHTML}
          </div>

          <!-- Footer -->
          ${footerHTML}

        </div>
      </div>
    `;

    grid.innerHTML += cardHTML;
  });
}


// ================== SHOW MODAL ==================
async function showIssueModal(id) {
  try {
    const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
    const result = await res.json();
    const issue = result.data || result;

    // ── Status logic ──
    const isOpen = issue.status.toLowerCase() === "open";
    const statusText = isOpen ? "Opened" : "Closed";
    const statusBg = isOpen ? "bg-green-500" : "bg-purple-600";

    // ── Priority styling ──
       let priorityBg = "bg-gray-100 text-gray-700";

        const priorityText = issue.priority.toUpperCase();

        if (priorityText === "HIGH") {
          priorityBg = "bg-red-200 text-red-900 border border-red-300";
        }
        else if (priorityText === "MEDIUM") {
          priorityBg = "bg-yellow-100 text-yellow-700 border border-yellow-300";
        }
        else if (priorityText === "LOW") {
          priorityBg = "bg-gray-200 text-gray-800 border border-gray-300";
        }


    // ── Fill modal ──
    document.getElementById("modal-title").textContent = issue.title;
     
    const statusClass = isOpen 
  ? "bg-green-100 text-green-700" 
  : "bg-purple-100 text-purple-700";

    // Status + Opened by + date
    document.getElementById("modal-status").innerHTML = `
      <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusClass} text-sm font-medium">
    ${statusText}
     </span>
     `;
   
    document.getElementById("modal-author").textContent = issue.author || "Unknown";

    document.getElementById("modal-date").textContent = 
      new Date(issue.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });

    // Labels
    const labelsContainer = document.getElementById("modal-labels");
    labelsContainer.innerHTML = "";
    
    if (Array.isArray(issue.labels) && issue.labels.length > 0) {
      issue.labels.forEach(label => {
        const lblUpper = label.trim().toUpperCase();
        let cls = "bg-gray-100 text-gray-700 px-3 py-1";

        if (lblUpper === "BUG") cls = "bg-red-100 text-red-800 px-3 py-1";
        if (lblUpper.includes("HELP WANTED")) cls = "bg-amber-100 text-amber-800 px-3 py-1";
        if (lblUpper === "ENHANCEMENT") cls = "bg-emerald-100 text-emerald-800 px-3 py-1";

        const span = document.createElement("span");
        span.className = `inline-flex items-center gap-1.5 rounded-full text-sm font-medium ${cls}`;
        span.innerHTML = `<span class="text-lg">🏷️</span> ${lblUpper}`;
        labelsContainer.appendChild(span);
      });
    }

    // Description
    document.getElementById("modal-description").textContent = 
      issue.description || "No description provided.";

    // Assignee = who opened it (issue.author)
    document.getElementById("modal-assignee").textContent = 
      issue.author || "Unassigned";

    // Priority
    const prioEl = document.getElementById("modal-priority");
    prioEl.textContent = priorityText;
    prioEl.className = `inline-flex px-5 py-2 rounded-md font-semibold text-white ${priorityBg}`;

    // Show modal
    document.getElementById("issue-detail-modal").showModal();

  } catch (err) {
    console.error(err);
    alert("Could not load issue details");
  }
}


// ================== TABS ==================
function switchTab(tabIndex) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("tab-active"));

  if (tabIndex === 0) {
    document.getElementById("tab-all").classList.add("tab-active");
    displayIssues(allIssues);
  } else if (tabIndex === 1) {
    document.getElementById("tab-open").classList.add("tab-active");
    displayIssues(allIssues.filter(i => i.status.toLowerCase() === "open"));
  } else {
    document.getElementById("tab-closed").classList.add("tab-active");
    displayIssues(allIssues.filter(i => i.status.toLowerCase() === "closed"));
  }
}

// ================== SEARCH ==================
async function searchIssues() {
  const query = document.getElementById("search-input").value.trim();
  if (!query) {
    displayIssues(allIssues);
    return;
  }

  showSpinner(true);
  try {
    const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${encodeURIComponent(query)}`);
    const json = await res.json();
    const searchResults = json.data || json;
    displayIssues(searchResults);
  } catch (err) {
    console.error(err);
    alert("Search failed");
  }
  showSpinner(false);
}

function showSpinner(show) {
  document.getElementById("spinner").classList.toggle("hidden", !show);
}