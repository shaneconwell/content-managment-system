const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "@Theo731",
  database: "cmsDB",
});

const viewAllEmployees = () => {
  connection.query(
    "SELECT employee.id, first_name, last_name, title, department_name, salary, manager_id FROM employee INNER JOIN role ON employee.role_id=role.id INNER JOIN department ON role.department_id=department.id;",
    (err, res) => {
      if (err) throw err;
      // Log all results of the SELECT statement
      console.table(res);
      start();
    }
  );
};
const viewAllRoles = () => {
  connection.query(
    "SELECT * FROM cmsDB.role INNER JOIN Department ON role.department_id=department.id;",
    (err, res) => {
      if (err) throw err;
      // Log all results of the SELECT statement
      console.table(res);
      start();
    }
  );
};
const viewAllDepartments = () => {
  connection.query("SELECT * FROM cmsDB.department;", (err, res) => {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.table(res);
    start();
  });
};

const viewEmployeesByDepartment = () => {
  connection.query("SELECT * FROM Department", (err, results) => {
    if (err) throw err;
    // once you have the items, prompt the user for which they'd like to bid on
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices() {
            const choiceArray = [];
            results.forEach(({ department_name }) => {
              choiceArray.push(department_name);
            });
            return choiceArray;
          },
          message: "Which department would you like to view?",
        },
      ])
      .then((answer) => {
        // get the information of the chosen item
        let chosenItem;
        results.forEach((item) => {
          // console.log(item.department_name);
          // console.log(answer);
          if (item.department_name === answer.choice) {
            chosenItem = item;
            // console.log(chosenItem);
          }
        });
        const query = connection.query(
          "SELECT employee.id, first_name, last_name, title, department_name, salary, manager_id FROM employee INNER JOIN role ON employee.role_id=role.id INNER JOIN department ON role.department_id=department.id WHERE ?",
          {
            department_name: chosenItem.department_name,
          },
          (err, res) => {
            if (err) throw err;
            console.table(res);
            start();
          }
        );
      });
  });
};

const start = () => {
  inquirer
    .prompt({
      name: "toDo",
      type: "list",
      message: "What would you like to?",
      choices: [
        "View all Employees",
        "View all Employees By Department",
        "Add Employee",
        "Update Employee Role",
        "View All Roles",
        "Add a Role",
        "View All Departments",
        "Add Department",
        "EXIT",
      ],
    })
    .then((answer) => {
      switch (answer.toDo) {
        case "View all Employees":
          viewAllEmployees();
          break;

        case "View all Employees By Department":
          viewEmployeesByDepartment();
          break;

        case "Add Employee":
          newEmployee();
          break;

        case "Update Employee Role":
          viewAllEmployees();
          break;
        case "View All Roles":
          viewAllRoles();
          break;

        case "Add a Role":
          viewAllEmployees();
          break;

        case "View All Departments":
          viewAllDepartments();
          break;

        case "Add Departments":
          viewAllEmployees();
          break;

        case "EXIT":
          connection.end();
          break;

        default:
          console.log(`Invalid action: ${answer.toDo}`);
          break;
      }
    });
};
const newEmployee = () => {
  connection.query("SELECT * FROM role", (err, results) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "firstName",
          type: "input",
          message: "What is the employee's first name?",
          default: "Shane",
        },
        {
          name: "lastName",
          type: "input",
          message: "What is the employee's last name?",
          default: "Conwell",
        },
        {
          name: "role",
          type: "rawlist",
          choices() {
            const choiceArray = [];
            results.forEach(({ title }) => {
              choiceArray.push(title);
            });
            return choiceArray;
          },
          message: "What is the employees role?",
        },
      ])
      .then((answer) => {
        connection.query(
          "SELECT id FROM role WHERE ?",
          {
            title: answer.role,
          },
          (err, res) => {
            if (err) throw err;
            console.log(res);
          }
        );
      });
  });
};

// console.log("Inserting a new employee...\n");
// const query = connection.query(
//   "INSERT INTO employee SET ?",
//   {
//     flavor: "Rocky Road",
//     price: 3.0,
//     quantity: 50,
//   },
//   (err, res) => {
//     if (err) throw err;
//     console.log(`${res.affectedRows} product inserted!\n`);
//     // Call updateProduct AFTER the INSERT completes
//     updateProduct();
//   }
// );
// };

// Connect to the DB
connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as id ${connection.threadId}\n`);
  start();
});
