document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const authStatusDiv = document.getElementById("auth-status");
  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");
  const logoutButton = document.getElementById("logout-btn");
  const signupHelp = document.getElementById("signup-help");

  let currentUserEmail = null;

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  function renderAuthState() {
    const isAuthenticated = !!currentUserEmail;

    if (isAuthenticated) {
      authStatusDiv.textContent = `Logged in as ${currentUserEmail}`;
      authStatusDiv.className = "success";
      registerForm.classList.add("hidden");
      loginForm.classList.add("hidden");
      logoutButton.classList.remove("hidden");
      signupForm.querySelector("button[type='submit']").disabled = false;
      signupHelp.textContent = "You can sign up as your logged-in account.";
      signupHelp.className = "info";
    } else {
      authStatusDiv.textContent = "Not logged in";
      authStatusDiv.className = "error";
      registerForm.classList.remove("hidden");
      loginForm.classList.remove("hidden");
      logoutButton.classList.add("hidden");
      signupForm.querySelector("button[type='submit']").disabled = true;
      signupHelp.textContent = "Login to sign up for activities.";
      signupHelp.className = "info";
    }
  }

  async function checkAuthStatus() {
    try {
      const response = await fetch("/auth/me");
      if (!response.ok) {
        currentUserEmail = null;
        renderAuthState();
        return;
      }

      const user = await response.json();
      currentUserEmail = user.email;
      renderAuthState();
    } catch (error) {
      currentUserEmail = null;
      renderAuthState();
      console.error("Error checking auth status:", error);
    }
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft =
          details.max_participants - details.participants.length;

        // Create participants HTML with delete icons instead of bullet points
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
              <h5>Participants:</h5>
              <ul class="participants-list">
                ${details.participants
                  .map(
                    (email) => {
                      const canDelete = currentUserEmail && currentUserEmail === email;
                      const deleteButton = canDelete
                        ? `<button class="delete-btn" data-activity="${name}" data-email="${email}">❌</button>`
                        : "";
                      return `<li><span class="participant-email">${email}</span>${deleteButton}</li>`;
                    }
                  )
                  .join("")}
              </ul>
            </div>`
            : `<p><em>No participants yet</em></p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-container">
            ${participantsHTML}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });
    } catch (error) {
      activitiesList.innerHTML =
        "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle unregister functionality
  async function handleUnregister(event) {
    if (!currentUserEmail) {
      showMessage("Please login to unregister yourself.", "error");
      return;
    }

    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const email = button.getAttribute("data-email");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to unregister. Please try again.", "error");
      console.error("Error unregistering:", error);
    }
  }

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    try {
      const response = await fetch(
        `/auth/register?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        { method: "POST" }
      );
      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        registerForm.reset();
      } else {
        showMessage(result.detail || "Registration failed", "error");
      }
    } catch (error) {
      showMessage("Failed to register. Please try again.", "error");
      console.error("Error registering:", error);
    }
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      const response = await fetch(
        `/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        { method: "POST" }
      );
      const result = await response.json();

      if (response.ok) {
        currentUserEmail = result.email;
        renderAuthState();
        loginForm.reset();
        showMessage(result.message, "success");
        fetchActivities();
      } else {
        showMessage(result.detail || "Login failed", "error");
      }
    } catch (error) {
      showMessage("Failed to login. Please try again.", "error");
      console.error("Error logging in:", error);
    }
  });

  logoutButton.addEventListener("click", async () => {
    try {
      const response = await fetch("/auth/logout", { method: "POST" });
      const result = await response.json();

      if (response.ok) {
        currentUserEmail = null;
        renderAuthState();
        showMessage(result.message, "success");
        fetchActivities();
      } else {
        showMessage(result.detail || "Logout failed", "error");
      }
    } catch (error) {
      showMessage("Failed to logout. Please try again.", "error");
      console.error("Error logging out:", error);
    }
  });

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const activity = document.getElementById("activity").value;

    if (!currentUserEmail) {
      showMessage("Please login to sign up for an activity.", "error");
      return;
    }

    try {
      const response = await fetch(`/activities/${encodeURIComponent(activity)}/signup`, {
        method: "POST",
      });

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        signupForm.reset();

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  renderAuthState();
  checkAuthStatus();
  fetchActivities();
});
