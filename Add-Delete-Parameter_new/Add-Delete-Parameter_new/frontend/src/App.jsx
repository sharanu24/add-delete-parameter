import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const ParameterManager = () => {
  const [newParameter, setNewParameter] = useState("");
  const [parameters, setParameters] = useState([]);
  const [selectedParameters, setSelectedParameters] = useState(new Set());
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch all parameters from the backend
  const fetchParameters = async () => {
    try {
      const response = await axios.get("http://localhost:5001/parameter/fetch");
      console.log(response);
      setParameters(response.data);
    } catch (error) {
      console.error("Error fetching parameters:", error);
    }
  };

  // Fetch parameters on component mount
  useEffect(() => {
    fetchParameters();
  }, []);

  // Add a new parameter (Prevent Duplicates)
  const handleAddParameter = () => {
    if (newParameter.trim()) {
      const isDuplicate = parameters.some(
        (parameter) =>
          parameter.name.toLowerCase() === newParameter.toLowerCase()
      );

      if (isDuplicate) {
        setErrorMessage("Parameter already exists!");
        return;
      }

      axios
        .post("http://localhost:5001/parameter/create", { name: newParameter })
        .then((response) => {
          setParameters([...parameters, response.data]);
          setNewParameter("");
          setErrorMessage("");
        })
        .catch((error) => {
          console.error("Error adding parameter:", error);
          setErrorMessage("Error adding parameter. Please try again.");
        });
    } else {
      setErrorMessage("Parameter name cannot be empty.");
    }
  };

  // Handle checkbox selection
  const handleCheckboxChange = (id) => {
    const updatedSelectedParameters = new Set(selectedParameters);
    console.log(updatedSelectedParameters);
    if (updatedSelectedParameters.has(id)) {
      updatedSelectedParameters.delete(id);
    } else {
      updatedSelectedParameters.add(id);
    }
    setSelectedParameters(updatedSelectedParameters);
  };

  // Delete selected parameters
  const handleDeleteSelectedParameters = () => {
    const idsToDelete = Array.from(selectedParameters);
    if (idsToDelete.length > 0) {
      axios
        .delete("http://localhost:5001/parameter/delete", {
          data: { ids: idsToDelete },
        })
        .then(() => {
          setParameters(
            parameters.filter(
              (parameter) => !idsToDelete.includes(parameter._id)
            )
          );
          setSelectedParameters(new Set());
        })
        .catch((error) => {
          console.error("Error deleting parameters:", error);
          setErrorMessage("Error deleting parameters. Please try again.");
        });
    } else {
      setErrorMessage("No parameters selected for deletion.");
    }
  };

  return (
    <div>
      <h1 className="text-center">Add/Delete Parameters</h1>
      <div className="container mt-5">
        {errorMessage && (
          <div className="alert alert-danger text-center">{errorMessage}</div>
        )}

        {/* Parameter List */}
        <ul className="list-group">
          {parameters.map((parameter) => (
            <li
              key={parameter._id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {parameter.name}
              <input
                type="checkbox"
                checked={selectedParameters.has(parameter._id)}
                onChange={() => handleCheckboxChange(parameter._id)}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Input field and buttons */}
      <div className="form-group d-flex justify-content-center align-items-center mt-3">
        <input
          type="text"
          value={newParameter}
          onChange={(e) => setNewParameter(e.target.value)}
          placeholder="Enter parameter name"
          className="form-control w-50"
        />
      </div>

      <div className="btn-container d-flex justify-content-center gap-3 mt-3">
        <button className="btn btn-primary" onClick={handleAddParameter}>
          Add{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            fill="white"
            className="bi bi-check2-circle"
            viewBox="0 0 16 17"
          >
            <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0" />
            <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z" />
          </svg>
        </button>
        <button
          className="btn btn-danger"
          onClick={handleDeleteSelectedParameters}
          disabled={selectedParameters.size === 0}
        >
          Delete{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            fill="white"
            className="bi bi-trash3-fill"
            viewBox="0 0 16 16"
          >
            <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ParameterManager;
