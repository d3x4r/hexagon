import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

const GridSizeForm = (props) => {
  const {
    onSubmitHandler,
    onInputHandler,
    formIsValid,
    formValues: { l, m, n },
  } = props;
  return (
    <Form onSubmit={onSubmitHandler}>
      <fieldset>
        <legend>Enter hexagon size</legend>
        <Form.Group>
          <Form.Label htmlFor="l">L</Form.Label>
          <Form.Control size="sm" type="text" onChange={onInputHandler} name="l" id="l" value={l} placeholder="3" />
        </Form.Group>
        <Form.Group>
          <Form.Label htmlFor="m">M</Form.Label>
          <Form.Control size="sm" type="text" onChange={onInputHandler} name="m" id="m" value={m} laceholder="5" />
        </Form.Group>
        <Form.Group>
          <Form.Label htmlFor="n">N</Form.Label>
          <Form.Control size="sm" type="text" onChange={onInputHandler} name="n" id="n" value={n} laceholder="3" />
        </Form.Group>
        {!formIsValid && <div className="text-danger">The size must be a number greater than 0 and less than 10</div>}
        <ButtonGroup className="mt-3">
          <Button type="submit">Render</Button>
        </ButtonGroup>
      </fieldset>
    </Form>
  );
};

export default GridSizeForm;
