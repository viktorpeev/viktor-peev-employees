import React, { useState } from "react";
import Papa from "papaparse";
import { differenceInDays, parse } from "date-fns";
import './App.css'

function App() {
  const [fileData, setFileData] = useState([]);
  const [commonProjects, setCommonProjects] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    Papa.parse(file, {
      header: true,
      complete: function (results) {
        setFileData(results.data);
      },
    });
  }

  const parseDate = (value) => {
    const formats = ['yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yyyy', 'dd.MM.yyyy'];
    for (let i = 0; i < formats.length; i++) {
      const date = parse(value, formats[i], new Date());
      if (date.toString() !== 'Invalid Date') {
        return date;
      }
    }
    return null;
  }

  const findCommonProjects = () => {
    const projects = {};

    fileData.forEach((project) => {
      const { EmpID, ProjectID, DateFrom, DateTo } = project;

      if (!(ProjectID in projects)) {
        projects[ProjectID] = [];
      }

      const parsedDateFrom = parseDate(DateFrom);
      const parsedDateTo = DateTo ? parseDate(DateTo) : new Date(); //checks if null

      if (parsedDateFrom && parsedDateTo) {
        projects[ProjectID].push({
          EmpID,
          DateFrom: parsedDateFrom,
          DateTo: parsedDateTo,
        });
      }
    });

    const commonProjects = [];

    Object.keys(projects).forEach((projectID) => {
      const employees = projects[projectID];
      for (let i = 0; i < employees.length; i++) {
        for (let j = i + 1; j < employees.length; j++) {
          const employee1 = employees[i];
          const employee2 = employees[j];

          if (employee1.ProjectID === employee2.ProjectID) {
            const days = differenceInDays(
              Math.min(employee1.DateTo, employee2.DateTo),
              Math.max(employee1.DateFrom, employee2.DateFrom)
            );

            commonProjects.push({
              EmpID1: employee1.EmpID,
              EmpID2: employee2.EmpID,
              ProjectID: projectID,
              DaysWorked: days,
            });
          }
        }
      }
    });


    setCommonProjects(commonProjects);
  }

  return (
    <div>
      <h1>TASK:<br/> Pair of employees who have worked together</h1>
      <span>Select .csv file format  </span>
      <input type="file" onChange={handleFileUpload} />
      <table>
        <thead>
          <tr>
            <th>Employee ID #1</th>
            <th>Employee ID #2</th>
            <th>Project ID</th>
            <th>Days Worked</th>
          </tr>
        </thead>
        <tbody>
          {commonProjects.map((project, index) => (
            <tr key={index}>
              <td>{project.EmpID1}</td>
              <td>{project.EmpID2}</td>
              <td>{project.ProjectID}</td>
              <td>{project.DaysWorked}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="buttonContainer">
        <button onClick={findCommonProjects}>Go</button>
      </div>
    </div>
  );
}

export default App;
