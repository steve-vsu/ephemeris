const mongoose = require("mongoose");

const pageViewSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  page: { type: String, required: true },
  location: {
    ip: String,
    network: String,
    version: String,
    city: String,
    region: String,
    region_code: String,
    country: String,
    country_name: String,
    country_code: String,
    country_code_iso3: String,
    country_capital: String,
    country_tld: String,
    continent_code: String,
    in_eu: Boolean,
    postal: String,
    latitude: Number,
    longitude: Number,
    timezone: String,
    utc_offset: String,
    country_calling_code: String,
    currency: String,
    currency_name: String,
    languages: String,
    country_area: Number,
    country_population: Number,
    asn: String,
    org: String
  },
  deviceType: { type: String, required: true }, // Add device field
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PageView", pageViewSchema);
