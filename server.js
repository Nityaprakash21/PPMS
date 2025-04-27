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
    console.log(req.body); // Log the request body to verify that the data is being received correctly

    if (!req.body.tankid || !req.body.tankfuel || !req.body.tankcapacity || !req.body.optimumvolume  || !req.body.tankname  || !req.body.minimumvolume ) {
      console.log('Missing required fields in request body');
      return res.status(400).send('Missing required fields in request body');
    }

    const { tankid, tankfuel, tankcapacity, optimumvolume, tankname, minimumvolume } = req.body;
    const tankData = {
      tank_id: tankid,
      tank_fuel: tankfuel,
      tank_capacity: tankcapacity,
      optimum_volume: optimumvolume,
      tank_name: tankname,
      minimum_volume: minimumvolume,
    };
  
    // Find the user and add the tank data to their tankdata field
    const user = await Login.findOne({ name: req.session.username });
    if (!user) {
      console.log('User   not found:', req.session.username); // Log the username to verify that it is correct
      return res.status(400).send('User   not found');
    } else {
      console.log('User   found:', user); // Log the user to verify that it is correct
      user.tankdata.push(tankData);
      await user.save();
      console.log(user); // Log the user to verify that it is correct
      return res.sendFile(path.join(__dirname, 'public', 'tanks.html'));
    }
  });


  app.post('/ma', async (req, res) => {
    console.log(req.body); // Log the request body to verify that the data is being received correctly
  
    // Check if the request body contains the required fields
    if (!req.body.machineid || !req.body.name || !req.body.dispensingunitnumber || !req.body.tankid ) {
      console.log('Missing required fields in request body');
      return res.status(400).send('Missing required fields in request body');
    }
  
    const { machineid, name, dispensingunitnumber, tankid } = req.body;
  
    // Create a new DUData object
    const machinedata = {
      machine_id: machineid,
      machine_name: name,
      dispensing_unit_number: dispensingunitnumber,
      tank_id: tankid,
    };
  
    // Find the user and add the tank data to their tankdata field
    const user = await Login.findOne({ name: req.session.username });
    if (!user) {
      console.log('User  not found:', req.session.username); // Log the username to verify that it is correct
      return res.status(400).send('User  not found');
    } else {
      console.log('User  found:', user); // Log the user to verify that it is correct
  
      // Check if the user already has tankdata
      if (!user.machinedata) {
        user.machinedata = [];
      }
  
      // Add the new DUData object to the user's tankdata
      user.machinedata.push(machinedata);
  
      // Save the updated user
      await user.save();
  
      console.log(user); // Log the user to verify that it is correct
      return res.sendFile(path.join(__dirname, 'public', 'machine.html'));
    }
  });

  app.post('/du', async (req, res) => {
    console.log(req.body); // Log the request body to verify that the data is being received correctly
  
    // Check if the request body contains the required fields
    if (!req.body.duid || !req.body.dufuel || !req.body.duworkingstatus || !req.body.duworkingstate || !req.body.machineid) {
      console.log('Missing required fields in request body');
      return res.status(400).send('Missing required fields in request body');
    }
  
    const { duid, dufuel, duworkingstatus, duworkingstate, machineid } = req.body;
  
    // Create a new DUData object
    const dudata = {
      du_id: duid,
      du_fuel: dufuel,
      du_working_status: duworkingstatus,
      du_working_state: duworkingstate,
      machine_id: machineid,
    };
  
    // Find the user and add the tank data to their tankdata field
    const user = await Login.findOne({ name: req.session.username });
    if (!user) {
      console.log('User  not found:', req.session.username); // Log the username to verify that it is correct
      return res.status(400).send('User  not found');
    } else {
      console.log('User  found:', user); // Log the user to verify that it is correct
  
      // Check if the user already has tankdata
      if (!user.dudata) {
        user.dudata = [];
      }
  
      // Add the new DUData object to the user's tankdata
      user.dudata.push(dudata);
  
      // Save the updated user
      await user.save();
  
      console.log(user); // Log the user to verify that it is correct
      return res.sendFile(path.join(__dirname, 'public', 'dispensingunit.html'));
    }
  });

  app.post('/ds', async (req, res) => {
    console.log(req.body); // Log the request body to verify that the data is being received correctly
  
    // Check if the request body contains the required fields
    if (!req.body.date || !req.body.tankid || !req.body.machineid || !req.body.duid || !req.body.openingdateandtime || !req.body.openingreading || !req.body.closingdateandtime || !req.body.closingreading || !req.body.operatorid || !req.body.operatorshift) {
      console.log('Missing required fields in request body');
      return res.status(400).send('Missing required fields in request body');
    }
  
    const { date, tankid, machineid, duid, openingdateandtime, openingreading, closingdateandtime, closingreading, operatorid, operatorshift } = req.body;
  
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
      operator_id: operatorid,
      operator_shift: operatorshift,
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
    if (!req.body.opid || !req.body.operatorname || !req.body.joiningdate || !req.body.dob || !req.body.salary || !req.body.contactdetails || !req.body.productid ) {
      console.log('Missing required fields in request body');
      return res.status(400).send('Missing required fields in request body');
    }
  
    const { opid, operatorname, joiningdate, dob, salary, contactdetails, productid } = req.body;
  
    // Create a new DUData object
    const opdata = {
      operator_id: opid,
      operator_name: operatorname,
      joining_date: joiningdate,
      date_of_birth: dob,
      salary: salary,
      contact_details: contactdetails,
      product_id: productid,
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