document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // helper: display name from participant entry
      function displayName(p) {
        if (!p) return "";
        if (typeof p === "string") return p.split("@")[0];
        if (p.name) return p.name;
        return String(p);
      }

      // helper: initials for avatar
      function getInitials(p) {
        const name = displayName(p);
        const parts = name.split(/[\s._-]+/).filter(Boolean);
        const first = parts[0] ? parts[0][0] : "?";
        const second = parts[1] ? parts[1][0] : "";
        return (first + second).toUpperCase();
      }

      // helper: simple HTML escape
      function escapeHtml(str) {
        return String(str)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // build participants HTML
        const participants = Array.isArray(details.participants) ? details.participants : [];
        const participantsHtml = participants.length
          ? `<ul class="participants-list">${participants
              .map(
                (p) =>
                  `<li><span class="avatar">${escapeHtml(
                    getInitials(p)
                  )}</span><span class="participant-name">${escapeHtml(displayName(p))}</span></li>`
              )
              .join("")}</ul>`
          : `<p class="info">No participants yet</p>`;

        activityCard.innerHTML = `
          <h4>${escapeHtml(name)}</h4>
          <p><strong>Category:</strong> ${escapeHtml(details.category || "")}</p>
          <p>${escapeHtml(details.description || "")}</p>
          <p><strong>Schedule:</strong> ${escapeHtml(details.schedule || "")}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>

          <div class="participants">
            <h5>Participants</h5>
            ${participantsHtml}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
