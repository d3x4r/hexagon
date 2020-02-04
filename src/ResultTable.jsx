import React from 'react';
import Table from 'react-bootstrap/Table';

const TableHead = () => {
  const style = {
    textAlign: 'center',
    verticalAlign: 'middle',
  };

  return (
    <thead style={style}>
      <tr>
        <th style={{ verticalAlign: 'middle' }} rowSpan="2">Вероятность</th>
        <th colSpan="2">Количество доменов в решетке</th>
        <th style={{ verticalAlign: 'middle' }} rowSpan="2">Количество ячеек в решётке (L;N;M), из них имеющих значение 1</th>
      </tr>
      <tr>
        <th>Всего</th>
        <th>Из них неодносвязных</th>
      </tr>
    </thead>
  );
};

const renderRows = (props, index) => {
  const {
    chanceValue,
    domainsCount,
    gridParameters,
    cellsInDomains,
    nonSimplyCount,
  } = props;
  const { l, n, m } = gridParameters;
  return (
    <tr key={index}>
      <td>{chanceValue}</td>
      <td>{domainsCount}</td>
      <td>{nonSimplyCount}</td>
      <td>{`L: ${l}, N: ${n}, M: ${m}, Общее: ${cellsInDomains}`}</td>
    </tr>
  );
};

const ResultTable = (props) => {
  const { data } = props;
  return (
    <Table className="mt-5 table-active" striped bordered hover>
      <TableHead />
      <tbody>
        {data.map(renderRows)}
      </tbody>
    </Table>
  );
};

export default ResultTable;
