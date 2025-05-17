const express = require('express');
const app = express();
const dotenv = require('dotenv');
const users = require('./routes/users');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const { Login } = require('./dbconnections/db'); // Import the models
const session = require('express-session');

dotenv.config();
const PORT = process.env.PORT;

app.set('view engine', 'ejs');
//body parser
app.use(express.json()); // Parse incoming JSON requests
app.use(cors()); // Enable CORS for all routes
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded request bodies
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use('/api', users);

app.get('/', (req, res) => {
  res.render("login");
});

app.get('/signup', (req, res) => {
  res.render("signup");
});

app.post('/signup', async (req, res) => {

  const data = {
    name: req.body.username,
    password: req.body.password
  }

  const existingUser  = await Login.findOne({ name: data.name });
  if (existingUser ) {
    res.status(400).send('User  already exists. Please choose a different username.');
  } else {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    data.password = hashedPassword
    const login = new Login(data);
    await login.save();
    console.log(login);
    res.redirect('/');
  }
});

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
  
  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await Login.findOne({ name: username });
    if (!user) {
      console.log('User   not found:', username); // Log the username to verify that it is correct
      return res.status(400).send('User   not found');
    } else {
      console.log('User   found:', user); // Log the user to verify that it is correct
      req.session = req.session || {}; // Initialize the req.session object
      req.session.username = username; // Populate the req.session object with the username
      return res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    }
  });
  
  app.post('/submit', async (req, res) => {
    try {
      console.log('Received request:', req.body);
  
      // Validate request body
      const { tankid, tankfuel, tankcapacity, optimumvolume, tankname, minimumvolume } = req.body;
      if (!tankid || !tankfuel || !tankcapacity || !optimumvolume || !tankname || !minimumvolume) {
        console.log('Missing required fields in request body');
        return res.status(400).send('Missing required fields in request body');
      }

      // **Tank ID Validation using Regex**
      const tankIdRegex = /^T\d{2}$/; // Ensures "T" followed by exactly two digits
      if (!tankIdRegex.test(tankid)) {
        console.log('Invalid Tank ID format:', tankid);
        return res.status(400).send('Invalid Tank ID format. Use "T01", "T02", etc.');
      }
  
      const tankData = {
        tank_id: tankid,
        tank_fuel: tankfuel,
        tank_capacity: tankcapacity,
        optimum_volume: optimumvolume,
        tank_name: tankname,
        minimum_volume: minimumvolume,
      };
  
      // Find the user based on session username
      const user = await Login.findOne({ name: req.session.username });
  
      if (!user) {
        console.log('User not found:', req.session.username);
        return res.status(400).send('User not found');
      }
  
      console.log('User found:', user);
  
      // Initialize tankdata array if it doesn't exist
      user.tankdata = user.tankdata || [];
  
      // Ensure tank with the same ID doesn't already exist
      if (user.tankdata.some(tank => tank.tank_id.toLowerCase() === tankid.toLowerCase())) {
        console.log('Tank with the same ID already exists');
        return res.status(400).send('Tank with the same ID already exists');
      }
  
      // Append new tank data and save
      user.tankdata.push(tankData);
      await user.save();
  
      console.log('Tank added successfully:', tankData);
      res.status(201).sendFile(path.join(__dirname, 'public', 'tanks.html'));
  
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).send('Internal server error');
    }
  });

