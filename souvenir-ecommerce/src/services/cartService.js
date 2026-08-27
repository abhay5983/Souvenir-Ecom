const MAX_CART_QUANTITY = 999;

const demoPartners = {
  "SPK-SC-DL-00001": "Greenfield Academy",
  "SPK-DS-DL-00002":
    "North Star Educational Distributors",
  "DEMO-SCH-001": "Greenfield Academy",
  "DEMO-DST-001":
    "North Star Educational Distributors",
  "SOUVENIR-PARTNER-001":
    "Souvenir Demo Partner",
};

function normaliseQuantity(quantity) {
  const numericQuantity = Number(quantity);

  if (!Number.isFinite(numericQuantity)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      MAX_CART_QUANTITY,
      Math.floor(numericQuantity),
    ),
  );
}

export function cartItemId(
  seriesId,
  variantId,
) {
  return `${seriesId}:${variantId || "series"}`;
}

export function createCartItem({
  seriesId,
  variantId,
  quantity,
}) {
  const safeSeriesId = String(
    seriesId ?? "",
  ).trim();

  const safeVariantId = String(
    variantId ?? "",
  ).trim();

  const safeQuantity =
    normaliseQuantity(quantity);

  if (!safeSeriesId || safeQuantity === 0) {
    return null;
  }

  return {
    id: cartItemId(
      safeSeriesId,
      safeVariantId || undefined,
    ),
    seriesId: safeSeriesId,
    ...(safeVariantId
      ? { variantId: safeVariantId }
      : {}),
    quantity: safeQuantity,
  };
}

export function mergeCartItems(
  current,
  additions,
) {
  const merged = new Map(
    current.map((item) => [
      item.id,
      { ...item },
    ]),
  );

  for (const addition of additions) {
    const safeQuantity =
      normaliseQuantity(addition.quantity);

    if (!addition.id || safeQuantity === 0) {
      continue;
    }

    const existing = merged.get(addition.id);

    merged.set(addition.id, {
      ...addition,
      quantity: Math.min(
        MAX_CART_QUANTITY,
        safeQuantity +
          (existing?.quantity ?? 0),
      ),
    });
  }

  return Array.from(merged.values());
}

export function addCartItem(
  current,
  addition,
) {
  return mergeCartItems(
    current,
    [addition],
  );
}

export function setCartQuantity(
  current,
  id,
  quantity,
) {
  const safeQuantity =
    normaliseQuantity(quantity);

  if (safeQuantity === 0) {
    return current.filter((item) => {
      return item.id !== id;
    });
  }

  return current.map((item) => {
    if (item.id !== id) {
      return item;
    }

    return {
      ...item,
      quantity: safeQuantity,
    };
  });
}

export function updateCartItemQuantity(
  current,
  id,
  quantity,
) {
  return setCartQuantity(
    current,
    id,
    quantity,
  );
}

export function removeCartItem(
  current,
  id,
) {
  return current.filter((item) => {
    return item.id !== id;
  });
}

export function clearCartItems() {
  return [];
}

export function cartUnitCount(items) {
  return items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
}

export function getCartUnits(items) {
  return cartUnitCount(items);
}

export function verifyPartnerKey(value) {
  const code = String(value ?? "")
    .trim()
    .toLocaleUpperCase();

  const accountName = demoPartners[code];

  return accountName
    ? {
        code,
        accountName,
      }
    : null;
}

export function sampleQuantityIssue(items) {
  const invalidItem = items.find((item) => {
    return item.quantity > 2;
  });

  return invalidItem
    ? "Sample requests allow a maximum of 2 copies per book. Return to the cart and reduce the highlighted quantities."
    : null;
}