const allDropdown = document.querySelectorAll('#sidebar .side-dropdown');
const sidebar = document.getElementById('sidebar');

allDropdown.forEach(item => {
    
    const a = item.parentElement.querySelector('a:first-child');

    
    a.addEventListener('click', function(e) {
        // Prevent the default action of the anchor tag (e.g., navigating to a link)
        e.preventDefault();

        // Check if the clicked anchor tag does not have the 'active' class
        if (!this.classList.contains('active')) {
            // Loop through all dropdown items again
            allDropdown.forEach(i => {
                // Select the first anchor tag within the parent of each dropdown item
                const aLink = i.parentElement.querySelector('a:first-child');

                // Remove the 'active' class from the anchor tag
                aLink.classList.remove('active');
                // Remove the 'show' class from the dropdown item
                i.classList.remove('show');
            })
        }

        // Toggle the 'active' class on the clicked anchor tag
        this.classList.toggle('active');
        // Toggle the 'show' class on the dropdown item
        item.classList.toggle('show');
    })
})


sidebar.addEventListener('mouseenter', function() {
    // Check if the sidebar has the 'hide' class
    if (this.classList.contains('hide')) {
        // Loop through all dropdown items
        allDropdown.forEach(item => {
                // Select the first anchor tag within the parent of each dropdown item
                const a = item.parentElement.querySelector('a:first-child');
                // Remove the 'active' class from the anchor tag
                a.classList.remove('active');
                // Remove the 'show' class from the dropdown item
                item.classList.remove('show');
            })
            // Loop through all sidebar dividers
        allSideDivider.forEach(item => {
            // Set the text content of the divider to its original text (from the data-text attribute)
            item.textContent = item.dataset.text;
        })
    }
})


const profile = document.querySelector('nav .profile');
// Select the image within the profile element
const imgProfile = profile.querySelector('img');
// Select the dropdown menu within the profile element
const dropdownProfile = profile.querySelector('.profile-link');

// Add a click event listener to the profile image
imgProfile.addEventListener('click', function() {
    // Toggle the 'show' class on the dropdown menu
    dropdownProfile.classList.toggle('show'); // Show or hide the profile dropdown
})


document.addEventListener('DOMContentLoaded', function() {
    // Select the notification link and dropdown
    const notificationLink = document.getElementById('notification-link');
    const notificationDropdown = document.getElementById('notification-dropdown');
    // Select the message link and dropdown
    const messageLink = document.getElementById('message-link');
    const messageDropdown = document.getElementById('message-dropdown');

    // Add a click event listener to the notification link
    notificationLink.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default action of the link
        notificationDropdown.classList.toggle('show'); // Toggle the visibility of the notification dropdown
        messageDropdown.classList.remove('show'); // Ensure the message dropdown is hidden if it's open
    });

    // Add a click event listener to the message link
    messageLink.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default action of the link
        messageDropdown.classList.toggle('show'); // Toggle the visibility of the message dropdown
        notificationDropdown.classList.remove('show'); // Ensure the notification dropdown is hidden if it's open
    });

    // Close dropdowns if clicked outside
    // window.addEventListener('click', function(event) {
    //     // Check if the click was outside the notification link and dropdown
    //     if (!notificationLink.contains(event.target) && !notificationDropdown.contains(event.target)) {
    //         notificationDropdown.classList.remove('show'); // Hide the notification dropdown
    //     }
    //     // Check if the click was outside the message link and dropdown
    //     if (!messageLink.contains(event.target) && !messageDropdown.contains(event.target)) {
    //         messageDropdown.classList.remove('show'); // Hide the message dropdown
    //     }
    // });
});


window.addEventListener('click', function(e) {
    // Check if the clicked target is not the profile image
    if (e.target !== imgProfile) {
        // Check if the clicked target is not the dropdown profile
        if (e.target !== dropdownProfile) {
            // If the dropdown profile is currently shown, hide it
            if (dropdownProfile.classList.contains('show')) {
                dropdownProfile.classList.remove('show'); // Hide the profile dropdown
            }
        }
    }
})

document.querySelector("#filterButton").addEventListener("click", function() {
    document.querySelector(".popup").classList.add("active");
});
    
document.querySelector(".popup .close-btn").addEventListener("click", function() {
    document.querySelector(".popup").classList.remove("active");
});


// Function to populate the table
// Function to fetch user data asynchronously
async function fetchUserData() {
    try {
        const response = await fetch('/get-user-data');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

// Function to populate the table with tank data
function populateTable(data) {
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = "";

    if (data && Array.isArray(data.dsdata)) {
        data.dsdata.forEach(tank => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${tank.date}</td>
                <td>${tank.tank_id}</td>
                <td>${tank.machine_id}</td>
                <td>${tank.du_id}</td>
                <td>${tank.opening_date_and_time}</td>
                <td>${tank.opening_reading}</td>
                <td>${tank.closing_date_and_time}</td>
                <td>${tank.closing_reading}</td>
                <td>${tank.fuel_type}</td>
                <td>${tank.operator_id}</td>
            `;
            tableBody.appendChild(row);
        });
    } else {
        console.warn('Invalid or missing tank data');
    }
}

// Generic function to populate dropdowns dynamically
function populateDropdown(dropdownId, dataArray, valueKey) {
    const dropdown = document.getElementById(dropdownId); // Remove quotes around dropdownId
    dropdown.innerHTML = "";
    if (dataArray && Array.isArray(dataArray)) {
        dataArray.forEach(item => {
            const option = document.createElement("option");
            option.value = item[valueKey];
            option.textContent = item[valueKey];
            dropdown.appendChild(option);
        });
    } else {
        console.warn(`Invalid or missing data for dropdown: ${dropdownId}`);
    }
}

// Fetch user data and populate the table and dropdowns
fetchUserData().then(data => {
    if (data) {
        populateTable(data);
        populateDropdown("fueltype", data.ftdata, "fuel_name");
        populateDropdown("tankid", data.tankdata, "tank_id");
        populateDropdown("machineid", data.machinedata, "machine_id");
        populateDropdown("operatorid", data.opdata, "operator_id");
    } else {
        console.warn('User data not found');
    }
});