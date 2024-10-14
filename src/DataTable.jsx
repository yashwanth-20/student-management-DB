import { useRef, useEffect, useState } from "react";
import CsvDownloader from 'react-csv-downloader';
import './App.css'; // Ensure you import your CSS file

const DataTable = () => {
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(false);
  const [formData, setFormData] = useState({ name: "", gender: "", age: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({});
  const outsideClick = useRef(false);
  const itemsPerPage = 3;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Filter items based on search term
  let filteredItems = data.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredData = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  // Reset current page on search term change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Focus on the edited item
  useEffect(() => {
    if (!editId) return;

    let selectedItem = document.querySelectorAll(`[id='${editId}']`);
    selectedItem[0].focus();
  }, [editId]);

  // Handle click outside to stop editing
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        outsideClick.current &&
        !outsideClick.current.contains(event.target)
      ) {
        setEditId(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    let formErrors = {};
    if (!formData.name.trim()) formErrors.name = "Name is required";
    if (!formData.gender.trim()) formErrors.gender = "Gender is required";
    if (!formData.age || isNaN(formData.age) || formData.age <= 0)
      formErrors.age = "Valid age is required";
    return formErrors;
  };

  const handleAddClick = () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length === 0) {
      const newItem = {
        id: Date.now(),
        name: formData.name,
        gender: formData.gender,
        age: formData.age,
      };
      setData([...data, newItem]);
      setFormData({ name: "", gender: "", age: "" });
    } else {
      setErrors(formErrors);
    }
  };

  const handleEdit = (id, updatedData) => {
    if (!editId || editId !== id) {
      return;
    }

    const updatedList = data.map((item) =>
      item.id === id ? { ...item, ...updatedData } : item
    );
    setData(updatedList);
  };

  const handleDelete = (id) => {
    if (filteredData.length === 1 && currentPage !== 1) {
      setCurrentPage((prev) => prev - 1);
    }
    const updatedList = data.filter((item) => item.id !== id);
    setData(updatedList);
  };

  return (
    <div className="container">
      <h1>Student Management System</h1>
      <div className="add-container">
        <div className="info-container">
          <input
            type="text"
            className="name-field"
            placeholder="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
          <select
            name="gender"
            className="gender-field"
            value={formData.gender}
            onChange={handleInputChange}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {errors.gender && (
            <span className="error-text">{errors.gender}</span>
          )}
          <input
            type="number"
            className="age-field"
            placeholder="Age"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
          />
          {errors.age && <span className="error-text">{errors.age}</span>}
          <button className="add" onClick={handleAddClick}>
            Add
          </button>
        </div>
        <input
          type="text"
          className="search-input"
          placeholder="Search by name..."
          onChange={handleSearch}
        />
      </div>

      {data.length === 0 ? (
        <div className="no-data">NO DATA FOUND</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Gender</th>
              <th>Age</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-data">NO DATA FOUND</td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} ref={outsideClick}>
                  {editId === item.id ? (
                    <>
                      <td>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            handleEdit(item.id, { name: e.target.value })
                          }
                          id={item.id} // Added for focusing
                        />
                      </td>
                      <td>
                        <select
                          value={item.gender}
                          onChange={(e) =>
                            handleEdit(item.id, { gender: e.target.value })
                          }
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.age}
                          onChange={(e) =>
                            handleEdit(item.id, { age: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => setEditId(false)}
                          className="edit"
                        >
                          Save
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{item.name}</td>
                      <td>{item.gender}</td>
                      <td>{item.age}</td>
                      <td className="actions">
                        <button
                          onClick={() => setEditId(item.id)}
                          className="edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="delete"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      <div className="pagination">
        {[...Array(Math.ceil(filteredItems.length / itemsPerPage)).keys()].map(
          (number) => (
            <button
              key={number + 1}
              className={currentPage === number + 1 ? "active" : ""}
              onClick={() => paginate(number + 1)}
            >
              {number + 1}
            </button>
          )
        )}
      </div>

      <CsvDownloader
        datas={data}
        text="Download CSV"
        type="csv"
        className="btn-success"
      />
    </div>
  );
};

export default DataTable;





