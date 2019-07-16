import { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import DatePicker from "react-datepicker"

export default ({ promo, saveLabel, onSubmit }) => {
  promo = promo || {}
  const [ coupon, setCoupon ] = useState(promo.coupon || '')
  const [ starts, setStarts ] = useState(promo.starts || new Date())
  const [ ends, setEnds ] = useState(promo.ends || new Date())
  const [ requiresTotal, setRequiresTotal ] = useState(promo.requiresTotal || 0)
  const [ percentageOff, setPercentageOff ] = useState(promo.percentageOff || 0)
  const [ moneyOff, setMoneyOff ] = useState(promo.moneyOff || 0)
  const [ freeShipping, setFreeShipping ] = useState(promo.setFreeShipping || false)
  return <Form onSubmit={(evt) => {
    evt.preventDefault()
    if (onSubmit && typeof onSubmit == "function") {
      onSubmit({
        coupon,
        starts,
        ends,
        requiresTotal,
        percentageOff,
        moneyOff,
        freeShipping,
      })
    }
  }}>
    <Form.Group controlId="ModifyPromoForm-coupon">
      <Form.Label>Coupon</Form.Label>
      <Form.Control
        value={coupon}
        onChange={(evt) => setCoupon(evt.target.value)}
         />
    </Form.Group>

    <Form.Group  controlId="ModifyPromoForm-promo-starts">
      <Form.Label>Promo Start</Form.Label>
      <Form.Control as="div">
        <DatePicker
          selected={starts}
          onSelect={(d) => setStarts(d)} />
      </Form.Control>
    </Form.Group>

    <Form.Group controlId="ModifyPromoForm-promo-ends">
      <Form.Label>Promo End</Form.Label>
      <Form.Control as="div">
        <DatePicker
          selected={ends}
          onSelect={(d) => setEnds(d)} />
      </Form.Control>
    </Form.Group>
    <Form.Group controlId="ModifyPromoForm-requires-total">
      <Form.Label>Requires Total</Form.Label>
      <Form.Control type="number"
        value={requiresTotal}
        onChange={(evt) => setRequiresTotal(Number.parseFloat(evt.target.value))}
         />
    </Form.Group>
    <Form.Group controlId="ModifyPromoForm-percent-off">
      <Form.Label>Percent Off</Form.Label>
      <Form.Control type="number"
        value={percentageOff}
        onChange={(evt) => setPercentageOff(Number.parseFloat(evt.target.value))}
         />
    </Form.Group>
    <Form.Group controlId="ModifyPromoForm-money-off">
      <Form.Label>Money Off</Form.Label>
      <Form.Control type="number"
        value={moneyOff}
        onChange={(evt) => setMoneyOff(Number.parseFloat(evt.target.value))}
         />
    </Form.Group>

    <Form.Group controlId="ModifyPromoForm-free-shipping">
      <Form.Label>Free Shipping</Form.Label>
      <Form.Check
        type="checkbox"
        checked={freeShipping}
        onChange={(evt) => setFreeShipping(evt.target.checked)}
         />
    </Form.Group>

    <div style={{ marginTop: '16px' }}>
      <Button variant="primary" type="submit">
        <>{ saveLabel || 'Save' }</>
      </Button>
    </div>
  </Form>
}