app.post('/ma', async (req, res) => {
    try {
        console.log('Received request:', req.body); // Log the request body

        // Validate request body
        const { machineid, name, dispensingunitnumber, tankid } = req.body;
        if (!machineid || !name || !dispensingunitnumber || !tankid) {
            console.log('Missing required fields in request body');
            return res.status(400).send('Missing required fields in request body');
        }

        // **Machine ID Validation using Regex**
        const machineIdRegex = /^M\d{2}$/; // Ensures "MACH" followed by exactly two digits
        if (!machineIdRegex.test(machineid)) {
            console.log('Invalid Machine ID format:', machineid);
            return res.status(400).send('Invalid Machine ID format. Use "M01", "M02", etc.');
        }

        // Create machine data object
        const machinedata = {
            machine_id: machineid,
            machine_name: name,
            dispensing_unit_number: dispensingunitnumber,
            tank_id: tankid,
        };

        // Find user based on session username
        const user = await Login.findOne({ name: req.session.username });

        if (!user) {
            console.log('User not found:', req.session.username);
            return res.status(400).send('User not found');
        }

        console.log('User found:', user);

        // Ensure machinedata array exists
        user.machinedata = user.machinedata || [];

        // Ensure machine_id is unique
        if (user.machinedata.some(machine => machine.machine_id.toLowerCase() === machineid.toLowerCase())) {
            console.log('Machine with the same ID already exists');
            return res.status(400).send('Machine with the same ID already exists');
        }

        // Append new machine data and save
        user.machinedata.push(machinedata);
        await user.save();

        console.log('Machine added successfully:', machinedata);
        res.status(201).sendFile(path.join(__dirname, 'public', 'machine.html'));
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/du', async (req, res) => {
    try {
        console.log('Received request:', req.body); // Log the request body

        // Validate request body
        const { duid, dufuel, duworkingstatus, machineid, tankid } = req.body;
        if (!duid || !dufuel || !duworkingstatus || !machineid || !tankid) {
            console.log('Missing required fields in request body');
            return res.status(400).send('Missing required fields in request body');
        }

        // **DU ID Validation using Regex**
        const duidRegex = /^DU\d{2}$/; // Ensures DU IDs follow "DU" + two-digit format
        if (!duidRegex.test(duid)) {
            console.log('Invalid DU ID format:', duid);
            return res.status(400).send('Invalid DU ID format. Use "DU01", "DU02", etc.');
        }

        // Create dispensing unit data object
        const dudata = {
            du_id: duid,
            du_fuel: dufuel,
            du_working_status: duworkingstatus,
            machine_id: machineid,
            tank_id: tankid,
        };

        // Find user based on session username
        const user = await Login.findOne({ name: req.session.username });

        if (!user) {
            console.log('User not found:', req.session.username);
            return res.status(400).send('User not found');
        }

        console.log('User found:', user);

        // Ensure dudata array exists
        user.dudata = user.dudata || [];

        // Ensure dispensing unit ID (`du_id`) is unique within the user's dudata array
        if (user.dudata.some(du => du.du_id.toLowerCase() === duid.toLowerCase())) {
            console.log('Dispensing unit with the same ID already exists');
            return res.status(400).send('Dispensing unit with the same ID already exists');
        }

        // Append new dispensing unit data and save
        user.dudata.push(dudata);
        await user.save();

        console.log('Dispensing unit added successfully:', dudata);
        res.status(201).sendFile(path.join(__dirname, 'public', 'dispensingunit.html'));
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Internal server error');
    }
});
  app.post('/ds', async (req, res) => {
    console.log(req.body); // Log the request body to verify that the data is being received correctly
  
    // Check if the request body contains the required fields
    if (!req.body.date || !req.body.tankid || !req.body.machineid || !req.body.duid || !req.body.openingdateandtime || !req.body.openingreading || !req.body.closingdateandtime || !req.body.closingreading || !req.body.fueltype || !req.body.operatorid) {
      console.log('Missing required fields in request body');
      return res.status(400).send('Missing required fields in request body');
    }
  
    const { date, tankid, machineid, duid, openingdateandtime, openingreading, closingdateandtime, closingreading, fueltype, operatorid } = req.body;
  
    // Create a new DUData object
    const dsdata = {
      date: date,
      tank_id: tankid,
      machine_id: machineid,
      du_id: duid,
      opening_date_and_time: openingdateandtime,
      opening_reading: openingreading,
      closing_date_and_time: closingdateandtime,
      closing_reading: closingreading,
      fuel_type: fueltype,
      operator_id: operatorid,
    };
  
    // Find the user and add the tank data to their tankdata field
    const user = await Login.findOne({ name: req.session.username });
    if (!user) {
      console.log('User  not found:', req.session.username); // Log the username to verify that it is correct
      return res.status(400).send('User  not found');
    } else {
      console.log('User  found:', user); // Log the user to verify that it is correct
  
      // Check if the user already has tankdata
      if (!user.dsdata) {
        user.dsdata = [];
      }
  
      // Add the new DUData object to the user's tankdata
      user.dsdata.push(dsdata);
  
      // Save the updated user
      await user.save();
  
      console.log(user); // Log the user to verify that it is correct
      return res.sendFile(path.join(__dirname, 'public', 'dailysales.html'));
    }
  });

  app.post('/op', async (req, res) => {
    console.log(req.body); // Log the request body to verify that the data is being received correctly
  
    // Check if the request body contains the required fields
    if (!req.body.opid || !req.body.operatorname || !req.body.joiningdate || !req.body.dob || !req.body.salary || !req.body.contactdetails ) {
      console.log('Missing required fields in request body');
      return res.status(400).send('Missing required fields in request body');
    }
  
    const { opid, operatorname, joiningdate, dob, salary, contactdetails } = req.body;
  
    // Create a new DUData object
    const opdata = {
      operator_id: opid,
      operator_name: operatorname,
      joining_date: joiningdate,
      date_of_birth: dob,
      salary: salary,
      contact_details: contactdetails,
    };
  
    // Find the user and add the tank data to their tankdata field
    const user = await Login.findOne({ name: req.session.username });
    if (!user) {
      console.log('User  not found:', req.session.username); // Log the username to verify that it is correct
      return res.status(400).send('User  not found');
    } else {
      console.log('User  found:', user); // Log the user to verify that it is correct
  
      // Check if the user already has tankdata
      if (!user.opdata) {
        user.opdata = [];
      }
  
      // Add the new DUData object to the user's tankdata
      user.opdata.push(opdata);
  
      // Save the updated user
      await user.save();
  
      console.log(user); // Log the user to verify that it is correct
      return res.sendFile(path.join(__dirname, 'public', 'operator.html'));
    }
  });


  app.post('/fo', async (req, res) => {
    console.log(req.body); // Log the request body to verify that the data is being received correctly
  
    // Check if the request body contains the required fields
    if (!req.body.orderid || !req.body.stationid || !req.body.supplierid || !req.body.fueltype || !req.body.quantityordered || !req.body.orderdate || !req.body.deliverydate || !req.body.quantitydelivered || !req.body.status ) {
      console.log('Missing required fields in request body');
      return res.status(400).send('Missing required fields in request body');
    }
  
    const { orderid, stationid, supplierid, fueltype, quantityordered, orderdate, deliverydate, quantitydelivered, status } = req.body;
  
    // Create a new DUData object
    const fodata = {
      order_id: orderid,
      station_id: stationid,
      supplier_id: supplierid,
      fuel_type: fueltype,
      quantity_ordered: quantityordered,
      order_date: orderdate,
      delivery_date: deliverydate,
      quantity_delivered: quantitydelivered,
      status: status,
    };
  
    // Find the user and add the tank data to their tankdata field
    const user = await Login.findOne({ name: req.session.username });
    if (!user) {
      console.log('User  not found:', req.session.username); // Log the username to verify that it is correct
      return res.status(400).send('User  not found');
    } else {
      console.log('User  found:', user); // Log the user to verify that it is correct
  
      // Check if the user already has tankdata
      if (!user.fodata) {
        user.fodata = [];
      }
  
      // Add the new DUData object to the user's tankdata
      user.fodata.push(fodata);
  
      // Save the updated user
      await user.save();
  
      console.log(user); // Log the user to verify that it is correct
      return res.sendFile(path.join(__dirname, 'public', 'fuelorder.html'));
    }
  });


  app.post('/su', async (req, res) => {
    console.log(req.body); // Log the request body to verify that the data is being received correctly
  
    // Check if the request body contains the required fields
    if (!req.body.supplierid || !req.body.name || !req.body.contactnumber || !req.body.address ) {
      console.log('Missing required fields in request body');
      return res.status(400).send('Missing required fields in request body');
    }
  
    const { supplierid, name, contactnumber, address } = req.body;
  
    const sudata = {
      supplier_id: supplierid,
      name: name,
      contact_number: contactnumber,
      address: address,
    };
  
    // Find the user and add the tank data to their tankdata field
    const user = await Login.findOne({ name: req.session.username });
    if (!user) {
      console.log('User  not found:', req.session.username); // Log the username to verify that it is correct
      return res.status(400).send('User  not found');
    } else {
      console.log('User  found:', user); // Log the user to verify that it is correct
  
      // Check if the user already has tankdata
      if (!user.sudata) {
        user.sudata = [];
      }
  
      // Add the new DUData object to the user's tankdata
      user.sudata.push(sudata);
  
      // Save the updated user
      await user.save();
  
      console.log(user); // Log the user to verify that it is correct
      return res.sendFile(path.join(__dirname, 'public', 'supplier.html'));
    }
  });

  app.post('/fuel', async (req, res) => {
    try {
      console.log('Received request:', req.body);
  
      // Validate request body
      const { fuelname, fueldensity } = req.body;
      if (!fuelname || !fueldensity) {
        console.log('Missing required fields in request body');
        return res.status(400).send('Missing required fields in request body');
      }
  
      const ftdata = {
        fuel_name: fuelname,
        fuel_density: fueldensity,
      };
  
      // Find the user based on session username
      const user = await Login.findOne({ name: req.session.username });
  
      if (!user) {
        console.log('User not found:', req.session.username);
        return res.status(400).send('User not found');
      }
  
      console.log('User found:', user);
  
      // Initialize ftdata array if it doesn't exist
      user.ftdata = user.ftdata || [];
  
      // Ensure fuel with the same name doesn't already exist
      if (user.ftdata.some(fuel => fuel.fuel_name.toLowerCase() === fuelname.toLowerCase())) {
        console.log('Fuel with the same name already exists');
        return res.status(400).send('Fuel with the same name already exists');
      }
  
      // Append new fuel data and save
      user.ftdata.push(ftdata);
      await user.save();
  
      console.log('Fuel added successfully:', ftdata);
      res.status(201).send('Fuel added successfully');
  
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).send('Internal server error');
    }
  });


  app.post('/ph', async (req, res) => {
    console.log(req.body); // Log the request body to verify that the data is being received correctly
  
    // Check if the request body contains the required fields
    if (!req.body.pricingid || !req.body.stationid || !req.body.fueltype || !req.body.priceperliter || !req.body.effectivedate ) {
      console.log('Missing required fields in request body');
      return res.status(400).send('Missing required fields in request body');
    }
  
    const { pricingid, stationid, fueltype, priceperliter, effectivedate } = req.body;
  
    const phdata = {
      pricing_id: pricingid,
      station_id: stationid,
      fuel_type: fueltype,
      price_per_liter: priceperliter,
      effective_date: effectivedate,
    };
  
    // Find the user and add the tank data to their tankdata field
    const user = await Login.findOne({ name: req.session.username });
    if (!user) {
      console.log('User  not found:', req.session.username); // Log the username to verify that it is correct
      return res.status(400).send('User  not found');
    } else {
      console.log('User  found:', user); // Log the user to verify that it is correct
  
      // Check if the user already has tankdata
      if (!user.phdata) {
        user.phdata = [];
      }
  
      // Add the new DUData object to the user's tankdata
      user.phdata.push(phdata);
  
      // Save the updated user
      await user.save();
  
      console.log(user); // Log the user to verify that it is correct
      return res.sendFile(path.join(__dirname, 'public', 'pricehistory.html'));
    }
  });


  app.post('/fi', async (req, res) => {
    console.log(req.body); // Log the request body to verify that the data is being received correctly
  
    // Check if the request body contains the required fields
    if (!req.body.fuelinventoryid || !req.body.stationid || !req.body.tankid || !req.body.fueltype || !req.body.quantityavailable || !req.body.lastupdated ) {
      console.log('Missing required fields in request body');
      return res.status(400).send('Missing required fields in request body');
    }
  
    const { fuelinventoryid, stationid, tankid, fueltype, quantityavailable, lastupdated } = req.body;
  
    const fidata = {
      fuel_inventory_id: fuelinventoryid,
      station_id: stationid,
      tank_id: tankid,
      fuel_type: fueltype,
      quantity_available: quantityavailable,
      last_updated: lastupdated,
    };
  
    // Find the user and add the tank data to their tankdata field
    const user = await Login.findOne({ name: req.session.username });
    if (!user) {
      console.log('User  not found:', req.session.username); // Log the username to verify that it is correct
      return res.status(400).send('User  not found');
    } else {
      console.log('User  found:', user); // Log the user to verify that it is correct
  
      // Check if the user already has tankdata
      if (!user.fidata) {
        user.fidata = [];
      }
  
      // Add the new DUData object to the user's tankdata
      user.fidata.push(fidata);
  
      // Save the updated user
      await user.save();
  
      console.log(user); // Log the user to verify that it is correct
      return res.sendFile(path.join(__dirname, 'public', 'fuelinventory.html'));
    }
  });

  // Create an API endpoint to get the user's data
app.get('/get-user-data', async (req, res) => {
  const user = await Login.findOne({ name: req.session.username });
  if (!user) {
    console.log('User  not found:', req.session.username); // Log the username to verify that it is correct
    return res.status(400).send('User  not found');
  } else {
    console.log('User  found:', user); // Log the user to verify that it is correct
    return res.json(user);
  }
});



  app.get('/fetchall', async (req, res) => {
    try {
      const data = await Login.find();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching data' });
    }
  });
  

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});