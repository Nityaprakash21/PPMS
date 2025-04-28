const allProgress = document.querySelectorAll('main .card .progress');

allProgress.forEach(item=> {
	item.style.setProperty('--value', item.dataset.value)
})

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
    window.addEventListener('click', function(event) {
        // Check if the click was outside the notification link and dropdown
        if (!notificationLink.contains(event.target) && !notificationDropdown.contains(event.target)) {
            notificationDropdown.classList.remove('show'); // Hide the notification dropdown
        }
        // Check if the click was outside the message link and dropdown
        if (!messageLink.contains(event.target) && !messageDropdown.contains(event.target)) {
            messageDropdown.classList.remove('show'); // Hide the message dropdown
        }
    });
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

let myChart;

function getLast7DaysRange() {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { startDate, endDate };
  }

  
  // Main data fetching function
  async function fetchData() {
    try {
      const response = await fetch('/get-user-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const jsonResponse = await response.json();
      console.log('Full API response:', jsonResponse);
  
      // Extract tank data
      const tankData = jsonResponse.tankdata;
      console.log("Tank Data:", tankData);

      // Extract dsdata
      const dsData = jsonResponse.dsdata;
      console.log("DS Data:", dsData);
  
      // Calculate fuel percentages
      const fuelPercentages = calculateFuelPercentages(tankData);
      console.log('Fuel Percentages:', fuelPercentages);

      document.getElementById("petrollabel").textContent = Math.round(fuelPercentages.petrolPercentage) || 0;
      document.getElementById("diesellabel").textContent = Math.round(fuelPercentages.dieselPercentage) || 0;
      document.getElementById("cnglabel").textContent = Math.round(fuelPercentages.cngPercentage) || 0;

    // Calculate daily sales
    const dailySalesData = calculateDailySales(dsData);
    console.log("Daily Sales Data:", dailySalesData);

    console.log("Daily Sales Individual : ", dailySalesData.dailySales);

    // Plot chart
    plotChart(dailySalesData.dates, dailySalesData.openingReadings, dailySalesData.closingReadings, tankData.map(tank => tank.tank_name), tankData.map(tank => tank.tank_capacity));
    } catch (error) {
      console.error('Error fetching or processing data:', error);
    }
  }

  function calculateFuelPercentages(tankData) {
    const totalCapacity = tankData.reduce((acc, tank) => acc + parseInt(tank.tank_capacity), 0);
    const petrolTanks = tankData.filter(tank => tank.tank_fuel === 'Petrol');
    const dieselTanks = tankData.filter(tank => tank.tank_fuel === 'Diesel');
    const cngTanks = tankData.filter(tank => tank.tank_fuel === 'CNG');
  
    const petrolCapacity = petrolTanks.reduce((acc, tank) => acc + parseInt(tank.tank_capacity), 0);
    const dieselCapacity = dieselTanks.reduce((acc, tank) => acc + parseInt(tank.tank_capacity), 0);
    const cngCapacity = cngTanks.reduce((acc, tank) => acc + parseInt(tank.tank_capacity), 0);
  
    const petrolPercentage = (petrolCapacity / totalCapacity) * 100;
    const dieselPercentage = (dieselCapacity / totalCapacity) * 100;
    const cngPercentage = (cngCapacity / totalCapacity) * 100;

    console.log("Petrol Capacity:", petrolCapacity);
    console.log("Diesel Capacity:", dieselCapacity);
    console.log("CNG Capacity:", cngCapacity);
    console.log("Total Capacity:", totalCapacity);
  
    return {
      petrolPercentage,
      dieselPercentage,
      cngPercentage,
    };
  }


  // Function to calculate daily sales
function calculateDailySales(dsData) {
  const dates = [];
  const openingReadings = [];
  const closingReadings = [];

  dsData.forEach(data => {
    dates.push(data.date);
    openingReadings.push(parseInt(data.opening_reading));
    closingReadings.push(parseInt(data.closing_reading));
  });

  const dailySales = closingReadings.map((closing, index) => closing - openingReadings[index]);
  console.log("Daily Sales:", dailySales);


  return { dates, openingReadings, closingReadings, dailySales };
}
  
  // Function to plot the chart
  function plotChart(dates, openingReadings, closingReadings) {
    const ctx = document.getElementById('myChart').getContext('2d');

    const dailySales = closingReadings.map((closing, index) => closing - openingReadings[index]);
    console.log("Chart Context:", dailySales  );
    // Destroy the existing chart instance if it exists
    if (myChart) {
      myChart.destroy();
    }
    // Create a new chart instance
    myChart = new Chart(ctx, {
      type: 'line', // Change to 'bar' or other types if needed
      data: {
        labels: dates, // X-axis labels
        datasets: [
          {
            label: 'Daily Sales',
            data: dailySales,
            borderColor: 'rgb(255, 99, 132)', // Red
            backgroundColor: 'rgba(255, 99, 132, 0.2)', // Red with opacity
            borderWidth: 1,
            fill: true, // Enable filling
            stack: 'Stack 1', // Stack name
          },
          {
            label: 'Opening Readings',
            data: openingReadings,
            borderColor: 'rgb(54, 162, 235)', // Blue
            backgroundColor: 'rgba(54, 162, 235, 0.2)', // Blue with opacity
            borderWidth: 1,
            fill: true, // Enable filling
            stack: 'Stack 1', // Stack name
          },
          {
            label: 'Closing Readings',
            data: closingReadings,
            borderColor: 'rgb(255, 206, 86)', // Yellow
            backgroundColor: 'rgba(255, 206, 86, 0.2)', // Yellow with opacity
            borderWidth: 1,
            fill: true, // Enable filling
            stack: 'Stack 1', // Stack name
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          zoom: {
            pan: {
              enabled: true,
              mode: 'x', // 'x', 'y', or 'xy'
              speed: 20,
            },
            zoom: {
              enabled: true,
              mode: 'x', // 'x', 'y', or 'xy'
              wheel: {
                enabled: true, // Enable zooming with the mouse wheel
                speed: 0.1,
                modifierKey: 'alt',
              },
              pinch: {
                enabled: true, // Enable zooming with pinch gestures on touch devices
              },
              drag: {
                enabled: true,
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Dates',
              font: {
                weight: 'bold',
              },
            },
          },
          y: {
            title: {
              display: true,
              text: 'Sales',
            },
            stacked: true, // Enable stacking
	    beginAtZero: true, // Ensure y-axis starts at 0
            min: 0,          // Explicitly set the minimum value for y-axis
          },
        },
      },
    });
  }
  
  // Fetch and plot data
  fetchData();
