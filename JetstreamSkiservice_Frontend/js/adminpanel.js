function fetchData() {
  fetch("http://localhost:5285/Registrations")
    .then((response) => response.json())
    .then((data) => {
      const outputDiv = document.getElementById("output");
      const tableHeaders = Object.keys(data[0])
        .map(
          (key) =>
            `<th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">${key}</th>`
        )
        .join("");
      const tableRows = data
        .map((row) => {
          const rowData = Object.entries(row)
            .map(
              ([key, value]) =>
                `<td class="px-5 py-5 border-b border-gray-200 bg-white text-sm" contenteditable="false" data-key="${key}">${value}</td>`
            )
            .join("");
          return `
                    <tr id="row-${row.registrationId}">
                      ${rowData}
                      <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <button onclick="editEntry(${row.registrationId})" class="edit-button">Ändern</button>
                        <button onclick="saveEntry(${row.registrationId})" class="save-button hidden">Speichern</button>
                      </td>
                    </tr>
                  `;
        })
        .join("");

      outputDiv.innerHTML = `
              <table class="min-w-full leading-normal">
                <thead>
                  <tr>${tableHeaders}<th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aktionen</th></tr>
                </thead>
                <tbody>
                  ${tableRows}
                </tbody>
              </table>
            `;
    })
    .catch((error) => console.error("Fetch Fehler:", error));
}

function editEntry(registrationId) {
  const row = document.getElementById(`row-${registrationId}`);
  Array.from(row.querySelectorAll("td[contenteditable='false']")).forEach(
    (cell) => {
      cell.contentEditable = true;
    }
  );
  row.querySelector(".edit-button").classList.add("hidden");
  row.querySelector(".save-button").classList.remove("hidden");
}

function saveEntry(id) {
  const row = document.getElementById(`row-${id}`);
  const cells = row.querySelectorAll("td[contenteditable='true']");
  const data = {};
  cells.forEach((cell) => {
    const key = cell.getAttribute("data-key");
    data[key] = cell.textContent.trim();
  });

  fetch(`http://localhost:5285/Registrations/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        alert(`Fehler: ${response.statusText}`);
        throw new Error(`HTTP Fehler: ${response.status}`);
      }
      return response.json();
    })
    .then((updatedEntry) => {
      alert("Eintrag erfolgreich gespeichert.");
      row.querySelector(".edit-button").classList.remove("hidden");
      row.querySelector(".save-button").classList.add("hidden");
      Array.from(cells).forEach((cell) => {
        cell.contentEditable = false;
      });
    })
    .catch((error) => {
      alert(`Fehler beim Speichern: ${error.message}`);
    });
}

function showSuccessModal() {
  document.getElementById("successModal").classList.remove("hidden");
  setTimeout(() => {
    document.getElementById("successModal").classList.add("hidden");
  }, 3000);
}

function showErrorModal(message) {
  document.getElementById("errorMessage").textContent = message;
  document.getElementById("errorModal").classList.remove("hidden");
  setTimeout(() => {
    document.getElementById("errorModal").classList.add("hidden");
  }, 3000);
}
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("allOrdersBtn").addEventListener("click", fetchData);
});