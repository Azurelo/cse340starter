const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("Error in getInventoryByClassificationId: " + error.message)
    throw error
  }
}

/* ***************************
 *  Get vehicle details by inv_id
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const sql = `SELECT * FROM public.inventory WHERE inv_id = $1`;
    const data = await pool.query(sql, [inv_id]);
    return data.rows.length ? data.rows[0] : null;
  } catch (error) {
    console.error(`Error in getVehicleById for inv_id ${inv_id}: ` + error.message);
    throw new Error("Database error retrieving vehicle.");
  }
}

/* ***************************
 * Add a new classification to the database
 * ************************** */
async function addClassification(classificationName) {
  try {
    const result = await pool.query(
      "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING classification_id",
      [classificationName]
    );
    return result.rows[0]; // Returning the inserted classification
  } catch (error) {
    console.error("Error inserting classification: " + error.message);
    throw error;
  }
}
async function addVehicle(vehicleData) {
  try {
    const sql = `
      INSERT INTO inventory (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
    const values = [
      vehicleData.classification_id,
      vehicleData.inv_make,
      vehicleData.inv_model,
      vehicleData.inv_description,
      vehicleData.inv_image,
      vehicleData.inv_thumbnail,
      vehicleData.inv_price,
      vehicleData.inv_year,
      vehicleData.inv_miles,
      vehicleData.inv_color
    ];

    const [result] = await pool.execute(sql, values);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error inserting vehicle into inventory:", error);
    return false;
  }
};

module.exports = { addVehicle, getClassifications, getInventoryByClassificationId, getVehicleById, addClassification };
