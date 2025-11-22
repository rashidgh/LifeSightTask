import React, { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import data from "../database/data.json";
import "./table.css";

const ROW_HEIGHT = 50;

const Table = () => {
  const [openGroups, setOpenGroups] = useState({});

  // Group data by region
  const grouped = useMemo(() => {
    return data.reduce((acc, item) => {
      (acc[item.region] = acc[item.region] || []).push(item);
      return acc;
    }, {});
  }, []);

  const toggleGroup = region => {
    setOpenGroups(prev => ({
      ...prev,
      [region]: !prev[region],
    }));
  };

  // Prepare rows for virtualizer
  const rows = useMemo(() => {
    const list = [];

    Object.keys(grouped).forEach(region => {
      list.push({ type: "group", region });

      if (openGroups[region]) {
        grouped[region].forEach(item => list.push({ type: "item", ...item }));
      }
    });

    return list;
  }, [grouped, openGroups]);

  // Virtualizer setup
  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  return (
    <div className="table-container">
      {/* Header */}
      <div className="header">
        <div className="cell">Channel</div>
        <div className="cell">Spend</div>
        <div className="cell">Impressions</div>
        <div className="cell">Conversions</div>
        <div className="cell">Clicks</div>
      </div>

      {/* Virtual List */}
      <div
        ref={parentRef}
        style={{
          height: "500px",
          overflow: "auto",
          position: "relative",
        }}
      >
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map(virtualRow => {
            const row = rows[virtualRow.index];

            if (row.type === "group") {
              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: "absolute",
                    top: virtualRow.start,
                    left: 0,
                    width: "100%",
                    height: ROW_HEIGHT,
                  }}
                  className="group-row"
                  onClick={() => toggleGroup(row.region)}
                >
                  <strong>{row.region}</strong>
                  <span>{openGroups[row.region] ? "▲" : "▼"}</span>
                </div>
              );
            }

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: virtualRow.start,
                  left: 0,
                  width: "100%",
                  height: ROW_HEIGHT,
                }}
                className="item-row"
              >
                <div className="cell">{row.channel}</div>
                <div className="cell">₹{row.spend}</div>
                <div className="cell">{row.impressions}</div>
                <div className="cell">{row.conversions}</div>
                <div className="cell">{row.clicks}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Table;
