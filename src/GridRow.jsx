import React from 'react';
import uniqueId from 'lodash.uniqueid';
import './GridRow.scss';

const renderCells = (appData) => (e, i) => {
  const { rowData, changeDomainHandler, domainsData } = appData;
  const { order, group, rowNumber } = rowData[i];
  const cellId = `${rowNumber}.${order}`;
  const cellGroup = domainsData[cellId];

  const style = {
    backgroundColor: group ? `#${cellGroup}` : null,
    borderColor: group ? `#${cellGroup}` : null,
  };

  return (
    <li className="board-row__item" style={style} onClick={changeDomainHandler(rowData[i])} key={uniqueId()}>
      {group ? <span className="board-row__value">1</span> : <span className="board-row__value">0</span>}
    </li>
  );
};

const GridRow = (props) => {
  const {
    appData: {
      hexagonUiState,
      changeDomainHandler,
      domainsData,
    },
    rowData,
    rowNumber,
  } = props;

  const appData = {
    changeDomainHandler,
    domainsData,
    rowData,
  };

  const { shift } = hexagonUiState[rowNumber];

  const step = `${55 * shift}px`;

  const style = {
    marginLeft: step,
  };

  return (
    <ul className="board-row" style={style}>
      {Object.keys(rowData).map(renderCells(appData))}
    </ul>
  );
};

export default GridRow;
