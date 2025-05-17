const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env Configuration
dotenv.config();

async function connectToMongoDB() {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}
connectToMongoDB();


const tankDataSchema = new mongoose.Schema({
  tank_id: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  tank_fuel: String,
  tank_capacity: String,
  optimum_volume: String,
  tank_name: String,
  minimum_volume: String,
});


const machineDataSchema = new mongoose.Schema({
  machine_id: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  machine_name: String,
  dispensing_unit_number: String,
  tank_id: String,
});

const duDataSchema = new mongoose.Schema({
  du_id: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  du_fuel: String,
  du_working_status: String,
  machine_id: String,
  tank_id: String,
});

const dsDataSchema = new mongoose.Schema({
  date: String,
  tank_id: String,
  machine_id: String,
  du_id: String,
  opening_date_and_time: String,
  opening_reading: String,
  closing_date_and_time: String,
  closing_reading: String,
  fuel_type: String,
  operator_id: String,
});


const opDataSchema = new mongoose.Schema({
  operator_id: String,
  operator_name: String,
  joining_date: String,
  date_of_birth: String,
  salary: String,
  contact_details: String,
});


const foDataSchema = new mongoose.Schema({
  order_id: String,
  station_id: String,
  supplier_id: String,
  fuel_type: String,
  quantity_ordered: String,
  order_date: String,
  delivery_date: String,
  quantity_delivered: String,
  status: String,
});


const suDataSchema = new mongoose.Schema({
  supplier_id: String,
  name: String,
  contact_number: String,
  address: String,
});


const phDataSchema = new mongoose.Schema({
  pricing_id: String,
  station_id: String,
  fuel_type: String,
  price_per_liter: String,
  effective_date: String,
});

const fiDataSchema = new mongoose.Schema({
  fuel_inventory_id: String,
  station_id: String,
  tank_id: String,
  fuel_type: String,
  quantity_available: String,
  last_updated: String,
});

const ftDataSchema = new mongoose.Schema({
  fuel_name: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  fuel_density: String,
});

// Define the LoginSchema with a tankdata field that is an array of TankDataSchema
const loginSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  password: {
    type: String,
  },
  tankdata: [tankDataSchema],
  machinedata: [machineDataSchema],
  dudata: [duDataSchema],
  dsdata: [dsDataSchema],
  opdata: [opDataSchema],
  fodata: [foDataSchema],
  sudata: [suDataSchema],
  phdata: [phDataSchema],
  fidata: [fiDataSchema],
  ftdata: [ftDataSchema],
});

// Create the models
const Login = mongoose.model('Login', loginSchema);

// Export the models
module.exports = { Login };