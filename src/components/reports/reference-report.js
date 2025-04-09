import React, { useState, useEffect } from "react";
import clsx from "clsx";
import styles from "./SharePointExcelTable.module.css";

const TABS = ["AZURE","AWS","GCP"];
const FILE_MAP = {
    AZURE: "azure-reference.json",
};

const ReferenceTable = () => {
  const [selectedTab, setSelectedTab] = useState("AZURE");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  useEffect(() => {
    const loadData = async () => {
      try {
        const jsonData = await import(`@site/static/data/${FILE_MAP[selectedTab]}`);
        setData(jsonData.default); // .default because it's a JSON module
        setSearchQuery("");
        setCurrentPage(1);
      } catch (err) {
        console.error("Error loading data:", err);
        setData([]);
      }
    };

    loadData();
  }, [selectedTab]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredData(
      query
        ? data.filter((row) =>
            Object.values(row).some((value) =>
              value.toString().toLowerCase().includes(query)
            )
          )
        : data
    );
  }, [searchQuery, data]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentRows = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Discovery Report for Azure resources</h2>

      <div className={styles.tabContainer}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={clsx(styles.tabButton, {
              [styles.activeTab]: tab === selectedTab,
            })}
          >
            {tab}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1);
        }}
        className={styles.searchBox}
      />

      <table className={styles.table}>
        <thead>
          <tr>
            {currentRows.length > 0 &&
              Object.keys(currentRows[0]).map((key) => (
                <th key={key} className={styles.header}>{key}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {currentRows.map((row, index) => (
            <tr key={index} className={clsx({ [styles.alternateRow]: index % 2 === 0 })}>
              {Object.entries(row).map(([key, value], i) => (
                <td key={i}>
                {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={styles.pageButton}
        >
          Previous
        </button>
        <span className={styles.pageInfo}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage >= totalPages}
          className={styles.pageButton}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ReferenceTable;
 