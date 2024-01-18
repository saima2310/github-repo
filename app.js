let currentPage = 1;
const reposPerPage = 10;

function fetchRepositories() {
  const username = $("#username").val();
  if (!username) {
    alert("Please enter a GitHub username.");
    return;
  }

  const apiUrl = `https://api.github.com/users/${username}/repos?per_page=${reposPerPage}&page=${currentPage}`;

  // Show loading spinner
  $("#loader").show();

  $.get(apiUrl, function (data, status, xhr) {
    // Clear previous repositories
    $("#repositories").empty();

    // Display each repository
    data.forEach((repo) => {
      // Fetch and display repository topics
      fetchRepositoryTopics(username, repo.name);

      const repoCard = `
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">${repo.name}</h5>
                        <p class="card-text">${
                          repo.description || "No description available."
                        }</p>
                        <p class="card-text"><strong>Language:</strong> ${
                          repo.language || "Not specified"
                        }</p>
                        <p class="card-text"><strong>Topics:</strong> <span id="topics-${
                          repo.name
                        }"></span></p>
                        <a href="${
                          repo.html_url
                        }" class="btn btn-primary" target="_blank">View on GitHub</a>
                    </div>
                </div>
            `;
      $("#repositories").append(repoCard);
    });

    // Update pagination
    const totalPages = parseInt(
      xhr
        .getResponseHeader("Link")
        .split(",")[1]
        .match(/&page=(\d+)/)[1]
    );
    updatePagination(totalPages);

    // Fetch and display user details
    fetchUserDetails(username);
  })
    .fail(function () {
      alert(
        "Failed to fetch repositories. Please check the username or try again later."
      );
    })
    .always(function () {
      // Hide loading spinner
      $("#loader").hide();
    });
}

function fetchRepositoryTopics(username, repoName) {
  const topicsUrl = `https://api.github.com/repos/${username}/${repoName}/topics`;

  $.get(topicsUrl, function (topics) {
    // Display topics for the repository
    const topicsList = topics.names.join(", ");
    $(`#topics-${repoName}`).text(topicsList || "No topics");
  }).fail(function () {
    console.error(`Error fetching topics for the repository ${repoName}.`);
  });
}

function fetchUserDetails(username) {
  const userDetailsUrl = `https://api.github.com/users/${username}`;

  $.get(userDetailsUrl, function (user) {
    // Display user details
    const userDetails = `
            <h2>User Details</h2>
            <p><strong>Name:</strong> ${user.name || "N/A"}</p>
            <p><strong>Location:</strong> ${user.location || "N/A"}</p>
            <img src="${
              user.avatar_url
            }" alt="Profile Image" style="width: 100px; height: 100px; border-radius: 50%" class="mb-3">
        `;
    $("#userDetails").html(userDetails);
  }).fail(function () {
    console.error("Error fetching user details.");
  });
}

function updatePagination(totalPages) {
  $("#pagination").empty();

  for (let i = 1; i <= totalPages; i++) {
    const listItem = `<li class="page-item ${
      i === currentPage ? "active" : ""
    }"><a class="page-link" href="#" onclick="changePage(${i})">${i}</a></li>`;
    $("#pagination").append(listItem);
  }
}

function changePage(page) {
  currentPage = page;
  fetchRepositories();
}
