const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: "cmsDB",
});

const viewAllEmployees = () => {
  let query =
    "SELECT employee.id, first_name, last_name, title, department_name, salary, manager_id FROM employee";
  query +=
    " INNER JOIN role ON employee.role_id=role.id INNER JOIN department ON role.department_id=department.id ORDER BY employee.id ASC;";
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
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
        },
        {
          name: "lastName",
          type: "input",
          message: "What is the employee's last name?",
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
        let roleID;
        connection.query(
          "SELECT id FROM role WHERE ?",
          {
            title: answer.role,
          },
          (err, res) => {
            if (err) throw err;
            roleID = res[0].id;
            const query = connection.query(
              "INSERT INTO employee SET ?",
              {
                first_name: answer.firstName,
                last_name: answer.lastName,
                role_id: roleID,
              },
              (err, res) => {
                if (err) throw err;
                console.log(`\n${res.affectedRows} employee added\n`);
                // Call updateProduct AFTER the INSERT completes
                start();
              }
            );
          }
        );
      });
  });
};
const updateEmployee = () => {
  connection.query(
    "SELECT * FROM employee INNER JOIN role ON role.id=employee.role_id;",
    (err, res) => {
      if (err) throw err;
      inquirer
        .prompt([
          {
            name: "employee",
            type: "list",
            choices() {
              const choiceArray = [];
              res.forEach(({ first_name, last_name }) => {
                choiceArray.push(`${first_name} ${last_name}`);
              });
              return choiceArray;
            },
            message: "Which employee would you like to update?",
          },
          {
            name: "newRole",
            type: "rawlist",
            choices() {
              const choiceArray = [];
              connection.query("SELECT * FROM cmsDB.role;", (err, res) => {
                if (err) throw err;
              });
              res.forEach(({ title }) => {
                choiceArray.push(title);
              });
              return choiceArray;
            },
            message: "What is the employees new role?",
          },
        ])
        .then((answer) => {
          res.forEach(({ id, first_name, last_name }) => {
            if (`${first_name} ${last_name}` === answer.employee) {
              connection.query(
                "SELECT id FROM role WHERE ?",
                { title: answer.newRole },
                (err, res) => {
                  if (err) throw err;
                  connection.query("UPDATE employee SET ? WHERE ?", [
                    {
                      role_id: res[0].id,
                    },
                    {
                      id: `${id}`,
                    },
                  ]);
                  console.log(
                    `\n ${first_name} ${last_name}'s role has been updated\n`
                  );
                }
              );
            }
          });
          start();
        });
    }
  );
};

const viewEmployeesByDepartment = () => {
  connection.query("SELECT * FROM Department", (err, results) => {
    if (err) throw err;
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
        let chosenItem;
        results.forEach((item) => {
          if (item.department_name === answer.choice) {
            chosenItem = item;
          }
        });
        let query =
          "SELECT employee.id, first_name, last_name, title, department_name, salary, manager_id";
        query +=
          " FROM employee INNER JOIN role ON employee.role_id=role.id INNER JOIN department ON role.department_id=department.id WHERE ?";
        connection.query(
          query,
          { department_name: chosenItem.department_name },
          (err, res) => {
            if (err) throw err;
            console.table(res);
            start();
          }
        );
      });
  });
};
const viewAllRoles = () => {
  connection.query(
    "SELECT * FROM cmsDB.role INNER JOIN Department ON role.department_id=department.id;",
    (err, res) => {
      if (err) throw err;
      console.table(res);
      start();
    }
  );
};

const addRole = () => {
  inquirer
    .prompt([
      {
        name: "roleName",
        type: "input",
        message: "What role would you like to add?"
      },
      {
        name: "salary",
        type: "input",
        message: "What is the salary of this role?"
      },
      {
        name: "department",
        type: "input",
        message: "Please enter this rolls department ID"
      },
    ])
    .then((answer) => {
      connection.query(
        "INSERT INTO role SET ?",
        {
          title: answer.roleName,
          salary: answer.salary,
          department_id: answer.department,
        },
        (err, res) => {
          if (err) throw err;
          console.log(`\n ${res.affectedRows} role added\n`);
          start();
        }
      );
    });
};

const viewAllDepartments = () => {
  connection.query("SELECT * FROM cmsDB.department;", (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
};

const addDepartment = () => {
  inquirer
    .prompt([
      {
        name: "departmentName",
        type: "input",
        message: "What department would you like to add?"
      },
    ])
    .then((answer) => {
      connection.query(
        "INSERT INTO department SET ?",
        { department_name: answer.departmentName },
        (err, res) => {
          if (err) throw err;
          console.log(`\n ${res.affectedRows} department added\n`);
          start();
        }
      );
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
          updateEmployee();
          break;

        case "View All Roles":
          viewAllRoles();
          break;

        case "Add a Role":
          addRole();
          break;

        case "View All Departments":
          viewAllDepartments();
          break;

        case "Add Department":
          addDepartment();
          break;

        case "EXIT":
          connection.end();
          break;

        default:
          console.log(`Invalid action: ${answer.toDo}`);
          start();
          break;
      }
    });
};

// Connect to the DB
connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as id ${connection.threadId}\n`);
  start();
});
