const mysql = require('mysql');
const cTable = require('console.table')

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '@Theo731',
  database: 'cmsDB',
});

const readEmployees = () => {
  console.log('Selecting all employees...\n');
  connection.query('SELECT employee.id, first_name, last_name, title, department_name, salary, manager_id FROM employee INNER JOIN role ON employee.role_id=role.id INNER JOIN department ON role.department_id=department.id;', (err, res) => {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.table(res);
    connection.end();
  });
};

// const deleteProduct = () => {
//   console.log('Deleting all strawberry icecream...\n');
//   connection.query(
//     'DELETE FROM products WHERE ?',
//     {
//       flavor: 'strawberry',
//     },
//     (err, res) => {
//       if (err) throw err;
//       console.log(`${res.affectedRows} products deleted!\n`);
//       // Call readProducts AFTER the DELETE completes
//       readProducts();
//     }
//   );
// };

// const updateProduct = () => {
//   console.log('Updating all Rocky Road quantities...\n');
//   const query = connection.query(
//     'UPDATE products SET ? WHERE ?',
//     [
//       {
//         quantity: 100,
//       },
//       {
//         flavor: 'Rocky Road',
//       },
//     ],
//     (err, res) => {
//       if (err) throw err;
//       console.log(`${res.affectedRows} products updated!\n`);
//       // Call deleteProduct AFTER the UPDATE completes
//       deleteProduct();
//     }
//   );

//   // logs the actual query being run
//   console.log(query.sql);
// };

// const createEmployee = () => {
//   console.log('Inserting a new employee...\n');
//   const query = connection.query(
//     'INSERT INTO employee SET ?',
//     {
//       flavor: 'Rocky Road',
//       price: 3.0,
//       quantity: 50,
//     },
//     (err, res) => {
//       if (err) throw err;
//       console.log(`${res.affectedRows} product inserted!\n`);
//       // Call updateProduct AFTER the INSERT completes
//       updateProduct();
//     }
//   );

//   // logs the actual query being run
//   console.log(query.sql);
// };

// Connect to the DB
connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as id ${connection.threadId}\n`);
  readEmployees();
});
