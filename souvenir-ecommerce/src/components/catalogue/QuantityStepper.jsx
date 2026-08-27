function clampQuantity(value, minimum, maximum) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return minimum;
  }

  return Math.max(
    minimum,
    Math.min(
      maximum,
      Math.floor(numericValue),
    ),
  );
}

function QuantityStepper({
  value,
  onChange,
  label,
  minimum = 0,
  maximum = 999,
}) {
  function decreaseQuantity() {
    onChange(
      clampQuantity(
        value - 1,
        minimum,
        maximum,
      ),
    );
  }

  function increaseQuantity() {
    onChange(
      clampQuantity(
        value + 1,
        minimum,
        maximum,
      ),
    );
  }

  function handleInputChange(event) {
    onChange(
      clampQuantity(
        event.target.value,
        minimum,
        maximum,
      ),
    );
  }

  return (
    <div
      className="quantity-stepper"
      aria-label={`Quantity for ${label}`}
    >
      <button
        type="button"
        aria-label={`Decrease ${label} quantity`}
        onClick={decreaseQuantity}
        disabled={value <= minimum}
      >
        −
      </button>

      <input
        type="number"
        min={minimum}
        max={maximum}
        value={value}
        inputMode="numeric"
        aria-label={`${label} quantity`}
        onChange={handleInputChange}
      />

      <button
        type="button"
        aria-label={`Increase ${label} quantity`}
        onClick={increaseQuantity}
        disabled={value >= maximum}
      >
        +
      </button>
    </div>
  );
}

export default QuantityStepper;