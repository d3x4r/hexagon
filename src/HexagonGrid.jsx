import React from 'react';
import uniqueId from 'lodash.uniqueid';
import GridRow from './GridRow';
import './HexagonGrid.scss';

const renderGridRow = (appData) => (rowNumber) => {
  const { hexagonGridData } = appData;
  const data = hexagonGridData[rowNumber];
  return (
    <GridRow
      key={uniqueId()}
      rowNumber={rowNumber}
      rowData={data}
      appData={appData}
    />
  );
};

const HexagonGrid = (props) => {
  const { data: { hexagonGridKeys } } = props;
  const { data } = props;
  return (
    <div className="Board mt-4 mb-3">
      {hexagonGridKeys.map(renderGridRow(data))}
    </div>
  );
};

export default HexagonGrid;
