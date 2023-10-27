/* set up an Express app for the Odata Service */

const express = require('express');
const {ODataServer} = require('odata-v4-server');
const mysql = require('mysql2/promise');

/* Create the Entity Type corresponding to claims_header table in the 
MySQL database claims_objects
Create an Entity Type:

Define the structure of your entity type based on the "claims_header" table in your MySQL database
 The entity type definition should include the properties that correspond to the columns
 in the "claims_header" table.*/

/*Edm stands for Entity Data Model. The "Edm" types provide a standardized way
 to represent various data types in OData services, ensuring that clients and 
 servers understand the data format. */


class ClaimHeaderType {
  static get Name() { return 'ClaimHeader'; }
  static get Model() {
    return {
      ID: { type: 'Edm.Int32', key: true },
      ClaimNumber: { type: 'Edm.String' },
      DateOfService: { type: 'Edm.DateTime' },
    };
  }
}

/* Create an Entity Set:

    Define an entity set for the "claims_header" table. 
    The entity set will be a collection of the "ClaimHeader" entities. */
class ClaimHeaderSet {
  static get Name() { return 'ClaimHeaders'; }
  static get EntityType() { return ClaimHeaderType; }
}

/* Define your OData service by specifying entity types and entity sets. 
You'll also need to provide handlers for various OData operations such as querying, 
creating, updating, and deleting entities. */

class ClaimHeaderService extends ODataServer {
  static get Model() {
    return {
      ClaimHeader: ClaimHeaderType,
    };
  }

  static get EntitySets() {
    return {
      ClaimHeaders: ClaimHeaderSet,
    };
  }
 /* Create a query handler */

  async onQuery(context) {
    try {

    /* Database connection */

      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Beg#6789',
        database: 'claims_objects',
      });
      /* Query the database */

      const [rows, fields] = await connection.execute('SELECT * FROM claims_header');

      /* Close the connection */

      connection.end();

      /* Set the query result in the OData context */
      context.query.result = rows;

      context.res.status(200).json({
        value: rows,
      });
    } catch (error) {
      console.error('Error:', error);
      context.handleError(error);
    }
  }
}

/* Use the Express app and start an instance of the OData server */
const app = express();

const server = new ClaimHeaderService();

app.use('/odata', (req, res) => {
  server.handle(req, res);
});

const port = 3000;
app.listen(port, () => {
  console.log(`OData service is running on port ${port}`);
});
