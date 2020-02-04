import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

const AutoFillForm = (props) => {
  const {
    onSubmit,
    onInput,
    value,
    chanceIsValid,
    isEditing,
  } = props;

  return (
    <Form onSubmit={onSubmit}>
      <fieldset>
        <legend>Auto Fill data</legend>
        <Form.Group>
          <Form.Label htmlFor="chance">Chance</Form.Label>
          <Form.Control size="sm" type="text" name="chance" id="chance" onChange={onInput} value={value} disabled={isEditing} placeholder="Example: 0.5" />
          <small className="form-text text-muted">The value must be in the range of 0.01 to 0.99</small>
        </Form.Group>
        <ButtonGroup className="mt-3">
          <Button type="submit" disabled={(chanceIsValid === false)}>Auto</Button>
        </ButtonGroup>
      </fieldset>
    </Form>
  );
};

export default AutoFillForm;
