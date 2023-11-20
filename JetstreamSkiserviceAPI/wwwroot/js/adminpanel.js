function fetchData() {
  fetch("/Registrations")
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
                      <button onclick="editEntry(${row.registrationId})" class="edit-button border border-gray-300 shadow-sm rounded px-2 py-1 m-1">Ändern</button>
                      <button onclick="saveEntry(${row.registrationId})" class="save-button hidden border border-gray-300 shadow-sm rounded px-2 py-1 m-1">Speichern</button>
                      <button onclick="deleteEntry(${row.registrationId})" class="delete-button border border-gray-300 shadow-sm rounded px-2 py-1 m-1">Löschen</button>
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

function fetchOrdersByStatus(status) {
  fetch(`/Status/${status}`)
    .then((response) => response.json())
    .then((data) => {
      updateTableWithOrders(data);
    })
    .catch((error) => console.error(`Fetch Fehler bei ${status}:`, error));
}

function fetchOrdersByPriority(priority) {
  fetch(`/Priority/${priority}`)
    .then((response) => response.json())
    .then((data) => {
      updateTableWithOrders(data);
    })
    .catch((error) =>
      console.error(`Fetch Fehler bei Priorität ${priority}:`, error)
    );
}

function updateTableWithOrders(data) {
  if (!data || !data.registration || data.registration.length === 0) {
    document.getElementById("output").innerHTML =
      "<p>Keine Daten gefunden.</p>";
    return;
  }

  const registrations = data.registration;

  const tableHeaders = Object.keys(registrations[0])
    .map(
      (key) =>
        `<th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">${key}</th>`
    )
    .join("");

  const tableRows = registrations
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
            <button onclick="editEntry(${row.registrationId})" class="edit-button border border-gray-300 shadow-sm rounded px-2 py-1 m-1">Ändern</button>
            <button onclick="saveEntry(${row.registrationId})" class="save-button hidden border border-gray-300 shadow-sm rounded px-2 py-1 m-1">Speichern</button>
            <button onclick="deleteEntry(${row.registrationId})" class="delete-button border border-gray-300 shadow-sm rounded px-2 py-1 m-1">Löschen</button>
          </td>
        </tr>
      `;
    })
    .join("");

  document.getElementById("output").innerHTML = `
    <table class="min-w-full leading-normal">
      <thead>
        <tr>${tableHeaders}<th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aktionen</th></tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;
}
function editEntry(registrationId) {
    const row = document.getElementById(`row-${registrationId}`);
    const cells = row.querySelectorAll("td");

    cells.forEach((cell) => {
        const key = cell.getAttribute("data-key");
        let value = cell.textContent.trim();

        if (key === "status") {
            cell.innerHTML = createStatusDropdown(value);
        } else if (key === "priority") {
            cell.innerHTML = createPriorityDropdown(value);
        } else if (key === "service") {
            cell.innerHTML = createServiceDropdown(value);
        } else if (key) {
            cell.contentEditable = true;
        }
    });

    row.querySelector(".edit-button").classList.add("hidden");
    row.querySelector(".save-button").classList.remove("hidden");
}


function getToken() {
  return localStorage.getItem("token");
}

function saveEntry(id) {
    const token = getToken();
    const row = document.getElementById(`row-${id}`);
    const cells = row.querySelectorAll("td");
    const data = {};

    cells.forEach((cell) => {
        const key = cell.getAttribute("data-key");
        let value;

        if (cell.querySelector("select")) {
            value = cell.querySelector("select").value;
        } else {
            value = cell.textContent.trim();
        }

        data[key] = value;
    });

    fetch(`/Registrations/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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


function deleteEntry(id) {
  const token = getToken();
  if (confirm("Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?")) {
    fetch(`/Registrations/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP Fehler: ${response.status}`);
        }
        if (response.status === 204) {
          return null;
        }
        return response.json();
      })
      .then(() => {
        document.getElementById(`row-${id}`).remove();
        alert("Eintrag erfolgreich gelöscht.");
      })
      .catch((error) => {
        alert(`Fehler beim Löschen: ${error.message}`);
      });
  }
}

function createStatusDropdown(selectedValue) {
  const options = ["Offen", "InArbeit", "abgeschlossen"]
    .map(
      (option) =>
        `<option value="${option}" ${
          option === selectedValue ? "selected" : ""
        }>${option}</option>`
    )
    .join("");
  return `<select class="status-dropdown">${options}</select>`;
}

function createPriorityDropdown(selectedValue) {
  const options = ["Tief", "Standard", "Express"]
    .map(
      (option) =>
        `<option value="${option}" ${
          option === selectedValue ? "selected" : ""
        }>${option}</option>`
    )
    .join("");
  return `<select class="priority-dropdown">${options}</select>`;
}

function createServiceDropdown(selectedValue) {
  const services = [
    "Kleiner Service",
    "Grosser Service",
    "Rennski Service",
    "Bindung montieren und einstellen",
    "Fell zuschneiden",
    "Heisswachsen",
  ];
  const options = services
    .map(
      (service) =>
        `<option value="${service}" ${
          service === selectedValue ? "selected" : ""
        }>${service}</option>`
    )
    .join("");
  return `<select class="service-dropdown">${options}</select>`;
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
  document
    .getElementById("openOrdersBtn")
    .addEventListener("click", () => fetchOrdersByStatus("Offen"));
  document
    .getElementById("inWorkOrdersBtn")
    .addEventListener("click", () => fetchOrdersByStatus("InArbeit"));
  document
    .getElementById("doneOrdersBtn")
    .addEventListener("click", () => fetchOrdersByStatus("abgeschlossen"));
  document
    .getElementById("tiefOrdersBtn")
    .addEventListener("click", () => fetchOrdersByPriority("Tief"));
  document
    .getElementById("standardOrdersBtn")
    .addEventListener("click", () => fetchOrdersByPriority("Standard"));
  document
    .getElementById("expressOrdersBtn")
    .addEventListener("click", () => fetchOrdersByPriority("Express"));
});