import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Navbar from 'react-bootstrap/Navbar';
import flattenDeep from 'lodash.flattendeep';
import ResultTable from './ResultTable';
import AutoFillFrom from './AutoFillForm';
import HexagonGrid from './HexagonGrid';
import GridSizeForm from './GridSizeForm';

const state = {
  gridParameters: {
    l: '',
    n: '',
    m: '',
  },
  gridFormValues: {
    l: 3,
    n: 7,
    m: 5,
  },
  chanceFormValue: '',
  chanceValue: '',
  editing: true,
  hexagonGridData: {},
  hexagonGridKeys: [],
  hexagonUiState: {},
  domainsData: {},
  autoFillHistory: [],
  calculateType: '',
  chanceIsValid: false,
  sizeIsValid: true,
};

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = state;
  }

  setGridParameters = (evt) => {
    evt.preventDefault();
    const { gridFormValues } = this.state;

    const validData = Object.keys(gridFormValues).reduce((acc, key) => {
      const currentKey = gridFormValues[key];
      if (currentKey <= 0 || currentKey > 9 || Number.isNaN(Number(currentKey))) {
        return acc;
      }
      return { ...acc, [key]: Number(currentKey) };
    }, {});

    if (Object.keys(validData).length < 3) {
      this.setState({ sizeIsValid: false });
      return;
    }

    const updatedState = {
      gridParameters: validData,
      editing: false,
      sizeIsValid: true,
      domainsData: {},
    };

    this.setState(updatedState, this.setHexagonData);
  }

  updateGridSizeForm = (evt) => {
    evt.preventDefault();
    const { value, name } = evt.target;
    const { gridFormValues } = this.state;

    const updatedFormValues = {
      gridFormValues: {
        ...gridFormValues,
        [name]: value,
      },
    };
    this.setState(updatedFormValues);
  }

  setChance = (evt) => {
    const calculateType = 'auto';
    evt.preventDefault();
    const { chanceFormValue } = this.state;
    this.setState({ chanceValue: chanceFormValue, calculateType }, this.autoFillGrids);
  }

  updateChanceForm = (evt) => {
    evt.preventDefault();
    const { value } = evt.target;
    if (value >= 0.01 && value <= 0.99) {
      this.setState({ chanceIsValid: true, chanceFormValue: value });
      return;
    }

    this.setState({ chanceIsValid: false, chanceFormValue: value });
  }

  autoFillGrids = () => {
    const { hexagonGridData, hexagonGridKeys } = this.state;
    const updatedData = hexagonGridKeys.map((row) => {
      const currentRow = hexagonGridData[row];
      return Object.keys(currentRow).map((cellNumber) => {
        const currentCell = currentRow[cellNumber];
        return { ...currentCell, group: this.getGroupByRandom() };
      });
    });

    this.setState({ hexagonGridData: updatedData }, this.calculateDomains);
  };

  updateHistory = () => {
    const { calculateType, domainsData } = this.state;

    if (calculateType === 'calculate') {
      return;
    }
    const { hexagonGridData, hexagonGridKeys } = this.state;

    const cellsWithoutGroup = hexagonGridKeys.reduce((acc, rowKey) => {
      const currentRow = hexagonGridData[rowKey];
      return [
        ...acc,
        // eslint-disable-next-line no-shadow
        ...Object.keys(currentRow).reduce((acc, cellKey) => {
          const currentCell = currentRow[cellKey];
          const { group } = currentCell;
          if (group === '') {
            return [...acc, currentCell];
          }
          return acc;
        }, []),
      ];
    }, []);

    const surroundedElements = cellsWithoutGroup.filter(({ order, rowNumber }) => {
      const nearElements = this.getNearElements(order, rowNumber);
      if (nearElements.length === 6) {
        const [firstElement] = nearElements;
        const { group } = firstElement;
        const isOneGroup = nearElements.filter((element) => (element.group === group) && (group === '1'));
        return isOneGroup.length === 6;
      }
      return false;
    });

    const groupsIds = surroundedElements.reduce((acc, element) => {
      const { order, rowNumber } = element;
      const nearElements = this.getNearElements(order, rowNumber);
      const [firstElement] = nearElements;
      const firstElementId = `${firstElement.rowNumber}.${firstElement.order}`;
      return [...acc, domainsData[firstElementId]];
    }, []);

    const nonSimplyCount = new Set(groupsIds).size;

    const { chanceValue, gridParameters, autoFillHistory } = this.state;
    const domainsCount = this.getDomainsCount();
    const cellsInDomains = Object.keys(domainsData).length;

    const result = {
      chanceValue,
      domainsCount,
      gridParameters,
      cellsInDomains,
      nonSimplyCount,
    };

    const history = autoFillHistory.length === 10 ? autoFillHistory.slice(1, 10) : autoFillHistory;

    this.setState({ autoFillHistory: [...history, result] });
  }

  fillHexagonCell = (acc, cell, index) => {
    const { gridParameters: { l, m, n } } = this.state;

    let shift;
    let width;
    let offset;
    if (index < l - 1) {
      shift = Math.abs((index - (l - 1)) * 0.5);
      width = n + index;
      offset = 'upper';
    }

    if (index === l - 1) {
      shift = 0;
      width = n + index;
      offset = 'middle';
    }

    if (index > l - 1) {
      shift = (index - (l - 1)) * 0.5;
      offset = 'lower';
    }

    if (index > l - 1 && index < m) {
      width = n + l - 1;
    }

    if (index > l - 1 && index >= m) {
      const test = n + l - 1;
      width = test - (index - m + 1);
    }

    const cells = Array(width).fill(0).reduce((accumulator, e, i) => ({
      ...accumulator,
      ...{
        [i]: {
          order: i,
          group: '',
          rowNumber: index,
        },
      },
    }), {});

    const cellData = {
      [index]: {
        shift,
        cells,
        offset,
      },
    };

    return { ...acc, ...cellData };
  }

  createHexagonData = (acc, cell, index) => {
    const { gridParameters: { l, m, n } } = this.state;

    let width;
    if (index < l - 1) {
      width = n + index;
    }

    if (index === l - 1) {
      width = n + index;
    }

    if (index > l - 1 && index < m) {
      width = n + l - 1;
    }

    if (index > l - 1 && index >= m) {
      const test = n + l - 1;
      width = test - (index - m + 1);
    }

    const cells = Array(width).fill(0).reduce((accumulator, e, i) => ({
      ...accumulator,
      ...{
        [i]: {
          order: i,
          group: '',
          rowNumber: index,
        },
      },
    }), {});

    return { ...acc, [index]: cells };
  }

  createHexagonUiState = (grid, gridKeys) => {
    const { gridParameters: { l } } = this.state;
    return gridKeys.reduce((acc, key, index) => {
      let shift;
      let offset;
      if (index < l - 1) {
        shift = Math.abs((index - (l - 1)) * 0.5);
        offset = 'upper';
      }

      if (index === l - 1) {
        shift = 0;
        offset = 'middle';
      }

      if (index > l - 1) {
        shift = (index - (l - 1)) * 0.5;
        offset = 'lower';
      }

      const cellData = {
        [index]: {
          shift,
          offset,
        },
      };

      return { ...acc, ...cellData };
    }, {});
  }

  setHexagonData = () => {
    const { gridParameters: { l, m } } = this.state;
    const gridHeight = l + m - 1;
    const hexagonGridData = Array(gridHeight).fill(0).reduce(this.createHexagonData, {});
    const hexagonGridKeys = Object.keys(hexagonGridData);
    const hexagonUiState = this.createHexagonUiState(hexagonGridData, hexagonGridKeys);
    this.setState({
      hexagonGridData,
      hexagonGridKeys,
      hexagonUiState,
    });
  }

  setCellValue = (selectedCell) => (evt) => {
    evt.preventDefault();
    const { hexagonGridData } = this.state;
    const { group, rowNumber, order } = selectedCell;

    const updatedGroup = group === '' ? '1' : '';
    const cellsData = hexagonGridData[rowNumber];
    const updatedCell = { ...cellsData[order], group: updatedGroup };
    const updatedRow = { ...hexagonGridData[rowNumber], [order]: updatedCell };

    const updatedData = { ...hexagonGridData, [rowNumber]: updatedRow };

    this.setState({ hexagonGridData: updatedData });
  }

  calculateDomains = (evt) => {
    if (evt) {
      this.setState({ calculateType: 'calculate' });
    }
    const { hexagonGridData, hexagonGridKeys } = this.state;
    const cellsInDomains = [];

    const getNearCellsId = (row) => {
      const { order, rowNumber } = row;
      const cellId = `${rowNumber}.${order}`;

      if (cellsInDomains.includes(cellId)) {
        return;
      }

      cellsInDomains.push(cellId);
      const nearElements = this.getNearElements(order, rowNumber);
      const checkedNearElements = nearElements.filter((nearElement) => nearElement.group);

      // eslint-disable-next-line consistent-return
      return [cellId, ...checkedNearElements.map(getNearCellsId)];
    };

    const getCellsGroups = () => {
      let groups = {};
      hexagonGridKeys.forEach((key) => {
        const curentRow = hexagonGridData[key];
        Object.keys(curentRow).forEach((cellKey) => {
          const { order, group, rowNumber } = curentRow[cellKey];
          const cellId = `${rowNumber}.${order}`;
          const isSelected = group === '1';

          if (isSelected && !cellsInDomains.includes(cellId)) {
            const domainId = Math.floor(Math.random() * 16777215).toString(16);
            const nearCellsId = getNearCellsId(curentRow[cellKey]);
            const normalizedCellsIdList = flattenDeep(nearCellsId).filter((e) => e);
            const cellsData = normalizedCellsIdList.reduce((acc, id) => ({
              ...acc,
              [id]: domainId,
            }), {});
            groups = { ...groups, ...cellsData };
          }
        });
      });
      return groups;
    };
    const cellsGroupsData = getCellsGroups();

    this.setState({ domainsData: cellsGroupsData }, this.updateHistory);
  }

  getElement = (row, number) => {
    const { hexagonGridData } = this.state;
    if (!hexagonGridData[row]) {
      return null;
    }
    const result = hexagonGridData[row][number];
    return result || null;
  }

  getRowOffset = (row) => {
    const { hexagonUiState } = this.state;
    const result = hexagonUiState[row].offset;
    return result || null;
  }

  getNearElements = (order, rowNumber) => {
    const rowOffset = this.getRowOffset(rowNumber);

    const getLeftTopIndex = () => {
      if ((rowOffset === 'upper' || rowOffset === 'middle')) {
        if (order === 0) {
          return null;
        }
        return order - 1;
      }

      return order;
    };

    const getLeftRightIndex = () => {
      if ((rowOffset === 'upper' || rowOffset === 'middle')) {
        return order;
      }
      return order + 1;
    };

    const getLeftBottomIndex = () => {
      if (rowOffset === 'upper') {
        return order;
      }

      if (order === 0) {
        return null;
      }

      return order - 1;
    };

    const getRightBottomIndex = () => {
      if (rowOffset === 'upper') {
        return order + 1;
      }

      return order;
    };

    const leftTopElement = this.getElement(rowNumber - 1, getLeftTopIndex());
    const rightTopElement = this.getElement(rowNumber - 1, getLeftRightIndex());
    const leftBottomElement = this.getElement(rowNumber + 1, getLeftBottomIndex());
    const rightBottomElement = this.getElement(rowNumber + 1, getRightBottomIndex());
    const leftElement = this.getElement(rowNumber, order - 1);
    const rightElement = this.getElement(rowNumber, order + 1);
    const result = [
      leftTopElement,
      rightTopElement,
      leftBottomElement,
      rightBottomElement,
      leftElement,
      rightElement,
    ];
    return result.filter((el) => el);
  }

  getDomainsCount = () => {
    const { domainsData } = this.state;
    const domainsValues = Object.values(domainsData);
    return new Set(Object.values(domainsValues)).size;
  }

  getGroupByRandom = () => {
    const { chanceValue } = this.state;
    const randomValue = Math.random();
    return randomValue < chanceValue ? '1' : '';
  }

  render() {
    const {
      hexagonGridData,
      hexagonGridKeys,
      hexagonUiState,
      domainsData,
      gridFormValues,
      editing,
      chanceFormValue,
      autoFillHistory,
      chanceIsValid,
      sizeIsValid,
    } = this.state;

    const appData = {
      hexagonGridData,
      hexagonGridKeys,
      hexagonUiState,
      domainsData,
      changeDomainHandler: this.setCellValue,
    };

    const dataSize = Object.keys(hexagonGridKeys).length;
    return (
      <Container>
        <Row>
          <Navbar variant="dark" className="navbar-expand-lg bg-primary w-100 mb-5">
            <Navbar.Brand href="#">
              HXGN
            </Navbar.Brand>
          </Navbar>
        </Row>
        <Row>
          <Col>
            <GridSizeForm
              onSubmitHandler={this.setGridParameters}
              formValues={gridFormValues}
              onInputHandler={this.updateGridSizeForm}
              formIsValid={sizeIsValid}
            />
          </Col>
          <Col style={{ opacity: editing ? 0.5 : 1 }}>
            <div className="mb-2">
              <h3>Calculate result</h3>
              <p>
                Number of domains:
                {' '}
                {this.getDomainsCount()}
              </p>
              <Button onClick={this.calculateDomains} name="calculate" type="button" disabled={editing}>Calculate domains</Button>
            </div>
            <div>
              <AutoFillFrom
                onSubmit={this.setChance}
                onInput={this.updateChanceForm}
                value={chanceFormValue}
                isEditing={editing}
                chanceIsValid={chanceIsValid}
              />
            </div>
          </Col>
        </Row>
        <Row>
          {dataSize > 0 ? <HexagonGrid data={appData} /> : null}
        </Row>
        <Row>
          {autoFillHistory.length > 0 ? <ResultTable data={autoFillHistory} /> : null}
        </Row>

      </Container>
    );
  }
}
